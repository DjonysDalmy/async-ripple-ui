<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  meta?: string
}>()
</script>

<template>
  <div class="section-heading">
    <div>
      <span>{{ eyebrow }}</span>
      <h2>{{ title }}</h2>
    </div>
    <small v-if="meta">{{ meta }}</small>
    <slot />
  </div>
</template>
