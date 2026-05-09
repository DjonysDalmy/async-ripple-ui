<script setup lang="ts">
import { computed } from 'vue'
import { Moon, Search, Sun } from 'lucide-vue-next'
import type { ColorMode, NavItem, SectionId } from '@/types/asyncapi'

const props = defineProps<{
  colorMode: ColorMode
  navItems: NavItem[]
  query: string
  selectedSection: SectionId
}>()

const emit = defineEmits<{
  'toggle-color-mode': []
  'update:query': [value: string]
  'update:selected-section': [value: SectionId]
}>()

const brandLogoUrl = computed(() =>
  props.colorMode === 'dark'
    ? '/async-ripple-ui.svg?v=5'
    : '/async-ripple-ui-black.svg?v=5',
)
</script>

<template>
  <aside class="sidebar" aria-label="Documentation sections">
    <div class="sidebar-top">
      <div class="brand">
        <img class="brand-mark" :src="brandLogoUrl" alt="" aria-hidden="true" />
        <div>
          <strong>Async Ripple UI</strong>
          <span>AsyncAPI UI</span>
        </div>
      </div>

      <button
        class="theme-toggle"
        type="button"
        :title="colorMode === 'dark' ? 'Use light mode' : 'Use dark mode'"
        @click="emit('toggle-color-mode')"
      >
        <Sun v-if="colorMode === 'dark'" :size="16" aria-hidden="true" />
        <Moon v-else :size="16" aria-hidden="true" />
      </button>
    </div>

    <label class="search-field">
      <Search :size="16" aria-hidden="true" />
      <input
        :value="query"
        type="search"
        placeholder="Search events, messages, schemas"
        @input="emit('update:query', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <nav class="nav-list">
      <a
        v-for="item in navItems"
        :key="item.id"
        :class="{ active: selectedSection === item.id }"
        :href="`#${item.id}`"
        @click="emit('update:selected-section', item.id)"
      >
        <component :is="item.icon" :size="16" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </a>
    </nav>
  </aside>
</template>
