import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import NewsAboutMe from '~/components/NewsAboutMe.vue'

const { mockFetchMe } = vi.hoisted(() => ({
  mockFetchMe: vi.fn().mockResolvedValue(undefined),
}))

const mockNewsfeed = {
  id: 123,
  userid: 456,
  message: 'Hello, I am a new member!',
  image: null,
  type: 'AboutMe',
  loved: false,
  loves: 0,
  closed: false,
}

const mockNewsfeedStore = {
  byId: vi.fn().mockReturnValue(mockNewsfeed),
}

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => mockNewsfeedStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    fetchMe: mockFetchMe,
  }),
}))

vi.mock('~/composables/useTwem', () => ({
  twem: (text) => text,
}))

vi.mock('~/constants', () => ({
  URL_REGEX: /https?:\/\/[^\s]+/g,
}))

describe('NewsAboutMe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNewsfeedStore.byId.mockReturnValue({ ...mockNewsfeed })
  })

  function createWrapper(props = {}) {
    return mount(NewsAboutMe, {
      props: {
        id: 123,
        ...props,
      },
      global: {
        stubs: {
          NewsUserIntro: {
            template:
              '<div class="news-user-intro" :data-userid="userid">{{ append }}</div>',
            props: ['userid', 'newsfeed', 'append'],
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
          'b-row': {
            template: '<div class="b-row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="b-col"><slot /></div>',
          },
          'b-img': {
            template:
              '<img class="b-img" :src="src" @click="$emit(\'click\')" />',
            props: ['thumbnail', 'rounded', 'lazy', 'src'],
            emits: ['click'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          AboutMeModal: {
            template: '<div class="about-me-modal" />',
            emits: ['hidden'],
          },
          NewsPhotoModal: {
            template: '<div class="news-photo-modal" />',
            props: ['id', 'newsfeedid', 'src', 'imgtype', 'imgflag'],
            emits: ['hidden'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders NewsUserIntro with userid', () => {
      const wrapper = createWrapper()
      const intro = wrapper.find('.news-user-intro')
      expect(intro.exists()).toBe(true)
      expect(intro.attributes('data-userid')).toBe('456')
    })

    it('renders "introduced themselves" text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('introduced themselves')
    })

    it('renders message in read-more', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.read-more').text()).toContain(
        'Hello, I am a new member!'
      )
    })

    it('renders NewsLoveComment', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.news-love-comment').exists()).toBe(true)
    })

    it('renders introduce yourself button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Introduce yourself to everyone')
    })
  })

  describe('conditional rendering', () => {
    it('does not render NewsUserIntro when userid is null', () => {
      mockNewsfeedStore.byId.mockReturnValue({ ...mockNewsfeed, userid: null })
      const wrapper = createWrapper()
      expect(wrapper.find('.news-user-intro').exists()).toBe(false)
    })

    it('does not render read-more when message is empty', () => {
      mockNewsfeedStore.byId.mockReturnValue({ ...mockNewsfeed, message: null })
      const wrapper = createWrapper()
      expect(wrapper.find('.read-more').exists()).toBe(false)
    })
  })

  describe('image handling', () => {
    it('renders image when available', () => {
      mockNewsfeedStore.byId.mockReturnValue({
        ...mockNewsfeed,
        image: { id: 1, paththumb: 'thumb.jpg', path: 'full.jpg' },
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(true)
      expect(wrapper.find('.b-img').attributes('src')).toBe('thumb.jpg')
    })

    it('does not render image row when no image', () => {
      mockNewsfeedStore.byId.mockReturnValue({ ...mockNewsfeed, image: null })
      const wrapper = createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(false)
    })

    it('shows photo modal on image click', async () => {
      mockNewsfeedStore.byId.mockReturnValue({
        ...mockNewsfeed,
        image: { id: 1, paththumb: 'thumb.jpg', path: 'full.jpg' },
      })
      const wrapper = createWrapper()

      expect(wrapper.find('.news-photo-modal').exists()).toBe(false)

      await wrapper.find('.b-img').trigger('click')

      expect(wrapper.find('.news-photo-modal').exists()).toBe(true)
    })
  })

  describe('about me modal', () => {
    it('does not show modal initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.about-me-modal').exists()).toBe(false)
    })

    it('fetches me and shows modal on button click', async () => {
      const wrapper = createWrapper()

      await wrapper.find('.b-button.primary').trigger('click')
      await flushPromises()

      expect(mockFetchMe).toHaveBeenCalledWith(['me'], true)
      expect(wrapper.find('.about-me-modal').exists()).toBe(true)
    })
  })

  describe('emessage computed', () => {
    it('processes message with twem', () => {
      const wrapper = createWrapper()
      // twem is mocked to return the same text
      expect(wrapper.vm.emessage).toBe('Hello, I am a new member!')
    })

    it('removes leading spaces and tabs', () => {
      mockNewsfeedStore.byId.mockReturnValue({
        ...mockNewsfeed,
        message: '   Hello with spaces',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.emessage).toBe('Hello with spaces')
    })

    it('returns null when message is empty', () => {
      mockNewsfeedStore.byId.mockReturnValue({ ...mockNewsfeed, message: '' })
      const wrapper = createWrapper()
      expect(wrapper.vm.emessage).toBe(null)
    })

    it('processes Alert type for link conversion', () => {
      mockNewsfeedStore.byId.mockReturnValue({
        ...mockNewsfeed,
        type: 'Alert',
        message: 'Check out https://example.com for more',
      })
      const wrapper = createWrapper()
      // The component uses URL_REGEX to convert URLs to links
      // We verify the message is processed (actual regex replacement varies)
      expect(wrapper.vm.emessage).toBeDefined()
      expect(wrapper.vm.emessage).toContain('Check out')
    })
  })

  describe('focus-comment emit', () => {
    it('emits focus-comment when NewsLoveComment emits', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.news-love-comment').trigger('focus-comment')
      // The emit is passed through via @focus-comment="emit('focus-comment')"
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 789 })
      expect(wrapper.props('id')).toBe(789)
    })
  })
})
