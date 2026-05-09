import type { Component } from 'vue'

export type AnyRecord = Record<string, any>

export type SectionId = 'overview' | 'servers' | 'channels' | 'messages' | 'schemas'
export type ColorMode = 'light' | 'dark'
export type MessagePayloadView = 'object' | 'schema'
export type EchoChannelKind = 'public' | 'private' | 'presence'
export type ClientStatus = 'idle' | 'connecting' | 'connected' | 'error'
export type SidePanel = 'source' | 'client'
export type ResizeTarget = 'left' | 'right'

export interface NamedItem {
  id: string
  key: string
  value: AnyRecord
  aliases?: string[]
}

export interface ChannelItem extends NamedItem {
  address: string
  messages: NamedItem[]
  operations: OperationItem[]
}

export interface OperationItem extends NamedItem {
  action: string
  channelRef: string
  messages: NamedItem[]
}

export interface ParseResult {
  document: AnyRecord | null
  error: string
}

export interface ClientEventLog {
  id: number
  time: string
  event: string
  channel: string
  payload: unknown
}

export interface ServerOption {
  key: string
  label: string
  url: string
}

export interface NavItem {
  id: SectionId
  label: string
  icon: Component
}

export interface SchemaRow {
  key: string
  type: string
  required: boolean
  description: string
  enum: string
}
