import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, Suspense, h } from 'vue'

import MessagePage from '~/pages/message/[id].vue'

// Mock component imports to avoid deep Nuxt chains
vi.mock('~/components/MyMessage', () => ({
  default: { template: '<div />', props: ['id', 'showOld', 'expand'] },
}))
vi.mock('~/components/OurMessage', () => ({
  default: {
    template: '<div class="our-message" />',
    props: ['id', 'startExpanded', 'hideClose', 'recordView'],
    emits: ['not-found'],
  },
}))
vi.mock('~/components/GlobalMessage', () => ({
  default: { template: '<div />' },
}))
vi.mock('~/components/VisibleWhen', () => ({
  default: { template: '<div><slot /></div>', props: ['not'] },
}))
vi.mock('~/components/ExternalDa', () => ({
  default: { template: '<div />' },
}))
vi.mock('~/components/MicroVolunteering', () => ({
  default: { template: '<div />' },
}))

// Mock composables
vi.mock('~/composables/useBuildHead', () => ({
  buildHead: vi.fn().mockReturnValue({}),
}))
vi.mock('~/composables/useTwem', () => ({
  twem: vi.fn((s) => s),
}))
vi.mock('~/composables/useTimeFormat', () => ({
  dateonlyNoYear: vi.fn().mockReturnValue('1 Jan'),
}))

// Mock stores
const mockFetch = vi.fn().mockResolvedValue({})
const mockById = vi.fn().mockReturnValue(null)

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    fetch: mockFetch,
    byId: mockById,
  }),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    user: null,
  }),
}))

// Mutable route so each test can set its own params
let mockRouteReturn = { params: { id: '123' }, query: {} }

vi.hoisted(() => {
  vi.resetModules()
})

vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    useRoute: () => mockRouteReturn,
    ref: actual.ref,
    computed: actual.computed,
    onMounted: actual.onMounted,
  }
})

// Nuxt auto-imports
globalThis.__testUseRoute = () => mockRouteReturn
globalThis.definePageMeta = vi.fn()
globalThis.useHead = vi.fn()
globalThis.useRuntimeConfig = () => ({ public: { BUILD_DATE: '2026-01-01' } })

describe('pages/message/[id].vue', () => {
  // Wrap in Suspense since message page has top-level await in setup
  function mountPage() {
    const Wrapper = defineComponent({
      setup() {
        return () => h(Suspense, null, { default: () => h(MessagePage) })
      },
    })
    return mount(Wrapper, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'client-only': { template: '<div><slot /></div>' },
          'b-col': { template: '<div><slot /></div>' },
          'b-row': { template: '<div><slot /></div>' },
          'b-button': { template: '<button><slot /></button>' },
          'v-icon': { template: '<i />' },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockRouteReturn = { params: { id: '123' }, query: {} }
    mockFetch.mockResolvedValue({})
    mockById.mockReturnValue(null)
  })

  it('mounts without error when route is undefined (SSR hydration race)', async () => {
    mockRouteReturn = undefined

    let mountError = null
    try {
      mountPage()
      await flushPromises()
    } catch (e) {
      mountError = e
    }

    expect(mountError).toBeNull()
  })

  it('mounts without error when route.params has no id', async () => {
    mockRouteReturn = { params: {}, query: {} }

    let mountError = null
    try {
      mountPage()
      await flushPromises()
    } catch (e) {
      mountError = e
    }

    expect(mountError).toBeNull()
  })

  it('calls fetch with parsed integer id on setup', async () => {
    mockRouteReturn = { params: { id: '98765' }, query: {} }

    mountPage()
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(98765)
  })

  it('mounts without error when fetch throws (failed state set gracefully)', async () => {
    mockRouteReturn = { params: { id: '123' }, query: {} }
    mockFetch.mockRejectedValueOnce(new Error('network error'))

    let mountError = null
    try {
      mountPage()
      await flushPromises()
    } catch (e) {
      mountError = e
    }

    expect(mountError).toBeNull()
  })

  it('mounts without error when fetch returns null (failed state set)', async () => {
    // Return null on first call (setup), allow second call (onMounted) to succeed
    mockFetch.mockResolvedValueOnce(null).mockResolvedValue({})

    let mountError = null
    try {
      mountPage()
      await flushPromises()
    } catch (e) {
      mountError = e
    }

    expect(mountError).toBeNull()
  })

  it('initial fetch is called without force flag', async () => {
    mockRouteReturn = { params: { id: '42' }, query: {} }

    mountPage()
    await flushPromises()

    expect(mockFetch.mock.calls[0]).toEqual([42])
  })

  it('calls fetch a second time on mount with force=true', async () => {
    mockRouteReturn = { params: { id: '42' }, query: {} }

    mountPage()
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(42, true)
  })

  it('fetch is called exactly twice per mount (setup + onMounted refetch)', async () => {
    mockRouteReturn = { params: { id: '42' }, query: {} }

    mountPage()
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('onMounted fetch also completes without error when it throws', async () => {
    mockRouteReturn = { params: { id: '42' }, query: {} }
    // First call (setup) resolves, second call (onMounted) rejects
    mockFetch
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('reload failed'))

    let mountError = null
    try {
      mountPage()
      await flushPromises()
    } catch (e) {
      mountError = e
    }

    expect(mountError).toBeNull()
  })
})
