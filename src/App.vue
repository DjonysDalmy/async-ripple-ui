<script setup lang="ts">
import { Braces, Layers3, Radio, Server, Sparkles } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import DocumentationView from '@/components/documentation/DocumentationView.vue'
import ResizeHandle from '@/components/layout/ResizeHandle.vue'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import ToolsPanel from '@/components/tools/ToolsPanel.vue'
import { useAsyncApiDocument } from '@/composables/useAsyncApiDocument'
import { useColorMode } from '@/composables/useColorMode'
import { useEchoClient } from '@/composables/useEchoClient'
import { useResizablePanels } from '@/composables/useResizablePanels'
import type { NamedItem, SectionId, ServerOption, SidePanel } from '@/types/asyncapi'
import { stringValue } from '@/utils/asyncapi'

const selectedSection = ref<SectionId>('overview')
const sidePanel = ref<SidePanel>('source')
const channelVariables = ref<Record<string, string>>({
  appKey: 'local',
  userId: '1',
  teamId: '1',
  clienteId: '',
  usuarioId: '',
  atendimentoUuid: '',
  conversaUuid: '',
  departamento: '',
  canalEchoId: '',
  livro: '',
  code: '',
  documentoKey: '',
  signatarioKey: '',
})

const { colorMode, toggleColorMode } = useColorMode()
const { shellStyle, startResize } = useResizablePanels()
const documentState = useAsyncApiDocument()
const echoClient = useEchoClient(channelVariables, () => {
  sidePanel.value = 'client'
})

const navItems = computed(() => [
  { id: 'overview' as const, label: 'Overview', icon: Sparkles },
  { id: 'servers' as const, label: 'Servers', icon: Server },
  { id: 'channels' as const, label: 'Channels', icon: Radio },
  { id: 'messages' as const, label: 'Messages', icon: Braces },
  { id: 'schemas' as const, label: 'Schemas', icon: Layers3 },
])

const echoServerOptions = computed<ServerOption[]>(() =>
  documentState.servers.value
    .map((server) => ({
      key: server.key,
      label: server.value.description ? `${server.key} - ${server.value.description}` : server.key,
      url: serverConnectionUrl(server),
    }))
    .filter((option) => option.url),
)

onMounted(() => {
  scrollToHash(window.location.hash)
  window.addEventListener('hashchange', handleHashChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', handleHashChange)
})

function handleHashChange() {
  scrollToHash(window.location.hash)
}

function scrollToHash(hash: string) {
  if (!hash) {
    return
  }

  void nextTick(() => {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function updateChannelVariable(variable: string, value: string) {
  channelVariables.value = {
    ...channelVariables.value,
    [variable]: value,
  }
}

function serverConnectionUrl(server: NamedItem): string {
  const directUrl = stringValue(server.value.url)

  if (directUrl) {
    return resolveTemplateValue(directUrl)
  }

  const host = stringValue(server.value.host)

  if (!host) {
    return ''
  }

  const protocol = stringValue(server.value.protocol)
  const scheme = protocol === 'socket.io' ? 'http' : protocol || 'http'
  const pathname = stringValue(server.value.pathname)

  return `${scheme}://${resolveTemplateValue(host)}${resolveTemplateValue(pathname)}`
}

function resolveTemplateValue(value: string): string {
  return value.replace(/\{([^}]+)\}/g, (_, variable: string) => channelVariables.value[variable]?.trim() || `{${variable}}`)
}
</script>

<template>
  <div class="app-shell" :style="shellStyle">
    <SidebarNav
      :color-mode="colorMode"
      :nav-items="navItems"
      :query="documentState.query.value"
      :selected-section="selectedSection"
      @toggle-color-mode="toggleColorMode"
      @update:query="documentState.query.value = $event"
      @update:selected-section="selectedSection = $event"
    />

    <ResizeHandle label="Resize navigation" target="left" @start="startResize" />

    <DocumentationView
      :async-document="documentState.asyncDocument.value"
      :channel-variables="channelVariables"
      :channels="documentState.filteredChannels.value"
      :client-target-for="echoClient.clientTargetFor"
      :info="documentState.info.value"
      :message-aliases="documentState.messageAliases"
      :message-anchor="documentState.messageAnchor"
      :message-payload-preview="documentState.messagePayloadPreview"
      :message-payload-view="documentState.messagePayloadView.value"
      :messages="documentState.filteredMessages.value"
      :parse-error="documentState.parseResult.value.error"
      :schema-rows="documentState.schemaRows"
      :schemas="documentState.filteredSchemas.value"
      :scroll-to-hash="scrollToHash"
      :servers="documentState.servers.value"
      :summary-for="documentState.summaryFor"
      :top-protocols="documentState.topProtocols.value"
      @subscribe="echoClient.subscribeDocumentChannel"
      @update:message-payload-view="documentState.messagePayloadView.value = $event"
      @update-variable="updateChannelVariable"
    />

    <ResizeHandle label="Resize side panel" target="right" @start="startResize" />

    <ToolsPanel
      :bearer-token="echoClient.bearerToken.value"
      :client-error="echoClient.clientError.value"
      :client-events="echoClient.clientEvents.value"
      :client-status="echoClient.clientStatus.value"
      :echo-host="echoClient.echoHost.value"
      :parse-error="documentState.parseResult.value.error"
      :server-options="echoServerOptions"
      :side-panel="sidePanel"
      :source-text="documentState.sourceText.value"
      :subscribed-channels="echoClient.subscribedChannels.value"
      :version="documentState.info.value.version"
      :wildcard-pattern="echoClient.wildcardPattern.value"
      @connect="echoClient.connectClient"
      @disconnect="echoClient.disconnectClient"
      @import="documentState.importDocument"
      @reset="documentState.resetDocument"
      @subscribe-wildcard="echoClient.subscribeWildcard(documentState.channels.value)"
      @unsubscribe="echoClient.unsubscribeChannel"
      @update:bearer-token="echoClient.bearerToken.value = $event"
      @update:echo-host="echoClient.echoHost.value = $event"
      @update:side-panel="sidePanel = $event"
      @update:source-text="documentState.sourceText.value = $event"
      @update:wildcard-pattern="echoClient.wildcardPattern.value = $event"
    />
  </div>
</template>
