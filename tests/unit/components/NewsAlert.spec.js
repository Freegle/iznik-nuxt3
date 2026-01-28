import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsAlert from '~/components/NewsAlert.vue'

const mockById = vi.fn()

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => ({
    byId: mockById,
  }),
}))

vi.mock('~/composables/useTwem', () => ({
  twem: vi.fn((text) => text),
}))

vi.mock('~/composables/useTimeFormat', () => ({
  timeago: vi.fn((date) => '2 days ago'),
}))

describe('NewsAlert', () => {
  const mockNewsfeed = {
    id: 1,
    message: 'Test alert message',
    html: null,
    image: null,
    type: 'Alert',
    added: '2026-01-20',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockById.mockReturnValue(mockNewsfeed)
  })

  function createWrapper(props = {}) {
    return mount(NewsAlert, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          ProfileImage: {
            template: '<div class="profile-image" />',
            props: ['image', 'isThumbnail', 'size'],
          },
          NewsLoveComment: {
            template:
              '<div class="news-love-comment" @click="$emit(\'focus-comment\')" />',
            props: ['newsfeed'],
            emits: ['focus-comment'],
          },
          'b-img': {
            template: '<img class="b-img" :src="src" />',
            props: ['src', 'rounded', 'lazy'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
          },
          'v-icon': {
            template: '<span class="v-icon" />',
            props: ['icon'],
          },
          NewsPhotoModal: {
            template: '<div class="news-photo-modal" />',
            props: ['id', 'newsfeedid', 'src', 'imgtype', 'imgflag'],
            emits: ['hidden'],
          },
          NewsShareModal: {
            template: '<div class="news-share-modal" />',
            props: ['newsfeed'],
            emits: ['hidden'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders profile image', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('shows Freegle branding', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Freegle')
    })

    it('shows time ago', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('2 days ago')
    })

    it('shows share button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Share')
    })

    it('shows news love comment component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.news-love-comment').exists()).toBe(true)
    })
  })

  describe('message display', () => {
    it('shows message when no html', () => {
      mockById.mockReturnValue({
        ...mockNewsfeed,
        message: 'Alert text',
        html: null,
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Alert text')
    })

    it('shows html when present', () => {
      mockById.mockReturnValue({ ...mockNewsfeed, html: '<p>HTML content</p>' })
      const wrapper = createWrapper()
      expect(wrapper.html()).toContain('HTML content')
    })
  })

  describe('image display', () => {
    it('shows image when present', () => {
      mockById.mockReturnValue({
        ...mockNewsfeed,
        image: { id: 123, paththumb: '/thumb.jpg', path: '/full.jpg' },
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })

    it('hides image when not present', () => {
      mockById.mockReturnValue({ ...mockNewsfeed, image: null })
      const wrapper = createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(false)
    })
  })

  describe('share modal', () => {
    it('opens share modal when share clicked', async () => {
      const wrapper = createWrapper()
      const shareButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Share'))
      await shareButton.trigger('click')
      expect(wrapper.find('.news-share-modal').exists()).toBe(true)
    })

    it('does not show share modal initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.news-share-modal').exists()).toBe(false)
    })
  })

  describe('photo modal', () => {
    it('opens photo modal when image clicked', async () => {
      mockById.mockReturnValue({
        ...mockNewsfeed,
        image: { id: 123, paththumb: '/thumb.jpg', path: '/full.jpg' },
      })
      const wrapper = createWrapper()
      await wrapper.find('.b-img').trigger('click')
      expect(wrapper.find('.news-photo-modal').exists()).toBe(true)
    })
  })

  describe('focus-comment event', () => {
    it('emits focus-comment when NewsLoveComment emits', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.news-love-comment').trigger('click')
      expect(wrapper.emitted('focus-comment')).toBeTruthy()
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 42 })
      expect(wrapper.props('id')).toBe(42)
    })
  })
})
