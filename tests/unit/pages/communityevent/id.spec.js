import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, Suspense, h } from 'vue'

import CommunityEventPage from '~/pages/communityevent/[[id]].vue'

// Mock components
vi.mock('~/components/NoticeMessage', () => ({
  default: { template: '<div class="notice" />', props: ['variant'] },
}))
vi.mock('~/components/CommunityEvent', () => ({
  default: { template: '<div />', props: ['id', 'summary', 'titleTag'] },
}))

// Mock composables
vi.mock('~/composables/useBuildHead', () => ({
  buildHead: vi.fn().mockReturnValue({}),
}))

// Mock store
const mockFetch = vi.fn().mockResolvedValue({ id: 1, title: 'Community Swap' })
const mockById = vi
  .fn()
  .mockReturnValue({ id: 1, title: 'Community Swap', description: 'desc' })

vi.mock('~/stores/communityevent', () => ({
  useCommunityEventStore: () => ({
    fetch: mockFetch,
    byId: mockById,
  }),
}))

// Mutable route
let mockRouteParams = { id: '10' }
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
      name: 'communityevent-id',
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
  name: 'communityevent-id',
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

describe('pages/communityevent/[[id]].vue', () => {
  function mountPage() {
    const Wrapper = defineComponent({
      setup() {
        return () => h(Suspense, null, { default: () => h(CommunityEventPage) })
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
    mockRouteParams = { id: '10' }
    mockFetch.mockResolvedValue({ id: 1, title: 'Event', description: 'desc' })
    mockById.mockReturnValue({ id: 1, title: 'Event', description: 'desc' })
  })

  it('calls fetch with parsed integer id', async () => {
    mockRouteParams = { id: '55' }

    mountPage()
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(55)
  })

  it('redirects to /communityevents when id is 0', async () => {
    mockRouteParams = { id: '0' }

    mountPage()
    await flushPromises()

    expect(mockRouterPush).toHaveBeenCalledWith('/communityevents')
  })

  it('redirects to /communityevents when id is missing', async () => {
    mockRouteParams = {}

    mountPage()
    await flushPromises()

    expect(mockRouterPush).toHaveBeenCalledWith('/communityevents')
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
    mountPage()
    await flushPromises()

    expect(mockRouterPush).not.toHaveBeenCalled()
  })
})
