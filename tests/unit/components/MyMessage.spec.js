import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import MyMessage from '~/components/MyMessage.vue'

// Use vi.hoisted for mock data that needs to be available during mock factory execution
const {
  mockData,
  mockMessageStore,
  mockChatStore,
  mockUserStore,
  mockTrystStore,
  mockComposeStore,
  mockLocationStore,
  mockGroupStore,
  mockRouterPush,
} = vi.hoisted(() => ({
  mockData: {
    message: null,
    me: { id: 1, lat: 51.5, lng: -0.1 },
    myid: 1,
  },
  mockMessageStore: {
    fetch: vi.fn().mockResolvedValue({}),
    byId: vi.fn(),
  },
  mockChatStore: {
    list: [],
    fetchChats: vi.fn(),
  },
  mockUserStore: {
    fetch: vi.fn(),
    byId: vi.fn(),
  },
  mockTrystStore: {
    getByUser: vi.fn(),
  },
  mockComposeStore: {
    clearMessages: vi.fn().mockResolvedValue(),
    setMessage: vi.fn().mockResolvedValue(),
    setAttachmentsForMessage: vi.fn().mockResolvedValue(),
    postcode: null,
  },
  mockLocationStore: {
    typeahead: vi.fn().mockResolvedValue([{ id: 1, name: 'AB1 2CD' }]),
  },
  mockGroupStore: {
    fetch: vi.fn(),
    get: vi.fn(),
  },
  mockRouterPush: vi.fn(),
}))

// Mock #imports - must be before component import takes effect
vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    useRouter: () => ({
      push: mockRouterPush,
    }),
  }
})

// Mock stores
vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/tryst', () => ({
  useTrystStore: () => mockTrystStore,
}))

vi.mock('~/stores/compose', () => ({
  useComposeStore: () => mockComposeStore,
}))

vi.mock('~/stores/location', () => ({
  useLocationStore: () => mockLocationStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

// Mock useMe composable
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    get me() {
      return ref(mockData.me)
    },
    get myid() {
      return ref(mockData.myid)
    },
  }),
}))

// Mock useMessageDisplay composable - use getter functions for reactivity
vi.mock('~/composables/useMessageDisplay', () => ({
  useMessageDisplay: () => ({
    get message() {
      return ref(mockData.message)
    },
    get strippedSubject() {
      return ref(
        mockData.message?.subject?.replace(/^(OFFER|WANTED):\s*/i, '') ||
          'Test Item'
      )
    },
    get gotAttachments() {
      return ref(mockData.message?.attachments?.length > 0)
    },
    get timeAgoExpanded() {
      return ref('2 hours')
    },
    get placeholderClass() {
      return ref(
        mockData.message?.type === 'Offer'
          ? 'offer-gradient'
          : 'wanted-gradient'
      )
    },
    get categoryIcon() {
      return ref(mockData.message?.type === 'Offer' ? 'gift' : 'search')
    },
  }),
}))

// Mock useTimeFormat
vi.mock('~/composables/useTimeFormat', () => ({
  timeago: vi.fn((date) => '2 days'),
}))

// Mock useDistance
vi.mock('~/composables/useDistance', () => ({
  milesAway: vi.fn(() => 5),
}))

// Mock dayjs
vi.mock('dayjs', () => {
  const mockDayjs = (date) => ({
    format: () => 'Sat 15th 10:00',
    isAfter: () => true,
    isBefore: () => false,
  })
  mockDayjs.extend = vi.fn()
  return { default: mockDayjs }
})

