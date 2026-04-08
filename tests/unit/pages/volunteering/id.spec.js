import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, Suspense, h } from 'vue'

import VolunteeringPage from '~/pages/volunteering/[[id]].vue'

// Mock components
vi.mock('~/components/NoticeMessage', () => ({
  default: { template: '<div class="notice" />', props: ['variant'] },
}))
vi.mock('~/components/VolunteerOpportunity', () => ({
  default: { template: '<div />', props: ['id', 'summary', 'titleTag'] },
}))

// Mock composables
vi.mock('~/composables/useBuildHead', () => ({
  buildHead: vi.fn().mockReturnValue({}),
}))

// Mock store
const mockFetch = vi.fn().mockResolvedValue({ id: 1, title: 'Help needed' })
const mockById = vi
  .fn()
  .mockReturnValue({ id: 1, title: 'Help needed', description: 'desc' })

vi.mock('~/stores/volunteering', () => ({
  useVolunteeringStore: () => ({
    fetch: mockFetch,
    byId: mockById,
  }),
}))

// Mutable route
let mockRouteParams = { id: '42' }
const mockRouterPush = vi.fn()

vi.hoisted(() => {
  vi.resetModules()
})

vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    useRoute: () => ({
      params: mockRouteParams,
      query: {},
      path: '/',
      name: 'volunteering-id',
      fullPath: '/',
      matched: [],
      redirectedFrom: undefined,
      meta: {},
    }),
    useRouter: () => ({ push: mockRouterPush }),
  }
})

globalThis.__testUseRoute = () => ({
  params: mockRouteParams,
  query: {},
  path: '/',
  name: 'volunteering-id',
  fullPath: '/',
  matched: [],
  redirectedFrom: undefined,
  meta: {},
})
globalThis.__testUseRouter = () => ({ push: mockRouterPush })

// Nuxt macros
globalThis.definePageMeta = vi.fn()
globalThis.useHead = vi.fn()
globalThis.useRuntimeConfig = () => ({ public: { BUILD_DATE: '2026-01-01' } })

describe('pages/volunteering/[[id]].vue', () => {
  function mountPage() {
    const Wrapper = defineComponent({
      setup() {
        return () => h(Suspense, null, { default: () => h(VolunteeringPage) })
      },
    })
    return mount(Wrapper, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'client-only': { template: '<div><slot /></div>' },
          'b-col': { template: '<div><slot /></div>' },
          'b-row': { template: '<div><slot /></div>' },
          'v-icon': { template: '<i />' },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockRouteParams = { id: '42' }
    mockFetch.mockResolvedValue({ id: 1, title: 'Help', description: 'desc' })
    mockById.mockReturnValue({ id: 1, title: 'Help', description: 'desc' })
  })

  it('calls fetch with parsed integer id', async () => {
    mockRouteParams = { id: '99' }

    mountPage()
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(99)
  })

  it('redirects to /volunteerings when id is 0', async () => {
    mockRouteParams = { id: '0' }

    mountPage()
    await flushPromises()

    expect(mockRouterPush).toHaveBeenCalledWith('/volunteerings')
  })

  it('redirects to /volunteerings when id is missing', async () => {
    mockRouteParams = {}

    mountPage()
    await flushPromises()

    // parseInt(undefined) = NaN which is falsy
    expect(mockRouterPush).toHaveBeenCalledWith('/volunteerings')
  })

  it('mounts without error when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('not found'))

    let mountError = null
    try {
      mountPage()
      await flushPromises()
    } catch (e) {
      mountError = e
    }

    expect(mountError).toBeNull()
  })

  it('does not redirect when id is valid', async () => {
    mockRouteParams = { id: '42' }

    mountPage()
    await flushPromises()

    expect(mockRouterPush).not.toHaveBeenCalled()
  })
})
