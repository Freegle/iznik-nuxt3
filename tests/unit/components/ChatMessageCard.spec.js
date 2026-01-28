import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatMessageCard from '~/components/ChatMessageCard.vue'

const {
  mockMessage,
  mockStrippedSubject,
  mockGotAttachments,
  mockTimeAgo,
  mockDistanceText,
  mockIsOffer,
  mockIsWanted,
  mockSuccessfulText,
  mockPlaceholderClass,
  mockCategoryIcon,
} = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockMessage: ref({
      id: 1,
      subject: 'OFFER: Test Item',
      successful: false,
      promised: false,
      area: 'London',
      fromuser: 2,
      attachments: [],
    }),
    mockStrippedSubject: ref('Test Item'),
    mockGotAttachments: ref(false),
    mockTimeAgo: ref('2 hours ago'),
    mockDistanceText: ref('5 miles'),
    mockIsOffer: ref(true),
    mockIsWanted: ref(false),
    mockSuccessfulText: ref('Freegled'),
    mockPlaceholderClass: ref('offer-gradient'),
    mockCategoryIcon: ref('gift'),
  }
})

const mockRouterPush = vi.fn()

vi.mock('#imports', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

vi.mock('~/composables/useMessageDisplay', () => ({
  useMessageDisplay: () => ({
    message: mockMessage,
    strippedSubject: mockStrippedSubject,
    gotAttachments: mockGotAttachments,
    timeAgo: mockTimeAgo,
    distanceText: mockDistanceText,
    isOffer: mockIsOffer,
    isWanted: mockIsWanted,
    successfulText: mockSuccessfulText,
    placeholderClass: mockPlaceholderClass,
    categoryIcon: mockCategoryIcon,
  }),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    user: { id: 1 },
  }),
}))

