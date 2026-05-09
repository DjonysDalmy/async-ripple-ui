<script setup lang="ts">
import type {
  AnyRecord,
  ChannelItem,
  MessagePayloadView,
  NamedItem,
  SchemaRow,
} from '@/types/asyncapi'
import OverviewSection from './OverviewSection.vue'
import ServersSection from './ServersSection.vue'
import ChannelsSection from './ChannelsSection.vue'
import MessagesSection from './MessagesSection.vue'
import SchemasSection from './SchemasSection.vue'

defineProps<{
  asyncDocument: AnyRecord | null
  channelVariables: Record<string, string>
  channels: ChannelItem[]
  clientTargetFor: (channel: ChannelItem) => { ready: boolean }
  info: AnyRecord
  messageAliases: (message: NamedItem) => string[]
  messageAnchor: (message: NamedItem) => string
  messagePayloadPreview: (message: AnyRecord) => string
  messagePayloadView: MessagePayloadView
  messages: NamedItem[]
  parseError: string
  schemaRows: (schema: AnyRecord) => SchemaRow[]
  schemas: NamedItem[]
  scrollToHash: (hash: string) => void
  servers: NamedItem[]
  summaryFor: (value: AnyRecord) => string
  topProtocols: string
}>()

const emit = defineEmits<{
  subscribe: [channel: ChannelItem]
  'update:message-payload-view': [value: MessagePayloadView]
  'update-variable': [variable: string, value: string]
}>()
</script>

<template>
  <main class="content">
    <OverviewSection
      :asyncapi-version="asyncDocument?.asyncapi"
      :info="info"
      :top-protocols="topProtocols"
    />

    <p v-if="parseError" class="error-banner">
      {{ parseError }}
    </p>

    <ServersSection :servers="servers" />

    <ChannelsSection
      :channel-variables="channelVariables"
      :channels="channels"
      :client-target-for="clientTargetFor"
      :message-anchor="messageAnchor"
      :scroll-to-hash="scrollToHash"
      :summary-for="summaryFor"
      @subscribe="emit('subscribe', $event)"
      @update-variable="(variable, value) => emit('update-variable', variable, value)"
    />

    <MessagesSection
      :message-aliases="messageAliases"
      :message-anchor="messageAnchor"
      :message-payload-preview="messagePayloadPreview"
      :messages="messages"
      :summary-for="summaryFor"
      :view="messagePayloadView"
      @update:view="emit('update:message-payload-view', $event)"
    />

    <SchemasSection :schema-rows="schemaRows" :schemas="schemas" />
  </main>
</template>
