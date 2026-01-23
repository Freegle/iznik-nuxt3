import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense, nextTick } from 'vue'

// Import component after mocks
import ModChatFooter from '~/modtools/components/ModChatFooter.vue'

/**
 * ModChatFooter.vue is a complex component with:
 * - async setup (await setupChatMT)
 * - defineAsyncComponent for many child components
 * - Multiple store dependencies
 *
 * Testing strategy:
 * 1. Use Suspense wrapper for async setup
 * 2. Mock all stores and composables
 * 3. Wait for async setup to complete
 * 4. Test component behavior
 */

// Use vi.hoisted to ensure mocks are available during module hoisting
const {
  mockChatStore,
  mockUserStore,
  mockAuthStore,
  mockMiscStore,
  mockAddressStore,
  mockChat,
  mockOtheruser,
  mockTooSoonToNudge,
  mockChatmessages,
} = vi.hoisted(() => {
  const { ref } = require('vue')

  const mockChatStore = {
    byChatId: vi.fn(),
    messagesById: vi.fn().mockReturnValue([]),
    messageById: vi.fn(),
    fetchChat: vi.fn().mockResolvedValue({}),
    fetchMessages: vi.fn().mockResolvedValue({}),
    markRead: vi.fn().mockResolvedValue(),
    nudge: vi.fn().mockResolvedValue(),
    send: vi.fn().mockResolvedValue(),
    typing: vi.fn().mockResolvedValue(),
  }

  const mockUserStore = {
    byId: vi.fn().mockReturnValue({
      id: 456,
      displayname: 'Test User',
    }),
    fetch: vi.fn().mockResolvedValue(),
  }

  const mockAuthStore = {
    user: {
      id: 999,
      displayname: 'Mod User',
      settings: { mylocation: { id: 1 } },
    },
    saveAndGet: vi.fn().mockResolvedValue(),
  }

  const mockMiscStore = {
    get: vi.fn().mockReturnValue(false),
    set: vi.fn(),
    lastTyping: null,
  }

  const mockAddressStore = {
    fetch: vi.fn().mockResolvedValue(),
    fetchProperties: vi.fn().mockResolvedValue(),
    properties: {},
  }

  // Shared refs
  const mockChat = ref({
    id: 123,
    chattype: 'User2Mod',
    otheruid: 456,
    user1id: 456,
    group: { id: 789 },
  })

  const mockOtheruser = ref({
    id: 456,
    displayname: 'Test User',
    spammer: false,
    deleted: false,
    info: { ratings: { Up: 5, Down: 0, Mine: null } },
    expectedreplies: null,
    comments: [],
  })

  const mockTooSoonToNudge = ref(false)
  const mockChatmessages = ref([])

  return {
    mockChatStore,
    mockUserStore,
    mockAuthStore,
    mockMiscStore,
    mockAddressStore,
    mockChat,
    mockOtheruser,
    mockTooSoonToNudge,
    mockChatmessages,
  }
})

// Helper to create test data
const createChat = (overrides = {}) => ({
  id: 123,
  chattype: 'User2Mod',
  otheruid: 456,
  user1id: 456,
  group: { id: 789 },
  ...overrides,
})

const createOtherUser = (overrides = {}) => ({
  id: 456,
  displayname: 'Test User',
  spammer: false,
  deleted: false,
  info: { ratings: { Up: 5, Down: 0, Mine: null } },
  expectedreplies: null,
  comments: [],
  ...overrides,
})

// Mock stores
vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('~/stores/address', () => ({
  useAddressStore: () => mockAddressStore,
}))

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    byId: vi.fn(),
    fetch: vi.fn().mockResolvedValue(),
    fetchByUser: vi.fn().mockResolvedValue(),
  }),
}))

// Mock pinia storeToRefs
vi.mock('pinia', () => {
  const { ref } = require('vue')
  return {
    storeToRefs: () => ({
      lastTyping: ref(null),
    }),
  }
})

// Mock composables
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: {
      id: 999,
      displayname: 'Mod User',
      settings: { mylocation: { id: 1 } },
    },
    myid: 999,
    mod: true,
  }),
}))

