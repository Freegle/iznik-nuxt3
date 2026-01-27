import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import MessageShareModal from '~/components/MessageShareModal.vue'

const { mockMessage } = vi.hoisted(() => {
  return {
    mockMessage: {
      id: 1,
      subject: 'OFFER: Test Item',
      url: 'https://freegle.org/message/1',
      textbody: 'A lovely item for free',
    },
  }
})

const mockModal = ref(null)

const mockMessageStore = {
  fetch: vi.fn().mockResolvedValue(mockMessage),
  byId: vi.fn().mockReturnValue(mockMessage),
}

const mockMobileStore = {
  isApp: false,
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('@/stores/mobile', () => ({
  useMobileStore: () => mockMobileStore,
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: vi.fn(),
  }),
}))

vi.mock('#app', () => ({
  useNuxtApp: () => ({
    vueApp: {
      use: vi.fn(),
    },
  }),
}))

vi.mock('vue-social-sharing', () => ({
  default: {
    install: vi.fn(),
  },
}))

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock clipboard at module level
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
}
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
  configurable: true,
})

describe('MessageShareModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageStore.byId.mockReturnValue(mockMessage)
    mockMobileStore.isApp = false
    mockClipboard.writeText.mockClear()
  })

  function createWrapper(props = {}) {
    return mount(MessageShareModal, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal"><slot /><slot name="footer" /></div>',
            props: ['scrollable', 'title', 'size'],
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
          'b-list-group': {
            template: '<div class="b-list-group"><slot /></div>',
            props: ['horizontal'],
          },
          'b-list-group-item': {
            template: '<div class="b-list-group-item"><slot /></div>',
          },
          'v-icon': {
            template:
              '<span class="v-icon" :data-icon="Array.isArray(icon) ? icon[1] : icon" />',
            props: ['icon'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          ShareNetwork: {
            template:
              '<div class="share-network" :data-network="network" @click="$emit(\'open\')"><slot /></div>',
            props: ['network', 'url', 'title', 'description', 'hashtags'],
            emits: ['open'],
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

    it('shows message subject', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('OFFER: Test Item')
    })

    it('shows share notice', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
    })

    it('shows share prompt', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Please share')
    })
  })

  describe('social share buttons', () => {
    it('shows Facebook share button', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.share-network[data-network="facebook"]').exists()
      ).toBe(true)
      expect(wrapper.text()).toContain('Facebook')
    })

    it('shows Twitter share button', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.share-network[data-network="twitter"]').exists()
      ).toBe(true)
      expect(wrapper.text()).toContain('X')
    })

    it('shows WhatsApp share button', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.share-network[data-network="whatsapp"]').exists()
      ).toBe(true)
      expect(wrapper.text()).toContain('Whatsapp')
    })

    it('shows Email share button', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.share-network[data-network="email"]').exists()
      ).toBe(true)
      expect(wrapper.text()).toContain('Email')
    })
  })

  describe('copy button', () => {
    it('shows copy button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Copy')
    })

    it('copies URL to clipboard on click', async () => {
      const wrapper = createWrapper()
      const copyBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Copy'))
      await copyBtn.trigger('click')
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        'https://freegle.org/message/1'
      )
    })

    it('shows check icon after copy', async () => {
      const wrapper = createWrapper()
      const copyBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Copy'))
      await copyBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('[data-icon="check"]').exists()).toBe(true)
    })
  })

  describe('close button', () => {
    it('shows close button in footer', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Close')
    })
  })

  describe('app mode', () => {
    it('shows share now button in app mode', () => {
      mockMobileStore.isApp = true
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Share now')
    })

    it('hides social share buttons in app mode', () => {
      mockMobileStore.isApp = true
      const wrapper = createWrapper()
      expect(wrapper.find('.b-list-group').exists()).toBe(false)
    })
  })

  describe('my posts notice', () => {
    it('shows my posts notice', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('My Posts')
    })
  })

  describe('message fetch', () => {
    it('fetches message on mount', async () => {
      createWrapper()
      await flushPromises()
      expect(mockMessageStore.fetch).toHaveBeenCalledWith(1, true)
    })
  })

  describe('icons', () => {
    it('shows clipboard icon before copy', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="clipboard"]').exists()).toBe(true)
    })

    it('shows envelope icon for email', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="envelope"]').exists()).toBe(true)
    })
  })
})
