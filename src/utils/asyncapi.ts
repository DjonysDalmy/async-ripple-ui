import type { AnyRecord, EchoChannelKind } from '@/types/asyncapi'

export function asRecord(value: unknown): AnyRecord {
  return isRecord(value) ? value : {}
}

export function isRecord(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function refValue(value: unknown): string {
  return isRecord(value) && typeof value.$ref === 'string' ? value.$ref : ''
}

export function lastRefSegment(ref: string): string {
  if (!ref) {
    return ''
  }

  const cleanRef = ref.split('/').filter(Boolean).at(-1) ?? ''
  return cleanRef.replace(/~1/g, '/').replace(/~0/g, '~')
}

export function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function extractVariables(pattern: string): string[] {
  return [...pattern.matchAll(/\{([^}]+)\}/g)].flatMap((match) => (match[1] ? [match[1]] : []))
}

export function inferChannelKind(channel: string): EchoChannelKind {
  if (channel.startsWith('presence-') || channel.includes('presenca')) {
    return 'presence'
  }

  if (channel.startsWith('private-') || channel.includes('privado') || channel.includes('notificacoes-do-app')) {
    return 'private'
  }

  return 'public'
}

export function jsonPreview(value: unknown): string {
  return JSON.stringify(value, null, 2)
}
