<script setup lang="ts">
import { FileUp, RefreshCcw, TerminalSquare } from 'lucide-vue-next'

defineProps<{
  parseError: string
  sourceText: string
  version?: string
}>()

const emit = defineEmits<{
  import: [event: Event]
  reset: []
  'update:source-text': [value: string]
}>()

function updateSource(event: Event) {
  emit('update:source-text', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div class="panel-toolbar">
    <div>
      <span>Source</span>
      <strong>{{ version || 'Draft' }}</strong>
    </div>
    <div class="icon-actions">
      <button type="button" title="Reset sample" @click="emit('reset')">
        <RefreshCcw :size="16" />
      </button>
      <label title="Import YAML or JSON">
        <FileUp :size="16" />
        <input type="file" accept=".yaml,.yml,.json,application/json,text/yaml" @change="emit('import', $event)" />
      </label>
    </div>
  </div>

  <textarea
    :value="sourceText"
    spellcheck="false"
    aria-label="AsyncAPI source"
    @input="updateSource"
  />

  <div class="panel-status" :class="{ invalid: parseError }">
    <TerminalSquare :size="16" aria-hidden="true" />
    <span>{{ parseError ? 'Parser error' : 'Document parsed' }}</span>
  </div>
</template>
