import { ref, watch } from 'vue'
import type { ColorMode } from '@/types/asyncapi'

const COLOR_MODE_KEY = 'async-ripple-ui-color-mode'
const LEGACY_COLOR_MODE_KEY = 'ripple-color-mode'

export function useColorMode() {
  const colorMode = ref<ColorMode>(initialColorMode())

  watch(
    colorMode,
    (mode) => {
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = mode
        localStorage.setItem(COLOR_MODE_KEY, mode)
        localStorage.removeItem(LEGACY_COLOR_MODE_KEY)
      }
    },
    { immediate: true },
  )

  function toggleColorMode() {
    colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
  }

  return {
    colorMode,
    toggleColorMode,
  }
}

function initialColorMode(): ColorMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const stored = localStorage.getItem(COLOR_MODE_KEY) ?? localStorage.getItem(LEGACY_COLOR_MODE_KEY)

  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
