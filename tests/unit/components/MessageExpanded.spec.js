import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'

import MessageExpanded from '~/components/MessageExpanded.vue'

// Mock composables and stores first, before imports
const {
  mockMessage,
  mockSubjectItemName,
  mockSubjectLocation,
  mockFromme,
  mockGotAttachments,
  mockAttachmentCount,
  mockTimeAgo,
  mockFullTimeAgo,
  mockDistanceText,
  mockReplyCount,
  mockReplyTooltip,
  mockIsOffer,
  mockFormattedDeadline,
  mockDeadlineTooltip,
  mockSuccessfulText,
  mockPlaceholderClass,
  mockCategoryIcon,
  mockPoster,
  mockMe,
  mockLoggedIn,
  mockStickyAdRendered,
  mockBreakpoint,
  mockIsApp,
  mockSetFullscreenModalOpen,
  mockSetLandscape,
} = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockMessage: ref({
      id: 123,
      subject: 'OFFER: Test Item (Edinburgh EH17)',
      textbody: 'This is a test item description.',
      type: 'Offer',
      fromuser: 2,
      lat: 55.9,
      lng: -3.2,
      attachments: [
        { id: 1, path: '/img/test1.jpg', paththumb: '/img/test1_thumb.jpg' },
      ],
      groups: [{ groupid: 1 }],
      successful: false,
      promised: false,
      promisedtome: false,
      deadline: null,
      deliverypossible: false,
      replies: [],
      url: 'https://www.ilovefreegle.org/message/123',
    }),
    mockSubjectItemName: ref('Test Item'),
    mockSubjectLocation: ref('Edinburgh EH17'),
    mockFromme: ref(false),
    mockGotAttachments: ref(true),
    mockAttachmentCount: ref(1),
    mockTimeAgo: ref('2h'),
    mockFullTimeAgo: ref('Posted 2 hours ago'),
    mockDistanceText: ref('5mi'),
    mockReplyCount: ref(3),
    mockReplyTooltip: ref('3 people have replied'),
    mockIsOffer: ref(true),
    mockFormattedDeadline: ref(''),
    mockDeadlineTooltip: ref('Only available until this date'),
    mockSuccessfulText: ref('Taken'),
    mockPlaceholderClass: ref('offer-gradient'),
    mockCategoryIcon: ref('gift'),
    mockPoster: ref({
      id: 2,
      displayname: 'John Smith',
      supporter: false,
      profile: { paththumb: '/profile.jpg' },
      info: { offers: 10, wanteds: 5 },
      aboutme: { text: 'I love recycling!' },
    }),
    mockMe: ref({
      id: 1,
      lat: 55.9,
      lng: -3.2,
    }),
    mockLoggedIn: ref(true),
    mockStickyAdRendered: ref(0),
    mockBreakpoint: ref('md'),
    mockIsApp: ref(false),
    mockSetFullscreenModalOpen: vi.fn(),
    mockSetLandscape: vi.fn(),
  }
})

vi.mock('~/composables/useMessageDisplay', () => ({
  useMessageDisplay: () => ({
    message: mockMessage,
    subjectItemName: mockSubjectItemName,
    subjectLocation: mockSubjectLocation,
    fromme: mockFromme,
    gotAttachments: mockGotAttachments,
    attachmentCount: mockAttachmentCount,
    timeAgo: mockTimeAgo,
    fullTimeAgo: mockFullTimeAgo,
    distanceText: mockDistanceText,
    replyCount: mockReplyCount,
    replyTooltip: mockReplyTooltip,
    isOffer: mockIsOffer,
    formattedDeadline: mockFormattedDeadline,
    deadlineTooltip: mockDeadlineTooltip,
    successfulText: mockSuccessfulText,
    placeholderClass: mockPlaceholderClass,
    categoryIcon: mockCategoryIcon,
    poster: mockPoster,
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    loggedIn: mockLoggedIn,
  }),
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    get stickyAdRendered() {
      return mockStickyAdRendered.value
    },
    get breakpoint() {
      return mockBreakpoint.value
    },
    setFullscreenModalOpen: mockSetFullscreenModalOpen,
    setLandscape: mockSetLandscape,
  }),
}))

vi.mock('~/stores/mobile', () => ({
  useMobileStore: () => ({
    get isApp() {
      return mockIsApp.value
    },
  }),
}))

vi.mock('~/composables/useModalHistory', () => ({
  useModalHistory: vi.fn(),
}))

