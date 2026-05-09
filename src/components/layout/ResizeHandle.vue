<script setup lang="ts">
import type { ResizeTarget } from '@/types/asyncapi'

defineProps<{
  label: string
  target: ResizeTarget
}>()

const emit = defineEmits<{
  start: [target: ResizeTarget, event: PointerEvent]
}>()
</script>

<template>
  <div
    class="resize-handle"
    :class="`resize-handle-${target}`"
    role="separator"
    :aria-label="label"
    aria-orientation="vertical"
    @pointerdown="emit('start', target, $event)"
  />
</template>
