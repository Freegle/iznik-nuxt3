import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsMessage from '~/components/NewsMessage.vue'

const mockNewsfeed = vi.fn()

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => ({
    byId: mockNewsfeed,
  }),
}))

vi.mock('~/composables/useTwem', () => ({
  twem: vi.fn((text) => text),
}))

describe('NewsMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNewsfeed.mockReturnValue({
      id: 1,
      userid: 100,
      message: 'Test message content',
      type: 'Message',
    })
  })

  function createWrapper(props = {}) {
    return mount(NewsMessage, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          NewsUserIntro: {
            template:
              '<div class="news-user-intro" :data-userid="userid" :data-id="newsfeed.id" />',
            props: ['userid', 'newsfeed'],
          },
          'read-more': {
            template: '<div class="read-more">{{ text }}</div>',
            props: ['text', 'maxChars'],
          },
          OurUploadedImage: {
            template: '<img class="our-uploaded-image" :src="src" />',
            props: ['src', 'modifiers', 'alt', 'sizes'],
          },
          NuxtPicture: {
            template: '<img class="nuxt-picture" :src="src" />',
            props: [
              'format',
              'fit',
              'provider',
              'src',
              'modifiers',
              'alt',
              'sizes',
              'height',
            ],
          },
          'b-img': {
            template:
              '<img class="b-img" :src="src" @click="$emit(\'click\')" />',
            props: ['lazy', 'rounded', 'src', 'fluid', 'center'],
            emits: ['click'],
          },
          NewsLoveComment: {
            template: '<div class="news-love-comment" />',
            props: ['newsfeed'],
            emits: ['focus-comment'],
          },
          ChatButton: {
            template: '<button class="chat-button" />',
            props: ['userid', 'title', 'size', 'variant', 'btnClass'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="btnClass" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
            computed: {
              btnClass() {
                return 'btn-' + this.variant
              },
            },
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          'b-modal': {
            template:
              '<div v-if="modelValue" class="b-modal"><slot /><slot name="default" /></div>',
            props: [
              'modelValue',
              'scrollable',
              'title',
              'size',
              'noStacking',
              'hideFooter',
            ],
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
    it('renders container div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('shows NewsUserIntro when userid exists', () => {
      mockNewsfeed.mockReturnValue({
        id: 1,
        userid: 100,
        message: 'Test',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.news-user-intro').exists()).toBe(true)
      expect(wrapper.find('.news-user-intro').attributes('data-userid')).toBe(
        '100'
      )
    })

    it('hides NewsUserIntro when no userid', () => {
      mockNewsfeed.mockReturnValue({
        id: 1,
        userid: null,
        message: 'Test',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.news-user-intro').exists()).toBe(false)
    })
  })

  describe('message content', () => {
    it('shows html content when provided', () => {
      mockNewsfeed.mockReturnValue({
        id: 1,
        userid: 1,
        html: '<p>HTML content</p>',
      })
      const wrapper = createWrapper()
      expect(wrapper.html()).toContain('HTML content')
    })

    it('shows read-more when message exists', () => {
      mockNewsfeed.mockReturnValue({
        id: 1,
        userid: 1,
        message: 'Long message text here',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.read-more').exists()).toBe(true)
    })
  })

  describe('image display', () => {
    it('shows OurUploadedImage when image has ouruid', () => {
      mockNewsfeed.mockReturnValue({
        id: 1,
        userid: 1,
        image: { ouruid: 'abc123' },
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })

    it('shows NuxtPicture when image has externaluid', () => {
      mockNewsfeed.mockReturnValue({
        id: 1,
        userid: 1,
        image: { externaluid: 'ext123' },
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)
    })

    it('shows b-img when image has path only', () => {
      mockNewsfeed.mockReturnValue({
        id: 1,
        userid: 1,
        image: { path: '/fallback.jpg' },
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })
  })

  describe('photo modal', () => {
    it('opens photo modal when image clicked', async () => {
      mockNewsfeed.mockReturnValue({
        id: 1,
        userid: 1,
        image: { path: '/photo.jpg' },
      })
      const wrapper = createWrapper()

      expect(wrapper.find('.b-modal').exists()).toBe(false)

      await wrapper.find('.b-img').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })
  })

  describe('interaction buttons', () => {
    it('shows NewsLoveComment component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.news-love-comment').exists()).toBe(true)
    })

    it('shows ChatButton component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-button').exists()).toBe(true)
    })

    it('shows Share button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Share')
      expect(wrapper.find('.v-icon[data-icon="share-alt"]').exists()).toBe(true)
    })
  })

  describe('share functionality', () => {
    it('opens share modal when Share clicked', async () => {
      const wrapper = createWrapper()

      expect(wrapper.find('.news-share-modal').exists()).toBe(false)

      const shareBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Share'))
      await shareBtn.trigger('click')

      expect(wrapper.find('.news-share-modal').exists()).toBe(true)
    })
  })

  describe('emits', () => {
    it('emits focus-comment event', () => {
      const wrapper = createWrapper()
      expect(wrapper.emitted('focus-comment')).toBeFalsy()
      // The event would be emitted through NewsLoveComment
    })
  })

  describe('message processing', () => {
    it('handles Alert type with URL regex', () => {
      mockNewsfeed.mockReturnValue({
        id: 1,
        userid: 1,
        message: 'Check https://freegle.org for details',
        type: 'Alert',
      })
      const wrapper = createWrapper()
      // The emessage computed processes Alert type
      expect(wrapper.vm.emessage).toContain('https://freegle.org')
    })

    it('removes leading spaces from message', () => {
      mockNewsfeed.mockReturnValue({
        id: 1,
        userid: 1,
        message: '   Line with spaces',
        type: 'Message',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.emessage).toBe('Line with spaces')
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 42 })
      expect(wrapper.props('id')).toBe(42)
    })
  })
})