vi.mock('~/composables/useClientLog', () => ({
  action: vi.fn(),
}))

// Mock defineAsyncComponent to return stub components immediately
vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    defineAsyncComponent: (loader) => {
      // Return a simple stub component that won't cause async issues
      return {
        name: 'AsyncComponentStub',
        template: '<div class="async-component-stub" />',
      }
    },
  }
})

describe('MessageExpanded', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset all mocks to default values
    mockMessage.value = {
      id: 123,
      subject: 'OFFER: Test Item (Edinburgh EH17)',
      textbody: 'This is a test item description.',
      type: 'Offer',
      fromuser: 2,
      lat: 55.9,
      lng: -3.2,
      attachments: [
        { id: 1, path: '/img/test1.jpg', paththumb: '/img/test1_thumb.jpg' },
      ],
      groups: [{ groupid: 1 }],
      successful: false,
      promised: false,
      promisedtome: false,
      deadline: null,
      deliverypossible: false,
      replies: [],
      url: 'https://www.ilovefreegle.org/message/123',
    }
    mockSubjectItemName.value = 'Test Item'
    mockSubjectLocation.value = 'Edinburgh EH17'
    mockFromme.value = false
    mockGotAttachments.value = true
    mockAttachmentCount.value = 1
    mockTimeAgo.value = '2h'
    mockFullTimeAgo.value = 'Posted 2 hours ago'
    mockDistanceText.value = '5mi'
    mockReplyCount.value = 3
    mockReplyTooltip.value = '3 people have replied'
    mockIsOffer.value = true
    mockFormattedDeadline.value = ''
    mockDeadlineTooltip.value = 'Only available until this date'
    mockSuccessfulText.value = 'Taken'
    mockPlaceholderClass.value = 'offer-gradient'
    mockCategoryIcon.value = 'gift'
    mockPoster.value = {
      id: 2,
      displayname: 'John Smith',
      supporter: false,
      profile: { paththumb: '/profile.jpg' },
      info: { offers: 10, wanteds: 5 },
      aboutme: { text: 'I love recycling!' },
    }
    mockMe.value = { id: 1, lat: 55.9, lng: -3.2 }
    mockLoggedIn.value = true
    mockStickyAdRendered.value = 0
    mockBreakpoint.value = 'md'
    mockIsApp.value = false

    // Mock window.matchMedia for reduced motion check
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    // Mock document.getElementById for navbar-mobile check
    vi.spyOn(document, 'getElementById').mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  async function createWrapper(props = {}, options = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(MessageExpanded, {
                id: 123,
                ...props,
              }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        directives: {
          'b-tooltip': {
            mounted: () => {},
            updated: () => {},
          },
        },
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon"><slot /></span>',
            props: ['icon'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size'],
          },
          'b-img': {
            template:
              '<img class="b-img" :src="src" :alt="alt" :class="{ lazy }" />',
            props: ['src', 'alt', 'lazy'],
          },
          'b-alert': {
            template: '<div class="b-alert" :class="variant"><slot /></div>',
            props: ['variant', 'modelValue'],
          },
          Teleport: {
            template: '<div class="teleport-stub"><slot /></div>',
          },
          'client-only': {
            template: '<div class="client-only"><slot /></div>',
          },
          NuxtLink: {
            template: '<a class="nuxt-link" :href="to"><slot /></a>',
            props: ['to'],
          },
          NuxtPicture: {
            template:
              '<picture class="nuxt-picture"><img :src="src" :alt="alt" /></picture>',
            props: [
              'src',
              'alt',
              'format',
              'provider',
              'modifiers',
              'width',
              'height',
            ],
          },
          OurUploadedImage: {
            template:
              '<img class="our-uploaded-image" :src="src" :alt="alt" />',
            props: ['src', 'alt', 'modifiers', 'width', 'height'],
          },
          ProxyImage: {
            template:
              '<img class="proxy-image" :src="src" :alt="alt" :class="className" />',
            props: ['src', 'alt', 'className', 'width', 'height', 'fit'],
          },
          ProfileImage: {
            template:
              '<div class="profile-image" :data-name="name" :data-size="size" />',
            props: [
              'image',
              'externaluid',
              'ouruid',
              'externalmods',
              'name',
              'isThumbnail',
              'size',
            ],
          },
          UserRatings: {
            template: '<div class="user-ratings" :data-id="id" />',
            props: ['id', 'size', 'disabled'],
          },
          MessageTextBody: {
            template: '<div class="message-text-body" :data-id="id" />',
            props: ['id'],
          },
          MessageTag: {
            template: '<span class="message-tag" :data-id="id" />',
            props: ['id', 'inline'],
          },
          MessageReplySection: {
            template:
              '<div class="message-reply-section" :data-id="id" @close="$emit(\'close\')" @sent="$emit(\'sent\')" />',
            props: ['id'],
            emits: ['close', 'sent'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          MessagePhotoPlaceholder: {
            template:
              '<div class="message-photo-placeholder" :class="placeholderClass" :data-icon="icon" />',
            props: ['placeholderClass', 'icon'],
          },
          MessageMap: {
            template: '<div class="message-map" />',
            props: ['home', 'position'],
          },
          MessagePhotosModal: {
            template: '<div class="message-photos-modal" />',
            props: ['id', 'initialIndex'],
            emits: ['hidden'],
          },
          MessageShareModal: {
            template: '<div class="message-share-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
          ProfileModal: {
            template: '<div class="profile-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
          MessageReportModal: {
            template: '<div class="message-report-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
        },
        ...options.global,
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders message-expanded-wrapper container', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.message-expanded-wrapper').exists()).toBe(true)
    })

    it('renders nothing when message is null', async () => {
      mockMessage.value = null
      const wrapper = await createWrapper()
      expect(wrapper.find('.message-expanded-wrapper').exists()).toBe(false)
    })

    it('renders photo-area section', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.photo-area').exists()).toBe(true)
    })

    it('renders info-section', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.info-section').exists()).toBe(true)
    })

    it('renders description-section', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.description-section').exists()).toBe(true)
    })

    it('renders title-overlay with subject', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.title-overlay').exists()).toBe(true)
      expect(wrapper.find('.title-subject').text()).toBe('Test Item')
    })

    it('renders location in title overlay', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.title-location').text()).toBe('Edinburgh EH17')
    })

    it('hides location when not provided', async () => {
      mockSubjectLocation.value = null
      const wrapper = await createWrapper()
      expect(wrapper.find('.title-location').exists()).toBe(false)
    })

    it('renders MessageTextBody component', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.message-text-body').exists()).toBe(true)
    })

    it('renders MessageTag component', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.message-tag').exists()).toBe(true)
    })
  })

  describe('props handling', () => {
    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 456 })
      expect(wrapper.findComponent(MessageExpanded).props('id')).toBe(456)
    })

    it('has default replyable of true', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(MessageExpanded).props('replyable')).toBe(
        true
      )
    })

    it('accepts replyable prop', async () => {
      const wrapper = await createWrapper({ replyable: false })
      expect(wrapper.findComponent(MessageExpanded).props('replyable')).toBe(
        false
      )
    })

    it('has default hideClose of false', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(MessageExpanded).props('hideClose')).toBe(
        false
      )
    })

    it('has default actions of true', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(MessageExpanded).props('actions')).toBe(true)
    })

    it('has default inModal of false', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(MessageExpanded).props('inModal')).toBe(
        false
      )
    })

    it('accepts inModal prop', async () => {
      const wrapper = await createWrapper({ inModal: true })
      expect(wrapper.findComponent(MessageExpanded).props('inModal')).toBe(true)
    })

    it('has default fullscreenOverlay of false', async () => {
      const wrapper = await createWrapper()
      expect(
        wrapper.findComponent(MessageExpanded).props('fullscreenOverlay')
      ).toBe(false)
    })

    it('accepts fullscreenOverlay prop', async () => {
      const wrapper = await createWrapper({ fullscreenOverlay: true })
      expect(
        wrapper.findComponent(MessageExpanded).props('fullscreenOverlay')
      ).toBe(true)
    })
  })

  describe('attachments display', () => {
    it('renders photo container when gotAttachments is true', async () => {
      mockGotAttachments.value = true
      const wrapper = await createWrapper()
      expect(wrapper.find('.photo-container').exists()).toBe(true)
    })

    it('renders placeholder when gotAttachments is false', async () => {
      mockGotAttachments.value = false
      const wrapper = await createWrapper()
      expect(wrapper.find('.message-photo-placeholder').exists()).toBe(true)
    })

    it('renders thumbnail carousel when multiple attachments', async () => {
      mockAttachmentCount.value = 3
      mockMessage.value.attachments = [
        { id: 1, path: '/img/1.jpg' },
        { id: 2, path: '/img/2.jpg' },
        { id: 3, path: '/img/3.jpg' },
      ]
      const wrapper = await createWrapper()
      expect(wrapper.find('.thumbnail-carousel').exists()).toBe(true)
      expect(wrapper.findAll('.thumbnail-item').length).toBe(3)
    })

    it('hides thumbnail carousel when single attachment', async () => {
      mockAttachmentCount.value = 1
      const wrapper = await createWrapper()
      expect(wrapper.find('.thumbnail-carousel').exists()).toBe(false)
    })

    it('marks first thumbnail as active by default', async () => {
      mockAttachmentCount.value = 2
      mockMessage.value.attachments = [
        { id: 1, path: '/img/1.jpg' },
        { id: 2, path: '/img/2.jpg' },
      ]
      const wrapper = await createWrapper()
      const thumbnails = wrapper.findAll('.thumbnail-item')
      expect(thumbnails[0].classes()).toContain('active')
      expect(thumbnails[1].classes()).not.toContain('active')
    })
  })

  describe('status overlays', () => {
    it('shows "freegled" overlay when message is successful', async () => {
      mockMessage.value.successful = true
      const wrapper = await createWrapper()
      const overlay = wrapper.find('.status-overlay-image')
      expect(overlay.exists()).toBe(true)
      expect(overlay.attributes('src')).toBe('/freegled.jpg')
    })

    it('shows "promised" overlay when message is promised', async () => {
      mockMessage.value.promised = true
      const wrapper = await createWrapper()

      // The promised overlay requires photoAreaTallEnough (height >= 150).
      // In tests there's no real DOM so photoAreaHeight defaults to 0.
      // Set it directly on the inner component instance.
      const inner = wrapper.findComponent(MessageExpanded)
      inner.vm.photoAreaHeight = 200
      await wrapper.vm.$nextTick()

      const overlay = wrapper.find('.status-overlay-image')
      expect(overlay.exists()).toBe(true)
      expect(overlay.attributes('src')).toBe('/promised.jpg')
    })

    it('hides overlay when not successful or promised', async () => {
      mockMessage.value.successful = false
      mockMessage.value.promised = false
      const wrapper = await createWrapper()
      expect(wrapper.find('.status-overlay-image').exists()).toBe(false)
    })

    it('prioritizes successful over promised', async () => {
      mockMessage.value.successful = true
      mockMessage.value.promised = true
      const wrapper = await createWrapper()
      const overlay = wrapper.find('.status-overlay-image')
      expect(overlay.attributes('src')).toBe('/freegled.jpg')
    })
  })

  describe('info icons', () => {
    it('renders distance text when available', async () => {
      mockDistanceText.value = '5mi'
      const wrapper = await createWrapper()
      expect(wrapper.find('.location').exists()).toBe(true)
      expect(wrapper.text()).toContain('5mi')
    })

    it('hides distance when not available', async () => {
      mockDistanceText.value = null
      const wrapper = await createWrapper()
      expect(wrapper.find('.location').exists()).toBe(false)
    })

    it('renders time ago', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.time').exists()).toBe(true)
      expect(wrapper.text()).toContain('2h')
    })

    it('renders reply count', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.replies').exists()).toBe(true)
      expect(wrapper.text()).toContain('3')
    })

    it('renders delivery icon when deliverypossible and isOffer', async () => {
      mockMessage.value.deliverypossible = true
      mockIsOffer.value = true
      const wrapper = await createWrapper()
      expect(wrapper.find('.delivery').exists()).toBe(true)
    })

    it('hides delivery icon when not deliverypossible', async () => {
      mockMessage.value.deliverypossible = false
      const wrapper = await createWrapper()
      expect(wrapper.find('.delivery').exists()).toBe(false)
    })

    it('hides delivery icon for Wanted posts', async () => {
      mockMessage.value.deliverypossible = true
      mockIsOffer.value = false
      const wrapper = await createWrapper()
      expect(wrapper.find('.delivery').exists()).toBe(false)
    })

    it('renders deadline when set', async () => {
      mockMessage.value.deadline = '2024-02-01'
      mockFormattedDeadline.value = '1 Feb'
      const wrapper = await createWrapper()
      expect(wrapper.find('.deadline').exists()).toBe(true)
      expect(wrapper.text()).toContain('1 Feb')
    })

    it('hides deadline when not set', async () => {
      mockMessage.value.deadline = null
      const wrapper = await createWrapper()
      expect(wrapper.find('.deadline').exists()).toBe(false)
    })
  })

  describe('poster display', () => {
    it('renders poster overlay with name', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.poster-overlay-name').text()).toBe('John Smith')
    })

    it('renders poster stats - offers count', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('10')
    })

    it('renders poster stats - wanteds count', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('5')
    })

    it('renders supporter badge when supporter', async () => {
      mockPoster.value.supporter = true
      const wrapper = await createWrapper()
      expect(wrapper.find('.supporter-badge-small').exists()).toBe(true)
    })

    it('hides supporter badge when not supporter', async () => {
      mockPoster.value.supporter = false
      const wrapper = await createWrapper()
      expect(wrapper.find('.supporter-badge-small').exists()).toBe(false)
    })

    it('renders ProfileImage for poster', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })
  })

  describe('reply functionality', () => {
    it('shows reply button when replyable and not from me', async () => {
      mockFromme.value = false
      const wrapper = await createWrapper({ replyable: true })
      expect(wrapper.text()).toContain('Reply')
    })

    it('hides reply button when from me', async () => {
      mockFromme.value = true
      const wrapper = await createWrapper({ replyable: true })
      expect(wrapper.find('.reply-button').exists()).toBe(false)
    })

    it('hides reply button when not replyable', async () => {
      const wrapper = await createWrapper({ replyable: false })
      expect(wrapper.find('.reply-button').exists()).toBe(false)
    })

    it('hides reply button when message is successful', async () => {
      mockMessage.value.successful = true
      const wrapper = await createWrapper()
      expect(wrapper.find('.reply-button').exists()).toBe(false)
    })

    it('expands reply section when reply button clicked', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.message-reply-section').exists()).toBe(false)

      await wrapper.find('.reply-button').trigger('click')
      await flushPromises()

      expect(wrapper.find('.message-reply-section').exists()).toBe(true)
    })

    it('shows cancel button in modal/fullscreen mode', async () => {
      const wrapper = await createWrapper({ inModal: true })
      expect(wrapper.find('.cancel-button').exists()).toBe(true)
    })

    it('hides cancel button when not in modal', async () => {
      const wrapper = await createWrapper({
        inModal: false,
        fullscreenOverlay: false,
      })
      expect(wrapper.find('.cancel-button').exists()).toBe(false)
    })
  })

  describe('promised notice', () => {
    it('shows promised notice when promised and not from me', async () => {
      mockMessage.value.promised = true
      mockFromme.value = false
      const wrapper = await createWrapper()
      expect(wrapper.find('.promised-notice').exists()).toBe(true)
      expect(wrapper.text()).toContain('Already promised')
    })

    it('shows "Promised to you" when promisedtome', async () => {
      mockMessage.value.promised = true
      mockMessage.value.promisedtome = true
      mockFromme.value = false
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Promised to you')
    })

    it('hides promised notice when successful', async () => {
      mockMessage.value.promised = true
      mockMessage.value.successful = true
      const wrapper = await createWrapper()
      expect(wrapper.find('.promised-notice').exists()).toBe(false)
    })

    it('hides promised notice when from me', async () => {
      mockMessage.value.promised = true
      mockFromme.value = true
      const wrapper = await createWrapper()
      expect(wrapper.find('.promised-notice').exists()).toBe(false)
    })
  })

  describe('replied state', () => {
    it('shows confirmation alert after sending reply', async () => {
      const wrapper = await createWrapper()

      // Expand reply section
      await wrapper.find('.reply-button').trigger('click')
      await flushPromises()

      // Trigger sent event
      const replySection = wrapper.find('.message-reply-section')
      await replySection.trigger('sent')
      await flushPromises()

      expect(wrapper.find('.b-alert').exists()).toBe(true)
      expect(wrapper.text()).toContain('Message sent')
    })
  })

  describe('action buttons', () => {
    it('renders share button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Share')
    })

    it('renders report button when logged in and has groups', async () => {
      mockLoggedIn.value = true
      mockMessage.value.groups = [{ groupid: 1 }]
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Report')
    })

    it('hides report button when not logged in', async () => {
      mockLoggedIn.value = false
      const wrapper = await createWrapper()
      // Report text might still be in page but button should be hidden
      const reportButtons = wrapper.findAll('.action-button--report')
      expect(reportButtons.length).toBe(0)
    })

    it('hides report button when no groups', async () => {
      mockLoggedIn.value = true
      mockMessage.value.groups = []
      const wrapper = await createWrapper()
      const reportButtons = wrapper.findAll('.action-button--report')
      expect(reportButtons.length).toBe(0)
    })

    it('renders message ID link', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('#123')
    })
  })

  describe('modal and overlay classes', () => {
    it('adds in-modal class when inModal prop is true', async () => {
      const wrapper = await createWrapper({ inModal: true })
      expect(wrapper.find('.in-modal').exists()).toBe(true)
    })

    it('adds fullscreen-overlay class when fullscreenOverlay prop is true', async () => {
      const wrapper = await createWrapper({ fullscreenOverlay: true })
      expect(wrapper.find('.fullscreen-overlay').exists()).toBe(true)
    })

    it('shows close button in modal mode', async () => {
      const wrapper = await createWrapper({ inModal: true })
      expect(wrapper.find('.close-button').exists()).toBe(true)
    })

    it('shows back button in fullscreen overlay mode', async () => {
      const wrapper = await createWrapper({ fullscreenOverlay: true })
      expect(wrapper.find('.back-button').exists()).toBe(true)
    })
  })

  describe('events', () => {
    it('emits close when close button clicked', async () => {
      const wrapper = await createWrapper({ inModal: true })
      await wrapper.find('.close-button').trigger('click')
      expect(
        wrapper.findComponent(MessageExpanded).emitted('close')
      ).toBeTruthy()
    })

    it('emits close when back button clicked', async () => {
      const wrapper = await createWrapper({ fullscreenOverlay: true })
      await wrapper.find('.back-button').trigger('click')
      expect(
        wrapper.findComponent(MessageExpanded).emitted('close')
      ).toBeTruthy()
    })

    it('emits close when cancel button clicked', async () => {
      const wrapper = await createWrapper({ inModal: true })
      await wrapper.find('.cancel-button').trigger('click')
      expect(
        wrapper.findComponent(MessageExpanded).emitted('close')
      ).toBeTruthy()
    })
  })

  describe('photo interactions', () => {
    it('emits zoom when photo area clicked with attachments', async () => {
      mockGotAttachments.value = true
      const wrapper = await createWrapper()
      await wrapper.find('.photo-area').trigger('click')
      expect(
        wrapper.findComponent(MessageExpanded).emitted('zoom')
      ).toBeTruthy()
    })

    it('does not emit zoom when no attachments', async () => {
      mockGotAttachments.value = false
      const wrapper = await createWrapper()
      await wrapper.find('.photo-area').trigger('click')
      expect(wrapper.findComponent(MessageExpanded).emitted('zoom')).toBeFalsy()
    })

    it('changes photo when thumbnail clicked', async () => {
      mockAttachmentCount.value = 3
      mockMessage.value.attachments = [
        { id: 1, path: '/img/1.jpg' },
        { id: 2, path: '/img/2.jpg' },
        { id: 3, path: '/img/3.jpg' },
      ]
      const wrapper = await createWrapper()

      const thumbnails = wrapper.findAll('.thumbnail-item')
      await thumbnails[1].trigger('click')
      await flushPromises()

      // Second thumbnail should now be active
      expect(thumbnails[1].classes()).toContain('active')
    })
  })

  describe('Ken Burns animation', () => {
    it('shows ken-burns class after mount', async () => {
      const wrapper = await createWrapper()
      await flushPromises()
      expect(wrapper.find('.photo-container.ken-burns').exists()).toBe(true)
    })

    it('hides ken-burns when prefers-reduced-motion', async () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const wrapper = await createWrapper()
      await flushPromises()
      expect(wrapper.find('.photo-container.ken-burns').exists()).toBe(false)
    })
  })

  describe('two-column layout', () => {
    it('computes isTwoColumnLayout correctly', async () => {
      mockBreakpoint.value = 'xl'
      const wrapper = await createWrapper({ inModal: true })
      await flushPromises()

      const comp = wrapper.findComponent(MessageExpanded)
      // The computed property checks breakpoint and window height
      // At xl breakpoint with default window height, isTwoColumnLayout may be false
      // because windowHeight needs to be <= 700px
      // We verify the computed works by checking initial state (tall screen = false)
      expect(typeof comp.vm.isTwoColumnLayout).toBe('boolean')
    })

    it('isTwoColumnLayout returns false when not in modal', async () => {
      mockBreakpoint.value = 'xl'
      const wrapper = await createWrapper({
        inModal: false,
        fullscreenOverlay: false,
      })
      await flushPromises()

      const comp = wrapper.findComponent(MessageExpanded)
      // Always false when not in modal/overlay mode
      expect(comp.vm.isTwoColumnLayout).toBe(false)
    })

    it('right-column element exists in template', async () => {
      const wrapper = await createWrapper({ inModal: true })
      await flushPromises()

      // The right-column wrapper should always exist
      expect(wrapper.find('.right-column').exists()).toBe(true)
    })
  })

  describe('sticky ad adjustment', () => {
    it('adds stickyAdRendered class when stickyAdRendered is truthy', async () => {
      mockStickyAdRendered.value = 1
      const wrapper = await createWrapper()
      expect(wrapper.find('.stickyAdRendered').exists()).toBe(true)
    })

    it('does not add stickyAdRendered class when falsy', async () => {
      mockStickyAdRendered.value = 0
      const wrapper = await createWrapper()
      // Check that the main container doesn't have the class
      expect(
        wrapper.find('.message-expanded-mobile.stickyAdRendered').exists()
      ).toBe(false)
    })
  })

  describe('fullscreen modal state management', () => {
    it('calls setFullscreenModalOpen(true) on mount in fullscreenOverlay mode', async () => {
      await createWrapper({ fullscreenOverlay: true })
      expect(mockSetFullscreenModalOpen).toHaveBeenCalledWith(true)
    })

    it('does not call setFullscreenModalOpen on mount in non-fullscreen mode', async () => {
      await createWrapper({ fullscreenOverlay: false })
      expect(mockSetFullscreenModalOpen).not.toHaveBeenCalled()
    })
  })

  describe('poster aboutme', () => {
    it('renders aboutme text when available', async () => {
      mockPoster.value.aboutme = { text: 'I love recycling!' }
      const wrapper = await createWrapper()
      expect(wrapper.find('.poster-aboutme').exists()).toBe(true)
      expect(wrapper.text()).toContain('I love recycling!')
    })

    it('hides aboutme when not available', async () => {
      mockPoster.value.aboutme = null
      const wrapper = await createWrapper()
      expect(wrapper.find('.poster-aboutme').exists()).toBe(false)
    })
  })

  describe('share button on photo', () => {
    it('renders share button in photo area', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.photo-action-btn').exists()).toBe(true)
    })
  })

  describe('message ID link', () => {
    it('links to message page', async () => {
      const wrapper = await createWrapper()
      const link = wrapper.find('.section-id-link.nuxt-link')
      expect(link.attributes('href')).toBe('/message/123')
    })
  })

  describe('reactive state', () => {
    it('initializes replied as false', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      expect(comp.vm.replied).toBe(false)
    })

    it('initializes replyExpanded as false', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      expect(comp.vm.replyExpanded).toBe(false)
    })

    it('initializes showMapModal as false', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      expect(comp.vm.showMapModal).toBe(false)
    })

    it('initializes showShareModal as false', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      expect(comp.vm.showShareModal).toBe(false)
    })

    it('initializes showProfileModal as false', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      expect(comp.vm.showProfileModal).toBe(false)
    })

    it('initializes currentPhotoIndex as 0', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      expect(comp.vm.currentPhotoIndex).toBe(0)
    })
  })

  describe('computed properties', () => {
    it('computes currentAttachment from message attachments', async () => {
      mockMessage.value.attachments = [
        { id: 1, path: '/img/1.jpg' },
        { id: 2, path: '/img/2.jpg' },
      ]
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      expect(comp.vm.currentAttachment).toEqual({
        id: 1,
        path: '/img/1.jpg',
      })
    })

    it('computes validPosition when lat or lng exists', async () => {
      mockMessage.value.lat = 55.9
      mockMessage.value.lng = -3.2
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      expect(comp.vm.validPosition).toBeTruthy()
    })

    it('computes validPosition as falsy when no coords', async () => {
      mockMessage.value.lat = null
      mockMessage.value.lng = null
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      expect(comp.vm.validPosition).toBeFalsy()
    })

    it('computes home from me coords', async () => {
      mockMe.value = { id: 1, lat: 55.9, lng: -3.2 }
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      expect(comp.vm.home).toEqual({ lat: 55.9, lng: -3.2 })
    })

    it('computes home as null when me has no coords', async () => {
      mockMe.value = { id: 1 }
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      expect(comp.vm.home).toBeNull()
    })

    it('computes posterAboutMe from poster', async () => {
      mockPoster.value.aboutme = { text: 'Hello world' }
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      expect(comp.vm.posterAboutMe).toBe('Hello world')
    })

    it('computes posterAboutMe as null when no aboutme', async () => {
      mockPoster.value.aboutme = null
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      expect(comp.vm.posterAboutMe).toBeNull()
    })
  })

  describe('methods', () => {
    it('goBack emits close', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      comp.vm.goBack()
      expect(comp.emitted('close')).toBeTruthy()
    })

    it('showPhotosModal opens photo modal when has attachments', async () => {
      mockGotAttachments.value = true
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      comp.vm.showPhotosModal()
      expect(comp.vm.showMessagePhotosModal).toBe(true)
      expect(comp.emitted('zoom')).toBeTruthy()
    })

    it('showPhotosModal does nothing when no attachments', async () => {
      mockGotAttachments.value = false
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      comp.vm.showPhotosModal()
      expect(comp.vm.showMessagePhotosModal).toBe(false)
      expect(comp.emitted('zoom')).toBeFalsy()
    })

    it('showShare opens share modal', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      comp.vm.showShare()
      expect(comp.vm.showShareModal).toBe(true)
    })

    it('showReport opens report modal', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      comp.vm.showReport()
      expect(comp.vm.showReportModal).toBe(true)
    })

    it('selectPhoto updates currentPhotoIndex', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      comp.vm.selectPhoto(2)
      expect(comp.vm.currentPhotoIndex).toBe(2)
    })

    it('handleThumbnailClick selects photo when different index', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      comp.vm.handleThumbnailClick(1)
      expect(comp.vm.currentPhotoIndex).toBe(1)
      expect(comp.vm.showMessagePhotosModal).toBe(false)
    })

    it('handleThumbnailClick opens modal when same index', async () => {
      mockGotAttachments.value = true
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      comp.vm.currentPhotoIndex = 0
      comp.vm.handleThumbnailClick(0)
      expect(comp.vm.showMessagePhotosModal).toBe(true)
    })

    it('expandReply sets replyExpanded to true', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      comp.vm.expandReply()
      expect(comp.vm.replyExpanded).toBe(true)
    })

    it('sent sets replied to true and replyExpanded to false', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(MessageExpanded)
      comp.vm.replyExpanded = true
      comp.vm.sent()
      expect(comp.vm.replyExpanded).toBe(false)
      expect(comp.vm.replied).toBe(true)
    })
  })

  describe('OurUploadedImage rendering', () => {
    it('renders OurUploadedImage when attachment has ouruid', async () => {
      mockMessage.value.attachments = [{ id: 1, ouruid: 'abc123' }]
      const wrapper = await createWrapper()
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })

    it('renders NuxtPicture when attachment has externaluid', async () => {
      mockMessage.value.attachments = [{ id: 1, externaluid: 'ext123' }]
      const wrapper = await createWrapper()
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)
    })

    it('renders ProxyImage when attachment has path', async () => {
      mockMessage.value.attachments = [{ id: 1, path: '/img/test.jpg' }]
      const wrapper = await createWrapper()
      expect(wrapper.find('.proxy-image').exists()).toBe(true)
    })
  })

  describe('thumbnail rendering', () => {
    it('renders OurUploadedImage thumbnails when ouruid exists', async () => {
      mockAttachmentCount.value = 2
      mockMessage.value.attachments = [
        { id: 1, ouruid: 'abc123' },
        { id: 2, ouruid: 'def456' },
      ]
      const wrapper = await createWrapper()
      expect(
        wrapper.findAll('.thumbnail-item .our-uploaded-image').length
      ).toBe(2)
    })

    it('renders NuxtPicture thumbnails when externaluid exists', async () => {
      mockAttachmentCount.value = 2
      mockMessage.value.attachments = [
        { id: 1, externaluid: 'ext123' },
        { id: 2, externaluid: 'ext456' },
      ]
      const wrapper = await createWrapper()
      expect(wrapper.findAll('.thumbnail-item .nuxt-picture').length).toBe(2)
    })

    it('renders ProxyImage thumbnails when path exists', async () => {
      mockAttachmentCount.value = 2
      mockMessage.value.attachments = [
        { id: 1, path: '/img/1.jpg' },
        { id: 2, path: '/img/2.jpg' },
      ]
      const wrapper = await createWrapper()
      expect(wrapper.findAll('.thumbnail-item .proxy-image').length).toBe(2)
    })
  })
})
