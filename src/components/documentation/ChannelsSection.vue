<script setup lang="ts">
import { Wifi } from 'lucide-vue-next'
import type { AnyRecord, ChannelItem, NamedItem } from '@/types/asyncapi'
import { extractVariables } from '@/utils/asyncapi'
import SectionHeading from './SectionHeading.vue'

defineProps<{
  channelVariables: Record<string, string>
  channels: ChannelItem[]
  clientTargetFor: (channel: ChannelItem) => { ready: boolean }
  messageAnchor: (message: NamedItem) => string
  scrollToHash: (hash: string) => void
  summaryFor: (value: AnyRecord) => string
}>()

const emit = defineEmits<{
  subscribe: [channel: ChannelItem]
  'update-variable': [variable: string, value: string]
}>()
</script>

<template>
  <section id="channels" class="doc-section">
    <SectionHeading eyebrow="Event surface" title="Channels" :meta="`${channels.length} visible`" />

    <article v-for="channel in channels" :key="channel.id" class="channel-card">
      <div class="channel-main">
        <div class="pill-row">
          <code>{{ channel.address }}</code>
        </div>
        <h3>{{ channel.key }}</h3>
        <p>{{ summaryFor(channel.value) }}</p>

        <div v-if="extractVariables(channel.address).length" class="channel-variable-grid">
          <label v-for="variable in extractVariables(channel.address)" :key="variable">
            <span>{{ variable }}</span>
            <input
              :value="channelVariables[variable]"
              type="text"
              :placeholder="`{${variable}}`"
              @input="emit('update-variable', variable, ($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>

        <div class="operation-list" v-if="channel.operations.length">
          <div v-for="operation in channel.operations" :key="operation.id" class="operation-row">
            <span class="operation-badge" :class="operation.action">
              {{ operation.action }}
            </span>
            <span>{{ operation.value.summary || operation.key }}</span>
          </div>
        </div>
      </div>

      <div class="channel-side">
        <span>Messages</span>
        <a
          v-for="message in channel.messages"
          :key="message.id"
          :href="`#${messageAnchor(message)}`"
          @click="scrollToHash(`#${messageAnchor(message)}`)"
        >
          {{ message.value.title || message.value.name || message.key }}
        </a>

        <div class="channel-actions">
          <button
            type="button"
            :disabled="!clientTargetFor(channel).ready"
            @click="emit('subscribe', channel)"
          >
            <Wifi :size="15" aria-hidden="true" />
            Subscribe
          </button>
        </div>
      </div>
    </article>
  </section>
</template>
