import { computed, onBeforeUnmount, ref } from 'vue'
import type { ResizeTarget } from '@/types/asyncapi'

const SIDEBAR_MIN_WIDTH = 220
const SIDEBAR_MAX_WIDTH = 420
const TOOLS_MIN_WIDTH = 320
const TOOLS_MAX_WIDTH = 620
const SIDEBAR_WIDTH_KEY = 'async-ripple-ui-sidebar-width'
const TOOLS_WIDTH_KEY = 'async-ripple-ui-tools-width'
const LEGACY_SIDEBAR_WIDTH_KEY = 'ripple-sidebar-width'
const LEGACY_TOOLS_WIDTH_KEY = 'ripple-tools-width'

/**
 * Controls the two resizable layout rails and persists the user's preferred widths.
 */
export function useResizablePanels() {
  const sidebarWidth = ref(clamp(numberFromStorage(SIDEBAR_WIDTH_KEY, LEGACY_SIDEBAR_WIDTH_KEY, 260), SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH))
  const toolsWidth = ref(clamp(numberFromStorage(TOOLS_WIDTH_KEY, LEGACY_TOOLS_WIDTH_KEY, 380), TOOLS_MIN_WIDTH, TOOLS_MAX_WIDTH))
  let activeResizeTarget: ResizeTarget | null = null

  const shellStyle = computed(() => ({
    '--sidebar-width': `${sidebarWidth.value}px`,
    '--tools-width': `${toolsWidth.value}px`,
  }))

  onBeforeUnmount(() => {
    stopResize()
  })

  function startResize(target: ResizeTarget, event: PointerEvent) {
    event.preventDefault()
    activeResizeTarget = target
    document.body.classList.add('is-resizing')
    window.addEventListener('pointermove', handleResize)
    window.addEventListener('pointerup', stopResize, { once: true })
    handleResize(event)
  }

  function handleResize(event: PointerEvent) {
    if (activeResizeTarget === 'left') {
      sidebarWidth.value = clamp(event.clientX, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH)
      return
    }

    if (activeResizeTarget === 'right') {
      toolsWidth.value = clamp(window.innerWidth - event.clientX, TOOLS_MIN_WIDTH, TOOLS_MAX_WIDTH)
    }
  }

  function stopResize() {
    if (!activeResizeTarget) {
      return
    }

    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth.value))
    localStorage.setItem(TOOLS_WIDTH_KEY, String(toolsWidth.value))
    localStorage.removeItem(LEGACY_SIDEBAR_WIDTH_KEY)
    localStorage.removeItem(LEGACY_TOOLS_WIDTH_KEY)
    window.removeEventListener('pointermove', handleResize)
    window.removeEventListener('pointerup', stopResize)
    document.body.classList.remove('is-resizing')
    activeResizeTarget = null
  }

  return {
    shellStyle,
    startResize,
  }
}

function numberFromStorage(key: string, legacyKey: string, fallback: number): number {
  if (typeof window === 'undefined') {
    return fallback
  }

  const value = Number(localStorage.getItem(key) ?? localStorage.getItem(legacyKey))
  return Number.isFinite(value) ? value : fallback
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
