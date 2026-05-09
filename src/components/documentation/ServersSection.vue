<script setup lang="ts">
import { Server } from 'lucide-vue-next'
import type { NamedItem } from '@/types/asyncapi'
import SectionHeading from './SectionHeading.vue'

defineProps<{
  servers: NamedItem[]
}>()
</script>

<template>
  <section id="servers" class="doc-section">
    <SectionHeading eyebrow="Infrastructure" title="Servers" :meta="`${servers.length} configured`" />

    <div class="server-grid">
      <article v-for="serverItem in servers" :key="serverItem.id" class="surface">
        <div class="surface-header">
          <Server :size="18" aria-hidden="true" />
          <div>
            <h3>{{ serverItem.key }}</h3>
            <p>{{ serverItem.value.description || 'No description.' }}</p>
          </div>
        </div>
        <dl class="meta-list">
          <div>
            <dt>Host</dt>
            <dd>{{ serverItem.value.host || serverItem.value.url || 'Not specified' }}</dd>
          </div>
          <div>
            <dt>Protocol</dt>
            <dd>{{ serverItem.value.protocol || 'Not specified' }}</dd>
          </div>
          <div v-if="serverItem.value.pathname">
            <dt>Path</dt>
            <dd>{{ serverItem.value.pathname }}</dd>
          </div>
        </dl>
      </article>
    </div>
  </section>
</template>