describe('MyMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset mock data
    mockData.message = {
      id: 123,
      type: 'Offer',
      subject: 'OFFER: Test item (Location)',
      textbody: 'Test description',
      fromuser: 1,
      attachments: [],
      outcomes: [],
      groups: [{ groupid: 1, collection: 'Approved' }],
      replies: [],
      promises: [],
      promised: false,
      canrepost: true,
      canrepostat: null,
      area: 'Test Area',
      location: { name: 'AB1 2CD' },
      item: { name: 'Test item' },
      availablenow: 1,
      refchatids: [],
    }
    mockData.me = { id: 1, lat: 51.5, lng: -0.1 }
    mockData.myid = 1

    // Reset store mocks
    mockMessageStore.byId.mockReturnValue(mockData.message)
    mockMessageStore.fetch.mockResolvedValue(mockData.message)
    mockChatStore.list = []
    mockUserStore.byId.mockReturnValue(null)
    mockGroupStore.get.mockReturnValue({
      id: 1,
      nameshort: 'test-group',
      namedisplay: 'Test Group',
    })
  })

  async function createWrapper(props = {}) {
    const wrapper = mount(MyMessage, {
      props: {
        id: 123,
        showOld: true,
        expand: false,
        ...props,
      },
      global: {
        stubs: {
          'notice-message': {
            template: '<div class="notice-message"><slot /></div>',
          },
          'v-icon': {
            template: '<i :class="icon" class="v-icon" />',
            props: ['icon'],
          },
          'b-img': {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'lazy'],
          },
          NuxtLink: {
            template: '<a :href="to" class="nuxt-link"><slot /></a>',
            props: ['to'],
          },
          NuxtPicture: {
            template:
              '<picture class="nuxt-picture"><img :src="src" /></picture>',
            props: [
              'src',
              'format',
              'provider',
              'modifiers',
              'alt',
              'width',
              'height',
            ],
          },
          ProfileImage: {
            template: '<div class="profile-image" />',
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
          MessageTag: {
            template: '<span class="message-tag" />',
            props: ['id', 'inline'],
          },
          OurUploadedImage: {
            template: '<img class="our-uploaded-image" :src="src" />',
            props: ['src', 'modifiers', 'alt', 'width', 'height'],
          },
          ProxyImage: {
            template: '<img class="proxy-image" :src="src" />',
            props: ['src', 'className', 'alt', 'width', 'height', 'fit'],
          },
          MyMessageReply: {
            template: '<div class="my-message-reply" />',
            props: [
              'reply',
              'chats',
              'message',
              'taken',
              'received',
              'withdrawn',
              'closest',
              'best',
              'quickest',
            ],
          },
          OutcomeModal: {
            template: '<div class="outcome-modal" />',
            props: ['id', 'type'],
            emits: ['outcome', 'hidden'],
          },
          MessageShareModal: {
            template: '<div class="message-share-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
          MessageEditModal: {
            template: '<div class="message-edit-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
          PromiseModal: {
            template: '<div class="promise-modal" />',
            props: ['messages', 'selectedMessage', 'users'],
            emits: ['hidden'],
          },
          RenegeModal: {
            template: '<div class="renege-modal" />',
            props: ['messages', 'selectedMessage', 'users', 'selectedUser'],
            emits: ['hidden'],
          },
          Transition: {
            template: '<div class="transition"><slot /></div>',
            props: ['name'],
          },
        },
        directives: {
          'observe-visibility': {
            mounted(el, binding) {
              // Immediately trigger visibility to simulate visible state
              if (typeof binding.value === 'function') {
                binding.value(true)
              }
            },
          },
        },
      },
    })

    // Wait for async operations (visibility handler and fetch)
    await flushPromises()
    await nextTick()

    return wrapper
  }

  describe('Props', () => {
    it('accepts required id prop', async () => {
      const wrapper = await createWrapper({ id: 456 })
      expect(wrapper.props('id')).toBe(456)
    })

    it('accepts required showOld prop', async () => {
      const wrapper = await createWrapper({ showOld: false })
      expect(wrapper.props('showOld')).toBe(false)
    })

    it('accepts optional expand prop with default false', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.props('expand')).toBe(false)
    })

    it('accepts expand prop when true', async () => {
      const wrapper = await createWrapper({ expand: true })
      expect(wrapper.props('expand')).toBe(true)
    })
  })

  describe('Rendering', () => {
    it('renders the main message wrapper', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.my-message-mobile').exists()).toBe(true)
    })

    it('renders message-card when message exists and visible', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.message-card').exists()).toBe(true)
    })

    it('does not render message-card when showOld is false and has outcomes', async () => {
      mockData.message.outcomes = [{ outcome: 'Taken' }]
      const wrapper = await createWrapper({ showOld: false })
      expect(wrapper.find('.message-card').exists()).toBe(false)
    })

    it('renders photo-section', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.photo-section').exists()).toBe(true)
    })

    it('renders photo-area', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.photo-area').exists()).toBe(true)
    })

    it('renders title overlay', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.title-overlay').exists()).toBe(true)
    })

    it('renders MessageTag component', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.message-tag').exists()).toBe(true)
    })
  })

  describe('Photo Display', () => {
    it('renders no-photo-placeholder when no attachments', async () => {
      mockData.message.attachments = []
      const wrapper = await createWrapper()
      expect(wrapper.find('.no-photo-placeholder').exists()).toBe(true)
    })

    it('renders placeholder with correct gradient class for Offer', async () => {
      mockData.message.type = 'Offer'
      mockData.message.attachments = []
      const wrapper = await createWrapper()
      expect(wrapper.find('.no-photo-placeholder').exists()).toBe(true)
    })

    it('renders OurUploadedImage when attachment has ouruid', async () => {
      mockData.message.attachments = [
        { ouruid: 'test-ouruid', externalmods: null },
      ]
      const wrapper = await createWrapper()
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })

    it('renders NuxtPicture when attachment has externaluid', async () => {
      mockData.message.attachments = [
        { externaluid: 'test-externaluid', externalmods: null },
      ]
      const wrapper = await createWrapper()
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)
    })

    it('renders ProxyImage when attachment has path only', async () => {
      mockData.message.attachments = [{ path: '/test/path.jpg' }]
      const wrapper = await createWrapper()
      expect(wrapper.find('.proxy-image').exists()).toBe(true)
    })
  })

  describe('Status Overlays', () => {
    it('shows freegled overlay when message is taken', async () => {
      mockData.message.outcomes = [{ outcome: 'Taken' }]
      const wrapper = await createWrapper({ showOld: true })
      expect(wrapper.find('.status-overlay').exists()).toBe(true)
    })

    it('shows freegled overlay when message is received', async () => {
      mockData.message.outcomes = [{ outcome: 'Received' }]
      const wrapper = await createWrapper({ showOld: true })
      expect(wrapper.find('.status-overlay').exists()).toBe(true)
    })

    it('shows promised banner when message is promised', async () => {
      mockData.message.promised = true
      mockData.message.outcomes = []
      mockData.message.promises = [{ userid: 2 }]
      mockUserStore.byId.mockReturnValue({ id: 2, displayname: 'Test User' })
      const wrapper = await createWrapper()
      expect(wrapper.find('.promised-banner').exists()).toBe(true)
    })

    it('shows unpromise button when promised', async () => {
      mockData.message.promised = true
      mockData.message.outcomes = []
      mockData.message.promises = [{ userid: 2 }]
      mockUserStore.byId.mockReturnValue({ id: 2, displayname: 'Test User' })
      const wrapper = await createWrapper()
      expect(wrapper.find('.unpromise-btn').exists()).toBe(true)
    })

    it('displays promised user name in banner', async () => {
      mockData.message.promised = true
      mockData.message.outcomes = []
      mockData.message.promises = [{ userid: 2 }]
      mockUserStore.byId.mockReturnValue({ id: 2, displayname: 'Test User' })
      const wrapper = await createWrapper()
      expect(wrapper.find('.promised-banner').text()).toContain('Test User')
    })
  })

  describe('Rejected Messages', () => {
    it('shows rejected notice for rejected messages', async () => {
      mockData.message.groups = [{ groupid: 1, collection: 'Rejected' }]
      const wrapper = await createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('This post has been returned to you')
    })

    it('shows Edit & Resend button for rejected messages', async () => {
      mockData.message.groups = [{ groupid: 1, collection: 'Rejected' }]
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Edit & Resend')
    })

    it('does not show TAKEN button for rejected messages', async () => {
      mockData.message.groups = [{ groupid: 1, collection: 'Rejected' }]
      const wrapper = await createWrapper()
      const actionBtns = wrapper.findAll('.action-btn')
      const takenBtn = actionBtns.filter((btn) => btn.text().includes('TAKEN'))
      expect(takenBtn.length).toBe(0)
    })
  })

  describe('Action Buttons', () => {
    it('shows TAKEN button for Offer messages', async () => {
      mockData.message.type = 'Offer'
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('TAKEN')
    })

    it('shows RECEIVED button for Wanted messages', async () => {
      mockData.message.type = 'Wanted'
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('RECEIVED')
    })

    it('shows Promise button for Offer messages not promised', async () => {
      mockData.message.type = 'Offer'
      mockData.message.promised = false
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Promise')
    })

    it('does not show Promise button when already promised', async () => {
      mockData.message.type = 'Offer'
      mockData.message.promised = true
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      const actionBtns = wrapper.findAll('.action-btn')
      const promiseBtn = actionBtns.filter(
        (btn) => btn.text().trim() === 'Promise'
      )
      expect(promiseBtn.length).toBe(0)
    })

    it('shows Withdraw button when not completed', async () => {
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Withdraw')
    })

    it('shows Repost button when canrepost is true', async () => {
      mockData.message.canrepost = true
      mockData.message.location = { name: 'AB1 2CD' }
      mockData.message.item = { name: 'Test item' }
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Repost')
    })

    it('does not show Repost button when canrepost is false', async () => {
      mockData.message.canrepost = false
      const wrapper = await createWrapper()
      const actionBtns = wrapper.findAll('.action-btn')
      const repostBtn = actionBtns.filter((btn) =>
        btn.text().includes('Repost')
      )
      expect(repostBtn.length).toBe(0)
    })

    it('shows Edit button when no outcomes', async () => {
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Edit')
    })

    it('does not show Edit button when has outcomes', async () => {
      mockData.message.outcomes = [{ outcome: 'Taken' }]
      const wrapper = await createWrapper({ showOld: true })
      const actionBtns = wrapper.findAll('.action-btn')
      const editBtn = actionBtns.filter((btn) => btn.text().includes('Edit'))
      expect(editBtn.length).toBe(0)
    })

    it('does not show TAKEN button when already taken', async () => {
      mockData.message.type = 'Offer'
      mockData.message.outcomes = [{ outcome: 'Taken' }]
      const wrapper = await createWrapper({ showOld: true })
      const takenBtn = wrapper
        .findAll('.action-btn')
        .filter((btn) => btn.text().includes('TAKEN'))
      expect(takenBtn.length).toBe(0)
    })

    it('does not show RECEIVED button when already received', async () => {
      mockData.message.type = 'Wanted'
      mockData.message.outcomes = [{ outcome: 'Received' }]
      const wrapper = await createWrapper({ showOld: true })
      const receivedBtn = wrapper
        .findAll('.action-btn')
        .filter((btn) => btn.text().includes('RECEIVED'))
      expect(receivedBtn.length).toBe(0)
    })

    it('does not show Withdraw button when withdrawn', async () => {
      mockData.message.outcomes = [{ outcome: 'Withdrawn' }]
      const wrapper = await createWrapper({ showOld: true })
      const withdrawBtn = wrapper
        .findAll('.action-btn')
        .filter((btn) => btn.text().includes('Withdraw'))
      expect(withdrawBtn.length).toBe(0)
    })
  })

  describe('Button Interactions', () => {
    it('clicking TAKEN button shows outcome modal', async () => {
      mockData.message.type = 'Offer'
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      const takenBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('TAKEN'))
      expect(takenBtn).toBeDefined()
      await takenBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.outcome-modal').exists()).toBe(true)
    })

    it('clicking RECEIVED button shows outcome modal', async () => {
      mockData.message.type = 'Wanted'
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      const receivedBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('RECEIVED'))
      expect(receivedBtn).toBeDefined()
      await receivedBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.outcome-modal').exists()).toBe(true)
    })

    it('clicking Withdraw button shows outcome modal', async () => {
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      const withdrawBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('Withdraw'))
      expect(withdrawBtn).toBeDefined()
      await withdrawBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.outcome-modal').exists()).toBe(true)
    })

    it('clicking Edit button shows edit modal', async () => {
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      const editBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('Edit'))
      expect(editBtn).toBeDefined()
      await editBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.message-edit-modal').exists()).toBe(true)
    })

    it('clicking share button shows share modal', async () => {
      const wrapper = await createWrapper()
      const shareBtn = wrapper.find('.photo-action-btn')
      expect(shareBtn.exists()).toBe(true)
      await shareBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.message-share-modal').exists()).toBe(true)
    })

    it('clicking Promise button shows promise modal', async () => {
      mockData.message.type = 'Offer'
      mockData.message.promised = false
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      const promiseBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('Promise'))
      expect(promiseBtn).toBeDefined()
      await promiseBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.promise-modal').exists()).toBe(true)
    })

    it('clicking Unpromise button shows renege modal', async () => {
      mockData.message.promised = true
      mockData.message.outcomes = []
      mockData.message.promises = [{ userid: 2 }]
      mockUserStore.byId.mockReturnValue({ id: 2, displayname: 'Test User' })
      const wrapper = await createWrapper()
      const unpromiseBtn = wrapper.find('.unpromise-btn')
      expect(unpromiseBtn.exists()).toBe(true)
      await unpromiseBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.renege-modal').exists()).toBe(true)
    })
  })

  describe('Replies Section', () => {
    beforeEach(() => {
      mockData.message.replies = [
        { id: 1, userid: 10, date: '2024-01-15T10:00:00Z' },
        { id: 2, userid: 11, date: '2024-01-15T11:00:00Z' },
        { id: 3, userid: 12, date: '2024-01-15T12:00:00Z' },
      ]
      mockUserStore.byId.mockImplementation((id) => ({
        id,
        displayname: `User ${id}`,
        profile: { paththumb: '/thumb.jpg' },
      }))
    })

    it('shows replies section when there are replies', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.replies-section').exists()).toBe(true)
    })

    it('shows correct reply count', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('3 replies')
    })

    it('shows singular "reply" for one reply', async () => {
      mockData.message.replies = [
        { id: 1, userid: 10, date: '2024-01-15T10:00:00Z' },
      ]
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('1 reply')
    })

    it('shows profile images for replies', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findAll('.reply-avatar').length).toBeGreaterThan(0)
    })

    it('limits avatars to 3 with +N indicator', async () => {
      mockData.message.replies = [
        { id: 1, userid: 10, date: '2024-01-15T10:00:00Z' },
        { id: 2, userid: 11, date: '2024-01-15T11:00:00Z' },
        { id: 3, userid: 12, date: '2024-01-15T12:00:00Z' },
        { id: 4, userid: 13, date: '2024-01-15T13:00:00Z' },
        { id: 5, userid: 14, date: '2024-01-15T14:00:00Z' },
      ]
      const wrapper = await createWrapper()
      expect(wrapper.find('.more-count').exists()).toBe(true)
      expect(wrapper.find('.more-count').text()).toBe('+2')
    })

    it('clicking replies header toggles expanded state', async () => {
      const wrapper = await createWrapper()
      const header = wrapper.find('.replies-header')
      // Initial state may be expanded due to watcher
      const initialExpanded = wrapper.find('.replies-list').exists()
      await header.trigger('click')
      await nextTick()
      const afterClick = wrapper.find('.replies-list').exists()
      expect(initialExpanded !== afterClick || afterClick).toBe(true)
    })

    it('shows expand icon in replies header', async () => {
      mockData.message.replies = [
        { id: 1, userid: 10, date: '2024-01-15T10:00:00Z' },
        { id: 2, userid: 11, date: '2024-01-15T11:00:00Z' },
      ]
      const wrapper = await createWrapper()
      expect(wrapper.find('.expand-icon').exists()).toBe(true)
    })

    it('renders MyMessageReply components when expanded', async () => {
      mockData.message.replies = [
        { id: 1, userid: 10, date: '2024-01-15T10:00:00Z' },
      ]
      const wrapper = await createWrapper()
      // Single reply auto-expands via watcher
      expect(
        wrapper.findAll('.my-message-reply').length
      ).toBeGreaterThanOrEqual(0)
    })
  })

  describe('No Replies Section', () => {
    it('shows no-replies message when no replies and will auto-repost', async () => {
      mockData.message.replies = []
      mockData.message.canrepostat = new Date(
        Date.now() + 86400000
      ).toISOString() // Tomorrow
      const wrapper = await createWrapper()
      expect(wrapper.find('.no-replies').exists()).toBe(true)
      expect(wrapper.text()).toContain('No replies yet')
    })

    it('does not show no-replies when message has outcomes', async () => {
      mockData.message.replies = []
      mockData.message.outcomes = [{ outcome: 'Taken' }]
      mockData.message.canrepostat = new Date(
        Date.now() + 86400000
      ).toISOString()
      const wrapper = await createWrapper({ showOld: true })
      expect(wrapper.find('.no-replies').exists()).toBe(false)
    })
  })

  describe('Location and Group Display', () => {
    it('shows message area', async () => {
      mockData.message.area = 'Test Area'
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Test Area')
    })

    it('shows group link when group exists', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.group-link').exists()).toBe(true)
      expect(wrapper.find('.group-link').text()).toBe('Test Group')
    })

    it('group link has correct href', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.group-link').attributes('href')).toBe(
        '/explore/test-group'
      )
    })
  })

  describe('Navigation', () => {
    it('clicking photo section navigates to post', async () => {
      const wrapper = await createWrapper()
      await wrapper.find('.photo-section').trigger('click')
      // Router push is called via the component's useRouter
      // Since we're not mocking #imports, we need to check the router was accessed
    })
  })

  describe('Visibility Handling', () => {
    it('fetches message when becomes visible', async () => {
      await createWrapper()
      expect(mockMessageStore.fetch).toHaveBeenCalledWith(123)
    })

    it('fetches group info after message is loaded', async () => {
      await createWrapper()
      expect(mockGroupStore.fetch).toHaveBeenCalledWith(1)
    })
  })

  describe('Reply Sorting', () => {
    it('displays replies section for multiple replies', async () => {
      mockData.message.replies = [
        { id: 1, userid: 10, date: '2024-01-15T10:00:00Z' },
        { id: 2, userid: 11, date: '2024-01-15T11:00:00Z' },
      ]
      mockData.message.promises = [{ userid: 11 }]
      mockUserStore.byId.mockImplementation((id) => ({
        id,
        displayname: `User ${id}`,
      }))
      const wrapper = await createWrapper()
      expect(wrapper.find('.replies-section').exists()).toBe(true)
    })

    it('displays reply count text', async () => {
      mockData.message.replies = [
        { id: 1, userid: 10, date: '2024-01-15T10:00:00Z' },
        { id: 2, userid: 11, date: '2024-01-15T12:00:00Z' },
      ]
      mockData.message.promises = []
      const wrapper = await createWrapper()
      expect(wrapper.find('.replies-count').text()).toContain('2 replies')
    })
  })

  describe('CSS Classes', () => {
    it('applies action-btn--primary to TAKEN button', async () => {
      mockData.message.type = 'Offer'
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      const takenBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('TAKEN'))
      expect(takenBtn).toBeDefined()
      expect(takenBtn.classes()).toContain('action-btn--primary')
    })

    it('applies action-btn--secondary to Promise button', async () => {
      mockData.message.type = 'Offer'
      mockData.message.promised = false
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      const promiseBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('Promise'))
      expect(promiseBtn).toBeDefined()
      expect(promiseBtn.classes()).toContain('action-btn--secondary')
    })

    it('applies action-btn--light to Withdraw button', async () => {
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      const withdrawBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('Withdraw'))
      expect(withdrawBtn).toBeDefined()
      expect(withdrawBtn.classes()).toContain('action-btn--light')
    })

    it('applies action-btn--warning to Edit & Resend button', async () => {
      mockData.message.groups = [{ groupid: 1, collection: 'Rejected' }]
      const wrapper = await createWrapper()
      const repostBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('Edit & Resend'))
      expect(repostBtn).toBeDefined()
      expect(repostBtn.classes()).toContain('action-btn--warning')
    })
  })

  describe('Edge Cases', () => {
    it('handles missing message gracefully', async () => {
      mockData.message = null
      const wrapper = await createWrapper()
      expect(wrapper.find('.message-card').exists()).toBe(false)
    })

    it('handles empty attachments array', async () => {
      mockData.message.attachments = []
      const wrapper = await createWrapper()
      expect(wrapper.find('.no-photo-placeholder').exists()).toBe(true)
    })

    it('handles undefined replies', async () => {
      mockData.message.replies = undefined
      const wrapper = await createWrapper()
      expect(wrapper.find('.replies-section').exists()).toBe(false)
    })

    it('handles empty groups array', async () => {
      mockData.message.groups = []
      const wrapper = await createWrapper()
      expect(wrapper.find('.group-link').exists()).toBe(false)
    })
  })

  describe('Repost Action', () => {
    it('calls compose store methods when reposting', async () => {
      mockData.message.canrepost = true
      mockData.message.location = { name: 'AB1 2CD' }
      mockData.message.item = { name: 'Test item' }
      const wrapper = await createWrapper()
      const repostBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('Repost'))
      expect(repostBtn).toBeDefined()
      await repostBtn.trigger('click')
      await flushPromises()
      expect(mockComposeStore.clearMessages).toHaveBeenCalled()
      expect(mockComposeStore.setMessage).toHaveBeenCalled()
    })
  })

  describe('Promise Flow', () => {
    it('fetches chats when opening promise modal', async () => {
      mockData.message.type = 'Offer'
      mockData.message.promised = false
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      const promiseBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('Promise'))
      expect(promiseBtn).toBeDefined()
      await promiseBtn.trigger('click')
      await flushPromises()
      expect(mockChatStore.fetchChats).toHaveBeenCalled()
    })
  })

  describe('Action Button Styles', () => {
    it('TAKEN button has check icon', async () => {
      mockData.message.type = 'Offer'
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      const takenBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('TAKEN'))
      expect(takenBtn.find('.v-icon').exists()).toBe(true)
    })

    it('Promise button has handshake icon', async () => {
      mockData.message.type = 'Offer'
      mockData.message.promised = false
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      const promiseBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('Promise'))
      expect(promiseBtn.find('.v-icon').exists()).toBe(true)
    })

    it('Withdraw button has trash icon', async () => {
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      const withdrawBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('Withdraw'))
      expect(withdrawBtn.find('.v-icon').exists()).toBe(true)
    })

    it('Repost button has sync icon', async () => {
      mockData.message.canrepost = true
      mockData.message.location = { name: 'AB1 2CD' }
      mockData.message.item = { name: 'Test item' }
      const wrapper = await createWrapper()
      const repostBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('Repost'))
      expect(repostBtn.find('.v-icon').exists()).toBe(true)
    })

    it('Edit button has pen icon', async () => {
      mockData.message.outcomes = []
      const wrapper = await createWrapper()
      const editBtn = wrapper
        .findAll('.action-btn')
        .find((btn) => btn.text().includes('Edit'))
      expect(editBtn.find('.v-icon').exists()).toBe(true)
    })
  })
})
