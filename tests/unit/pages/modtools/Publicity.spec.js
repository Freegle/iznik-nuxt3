import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Publicity from '~/modtools/pages/publicity.vue'

// Mock publicity store
const mockPublicityStore = {
  list: {},
  popularposts: {},
  clear: vi.fn().mockResolvedValue(),
  fetch: vi.fn().mockResolvedValue(),
}

vi.mock('@/stores/publicity', () => ({
  usePublicityStore: () => mockPublicityStore,
}))

describe('Publicity Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPublicityStore.list = {}
    mockPublicityStore.popularposts = {}
  })

  function mountComponent() {
    return mount(Publicity, {
      global: {
        stubs: {
          ModHelpPublicity: { template: '<div class="help-publicity"></div>' },
          ModMissingFacebook: {
            template: '<div class="missing-facebook"></div>',
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          ModSocialAction: {
            template: '<div class="social-action" :data-id="item.id"></div>',
            props: ['item'],
          },
          ModPopularPost: {
            template: '<div class="popular-post" :data-id="item.id"></div>',
            props: ['item'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders ModHelpPublicity component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.help-publicity').exists()).toBe(true)
    })

    it('renders ModMissingFacebook component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.missing-facebook').exists()).toBe(true)
    })

    it('shows notice message when no items and no popular posts', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('There are no publicity items to review')
    })

    it('hides notice message when items exist', async () => {
      mockPublicityStore.list = {
        1: { id: 1, date: '2024-01-01' },
      }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })

    it('hides notice message when popular posts exist', async () => {
      mockPublicityStore.popularposts = {
        1: { id: 1, date: '2024-01-01' },
      }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })
  })

  describe('mounted lifecycle', () => {
    it('clears and fetches publicity items on mount', async () => {
      mountComponent()
      await flushPromises()

      expect(mockPublicityStore.clear).toHaveBeenCalled()
      expect(mockPublicityStore.fetch).toHaveBeenCalledWith({ reviewed: 0 })
    })
  })

  describe('items computed property', () => {
    it('returns empty array when list is null', () => {
      mockPublicityStore.list = null
      const wrapper = mountComponent()
      expect(wrapper.vm.items).toEqual([])
    })

    it('returns empty array when list is empty', () => {
      mockPublicityStore.list = {}
      const wrapper = mountComponent()
      expect(wrapper.vm.items).toEqual([])
    })

    it('returns sorted array of items by date (newest first)', () => {
      mockPublicityStore.list = {
        1: { id: 1, date: '2024-01-01' },
        2: { id: 2, date: '2024-01-15' },
        3: { id: 3, date: '2024-01-10' },
      }
      const wrapper = mountComponent()
      const items = wrapper.vm.items

      expect(items).toHaveLength(3)
      expect(items[0].id).toBe(2) // newest
      expect(items[1].id).toBe(3) // middle
      expect(items[2].id).toBe(1) // oldest
    })

    it('renders ModSocialAction for each item', async () => {
      mockPublicityStore.list = {
        1: { id: 1, date: '2024-01-01' },
        2: { id: 2, date: '2024-01-02' },
      }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const socialActions = wrapper.findAll('.social-action')
      expect(socialActions).toHaveLength(2)
    })
  })

  describe('popularPosts computed property', () => {
    it('returns empty array when popularposts is null', () => {
      mockPublicityStore.popularposts = null
      const wrapper = mountComponent()
      expect(wrapper.vm.popularPosts).toEqual([])
    })

    it('returns empty array when popularposts is empty', () => {
      mockPublicityStore.popularposts = {}
      const wrapper = mountComponent()
      expect(wrapper.vm.popularPosts).toEqual([])
    })

    it('returns sorted array of popular posts by date (newest first)', () => {
      mockPublicityStore.popularposts = {
        1: { id: 1, date: '2024-02-01' },
        2: { id: 2, date: '2024-02-20' },
        3: { id: 3, date: '2024-02-10' },
      }
      const wrapper = mountComponent()
      const posts = wrapper.vm.popularPosts

      expect(posts).toHaveLength(3)
      expect(posts[0].id).toBe(2) // newest
      expect(posts[1].id).toBe(3) // middle
      expect(posts[2].id).toBe(1) // oldest
    })

    it('renders ModPopularPost for each popular post', async () => {
      mockPublicityStore.popularposts = {
        1: { id: 1, date: '2024-02-01' },
        2: { id: 2, date: '2024-02-02' },
      }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const popularPosts = wrapper.findAll('.popular-post')
      expect(popularPosts).toHaveLength(2)
    })
  })
})
