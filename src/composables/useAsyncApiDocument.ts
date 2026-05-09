import { computed, ref } from 'vue'
import YAML from 'js-yaml'
import { sampleDocument } from '@/fixtures/sampleDocument'
import type {
  AnyRecord,
  ChannelItem,
  MessagePayloadView,
  NamedItem,
  OperationItem,
  ParseResult,
  SchemaRow,
} from '@/types/asyncapi'
import {
  asRecord,
  isRecord,
  jsonPreview,
  lastRefSegment,
  refValue,
  slug,
  stringValue,
} from '@/utils/asyncapi'

export function useAsyncApiDocument() {
  const sourceText = ref(sampleDocument)
  const query = ref('')
  const messagePayloadView = ref<MessagePayloadView>('object')

  const parseResult = computed<ParseResult>(() => {
    try {
      const parsed = YAML.load(sourceText.value)

      if (isRecord(parsed)) {
        return { document: parsed, error: '' }
      }

      return { document: null, error: 'The document must be a YAML or JSON object.' }
    } catch (error) {
      return {
        document: null,
        error: error instanceof Error ? error.message : 'Unable to parse the document.',
      }
    }
  })

  const asyncDocument = computed(() => parseResult.value.document)
  const info = computed(() => asRecord(asyncDocument.value?.info))
  const components = computed(() => asRecord(asyncDocument.value?.components))

  const servers = computed<NamedItem[]>(() =>
    entriesFrom(asyncDocument.value?.servers).map(([key, value]) => ({
      id: slug(`server-${key}`),
      key,
      value,
    })),
  )

  const operations = computed<OperationItem[]>(() => {
    const rootOperations = entriesFrom(asyncDocument.value?.operations).map(([key, value]) =>
      normalizeOperation(key, value),
    )

    const legacyOperations = rawChannels.value.flatMap(([channelKey, channel]) => {
      const items: OperationItem[] = []

      if (isRecord(channel.publish)) {
        items.push(
          normalizeOperation(`${channelKey}.publish`, {
            ...channel.publish,
            action: 'send',
            channel: { $ref: `#/channels/${channelKey}` },
          }),
        )
      }

      if (isRecord(channel.subscribe)) {
        items.push(
          normalizeOperation(`${channelKey}.subscribe`, {
            ...channel.subscribe,
            action: 'receive',
            channel: { $ref: `#/channels/${channelKey}` },
          }),
        )
      }

      return items
    })

    return [...rootOperations, ...legacyOperations]
  })

  const rawChannels = computed(() => entriesFrom(asyncDocument.value?.channels))

  const channels = computed<ChannelItem[]>(() =>
    rawChannels.value.map(([key, value]) => {
      const resolved = resolveRef(value)
      const address = stringValue(resolved.address) || key
      const relatedOperations = operations.value.filter((operation) => {
        const refKey = lastRefSegment(operation.channelRef)
        return refKey === key || operation.channelRef === address || operation.channelRef === key
      })

      return {
        id: slug(`channel-${key}`),
        key,
        value: resolved,
        address,
        messages: channelMessages(resolved, key),
        operations: relatedOperations,
      }
    }),
  )

  const componentMessages = computed<NamedItem[]>(() =>
    entriesFrom(components.value.messages).map(([key, value]) => ({
      id: slug(`message-${key}`),
      key,
      value: resolveRef(value),
    })),
  )

  const allMessages = computed<NamedItem[]>(() => {
    const byKey = new Map<string, NamedItem>()

    for (const message of componentMessages.value) {
      upsertMessage(byKey, message)
    }

    for (const channel of channels.value) {
      for (const message of channel.messages) {
        upsertMessage(byKey, {
          ...message,
          key: stringValue(message.value.name) || message.key,
        })
      }
    }

    for (const operation of operations.value) {
      for (const message of operation.messages) {
        upsertMessage(byKey, {
          ...message,
          key: stringValue(message.value.name) || message.key,
        })
      }
    }

    return [...byKey.values()]
  })

  const schemas = computed<NamedItem[]>(() =>
    entriesFrom(components.value.schemas).map(([key, value]) => ({
      id: slug(`schema-${key}`),
      key,
      value: resolveRef(value),
    })),
  )

  const filteredChannels = computed(() => filterItems(channels.value))
  const filteredMessages = computed(() => filterItems(allMessages.value))
  const filteredSchemas = computed(() => filterItems(schemas.value))

  const topProtocols = computed(() => {
    const values = servers.value
      .map((serverItem) => stringValue(serverItem.value.protocol))
      .filter(Boolean)

    return values.length ? [...new Set(values)].join(', ') : 'documented events'
  })

  function entriesFrom(value: unknown): [string, AnyRecord][] {
    if (!isRecord(value)) {
      return []
    }

    return Object.entries(value).map(([key, item]) => [key, asRecord(resolveRef(item))])
  }

  function normalizeOperation(key: string, value: AnyRecord): OperationItem {
    const resolved = resolveRef(value)
    const channelRef = refValue(resolved.channel) || stringValue(resolved.channel) || ''

    return {
      id: slug(`operation-${key}`),
      key,
      value: resolved,
      action: stringValue(resolved.action) || actionFromLegacyKey(key),
      channelRef,
      messages: operationMessages(resolved),
    }
  }

  function actionFromLegacyKey(key: string) {
    if (key.endsWith('.publish')) {
      return 'send'
    }

    if (key.endsWith('.subscribe')) {
      return 'receive'
    }

    return 'event'
  }

  function channelMessages(channel: AnyRecord, channelKey: string): NamedItem[] {
    return entriesFrom(channel.messages).map(([key, value]) => ({
      id: slug(`message-${channelKey}-${key}`),
      key,
      value: resolveRef(value),
    }))
  }

  function operationMessages(operation: AnyRecord): NamedItem[] {
    const messageList = Array.isArray(operation.messages)
      ? operation.messages
      : isRecord(operation.message)
        ? [operation.message]
        : []

    return messageList
      .map((message, index) => {
        const key = lastRefSegment(refValue(message)) || stringValue(asRecord(message).name) || `message-${index + 1}`
        const resolved = resolveRef(message)

        return {
          id: slug(`message-${key}-${index}`),
          key,
          value: resolved,
        }
      })
      .filter((message) => Object.keys(message.value).length)
  }

  function resolveRef(value: unknown, seen = new Set<string>()): AnyRecord {
    if (!isRecord(value)) {
      return {}
    }

    const ref = refValue(value)

    if (!ref || !ref.startsWith('#/')) {
      return value
    }

    if (seen.has(ref)) {
      return value
    }

    seen.add(ref)

    return resolveRef(getByPointer(asyncDocument.value, ref), seen)
  }

  function getByPointer(root: unknown, pointer: string): unknown {
    const segments = pointer
      .replace(/^#\//, '')
      .split('/')
      .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))

    let current = root

    for (const segment of segments) {
      if (!isRecord(current)) {
        return undefined
      }

      current = current[segment]
    }

    return current
  }

  function payloadFor(message: AnyRecord): AnyRecord {
    return resolveRef(message.payload)
  }

  function schemaRows(schema: AnyRecord): SchemaRow[] {
    const properties = asRecord(schema.properties)
    const required = new Set(Array.isArray(schema.required) ? schema.required : [])

    return Object.entries(properties).map(([key, value]) => {
      const property = asRecord(value)
      return {
        key,
        type: stringValue(property.type) || stringValue(property.format) || 'any',
        required: required.has(key),
        description: stringValue(property.description),
        enum: Array.isArray(property.enum) ? property.enum.join(', ') : '',
      }
    })
  }

  function summaryFor(value: AnyRecord): string {
    return (
      stringValue(value.summary) ||
      stringValue(value.description) ||
      stringValue(value.title) ||
      'No description.'
    )
  }

  function messagePayloadPreview(message: AnyRecord): string {
    const payload = payloadFor(message)
    const value = messagePayloadView.value === 'schema' ? payload : schemaExample(payload)

    return Object.keys(payload).length ? jsonPreview(value) : '{}'
  }

  function schemaExample(schema: AnyRecord): unknown {
    const enumValues = Array.isArray(schema.enum) ? schema.enum : []

    if (enumValues.length) {
      return enumValues[0]
    }

    if ('example' in schema) {
      return schema.example
    }

    if (Array.isArray(schema.oneOf) && schema.oneOf[0]) {
      return schemaExample(resolveRef(schema.oneOf[0]))
    }

    if (Array.isArray(schema.anyOf) && schema.anyOf[0]) {
      return schemaExample(resolveRef(schema.anyOf[0]))
    }

    if (Array.isArray(schema.allOf) && schema.allOf[0]) {
      return schemaExample(resolveRef(schema.allOf[0]))
    }

    if (schema.type === 'array') {
      return [schemaExample(resolveRef(schema.items))]
    }

    if (schema.type === 'object' || isRecord(schema.properties)) {
      const properties = asRecord(schema.properties)
      return Object.fromEntries(
        Object.entries(properties).map(([key, value]) => [key, schemaExample(resolveRef(value))]),
      )
    }

    if (schema.type === 'number' || schema.type === 'integer') {
      return 0
    }

    if (schema.type === 'boolean') {
      return false
    }

    if (Array.isArray(schema.type)) {
      return schema.type.includes('null') ? null : String(schema.type[0] ?? 'string')
    }

    return stringValue(schema.type) || 'string'
  }

  function filterItems<T extends NamedItem>(items: T[]): T[] {
    const term = query.value.trim().toLowerCase()

    if (!term) {
      return items
    }

    return items.filter((item) =>
      `${item.key} ${item.value.title ?? ''} ${item.value.summary ?? ''} ${item.value.description ?? ''}`
        .toLowerCase()
        .includes(term),
    )
  }

  function messageIdentity(message: NamedItem): string {
    return stringValue(message.value.name) || stringValue(message.value.title) || message.key
  }

  function messageAnchor(message: NamedItem): string {
    return slug(`message-${messageIdentity(message)}`)
  }

  function messageAliases(message: NamedItem): string[] {
    return [...new Set([message.id, ...(message.aliases ?? [])])].filter(
      (alias) => alias !== messageAnchor(message),
    )
  }

  function upsertMessage(messages: Map<string, NamedItem>, message: NamedItem) {
    const identity = messageIdentity(message)
    const existing = messages.get(identity)
    const aliases = [...(existing?.aliases ?? []), existing?.id, message.id].filter(Boolean) as string[]

    messages.set(identity, {
      ...(existing ?? message),
      id: messageAnchor(message),
      aliases,
    })
  }

  function resetDocument() {
    sourceText.value = sampleDocument
  }

  async function importDocument(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file) {
      return
    }

    sourceText.value = await file.text()
    input.value = ''
  }

  return {
    allMessages,
    asyncDocument,
    channels,
    filteredChannels,
    filteredMessages,
    filteredSchemas,
    importDocument,
    info,
    messageAliases,
    messageAnchor,
    messagePayloadPreview,
    messagePayloadView,
    parseResult,
    query,
    resetDocument,
    schemaRows,
    schemas,
    servers,
    sourceText,
    summaryFor,
    topProtocols,
  }
}