describe('ChatMessageCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessage.value = {
      id: 1,
      subject: 'OFFER: Test Item',
      successful: false,
      promised: false,
      area: 'London',
      fromuser: 2,
      attachments: [],
    }
    mockStrippedSubject.value = 'Test Item'
    mockGotAttachments.value = false
    mockTimeAgo.value = '2 hours ago'
    mockDistanceText.value = '5 miles'
    mockIsOffer.value = true
    mockIsWanted.value = false
    mockSuccessfulText.value = 'Freegled'
    mockPlaceholderClass.value = 'offer-gradient'
    mockCategoryIcon.value = 'gift'
  })

  function createWrapper(props = {}) {
    return mount(ChatMessageCard, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          'b-img': {
            template: '<img class="b-img" :src="src" :alt="alt" />',
            props: ['lazy', 'src', 'alt'],
          },
          OurUploadedImage: {
            template: '<div class="our-uploaded-image" :data-src="src" />',
            props: ['src', 'modifiers', 'alt', 'width', 'height'],
          },
          NuxtPicture: {
            template: '<div class="nuxt-picture" :data-src="src" />',
            props: [
              'format',
              'provider',
              'src',
              'modifiers',
              'alt',
              'width',
              'height',
            ],
          },
          ProxyImage: {
            template: '<div class="proxy-image" :data-src="src" />',
            props: ['className', 'alt', 'src', 'width', 'height', 'fit'],
          },
          MessageTag: {
            template: '<span class="message-tag" />',
            props: ['id', 'inline'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders chat-message-card when message exists', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-message-card').exists()).toBe(true)
    })

    it('does not render when message is null', () => {
      mockMessage.value = null
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-message-card').exists()).toBe(false)
    })

    it('renders photo-area', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.photo-area').exists()).toBe(true)
    })

    it('renders title-overlay', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.title-overlay').exists()).toBe(true)
    })

    it('displays stripped subject', () => {
      mockStrippedSubject.value = 'Vintage Chair'
      const wrapper = createWrapper()
      expect(wrapper.find('.title-subject').text()).toBe('Vintage Chair')
    })

    it('displays time ago', () => {
      mockTimeAgo.value = '5 minutes ago'
      const wrapper = createWrapper()
      expect(wrapper.find('.time').text()).toBe('5 minutes ago')
    })

    it('renders MessageTag', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.message-tag').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 42 })
      expect(wrapper.props('id')).toBe(42)
    })

    it('has default showLocation of true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('showLocation')).toBe(true)
    })

    it('accepts showLocation prop', () => {
      const wrapper = createWrapper({ showLocation: false })
      expect(wrapper.props('showLocation')).toBe(false)
    })
  })

  describe('CSS classes', () => {
    it('adds offer class when isOffer', () => {
      mockIsOffer.value = true
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-message-card').classes()).toContain('offer')
    })

    it('adds wanted class when isWanted', () => {
      mockIsWanted.value = true
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-message-card').classes()).toContain('wanted')
    })

    it('adds freegled class when successful', () => {
      mockMessage.value.successful = true
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-message-card').classes()).toContain('freegled')
    })

    it('adds promised class when promised but not successful', () => {
      mockMessage.value.promised = true
      mockMessage.value.successful = false
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-message-card').classes()).toContain('promised')
    })

    it('does not add promised class when successful', () => {
      mockMessage.value.promised = true
      mockMessage.value.successful = true
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-message-card').classes()).not.toContain(
        'promised'
      )
    })
  })

  describe('status overlays', () => {
    it('shows freegled overlay when successful', () => {
      mockMessage.value.successful = true
      const wrapper = createWrapper()
      const overlay = wrapper.find('.status-overlay-image')
      expect(overlay.attributes('src')).toBe('/freegled.jpg')
    })

    it('shows promised overlay when promised but not successful', () => {
      mockMessage.value.promised = true
      mockMessage.value.successful = false
      const wrapper = createWrapper()
      const overlay = wrapper.find('.status-overlay-image')
      expect(overlay.attributes('src')).toBe('/promised.jpg')
    })

    it('does not show overlay when not successful or promised', () => {
      mockMessage.value.successful = false
      mockMessage.value.promised = false
      const wrapper = createWrapper()
      expect(wrapper.find('.status-overlay-image').exists()).toBe(false)
    })
  })

  describe('photo display', () => {
    it('shows photo-container when gotAttachments is true', () => {
      mockGotAttachments.value = true
      mockMessage.value.attachments = [{ path: '/photo.jpg' }]
      const wrapper = createWrapper()
      expect(wrapper.find('.photo-container').exists()).toBe(true)
    })

    it('shows placeholder when no attachments', () => {
      mockGotAttachments.value = false
      const wrapper = createWrapper()
      expect(wrapper.find('.no-photo-placeholder').exists()).toBe(true)
    })

    it('applies placeholder class from composable', () => {
      mockGotAttachments.value = false
      mockPlaceholderClass.value = 'wanted-gradient'
      const wrapper = createWrapper()
      expect(wrapper.find('.no-photo-placeholder').classes()).toContain(
        'wanted-gradient'
      )
    })

    it('shows category icon in placeholder', () => {
      mockGotAttachments.value = false
      mockCategoryIcon.value = 'search'
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="search"]').exists()).toBe(true)
    })

    it('uses OurUploadedImage for ouruid attachments', () => {
      mockGotAttachments.value = true
      mockMessage.value.attachments = [{ ouruid: 'abc123' }]
      const wrapper = createWrapper()
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })

    it('uses NuxtPicture for externaluid attachments', () => {
      mockGotAttachments.value = true
      mockMessage.value.attachments = [{ externaluid: 'ext123' }]
      const wrapper = createWrapper()
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)
    })

    it('uses ProxyImage for path attachments', () => {
      mockGotAttachments.value = true
      mockMessage.value.attachments = [{ path: '/photo.jpg' }]
      const wrapper = createWrapper()
      expect(wrapper.find('.proxy-image').exists()).toBe(true)
    })
  })

  describe('location display', () => {
    it('shows location when showLocation is true and area exists', () => {
      mockMessage.value.area = 'Cambridge'
      const wrapper = createWrapper({ showLocation: true })
      expect(wrapper.find('.location').text()).toContain('Cambridge')
    })

    it('shows distanceText when no area', () => {
      mockMessage.value.area = null
      mockDistanceText.value = '3 miles'
      const wrapper = createWrapper({ showLocation: true })
      expect(wrapper.find('.location').text()).toContain('3 miles')
    })

    it('hides location when showLocation is false', () => {
      const wrapper = createWrapper({ showLocation: false })
      expect(wrapper.find('.location').exists()).toBe(false)
    })

    it('renders map-marker-alt icon with location', () => {
      mockMessage.value.area = 'Oxford'
      const wrapper = createWrapper({ showLocation: true })
      expect(
        wrapper.find('.location .v-icon[data-icon="map-marker-alt"]').exists()
      ).toBe(true)
    })
  })

  describe('navigation', () => {
    it('calls router.push on click', async () => {
      const wrapper = createWrapper({ id: 123 })
      await wrapper.find('.chat-message-card').trigger('click')
      expect(mockRouterPush).toHaveBeenCalled()
    })

    it('navigates to /mypost when user owns message', async () => {
      mockMessage.value.fromuser = 1 // Same as mock user id
      const wrapper = createWrapper({ id: 123 })
      await wrapper.find('.chat-message-card').trigger('click')
      expect(mockRouterPush).toHaveBeenCalledWith('/mypost/123')
    })

    it('navigates to /message when user does not own message', async () => {
      mockMessage.value.fromuser = 999 // Different from mock user id
      const wrapper = createWrapper({ id: 123 })
      await wrapper.find('.chat-message-card').trigger('click')
      expect(mockRouterPush).toHaveBeenCalledWith('/message/123')
    })
  })

  describe('computed properties', () => {
    it('computes locationText from message area', () => {
      mockMessage.value.area = 'Bristol'
      const wrapper = createWrapper()
      expect(wrapper.vm.locationText).toBe('Bristol')
    })

    it('falls back to distanceText when no area', () => {
      mockMessage.value.area = null
      mockDistanceText.value = '10 km'
      const wrapper = createWrapper()
      expect(wrapper.vm.locationText).toBe('10 km')
    })
  })
})
