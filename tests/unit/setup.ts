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
// NUXT COMPOSABLE GLOBALS (for auto-imports)
// ============================================
// Mock useNuxtApp to provide $api and other injected services
const mockApi = {
  dashboard: { fetch: vi.fn().mockResolvedValue({ data: {} }) },
  message: { fetch: vi.fn().mockResolvedValue({ data: {} }), fetchMultiple: vi.fn().mockResolvedValue([]) },
  user: { fetch: vi.fn().mockResolvedValue({ data: {} }) },
  chat: { fetch: vi.fn().mockResolvedValue({ data: {} }), listChats: vi.fn().mockResolvedValue([]) },
  group: { fetch: vi.fn().mockResolvedValue({ data: {} }) },
  news: { fetch: vi.fn().mockResolvedValue({ data: {} }) },
  notification: { fetch: vi.fn().mockResolvedValue({ data: {} }) },
  story: { fetch: vi.fn().mockResolvedValue({ data: {} }) },
  tryst: { fetch: vi.fn().mockResolvedValue({ data: {} }) },
  volunteering: { fetch: vi.fn().mockResolvedValue({ data: {} }) },
  communityevent: { fetch: vi.fn().mockResolvedValue({ data: {} }) },
  shortlink: { fetch: vi.fn().mockResolvedValue({ data: {} }) },
  address: { fetch: vi.fn().mockResolvedValue({ data: {} }) },
  isochrone: { fetch: vi.fn().mockResolvedValue({ data: {} }) },
  location: { fetch: vi.fn().mockResolvedValue({ data: {} }) },
}

const mockNuxtApp = {
  $api: mockApi,
  $dayjs: (val: unknown) => ({
    format: () => 'formatted',
    fromNow: () => 'now',
    isBefore: () => false,
    isAfter: () => true,
    diff: () => 0,
    add: () => ({ format: () => 'formatted' }),
    subtract: () => ({ format: () => 'formatted' }),
  }),
  $pinia: {},
}

;(globalThis as Record<string, unknown>).useNuxtApp = () => mockNuxtApp

// Mock useRoute
;(globalThis as Record<string, unknown>).useRoute = () => ({
  params: {},
  query: {},
  path: '/',
  name: 'index',
  fullPath: '/',
})

// Mock useRouter
;(globalThis as Record<string, unknown>).useRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
})

// Mock useRuntimeConfig
;(globalThis as Record<string, unknown>).useRuntimeConfig = () => ({
  public: {
    APIv1: 'http://apiv1.localhost',
    APIv2: 'http://apiv2.localhost',
    GOOGLE_MAPS_KEY: 'test-key',
    GOOGLE_CLIENT_ID: 'test-client-id',
    FACEBOOK_APPID: 'test-fb-id',
    SENTRY_DSN: '',
    YAHOO_APPID: 'test-yahoo-id',
  },
})

// Mock navigateTo
;(globalThis as Record<string, unknown>).navigateTo = vi.fn()

// Mock useCookie
;(globalThis as Record<string, unknown>).useCookie = () => ref(null)

// Mock useState
;(globalThis as Record<string, unknown>).useState = (key: string, init?: () => unknown) => ref(init ? init() : null)

// Mock useFetch
;(globalThis as Record<string, unknown>).useFetch = vi.fn().mockResolvedValue({ data: ref(null), pending: ref(false), error: ref(null) })

// Mock useAsyncData
;(globalThis as Record<string, unknown>).useAsyncData = vi.fn().mockResolvedValue({ data: ref(null), pending: ref(false), error: ref(null) })

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
