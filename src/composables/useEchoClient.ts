import { onBeforeUnmount, ref, type Ref } from 'vue'
import { io } from 'socket.io-client'
import type { ChannelItem, ClientEventLog, ClientStatus, EchoChannelKind } from '@/types/asyncapi'
import { extractVariables, inferChannelKind } from '@/utils/asyncapi'

interface SocketLike {
  id?: string
  connected?: boolean
  disconnect(): SocketLike
  emit(event: string, ...args: unknown[]): SocketLike
  on(event: string, callback: (...args: any[]) => void): SocketLike
  removeAllListeners?(event?: string): SocketLike
  onevent?: (packet: { data?: unknown[] }) => void
}

/**
 * Small Socket.IO realtime client used by the documentation surface.
 *
 * It stays protocol-focused: UI panels decide where to display errors and logs.
 */
export function useEchoClient(channelVariables: Ref<Record<string, string>>, openClientPanel: () => void) {
  const clientStatus = ref<ClientStatus>('idle')
  const clientError = ref('')
  const echoHost = ref('')
  const bearerToken = ref('')
  const wildcardPattern = ref('*')
  const subscribedChannels = ref<string[]>([])
  const clientEvents = ref<ClientEventLog[]>([])
  let socket: SocketLike | null = null
  let eventId = 0

  onBeforeUnmount(() => {
    disconnectClient()
  })

  function connectClient() {
    clientError.value = ''

    if (!echoHost.value.trim()) {
      clientStatus.value = 'error'
      clientError.value = 'Choose or enter a Socket.IO server URL before connecting.'
      return
    }

    if (socket?.connected) {
      return
    }

    clientStatus.value = 'connecting'
    socket = io(echoHost.value, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    }) as unknown as SocketLike

    attachSocketEventCapture(socket)

    socket.on('connect', () => {
      clientStatus.value = 'connected'
      pushClientEvent('socket:connected', 'system', { socket_id: socket?.id })
    })

    socket.on('connect_error', (error: Error) => {
      clientStatus.value = 'error'
      clientError.value = error.message || 'Could not connect to the Socket.IO server.'
      pushClientEvent('socket:error', 'system', clientError.value)
    })

    socket.on('disconnect', (reason: string) => {
      clientStatus.value = 'idle'
      subscribedChannels.value = []
      pushClientEvent('socket:disconnected', 'system', reason)
    })

    socket.on('subscription_error', (channel: string, status: number) => {
      pushClientEvent('subscription:error', channel, { status })
    })

    socket.on('presence:subscribed', (channel: string, members: unknown) => {
      pushClientEvent('presence:subscribed', channel, members)
    })

    socket.on('presence:joining', (channel: string, member: unknown) => {
      pushClientEvent('presence:joining', channel, member)
    })

    socket.on('presence:leaving', (channel: string, member: unknown) => {
      pushClientEvent('presence:leaving', channel, member)
    })
  }

  function disconnectClient() {
    if (!socket) {
      return
    }

    socket.removeAllListeners?.()
    socket.disconnect()
    socket = null
    clientStatus.value = 'idle'
    subscribedChannels.value = []
  }

  function unsubscribeChannel(channel: string) {
    const wireChannel = normalizeWireChannel(channel)
    socket?.emit('unsubscribe', { channel: wireChannel })
    subscribedChannels.value = subscribedChannels.value.filter((item) => item !== wireChannel)
    pushClientEvent('subscription:leave', wireChannel, {})
  }

  function subscribeDocumentChannel(channel: ChannelItem) {
    const target = clientTargetFor(channel)

    if (!target.ready) {
      openClientPanel()
      clientError.value = `Fill variables for ${target.channel}.`
      return
    }

    connectClient()
    openClientPanel()
    subscribeChannel(target.channel, target.kind)
  }

  function subscribeWildcard(channels: ChannelItem[]) {
    const pattern = wildcardPattern.value.trim() || '*'
    const matcher = wildcardMatcher(pattern)
    const matchedTargets = channels
      .map((channel) => {
        const target = clientTargetFor(channel)
        const wireChannel = normalizeWireChannel(target.channel, target.kind)

        return {
          address: channel.address,
          target,
          wireChannel,
        }
      })
      .filter(({ address, wireChannel }) => matcher(address) || matcher(wireChannel))

    const readyTargets = matchedTargets.filter(({ target }) => target.ready)
    const skipped = matchedTargets.length - readyTargets.length

    openClientPanel()

    if (!readyTargets.length) {
      clientError.value = `No ready channels matched "${pattern}".`
      return
    }

    connectClient()

    for (const { target } of readyTargets) {
      subscribeChannel(target.channel, target.kind)
    }

    pushClientEvent('subscription:wildcard', 'system', {
      pattern,
      subscribed: readyTargets.length,
      skipped,
    })

    if (skipped) {
      clientError.value = `${skipped} matched channel(s) need variables before subscribing.`
    }
  }

  function clientTargetFor(channel: ChannelItem) {
    const kind = inferChannelKind(channel.address)
    const variables = extractVariables(channel.address)
    const resolvedChannel = resolveChannelPattern(channel.address)

    return {
      channel: resolvedChannel,
      kind,
      ready: variables.every((variable) => channelVariables.value[variable]?.trim()),
    }
  }

  function subscribeChannel(channel: string, kind: EchoChannelKind) {
    const wireChannel = normalizeWireChannel(channel, kind)

    if (!wireChannel || subscribedChannels.value.includes(wireChannel)) {
      return
    }

    const authHeaders: Record<string, string> = {}

    if (bearerToken.value.trim()) {
      authHeaders.Authorization = `Bearer ${bearerToken.value.trim()}`
    }

    socket?.emit('subscribe', {
      channel: wireChannel,
      auth: { headers: authHeaders },
    })

    subscribedChannels.value = [...subscribedChannels.value, wireChannel]
    pushClientEvent('subscription:join', wireChannel, {
      kind,
      authenticated: Boolean(authHeaders.Authorization),
    })
  }

  function attachSocketEventCapture(activeSocket: SocketLike) {
    const originalOnevent = activeSocket.onevent?.bind(activeSocket)

    activeSocket.onevent = (packet) => {
      const data = packet.data ?? []
      const [event, channel, payload] = data

      if (
        typeof event === 'string' &&
        typeof channel === 'string' &&
        !event.startsWith('presence:') &&
        event !== 'subscription_error'
      ) {
        pushClientEvent(event, channel, payload)
      }

      originalOnevent?.(packet)
    }
  }

  function pushClientEvent(event: string, channel: string, payload: unknown) {
    clientEvents.value = [
      {
        id: ++eventId,
        time: new Date().toLocaleTimeString(),
        event,
        channel,
        payload,
      },
      ...clientEvents.value,
    ].slice(0, 80)
  }

  function normalizeWireChannel(channel: string, kind?: EchoChannelKind): string {
    const cleanChannel = channel.trim()

    if (
      cleanChannel.startsWith('private-') ||
      cleanChannel.startsWith('presence-') ||
      kind === 'public' ||
      !kind
    ) {
      return cleanChannel
    }

    return `${kind}-${cleanChannel}`
  }

  function resolveChannelPattern(pattern: string): string {
    return pattern.replace(/\{([^}]+)\}/g, (_, variable: string) => {
      const value = channelVariables.value[variable]?.trim()
      return value || `{${variable}}`
    })
  }

  function wildcardMatcher(pattern: string): (value: string) => boolean {
    const escaped = pattern
      .split('*')
      .map((part) => part.replace(/[|\\{}()[\]^$+?.]/g, '\\$&'))
      .join('.*')
    const regex = new RegExp(`^${escaped}$`)

    return (value) => regex.test(value)
  }

  return {
    bearerToken,
    clientError,
    clientEvents,
    clientStatus,
    clientTargetFor,
    connectClient,
    disconnectClient,
    echoHost,
    subscribeDocumentChannel,
    subscribeWildcard,
    subscribedChannels,
    unsubscribeChannel,
    wildcardPattern,
  }
}
