import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Newsletter from '~/modtools/pages/members/newsletter.vue'

// Mock story store
const mockStoryStore = {
  list: {},
  fetchNewsletterReviewing: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/stories', () => ({
  useStoryStore: () => mockStoryStore,
}))

describe('Newsletter Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStoryStore.list = {}
  })

  function mountComponent() {
    return mount(Newsletter, {
      global: {
        stubs: {
          ScrollToTop: { template: '<div class="scroll-to-top" />' },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          ModStoryReview: {
            template:
              '<div class="mod-story-review" :data-story-id="story.id" :data-newsletter="newsletter" />',
            props: ['story', 'newsletter'],
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

    it('passes newsletter prop as true to ModStoryReview', async () => {
      mockStoryStore.list = {
        1: { id: 1, headline: 'Story 1' },
      }
      const wrapper = mountComponent()
      await flushPromises()

      const storyComponent = wrapper.find('.mod-story-review')
      // Boolean prop `newsletter` is passed as true (renders as empty string in HTML attributes)
      expect(storyComponent.attributes('data-newsletter')).toBe('')
    })

    it('passes correct story data to ModStoryReview', async () => {
      mockStoryStore.list = {
        42: { id: 42, headline: 'My great story', body: 'Details here' },
      }
      const wrapper = mountComponent()
      await flushPromises()

      const storyComponent = wrapper.find('.mod-story-review')
      expect(storyComponent.attributes('data-story-id')).toBe('42')
      expect(storyComponent.exists()).toBe(true)
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
    it('fetches newsletter stories on mount', async () => {
      mountComponent()
      await flushPromises()

      expect(mockStoryStore.fetchNewsletterReviewing).toHaveBeenCalled()
    })

    it('fetches stories only once on mount', async () => {
      mountComponent()
      await flushPromises()

      expect(mockStoryStore.fetchNewsletterReviewing).toHaveBeenCalledTimes(1)
    })
  })
})
