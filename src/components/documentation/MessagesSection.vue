<script setup lang="ts">
import type { AnyRecord, MessagePayloadView, NamedItem } from '@/types/asyncapi'
import JsonCode from '@/components/common/JsonCode.vue'
import SectionHeading from './SectionHeading.vue'

defineProps<{
  messageAliases: (message: NamedItem) => string[]
  messageAnchor: (message: NamedItem) => string
  messagePayloadPreview: (message: AnyRecord) => string
  messages: NamedItem[]
  summaryFor: (value: AnyRecord) => string
  view: MessagePayloadView
}>()

const emit = defineEmits<{
  'update:view': [value: MessagePayloadView]
}>()
</script>

<template>
  <section id="messages" class="doc-section">
    <SectionHeading eyebrow="Contracts" title="Messages">
      <div class="segmented-control" aria-label="Message payload view">
        <button
          type="button"
          :class="{ active: view === 'object' }"
          @click="emit('update:view', 'object')"
        >
          Object
        </button>
        <button
          type="button"
          :class="{ active: view === 'schema' }"
          @click="emit('update:view', 'schema')"
        >
          Schema
        </button>
      </div>
    </SectionHeading>

    <article v-for="message in messages" :id="messageAnchor(message)" :key="message.key" class="message-card">
      <span
        v-for="alias in messageAliases(message)"
        :id="alias"
        :key="alias"
        class="anchor-alias"
        aria-hidden="true"
      />
      <div class="message-copy">
        <div class="pill-row">
          <span class="method-pill event">message</span>
          <code>{{ message.value.name || message.key }}</code>
        </div>
        <h3>{{ message.value.title || message.key }}</h3>
        <p>{{ summaryFor(message.value) }}</p>
      </div>

      <div class="message-schema">
        <JsonCode compact :source="messagePayloadPreview(message.value)" />
      </div>
    </article>
  </section>
</template>
