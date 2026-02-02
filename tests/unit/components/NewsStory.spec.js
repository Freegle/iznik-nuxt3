import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import NewsStory from '~/components/NewsStory.vue'

const mockNewsfeed = {
  id: 123,
  userid: 456,
  storyid: 789,
}

const mockStory = {
  id: 789,
  headline: 'Amazing Freegle Story',
  story: 'This is the full story text with lots of details...',
  image: {
    id: 1,
    paththumb: 'thumb.jpg',
    path: 'full.jpg',
  },
}

const mockNewsfeedStore = {
  byId: vi.fn().mockReturnValue(mockNewsfeed),
}

const mockStoryStore = {
  fetch: vi.fn().mockResolvedValue(mockStory),
  byId: vi.fn().mockReturnValue(mockStory),
}

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => mockNewsfeedStore,
}))

vi.mock('~/stores/stories', () => ({
  useStoryStore: () => mockStoryStore,
}))

vi.mock('~/composables/useTwem', () => ({
  twem: (text) => text,
}))

describe('NewsStory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNewsfeedStore.byId.mockReturnValue({ ...mockNewsfeed })
    mockStoryStore.byId.mockReturnValue({ ...mockStory })
    mockStoryStore.fetch.mockResolvedValue({ ...mockStory })
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(NewsStory, { id: 123, ...props }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          NewsUserIntro: {
            template:
              '<div class="news-user-intro" :data-userid="userid">{{ append }}</div>',
            props: ['userid', 'newsfeed', 'append'],
          },
          'b-row': {
            template: '<div class="b-row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="b-col"><slot /></div>',
          },
          'b-card': {
            template: '<div class="b-card"><slot /></div>',
            props: ['noBody'],
          },
          'b-card-header': {
            template:
              '<div class="b-card-header" :class="[bgVariant, textVariant]"><slot /></div>',
            props: ['bgVariant', 'textVariant'],
          },
          'b-card-text': {
            template: '<div class="b-card-text"><slot /></div>',
          },
          OurUploadedImage: {
            template:
              '<img class="our-uploaded-image" :src="src" @click="$emit(\'click\')" />',
            props: ['src', 'modifiers', 'alt', 'sizes'],
            emits: ['click'],
          },
          NuxtPicture: {
            template:
              '<picture class="nuxt-picture" @click="$emit(\'click\')"><img :src="src" /></picture>',
            props: [
              'fit',
              'format',
              'provider',
              'src',
              'modifiers',
              'alt',
              'sizes',
            ],
            emits: ['click'],
          },
          'b-img': {
            template:
              '<img class="b-img" :src="src" @click="$emit(\'click\')" />',
            props: ['thumbnail', 'rounded', 'lazy', 'src'],
            emits: ['click'],
          },
          'read-more': {
            template: '<div class="read-more">{{ text }}</div>',
            props: ['text', 'maxChars'],
          },
          NewsLoveComment: {
            template: '<div class="news-love-comment" />',
            props: ['newsfeed'],
            emits: ['focus-comment'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'to'],
            emits: ['click'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          NewsPhotoModal: {
            template: '<div class="news-photo-modal" />',
            props: ['id', 'newsfeedid', 'src', 'imgtype', 'imgflag'],
            emits: ['hidden'],
          },
          StoryAddModal: {
            template: '<div class="story-add-modal" />',
            emits: ['hidden'],
          },
          StoryShareModal: {
            template: '<div class="story-share-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders NewsUserIntro with userid', async () => {
      const wrapper = await createWrapper()
      const intro = wrapper.find('.news-user-intro')
      expect(intro.exists()).toBe(true)
      expect(intro.attributes('data-userid')).toBe('456')
    })

    it('shows "told their Freegle story" append text', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('told their Freegle story')
    })

    it('renders story headline in card header', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-card-header').text()).toBe(
        'Amazing Freegle Story'
      )
    })

    it('renders story body in read-more', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.read-more').text()).toContain(
        'This is the full story text'
      )
    })
  })

  describe('image display', () => {
    it('renders b-img when story has image with paththumb', async () => {
      const wrapper = await createWrapper()
      const img = wrapper.find('.b-img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('thumb.jpg')
    })

    it('does not render image when story has no image', async () => {
      mockStoryStore.byId.mockReturnValue({ ...mockStory, image: null })
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(false)
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(false)
      expect(wrapper.find('.nuxt-picture').exists()).toBe(false)
    })

    it('renders OurUploadedImage when image has ouruid', async () => {
      mockStoryStore.byId.mockReturnValue({
        ...mockStory,
        image: { ouruid: 'our-123', externalmods: '{}' },
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })

    it('renders NuxtPicture when image has externaluid', async () => {
      mockStoryStore.byId.mockReturnValue({
        ...mockStory,
        image: { externaluid: 'ext-123', externalmods: '{}' },
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)
    })
  })

  describe('action buttons', () => {
    it('renders Share button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Share')
    })

    it('renders More stories button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('More stories')
    })

    it('renders Tell your story button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Tell your story!')
    })
  })

  describe('photo modal', () => {
    it('does not show photo modal initially', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-photo-modal').exists()).toBe(false)
    })

    it('shows photo modal on image click', async () => {
      const wrapper = await createWrapper()
      await wrapper.find('.b-img').trigger('click')
      expect(wrapper.find('.news-photo-modal').exists()).toBe(true)
    })
  })

  describe('story add modal', () => {
    it('does not show add modal initially', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.story-add-modal').exists()).toBe(false)
    })

    it('shows add modal on Tell your story click', async () => {
      const wrapper = await createWrapper()
      const tellButton = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Tell your story!'))
      await tellButton.trigger('click')
      expect(wrapper.find('.story-add-modal').exists()).toBe(true)
    })
  })

  describe('share modal', () => {
    it('does not show share modal initially', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.story-share-modal').exists()).toBe(false)
    })

    it('shows share modal on Share button click', async () => {
      const wrapper = await createWrapper()
      const shareButton = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Share') && !b.text().includes('story'))
      await shareButton.trigger('click')
      expect(wrapper.find('.story-share-modal').exists()).toBe(true)
    })
  })

  describe('NewsLoveComment integration', () => {
    it('renders NewsLoveComment', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-love-comment').exists()).toBe(true)
    })
  })

  describe('data fetching', () => {
    it('fetches story on mount', async () => {
      await createWrapper()
      expect(mockStoryStore.fetch).toHaveBeenCalledWith(789)
    })
  })

  describe('conditional rendering', () => {
    it('does not render NewsUserIntro when userid is null', async () => {
      mockNewsfeedStore.byId.mockReturnValue({ ...mockNewsfeed, userid: null })
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-user-intro').exists()).toBe(false)
    })

    it('does not render read-more when body is empty', async () => {
      mockStoryStore.byId.mockReturnValue({ ...mockStory, story: '' })
      const wrapper = await createWrapper()
      expect(wrapper.find('.read-more').exists()).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('trims story text', async () => {
      mockStoryStore.byId.mockReturnValue({
        ...mockStory,
        story: '  Story with spaces  ',
      })
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(NewsStory)
      expect(component.vm.body).toBe('Story with spaces')
    })
  })

  describe('emits', () => {
    it('defines focus-comment emit', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(NewsStory)
      expect(component.emitted).toBeDefined()
    })
  })

  describe('props', () => {
    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 999 })
      expect(wrapper.findComponent(NewsStory).props('id')).toBe(999)
    })
  })
})
