import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsShareModal from '~/components/NewsShareModal.vue'

const { mockModal, mockHide } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockModal: ref(null),
    mockHide: vi.fn(),
  }
})

const mockMobileStore = {
  isApp: false,
}

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: mockHide,
  }),
}))

vi.mock('@/stores/mobile', () => ({
  useMobileStore: () => mockMobileStore,
}))

vi.mock('vue-social-sharing', () => ({
  default: {},
}))

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn().mockResolvedValue(undefined),
  },
}))

const mockVueApp = {
  use: vi.fn(),
}

vi.mock('#app', () => ({
  useNuxtApp: () => ({
    vueApp: mockVueApp,
  }),
  useRuntimeConfig: () => ({
    public: {
      USER_SITE: 'https://www.ilovefreegle.org',
    },
  }),
}))

describe('NewsShareModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMobileStore.isApp = false
  })

  function createWrapper(props = {}) {
    return mount(NewsShareModal, {
      props: {
        newsfeed: {
          id: 123,
          message: 'Test news message',
        },
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal" :id="id"><div class="modal-title">{{ title }}</div><slot /><slot name="footer" /></div>',
            props: ['id', 'scrollable', 'title', 'size', 'noStacking'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size'],
          },
          'b-list-group': {
            template: '<div class="b-list-group"><slot /></div>',
            props: ['horizontal'],
          },
          'b-list-group-item': {
            template: '<div class="b-list-group-item"><slot /></div>',
          },
          ShareNetwork: {
            template:
              '<div class="share-network" :data-network="network"><slot /></div>',
            props: ['network', 'url', 'title', 'description', 'hashtags'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders modal container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('displays correct title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Share chitchat')
    })

    it('renders url link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('a[target="_blank"]')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe(
        'https://www.ilovefreegle.org/chitchat/123'
      )
    })

    it('displays url text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(
        'https://www.ilovefreegle.org/chitchat/123'
      )
    })

    it('renders sharing instructions', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('You can share using these buttons')
    })

    it('renders list group for share buttons', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-list-group').exists()).toBe(true)
    })
  })

  describe('social share buttons', () => {
    it('renders Facebook share button', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.share-network[data-network="facebook"]').exists()
      ).toBe(true)
      expect(wrapper.text()).toContain('Facebook')
    })

    it('renders Twitter share button', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.share-network[data-network="twitter"]').exists()
      ).toBe(true)
      expect(wrapper.text()).toContain('X')
    })

    it('renders WhatsApp share button', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.share-network[data-network="whatsapp"]').exists()
      ).toBe(true)
      expect(wrapper.text()).toContain('Whatsapp')
    })

    it('renders Email share button', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.share-network[data-network="email"]').exists()
      ).toBe(true)
      expect(wrapper.text()).toContain('Email')
    })

    it('renders Copy button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Copy')
    })
  })

  describe('icons', () => {
    it('renders facebook icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.facebook .v-icon').exists()).toBe(true)
    })

    it('renders twitter icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.twitter .v-icon').exists()).toBe(true)
    })

    it('renders whatsapp icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.whatsapp .v-icon').exists()).toBe(true)
    })

    it('renders envelope icon for email', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="envelope"]').exists()).toBe(true)
    })

    it('renders clipboard icon for copy', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="clipboard"]').exists()).toBe(true)
    })
  })

  describe('app share button', () => {
    it('shows app share button when isApp is true', () => {
      mockMobileStore.isApp = true
      const wrapper = mount(NewsShareModal, {
        props: {
          newsfeed: { id: 123, message: 'Test' },
        },
        global: {
          stubs: {
            'b-modal': {
              template:
                '<div class="b-modal"><slot /><slot name="footer" /></div>',
            },
            'b-button': {
              template:
                '<button :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
              props: ['variant', 'size'],
            },
            'b-list-group': { template: '<div />' },
            'b-list-group-item': { template: '<div />' },
            ShareNetwork: { template: '<div />' },
            'v-icon': { template: '<span />' },
          },
        },
      })
      expect(wrapper.text()).toContain('Share now')
    })

    it('does not show app share button when isApp is false', () => {
      mockMobileStore.isApp = false
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('Share now')
    })
  })

  describe('url computed', () => {
    it('generates correct url from newsfeed id', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.url).toBe('https://www.ilovefreegle.org/chitchat/123')
    })

    it('handles missing newsfeed id gracefully', () => {
      const wrapper = createWrapper({
        newsfeed: {},
      })
      expect(wrapper.vm.url).toBe(
        'https://www.ilovefreegle.org/chitchat/undefined'
      )
    })

    it('uses different newsfeed id in url', () => {
      const wrapper = createWrapper({
        newsfeed: { id: 456, message: 'Another message' },
      })
      expect(wrapper.vm.url).toBe('https://www.ilovefreegle.org/chitchat/456')
    })
  })

  describe('reactive state', () => {
    it('initializes copied as false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.copied).toBe(false)
    })

    it('initializes bump as 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.bump).toBe(0)
    })
  })

  describe('doCopy method', () => {
    it('copies url to clipboard', async () => {
      const mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      })

      const wrapper = createWrapper()
      await wrapper.vm.doCopy()

      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        'https://www.ilovefreegle.org/chitchat/123'
      )
    })

    it('sets copied to true after copy', async () => {
      const mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      })

      const wrapper = createWrapper()
      await wrapper.vm.doCopy()

      expect(wrapper.vm.copied).toBe(true)
    })

    it('shows check icon after copy', async () => {
      const mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      })

      const wrapper = createWrapper()
      await wrapper.vm.doCopy()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.v-icon[data-icon="check"]').exists()).toBe(true)
    })
  })

  describe('opened method', () => {
    it('increments bump value', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.bump).toBe(0)

      wrapper.vm.opened()
      expect(wrapper.vm.bump).toBe(1)

      wrapper.vm.opened()
      expect(wrapper.vm.bump).toBe(2)
    })
  })

  describe('footer', () => {
    it('renders Close button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Close')
    })

    it('calls hide when Close clicked', async () => {
      const wrapper = createWrapper()
      const closeBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Close'))

      await closeBtn.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('props', () => {
    it('requires newsfeed prop', () => {
      const wrapper = createWrapper({
        newsfeed: { id: 789, message: 'Test news' },
      })
      expect(wrapper.props('newsfeed').id).toBe(789)
      expect(wrapper.props('newsfeed').message).toBe('Test news')
    })
  })

  describe('modal id', () => {
    it('generates unique modal id from newsfeed id', () => {
      const wrapper = createWrapper()
      // The modal id is generated in the component as 'newsShareModal-' + newsfeed.id
      // We can verify this by checking the component's modal id prop
      expect(wrapper.html()).toContain('newsShareModal-123')
    })

    it('uses different modal id for different newsfeed', () => {
      const wrapper = createWrapper({
        newsfeed: { id: 999, message: 'Test' },
      })
      expect(wrapper.html()).toContain('newsShareModal-999')
    })
  })
})
