<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  compact?: boolean
  source?: string
  value?: unknown
}>()

const jsonSource = computed(() => {
  if (typeof props.source === 'string') {
    return props.source
  }

  return JSON.stringify(props.value, null, 2) ?? 'undefined'
})

const highlightedJson = computed(() => highlightJson(jsonSource.value))

function highlightJson(source: string): string {
  return escapeHtml(source).replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (token) => {
      if (token.endsWith(':')) {
        return `<span class="json-key">${token}</span>`
      }

      if (token.startsWith('"')) {
        return `<span class="json-string">${token}</span>`
      }

      if (token === 'true' || token === 'false') {
        return `<span class="json-boolean">${token}</span>`
      }

      if (token === 'null') {
        return `<span class="json-null">${token}</span>`
      }

      return `<span class="json-number">${token}</span>`
    },
  )
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
</script>

<template>
  <pre class="code-panel json-code" :class="{ compact }"><code v-html="highlightedJson" /></pre>
</template>
