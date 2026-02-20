import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Stories from '~/modtools/pages/members/stories.vue'

// Mock story store
const mockStoryStore = {
  list: {},
  fetchReviewing: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/stories', () => ({
  useStoryStore: () => mockStoryStore,
}))

describe('Stories Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStoryStore.list = {}
  })

  function mountComponent() {
    return mount(Stories, {
      global: {
        stubs: {
          ScrollToTop: { template: '<div class="scroll-to-top" />' },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          ModStoryReview: {
            template:
              '<div class="mod-story-review" :data-story-id="story.id" />',
            props: ['story'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('shows empty message when no stories', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'There are no stories to review at the moment'
      )
    })

    it('renders stories when available', async () => {
      mockStoryStore.list = {
        1: { id: 1, headline: 'Story 1' },
        2: { id: 2, headline: 'Story 2' },
      }
      const wrapper = mountComponent()
      await flushPromises()

      const storyComponents = wrapper.findAll('.mod-story-review')
      expect(storyComponents).toHaveLength(2)
    })

    it('passes story prop to ModStoryReview', async () => {
      mockStoryStore.list = {
        42: { id: 42, headline: 'Test Story' },
      }
      const wrapper = mountComponent()
      await flushPromises()

      const storyComponent = wrapper.find('.mod-story-review')
      expect(storyComponent.attributes('data-story-id')).toBe('42')
    })

    it('hides empty message when stories exist', async () => {
      mockStoryStore.list = {
        1: { id: 1, headline: 'Story 1' },
      }
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('returns empty array when list is null', () => {
      mockStoryStore.list = null
      const wrapper = mountComponent()
      expect(wrapper.vm.stories).toEqual([])
    })

    it('returns empty array when list is empty', () => {
      mockStoryStore.list = {}
      const wrapper = mountComponent()
      expect(wrapper.vm.stories).toEqual([])
    })

    it('converts list object to array of stories', () => {
      mockStoryStore.list = {
        1: { id: 1, headline: 'Story 1' },
        2: { id: 2, headline: 'Story 2' },
      }
      const wrapper = mountComponent()
      const stories = wrapper.vm.stories

      expect(stories).toHaveLength(2)
      expect(stories).toContainEqual({ id: 1, headline: 'Story 1' })
      expect(stories).toContainEqual({ id: 2, headline: 'Story 2' })
    })
  })

  describe('lifecycle', () => {
    it('fetches unreviewed stories on mount', async () => {
      mountComponent()
      await flushPromises()

      expect(mockStoryStore.fetchReviewing).toHaveBeenCalled()
    })

    it('fetches stories only once on mount', async () => {
      mountComponent()
      await flushPromises()

      expect(mockStoryStore.fetchReviewing).toHaveBeenCalledTimes(1)
    })
  })
})