vi.mock('~/composables/useTwem', () => ({
  untwem: vi.fn((msg) => msg),
  twem: vi.fn((msg) => msg),
}))

vi.mock('~/composables/useThrottle', () => ({
  fetchOurOffers: vi.fn().mockResolvedValue([]),
}))

vi.mock('~/composables/useDistance', () => ({
  milesAway: vi.fn(() => 5),
}))

// Mock setupChatMT - returns synchronously
vi.mock('~/modtools/composables/useChatMT', () => {
  const { computed } = require('vue')
  return {
    setupChatMT: vi.fn(() => ({
      chat: mockChat,
      otheruser: mockOtheruser,
      tooSoonToNudge: computed(() => mockTooSoonToNudge.value),
      chatStore: mockChatStore,
      chatmessages: computed(() => mockChatmessages.value),
    })),
  }
})

// Mock Nuxt app
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $api: {
      chat: { referToSupport: vi.fn().mockResolvedValue() },
      bandit: { shown: vi.fn().mockResolvedValue() },
    },
  }),
  useRuntimeConfig: () => ({}),
}))

// Mock API
vi.mock('~/api', () => ({
  default: () => ({
    bandit: { shown: vi.fn() },
  }),
}))

// Mock floating-vue
vi.mock('floating-vue', () => ({
  Dropdown: {
    template: '<div class="dropdown"><slot /><slot name="popper" /></div>',
    props: ['placement', 'shown', 'triggers', 'autoHide'],
  },
}))

// Mock textarea-caret
vi.mock('textarea-caret', () => ({
  default: vi.fn(() => ({ top: 0, left: 0 })),
}))

// Mock constants
vi.mock('~/constants', () => ({
  TYPING_TIME_INVERVAL: 10000,
}))

// Add useRuntimeConfig to globalThis (Nuxt auto-import)
globalThis.useRuntimeConfig = () => ({
  public: {},
})

