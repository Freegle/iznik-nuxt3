import { vi, beforeEach, afterEach } from 'vitest'
import { config } from '@vue/test-utils'
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  defineComponent,
  defineAsyncComponent,
  h,
} from 'vue'

// ============================================
// VUE COMPOSITION API GLOBALS (for Nuxt auto-imports)
// ============================================
// Nuxt auto-imports Vue composition API functions. In tests, components that
// don't explicitly import these expect them to be globally available.
;(globalThis as Record<string, unknown>).ref = ref
;(globalThis as Record<string, unknown>).computed = computed
;(globalThis as Record<string, unknown>).watch = watch
;(globalThis as Record<string, unknown>).onMounted = onMounted
;(globalThis as Record<string, unknown>).onBeforeUnmount = onBeforeUnmount
;(globalThis as Record<string, unknown>).defineAsyncComponent = defineAsyncComponent


// ============================================
// GLOBAL VARIABLE MOCKS (for pinia-plugin-persistedstate)
// ============================================
// The compose store uses piniaPluginPersistedstate which is injected by Nuxt
// We need to provide a mock implementation for testing
;(globalThis as Record<string, unknown>).piniaPluginPersistedstate = {
  localStorage: () => ({
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }),
  sessionStorage: () => ({
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }),
}

// ============================================
// VUE WARNINGS HANDLER - Fail tests on warnings
// ============================================
const originalWarn = console.warn
console.warn = (...args: unknown[]) => {
  const message = typeof args[0] === 'string' ? args[0] : ''
  if (message.includes('[Vue warn]')) {
    // Throw an error to fail the test
    throw new Error(`Vue warning should not occur in tests: ${args.join(' ')}`)
  }
  originalWarn.apply(console, args)
}

// ============================================
// GLOBAL MOCKS (provided to template context)
// ============================================
// These functions are auto-imported by Nuxt but need to be provided as mocks in tests
config.global.mocks = {
  // Time formatting functions (from composables/useTimeFormat.js)
  datetimeshort: (val: string) => `formatted:${val}`,
  timeadapt: (val: string) => `adapted:${val}`,
  timeago: (val: string) => `ago:${val}`,
  dateonly: (val: string) => `dateonly:${val}`,
  dateshort: (val: string) => `dateshort:${val}`,
}

// ============================================
// GLOBAL STUBS (applied to all tests)
// ============================================
config.global.stubs = {
  // Stub bootstrap-vue-next components
  'b-button': {
    template:
      '<button :disabled="disabled" :class="variant"><slot /></button>',
    props: ['variant', 'disabled', 'size'],
  },
  'b-card': {
    template:
      '<div class="card"><slot /><slot name="header" /><slot name="footer" /></div>',
  },

  // Stub FontAwesome
  'v-icon': { template: '<i :class="icon"></i>', props: ['icon'] },

  // Stub NuxtLink
  NuxtLink: { template: '<a :href="to"><slot /></a>', props: ['to'] },
}

// ============================================
// RESET BETWEEN TESTS
// ============================================
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})
