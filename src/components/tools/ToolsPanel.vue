<script setup lang="ts">
import { Braces, Plug } from 'lucide-vue-next'
import type { ClientEventLog, ClientStatus, ServerOption, SidePanel } from '@/types/asyncapi'
import SourcePanel from './SourcePanel.vue'
import RealtimeClientPanel from './RealtimeClientPanel.vue'

defineProps<{
  bearerToken: string
  clientError: string
  clientEvents: ClientEventLog[]
  clientStatus: ClientStatus
  serverUrl: string
  parseError: string
  serverOptions: ServerOption[]
  sidePanel: SidePanel
  sourceText: string
  subscribedChannels: string[]
  version?: string
  wildcardPattern: string
}>()

const emit = defineEmits<{
  connect: []
  disconnect: []
  import: [event: Event]
  reset: []
  'subscribe-wildcard': []
  unsubscribe: [channel: string]
  'update:bearer-token': [value: string]
  'update:server-url': [value: string]
  'update:side-panel': [value: SidePanel]
  'update:source-text': [value: string]
  'update:wildcard-pattern': [value: string]
}>()
</script>

<template>
  <aside class="document-panel" aria-label="Tools panel">
    <div class="panel-switcher" aria-label="Side panel">
      <button type="button" :class="{ active: sidePanel === 'source' }" @click="emit('update:side-panel', 'source')">
        <Braces :size="15" aria-hidden="true" />
        Source
      </button>
      <button type="button" :class="{ active: sidePanel === 'client' }" @click="emit('update:side-panel', 'client')">
        <Plug :size="15" aria-hidden="true" />
        Client
        <small v-if="subscribedChannels.length">{{ subscribedChannels.length }}</small>
      </button>
    </div>

    <SourcePanel
      v-if="sidePanel === 'source'"
      :parse-error="parseError"
      :source-text="sourceText"
      :version="version"
      @import="emit('import', $event)"
      @reset="emit('reset')"
      @update:source-text="emit('update:source-text', $event)"
    />

    <RealtimeClientPanel
      v-else
      :bearer-token="bearerToken"
      :client-error="clientError"
      :client-events="clientEvents"
      :client-status="clientStatus"
      :server-url="serverUrl"
      :server-options="serverOptions"
      :subscribed-channels="subscribedChannels"
      :wildcard-pattern="wildcardPattern"
      @connect="emit('connect')"
      @disconnect="emit('disconnect')"
      @subscribe-wildcard="emit('subscribe-wildcard')"
      @unsubscribe="emit('unsubscribe', $event)"
      @update:bearer-token="emit('update:bearer-token', $event)"
      @update:server-url="emit('update:server-url', $event)"
      @update:wildcard-pattern="emit('update:wildcard-pattern', $event)"
    />
  </aside>
</template>
