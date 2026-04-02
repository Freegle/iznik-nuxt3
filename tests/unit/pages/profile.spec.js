import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, Suspense, h } from 'vue'

import ProfilePage from '~/pages/profile/[id].vue'

// Mock ProfileInfo to avoid deep import chains
vi.mock('~/components/ProfileInfo', () => ({
  default: { template: '<div class="profile-info" />', props: ['id'] },
}))

// Mock user store
const mockFetch = vi.fn().mockResolvedValue({})

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    fetch: mockFetch,
    byId: vi.fn(() => null),
  }),
}))

// Mutable route so each test can set its own params
let mockRouteReturn = { params: { id: '123' }, query: {} }
const mockRouter = { back: vi.fn(), push: vi.fn() }

vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    useRoute: () => mockRouteReturn,
    useRouter: () => mockRouter,
    ref: actual.ref,
  }
})

// Nuxt macros
globalThis.definePageMeta = vi.fn()
globalThis.useHead = vi.fn()
globalThis.useRuntimeConfig = () => ({ public: { BUILD_DATE: '2026-01-01' } })

describe('pages/profile/[id].vue', () => {
  // Wrap in Suspense since profile page has conditional top-level await in setup
  function mountPage() {
    const Wrapper = defineComponent({
      setup() {
        return () => h(Suspense, null, { default: () => h(ProfilePage) })
      },
    })
    return mount(Wrapper, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'client-only': { template: '<div><slot /></div>' },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockRouteReturn = { params: { id: '123' }, query: {} }
  })

  it('mounts without error when useRoute returns undefined (SSR hydration race)', async () => {
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
    expect(mockFetch).not.toHaveBeenCalledWith(0)
    expect(mockFetch).not.toHaveBeenCalledWith(NaN)
  })

  it('calls userStore.fetch with parsed id when route params are valid', async () => {
    mockRouteReturn = { params: { id: '44831810' }, query: {} }

    mountPage()
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(44831810)
  })
})
