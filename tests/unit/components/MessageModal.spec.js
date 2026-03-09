import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import MessageModal from '~/components/MessageModal.vue'

const { mockMessage } = vi.hoisted(() => {
  return {
    mockMessage: {
      id: 1,
      subject: 'OFFER: Test Item',
      attachments: [
        { id: 1, path: '/img/1.jpg' },
        { id: 2, path: '/img/2.jpg' },
      ],
    },
  }
})

const mockModal = ref(null)

const mockMessageStore = {
  byId: vi.fn().mockReturnValue(mockMessage),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: vi.fn(),
  }),
}))

describe('MessageModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageStore.byId.mockReturnValue(mockMessage)
  })

  function createWrapper(props = {}) {
    return mount(MessageModal, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template: '<div class="b-modal"><slot /></div>',
            props: [
              'scrollable',
              'size',
              'noTrap',
              'hideHeader',
              'fullscreen',
              'bodyClass',
              'dialogClass',
              'contentClass',
            ],
            emits: ['shown'],
            methods: {
              show() {},
              hide() {},
            },
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'block'],
            emits: ['click'],
          },
          'b-img': {
            template: '<img class="b-img" :src="src" />',
            props: ['lazy', 'src', 'alt', 'width'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          ImageCarousel: {
            template: '<div class="image-carousel" />',
            props: ['messageId', 'attachments'],
          },
          MessageExpanded: {
            template:
              '<div class="message-expanded" @close="$emit(\'close\')" />',
            props: ['id', 'replyable', 'hideClose', 'actions', 'inModal'],
            emits: ['close'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders modal', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('shows message content wrapper when message exists', () => {
      const wrapper = createWrapper()
      // When message exists, the content wrapper renders (even before bumpMessage increments)
      expect(wrapper.find('.message-content-wrapper').exists()).toBe(true)
    })
  })

  describe('image carousel mode', () => {
    it('shows image carousel when showImages is true', () => {
      const wrapper = createWrapper({ showImages: true })
      expect(wrapper.find('.image-carousel').exists()).toBe(true)
    })

    it('hides message expanded when showing images', () => {
      const wrapper = createWrapper({ showImages: true })
      expect(wrapper.find('.message-expanded').exists()).toBe(false)
    })

    it('shows back button when showing images', () => {
      const wrapper = createWrapper({ showImages: true })
      expect(wrapper.text()).toContain('Back to description')
    })

    it('shows close button when showing images', () => {
      const wrapper = createWrapper({ showImages: true })
      expect(wrapper.text()).toContain('Close')
    })
  })

  describe('loading state', () => {
    it('shows loader when message not available', () => {
      mockMessageStore.byId.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.find('.spinner-border').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts hideClose prop', () => {
      const wrapper = createWrapper({ hideClose: true })
      expect(wrapper.vm.hideClose).toBe(true)
    })

    it('accepts replyable prop', () => {
      const wrapper = createWrapper({ replyable: false })
      expect(wrapper.vm.replyable).toBe(false)
    })

    it('accepts actions prop', () => {
      const wrapper = createWrapper({ actions: false })
      expect(wrapper.vm.actions).toBe(false)
    })

    it('accepts id prop', () => {
      const wrapper = createWrapper({ id: 42 })
      expect(wrapper.vm.id).toBe(42)
    })
  })

  describe('image carousel props', () => {
    it('passes message id to ImageCarousel', () => {
      const wrapper = createWrapper({ showImages: true })
      const carousel = wrapper.findComponent('.image-carousel')
      expect(carousel.props('messageId')).toBe(1)
    })

    it('passes attachments to ImageCarousel', () => {
      const wrapper = createWrapper({ showImages: true })
      const carousel = wrapper.findComponent('.image-carousel')
      expect(carousel.props('attachments')).toEqual(mockMessage.attachments)
    })
  })

  describe('update:showImages emit', () => {
    it('emits update when toggling images view', async () => {
      const wrapper = createWrapper({ showImages: true })
      const closeBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Close'))
      await closeBtn.trigger('click')
      expect(wrapper.emitted('update:showImages')).toBeTruthy()
      expect(wrapper.emitted('update:showImages')[0]).toEqual([false])
    })

    it('emits update when clicking back button', async () => {
      const wrapper = createWrapper({ showImages: true })
      const backBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Back'))
      await backBtn.trigger('click')
      expect(wrapper.emitted('update:showImages')).toBeTruthy()
    })
  })

  describe('icons', () => {
    it('shows angle-double-left icon on back button', () => {
      const wrapper = createWrapper({ showImages: true })
      expect(wrapper.find('[data-icon="angle-double-left"]').exists()).toBe(
        true
      )
    })
  })

  describe('default prop values', () => {
    it('defaults replyable to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.replyable).toBe(true)
    })

    it('defaults actions to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.actions).toBe(true)
    })

    it('defaults hideClose to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.hideClose).toBe(false)
    })

    it('defaults showImages to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showImages).toBe(false)
    })
  })
})
