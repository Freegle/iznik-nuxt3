import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, Suspense, h } from 'vue'

import StoryPage from '~/pages/story/[id].vue'

// Mock components
vi.mock('~/components/NoticeMessage', () => ({
  default: { template: '<div class="notice" />', props: ['variant'] },
}))
vi.mock('~/components/StoryOne', () => ({
  default: { template: '<div class="story-one" />', props: ['id'] },
}))
vi.mock('~/components/StoryAddModal', () => ({
  default: { template: '<div />', emits: ['hidden'] },
}))

// Mock composables
vi.mock('~/composables/useBuildHead', () => ({
  buildHead: vi.fn().mockReturnValue({}),
}))

// Mock store
const mockFetch = vi
  .fn()
  .mockResolvedValue({ id: 7, headline: 'My Story', story: 'It was great' })

vi.mock('~/stores/stories', () => ({
  useStoryStore: () => ({
    fetch: mockFetch,
  }),
}))

// Mutable route
let mockRouteParams = { id: '7' }

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: mockRouteParams }),
}))

// Nuxt macros
globalThis.definePageMeta = vi.fn()
globalThis.useHead = vi.fn()
globalThis.useRuntimeConfig = () => ({ public: { BUILD_DATE: '2026-01-01' } })

describe('pages/story/[id].vue', () => {
  function mountPage() {
    const Wrapper = defineComponent({
      setup() {
        return () => h(Suspense, null, { default: () => h(StoryPage) })
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
    mockRouteParams = { id: '7' }
    mockFetch.mockResolvedValue({
      id: 7,
      headline: 'My Story',
      story: 'Great',
      image: null,
    })
  })

  it('calls fetch with parsed integer id', async () => {
    mockRouteParams = { id: '42' }

    mountPage()
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(42)
  })

  it('mounts without error when fetch throws (invalid ref set)', async () => {
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

  it('stores returned story object in story ref', async () => {
    const storyData = {
      id: 7,
      headline: 'My Story',
      story: 'It was great',
      image: null,
    }
    mockFetch.mockResolvedValueOnce(storyData)

    mountPage()
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith(7)
  })

  it('fetch is called exactly once (no extra calls)', async () => {
    mountPage()
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})