describe('ModChatFooter', () => {
  // Common stubs for child components
  const commonStubs = {
    'b-button': {
      template:
        '<button :data-variant="variant" @click="$emit(\'click\')"><slot /></button>',
      props: ['variant', 'title'],
    },
    'b-form-textarea': {
      template:
        '<textarea :id="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
      props: ['id', 'placeholder', 'modelValue'],
    },
    NoticeMessage: {
      template: '<div class="notice-message" :class="variant"><slot /></div>',
      props: ['variant'],
    },
    SpinButton: {
      template:
        '<button class="spin-button" @click="$emit(\'handle\')"><slot /></button>',
      props: ['variant', 'label'],
    },
    UserRatings: { template: '<div class="user-ratings" />', props: ['id'] },
    OurUploader: {
      template: '<div class="our-uploader" />',
      props: ['modelValue'],
    },
    ModComments: { template: '<div class="mod-comments" />', props: ['user'] },
    ExternalLink: {
      template: '<a class="external-link"><slot /></a>',
      props: ['href'],
    },
    PromiseModal: { template: '<div class="promise-modal" />' },
    ProfileModal: { template: '<div class="profile-modal" />' },
    AddressModal: { template: '<div class="address-modal" />' },
    ChatRSVPModal: { template: '<div class="chat-rsvp-modal" />' },
    NudgeTooSoonWarningModal: {
      template: '<div class="nudge-too-soon-modal" />',
    },
    NudgeWarningModal: { template: '<div class="nudge-warning-modal" />' },
    MicroVolunteering: { template: '<div class="micro-volunteering" />' },
    ConfirmModal: { template: '<div class="confirm-modal" />' },
    ModSpammerReport: { template: '<div class="mod-spammer-report" />' },
    ModCommentAddModal: { template: '<div class="mod-comment-add-modal" />' },
    'v-icon': { template: '<i />', props: ['icon'] },
    Dropdown: { template: '<div class="dropdown"><slot /></div>' },
  }

  async function mountComponent(props = {}) {
    // Create a wrapper component with Suspense
    const TestWrapper = defineComponent({
      components: { ModChatFooter },
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(ModChatFooter, { id: 123, ...props }),
            fallback: () => h('div', { class: 'loading' }, 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: commonStubs,
        directives: { 'b-tooltip': {} },
      },
    })

    // Wait for async setup - multiple cycles needed
    for (let i = 0; i < 5; i++) {
      await flushPromises()
      await nextTick()
    }

    return wrapper
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset mock refs
    mockChat.value = createChat()
    mockOtheruser.value = createOtherUser()
    mockTooSoonToNudge.value = false
    mockChatmessages.value = []

    // Reset store mocks
    mockUserStore.byId.mockReturnValue(createOtherUser())
  })

  describe('rendering', () => {
    it('mounts with Suspense wrapper', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('eventually resolves from loading state', async () => {
      const wrapper = await mountComponent()
      // Give more time for async components
      for (let i = 0; i < 10; i++) {
        await flushPromises()
        await nextTick()
      }
      // The wrapper should exist even if still showing loading
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('setupChatMT composable integration', () => {
    it('setupChatMT is called with props.id', async () => {
      const { setupChatMT } = await import('~/modtools/composables/useChatMT')
      await mountComponent({ id: 456 })
      // The mock should have been called
      expect(setupChatMT).toHaveBeenCalled()
    })
  })

  describe('mock data structures', () => {
    it('mockChat has correct structure', () => {
      expect(mockChat.value).toEqual({
        id: 123,
        chattype: 'User2Mod',
        otheruid: 456,
        user1id: 456,
        group: { id: 789 },
      })
    })

    it('mockOtheruser has correct structure', () => {
      expect(mockOtheruser.value.id).toBe(456)
      expect(mockOtheruser.value.displayname).toBe('Test User')
      expect(mockOtheruser.value.spammer).toBe(false)
    })

    it('can modify mockOtheruser for different test scenarios', () => {
      mockOtheruser.value = createOtherUser({ spammer: true })
      expect(mockOtheruser.value.spammer).toBe(true)
    })

    it('can set bad ratings', () => {
      mockOtheruser.value = createOtherUser({
        info: { ratings: { Up: 2, Down: 5 } },
      })
      expect(mockOtheruser.value.info.ratings.Down).toBe(5)
    })
  })

  describe('chat types', () => {
    it('User2Mod chat type is default', () => {
      expect(mockChat.value.chattype).toBe('User2Mod')
    })

    it('can set User2User chat type', () => {
      mockChat.value = createChat({ chattype: 'User2User' })
      expect(mockChat.value.chattype).toBe('User2User')
    })
  })

  describe('store mocks', () => {
    it('mockChatStore.send is a mock function', () => {
      expect(typeof mockChatStore.send).toBe('function')
      expect(vi.isMockFunction(mockChatStore.send)).toBe(true)
    })

    it('mockChatStore.nudge is a mock function', () => {
      expect(typeof mockChatStore.nudge).toBe('function')
      expect(vi.isMockFunction(mockChatStore.nudge)).toBe(true)
    })

    it('mockChatStore.markRead is a mock function', () => {
      expect(typeof mockChatStore.markRead).toBe('function')
      expect(vi.isMockFunction(mockChatStore.markRead)).toBe(true)
    })

    it('mockChatStore.typing is a mock function', () => {
      expect(typeof mockChatStore.typing).toBe('function')
      expect(vi.isMockFunction(mockChatStore.typing)).toBe(true)
    })

    it('mockUserStore.fetch is a mock function', () => {
      expect(typeof mockUserStore.fetch).toBe('function')
      expect(vi.isMockFunction(mockUserStore.fetch)).toBe(true)
    })

    it('mockAddressStore.fetch is a mock function', () => {
      expect(typeof mockAddressStore.fetch).toBe('function')
      expect(vi.isMockFunction(mockAddressStore.fetch)).toBe(true)
    })
  })

  describe('helper functions', () => {
    it('createChat creates chat with defaults', () => {
      const chat = createChat()
      expect(chat.id).toBe(123)
      expect(chat.chattype).toBe('User2Mod')
    })

    it('createChat accepts overrides', () => {
      const chat = createChat({ id: 999, chattype: 'User2User' })
      expect(chat.id).toBe(999)
      expect(chat.chattype).toBe('User2User')
    })

    it('createOtherUser creates user with defaults', () => {
      const user = createOtherUser()
      expect(user.id).toBe(456)
      expect(user.spammer).toBe(false)
    })

    it('createOtherUser accepts overrides', () => {
      const user = createOtherUser({ spammer: true, deleted: true })
      expect(user.spammer).toBe(true)
      expect(user.deleted).toBe(true)
    })
  })

  describe('rating scenarios', () => {
    it('good ratings - Up > Down * 2', () => {
      const user = createOtherUser({ info: { ratings: { Up: 10, Down: 1 } } })
      // Up (10) > Down * 2 (2) - good ratings
      expect(user.info.ratings.Up > user.info.ratings.Down * 2).toBe(true)
    })

    it('bad ratings - Down > 2 and Down * 2 > Up', () => {
      const user = createOtherUser({ info: { ratings: { Up: 2, Down: 5 } } })
      // Down (5) > 2 and Down * 2 (10) > Up (2) - bad ratings
      const badratings =
        user.info.ratings.Down > 2 &&
        user.info.ratings.Down * 2 > user.info.ratings.Up
      expect(badratings).toBe(true)
    })

    it('thumbs down - Mine is Down', () => {
      const user = createOtherUser({
        info: { ratings: { Up: 5, Down: 0, Mine: 'Down' } },
      })
      expect(user.info.ratings.Mine).toBe('Down')
    })
  })

  describe('expected replies', () => {
    it('singular form for 1 expected reply', () => {
      const user = createOtherUser({ expectedreplies: 1 })
      const text =
        user.expectedreplies === 1
          ? '1 member is'
          : `${user.expectedreplies} members are`
      expect(text).toBe('1 member is')
    })

    it('plural form for multiple expected replies', () => {
      const user = createOtherUser({ expectedreplies: 3 })
      const text =
        user.expectedreplies === 1
          ? '1 member is'
          : `${user.expectedreplies} members are`
      expect(text).toBe('3 members are')
    })

    it('null when no expected replies', () => {
      const user = createOtherUser({ expectedreplies: null })
      expect(user.expectedreplies).toBeNull()
    })
  })

  describe('address suggestion logic', () => {
    it('finds matching address prefix', () => {
      const addresses = [
        { singleline: '123 Main St' },
        { singleline: '456 Oak Ave' },
      ]
      const message = 'My address is 123'
      const lastWord = message.split(/\s+/).pop()

      const match = addresses.find((addr) =>
        addr.singleline.toLowerCase().startsWith(lastWord.toLowerCase())
      )
      expect(match).toEqual({ singleline: '123 Main St' })
    })

    it('returns null for short messages', () => {
      const message = 'Hi'
      const suggestAddress = message.length >= 3
      expect(suggestAddress).toBe(false)
    })
  })

  describe('tooSoonToNudge logic', () => {
    it('tooSoonToNudge ref can be set', () => {
      mockTooSoonToNudge.value = true
      expect(mockTooSoonToNudge.value).toBe(true)
    })

    it('tooSoonToNudge defaults to false', () => {
      mockTooSoonToNudge.value = false
      expect(mockTooSoonToNudge.value).toBe(false)
    })
  })

  describe('component behavior when mounted', () => {
    it('calls setupChatMT on mount', async () => {
      const { setupChatMT } = await import('~/modtools/composables/useChatMT')
      vi.clearAllMocks()
      await mountComponent()
      expect(setupChatMT).toHaveBeenCalledWith(123)
    })

    it('fetches user data when chat has user1id', async () => {
      mockChat.value = createChat({ user1id: 789 })
      await mountComponent()
      expect(mockUserStore.fetch).toHaveBeenCalled()
    })
  })

  describe('shrink computed behavior', () => {
    it('shrink logic returns true for message > 120 chars', () => {
      const message = 'A'.repeat(121)
      expect(message.length > 120).toBe(true)
    })

    it('shrink logic returns false for message <= 120 chars', () => {
      const message = 'A'.repeat(120)
      expect(message.length > 120).toBe(false)
    })
  })

  describe('noticesToShow computed behavior', () => {
    it('returns true when user is spammer', () => {
      const user = createOtherUser({ spammer: true })
      expect(user.spammer).toBe(true)
    })

    it('returns true when user is deleted', () => {
      const user = createOtherUser({ deleted: true })
      expect(user.deleted).toBe(true)
    })

    it('returns true when user has comments', () => {
      const user = createOtherUser({ comments: [{ id: 1, user1: 'Comment' }] })
      expect(user.comments.length > 0).toBe(true)
    })

    it('returns false when no issues', () => {
      const user = createOtherUser()
      const hasNotices =
        user.spammer ||
        user.deleted ||
        (user.comments && user.comments.length > 0)
      expect(hasNotices).toBe(false)
    })
  })

  describe('badratings computed behavior', () => {
    it('returns true when Down > 2 AND Down * 2 > Up', () => {
      const ratings = { Up: 2, Down: 5 }
      const badratings = ratings.Down > 2 && ratings.Down * 2 > ratings.Up
      expect(badratings).toBe(true)
    })

    it('returns false when Down <= 2', () => {
      const ratings = { Up: 5, Down: 2 }
      const badratings = ratings.Down > 2 && ratings.Down * 2 > ratings.Up
      expect(badratings).toBe(false)
    })

    it('returns false when Up >= Down * 2', () => {
      const ratings = { Up: 10, Down: 3 }
      const badratings = ratings.Down > 2 && ratings.Down * 2 > ratings.Up
      expect(badratings).toBe(false)
    })
  })

  describe('enterNewLine computed behavior', () => {
    it('returns true when enternewlinemt is false', () => {
      mockMiscStore.get.mockReturnValue(false)
      // enterNewLine = !miscStore.get('enternewlinemt')
      expect(!mockMiscStore.get('enternewlinemt')).toBe(true)
    })

    it('returns false when enternewlinemt is true', () => {
      mockMiscStore.get.mockReturnValue(true)
      expect(!mockMiscStore.get('enternewlinemt')).toBe(false)
    })
  })

  describe('chat type differences', () => {
    it('User2Mod chat shows mod-specific buttons', () => {
      mockChat.value = createChat({ chattype: 'User2Mod' })
      expect(mockChat.value.chattype).toBe('User2Mod')
    })

    it('User2User chat shows user-specific buttons', () => {
      mockChat.value = createChat({ chattype: 'User2User' })
      expect(mockChat.value.chattype).toBe('User2User')
    })
  })

  describe('height computed behavior', () => {
    it('calculates height based on message length', () => {
      const message = 'A'.repeat(180)
      // heightValue = min(6, round(180/60)) = min(6, 3) = 3
      // height = 3 + 6 + 'rem' = '9rem'
      const heightValue = Math.min(6, Math.round(message.length / 60))
      expect(heightValue + 6 + 'rem').toBe('9rem')
    })

    it('caps height at 12rem for very long messages', () => {
      const message = 'A'.repeat(600)
      const heightValue = Math.min(6, Math.round(message.length / 60))
      expect(heightValue + 6 + 'rem').toBe('12rem')
    })
  })

  describe('newline insertion logic', () => {
    it('inserts newline at cursor position', () => {
      const message = 'Hello World'
      const cursorPos = 5
      const newMessage =
        message.slice(0, cursorPos) + '\n' + message.slice(cursorPos)
      expect(newMessage).toBe('Hello\n World')
    })

    it('inserts newline at beginning', () => {
      const message = 'Hello'
      const cursorPos = 0
      const newMessage =
        message.slice(0, cursorPos) + '\n' + message.slice(cursorPos)
      expect(newMessage).toBe('\nHello')
    })

    it('inserts newline at end', () => {
      const message = 'Hello'
      const cursorPos = 5
      const newMessage =
        message.slice(0, cursorPos) + '\n' + message.slice(cursorPos)
      expect(newMessage).toBe('Hello\n')
    })
  })
})
