<script setup lang="ts">
import type { AnyRecord } from '@/types/asyncapi'

defineProps<{
  asyncapiVersion?: string
  info: AnyRecord
  topProtocols: string
}>()
</script>

<template>
  <section id="overview" class="intro-section">
    <div class="eyebrow">
      <span>{{ asyncapiVersion ? `AsyncAPI ${asyncapiVersion}` : 'AsyncAPI' }}</span>
      <span>{{ topProtocols }}</span>
    </div>

    <div class="intro-grid">
      <div>
        <h1>{{ info.title || 'Untitled AsyncAPI document' }}</h1>
        <p>{{ info.description || 'Paste an AsyncAPI document to render its event contract.' }}</p>
      </div>
    </div>
  </section>
</template>
