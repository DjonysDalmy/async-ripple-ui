<script setup lang="ts">
import { Activity, Check, Clock3, Copy, Plug, Radio, Wifi, WifiOff, X } from 'lucide-vue-next'
import { ref } from 'vue'
import JsonCode from '@/components/common/JsonCode.vue'
import type { ClientEventLog, ClientStatus, ServerOption } from '@/types/asyncapi'
import { jsonPreview } from '@/utils/asyncapi'

defineProps<{
  bearerToken: string
  clientError: string
  clientEvents: ClientEventLog[]
  clientStatus: ClientStatus
  echoHost: string
  serverOptions: ServerOption[]
  subscribedChannels: string[]
  wildcardPattern: string
}>()

const emit = defineEmits<{
  connect: []
  disconnect: []
  'subscribe-wildcard': []
  unsubscribe: [channel: string]
  'update:bearer-token': [value: string]
  'update:echo-host': [value: string]
  'update:wildcard-pattern': [value: string]
}>()

const copiedEventId = ref<number | null>(null)

function updateEchoHost(event: Event) {
  emit('update:echo-host', (event.target as HTMLInputElement).value)
}

function updateBearerToken(event: Event) {
  emit('update:bearer-token', (event.target as HTMLInputElement).value)
}

function updateWildcardPattern(event: Event) {
  emit('update:wildcard-pattern', (event.target as HTMLInputElement).value)
}

async function copyEventJson(event: MouseEvent, item: ClientEventLog) {
  event.preventDefault()
  event.stopPropagation()

  await copyText(jsonPreview(item.payload))
  copiedEventId.value = item.id
  window.setTimeout(() => {
    if (copiedEventId.value === item.id) {
      copiedEventId.value = null
    }
  }, 1200)
}

async function copyText(value: string) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.append(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}
</script>

<template>
  <div class="panel-client">
    <div class="panel-toolbar compact-toolbar">
      <div>
        <span>Realtime Client</span>
        <strong>{{ clientStatus === 'connected' ? 'Connected' : 'Client' }}</strong>
      </div>
      <button type="button" class="panel-icon-button" title="Disconnect" @click="emit('disconnect')">
        <WifiOff :size="16" />
      </button>
    </div>

    <div class="client-panel side-client-panel">
      <div class="client-config">
        <label>
          <span>Document server</span>
          <select
            :value="serverOptions.find((option) => option.url === echoHost)?.url || ''"
            :disabled="!serverOptions.length"
            @change="emit('update:echo-host', ($event.target as HTMLSelectElement).value || echoHost)"
          >
            <option value="">Manual</option>
            <option v-for="server in serverOptions" :key="server.key" :value="server.url">
              {{ server.label }}
            </option>
          </select>
        </label>
        <label>
          <span>Socket.IO server</span>
          <input :value="echoHost" type="url" placeholder="https://echo.example.com" @input="updateEchoHost" />
        </label>
        <label>
          <span>Bearer token</span>
          <input
            :value="bearerToken"
            type="password"
            placeholder="JWT for authenticated channels"
            @input="updateBearerToken"
          />
        </label>
      </div>

      <div class="client-actions">
        <button type="button" class="primary-action" @click="emit('connect')">
          <Wifi v-if="clientStatus === 'connected'" :size="16" aria-hidden="true" />
          <Plug v-else :size="16" aria-hidden="true" />
          {{ clientStatus === 'connected' ? 'Connected' : 'Connect' }}
        </button>
      </div>

      <p v-if="clientError" class="error-banner client-error">{{ clientError }}</p>
    </div>

    <section class="side-section wildcard-section">
      <div class="surface-title panel-section-title">
        <div>
          <h3>Wildcard</h3>
          <p>Subscribe by channel pattern.</p>
        </div>
      </div>
      <div class="wildcard-control">
        <label>
          <span>Pattern</span>
          <input
            :value="wildcardPattern"
            type="text"
            placeholder="*"
            @input="updateWildcardPattern"
          />
        </label>
        <button type="button" @click="emit('subscribe-wildcard')">
          <Radio :size="15" aria-hidden="true" />
          Subscribe
        </button>
      </div>
    </section>

    <section class="side-section">
      <div class="surface-title panel-section-title">
        <div>
          <h3>Subscribed</h3>
          <p>Active channel rooms.</p>
        </div>
        <span class="section-count">{{ subscribedChannels.length }}</span>
      </div>
      <div v-if="subscribedChannels.length" class="subscribed-channels">
        <div v-for="channel in subscribedChannels" :key="channel" class="subscription-card">
          <div class="subscription-icon">
            <Radio :size="15" aria-hidden="true" />
          </div>
          <div class="subscription-copy">
            <code>{{ channel }}</code>
            <span>Listening</span>
          </div>
          <button type="button" title="Leave channel" @click="emit('unsubscribe', channel)">
            <X :size="14" aria-hidden="true" />
            Leave
          </button>
        </div>
      </div>
      <p v-else class="empty-schema">No active subscriptions.</p>
    </section>

    <section class="side-section event-log">
      <div class="surface-title panel-section-title">
        <div>
          <h3>Events</h3>
          <p>Latest received payloads.</p>
        </div>
        <span class="section-count">{{ clientEvents.length }}</span>
      </div>
      <div v-if="clientEvents.length" class="event-list">
        <details v-for="event in clientEvents" :key="event.id" class="event-card" open>
          <summary>
            <span class="event-time">
              <Clock3 :size="12" aria-hidden="true" />
              {{ event.time }}
            </span>
            <span class="event-copy">
              <strong>
                <Activity :size="13" aria-hidden="true" />
                {{ event.event }}
              </strong>
              <code>{{ event.channel }}</code>
            </span>
            <button class="event-copy-button" type="button" @click="copyEventJson($event, event)">
              <Check v-if="copiedEventId === event.id" :size="13" aria-hidden="true" />
              <Copy v-else :size="13" aria-hidden="true" />
              {{ copiedEventId === event.id ? 'Copied' : 'Copy JSON' }}
            </button>
          </summary>
          <JsonCode compact class="event-payload" :value="event.payload" />
        </details>
      </div>
      <p v-else class="empty-schema">Events will appear here after subscribing.</p>
    </section>
  </div>
</template>
