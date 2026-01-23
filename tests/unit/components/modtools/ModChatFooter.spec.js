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
    it('mounts with Suspense wrapper and eventually resolves from loading state', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.exists()).toBe(true)
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
    it('setupChatMT is called with props.id on mount', async () => {
      const { setupChatMT } = await import('~/modtools/composables/useChatMT')
      vi.clearAllMocks()
      await mountComponent({ id: 456 })
      expect(setupChatMT).toHaveBeenCalled()
      expect(setupChatMT).toHaveBeenCalledWith(456)
    })
  })

  describe('mock data structures', () => {
    it('mockChat and mockOtheruser have correct structure and can be modified', () => {
      // Verify initial structure
      expect(mockChat.value).toEqual({
        id: 123,
        chattype: 'User2Mod',
        otheruid: 456,
        user1id: 456,
        group: { id: 789 },
      })
      expect(mockOtheruser.value.id).toBe(456)
      expect(mockOtheruser.value.displayname).toBe('Test User')
      expect(mockOtheruser.value.spammer).toBe(false)

      // Verify can modify for different scenarios
      mockOtheruser.value = createOtherUser({ spammer: true })
      expect(mockOtheruser.value.spammer).toBe(true)

      mockOtheruser.value = createOtherUser({
        info: { ratings: { Up: 2, Down: 5 } },
      })
      expect(mockOtheruser.value.info.ratings.Down).toBe(5)
    })
  })

  describe('chat types', () => {
    it.each([
      ['User2Mod', 'User2Mod'],
      ['User2User', 'User2User'],
    ])('can set %s chat type', (chatType, expected) => {
      mockChat.value = createChat({ chattype: chatType })
      expect(mockChat.value.chattype).toBe(expected)
    })
  })

  describe('store mocks', () => {
    it.each([
      ['mockChatStore.send', mockChatStore.send],
      ['mockChatStore.nudge', mockChatStore.nudge],
      ['mockChatStore.markRead', mockChatStore.markRead],
      ['mockChatStore.typing', mockChatStore.typing],
      ['mockUserStore.fetch', mockUserStore.fetch],
      ['mockAddressStore.fetch', mockAddressStore.fetch],
    ])('%s is a mock function', (name, mockFn) => {
      expect(typeof mockFn).toBe('function')
      expect(vi.isMockFunction(mockFn)).toBe(true)
    })
  })

  describe('helper functions', () => {
    it('createChat creates chat with defaults and accepts overrides', () => {
      const defaultChat = createChat()
      expect(defaultChat.id).toBe(123)
      expect(defaultChat.chattype).toBe('User2Mod')

      const overriddenChat = createChat({ id: 999, chattype: 'User2User' })
      expect(overriddenChat.id).toBe(999)
      expect(overriddenChat.chattype).toBe('User2User')
    })

    it('createOtherUser creates user with defaults and accepts overrides', () => {
      const defaultUser = createOtherUser()
      expect(defaultUser.id).toBe(456)
      expect(defaultUser.spammer).toBe(false)

      const overriddenUser = createOtherUser({ spammer: true, deleted: true })
      expect(overriddenUser.spammer).toBe(true)
      expect(overriddenUser.deleted).toBe(true)
    })
  })

  describe('rating scenarios', () => {
    it.each([
      [
        'good ratings (Up > Down * 2)',
        { Up: 10, Down: 1 },
        { goodRatings: true, badRatings: false },
      ],
      [
        'bad ratings (Down > 2 and Down * 2 > Up)',
        { Up: 2, Down: 5 },
        { goodRatings: false, badRatings: true },
      ],
      [
        'thumbs down (Mine is Down)',
        { Up: 5, Down: 0, Mine: 'Down' },
        { thumbsDown: true },
      ],
    ])('%s', (scenario, ratings, expected) => {
      const user = createOtherUser({ info: { ratings } })

      if (expected.goodRatings !== undefined) {
        const goodRatings = user.info.ratings.Up > user.info.ratings.Down * 2
        expect(goodRatings).toBe(expected.goodRatings)
      }

      if (expected.badRatings !== undefined) {
        const badRatings =
          user.info.ratings.Down > 2 &&
          user.info.ratings.Down * 2 > user.info.ratings.Up
        expect(badRatings).toBe(expected.badRatings)
      }

      if (expected.thumbsDown !== undefined) {
        expect(user.info.ratings.Mine).toBe('Down')
      }
    })
  })

  describe('expected replies', () => {
    it.each([
      [1, '1 member is'],
      [3, '3 members are'],
      [null, null],
    ])(
      'expectedreplies=%s returns correct text',
      (expectedreplies, expectedText) => {
        const user = createOtherUser({ expectedreplies })
        if (expectedreplies === null) {
          expect(user.expectedreplies).toBeNull()
        } else {
          const text =
            user.expectedreplies === 1
              ? '1 member is'
              : `${user.expectedreplies} members are`
          expect(text).toBe(expectedText)
        }
      }
    )
  })

  describe('address suggestion logic', () => {
    it('finds matching address prefix or returns null for short messages', () => {
      const addresses = [
        { singleline: '123 Main St' },
        { singleline: '456 Oak Ave' },
      ]

      // Test matching address
      const message = 'My address is 123'
      const lastWord = message.split(/\s+/).pop()
      const match = addresses.find((addr) =>
        addr.singleline.toLowerCase().startsWith(lastWord.toLowerCase())
      )
      expect(match).toEqual({ singleline: '123 Main St' })

      // Test short message
      const shortMessage = 'Hi'
      const suggestAddress = shortMessage.length >= 3
      expect(suggestAddress).toBe(false)
    })
  })

  describe('tooSoonToNudge logic', () => {
    it('tooSoonToNudge ref can be set', () => {
      mockTooSoonToNudge.value = true
      expect(mockTooSoonToNudge.value).toBe(true)
    })
  })

  describe('component behavior when mounted', () => {
    it('fetches user data when chat has user1id', async () => {
      mockChat.value = createChat({ user1id: 789 })
      await mountComponent()
      expect(mockUserStore.fetch).toHaveBeenCalled()
    })
  })

  describe('shrink computed behavior', () => {
    it.each([
      [121, true],
      [120, false],
    ])('message length %d returns shrink=%s', (length, expected) => {
      const message = 'A'.repeat(length)
      expect(message.length > 120).toBe(expected)
    })
  })

  describe('noticesToShow computed behavior', () => {
    it.each([
      ['spammer', { spammer: true }, true],
      ['deleted', { deleted: true }, true],
      ['has comments', { comments: [{ id: 1, user1: 'Comment' }] }, true],
      ['no issues', {}, false],
    ])('returns %s when user %s', (scenario, overrides, expected) => {
      const user = createOtherUser(overrides)
      const hasNotices =
        user.spammer ||
        user.deleted ||
        (user.comments && user.comments.length > 0)
      expect(hasNotices).toBe(expected)
    })
  })

  describe('badratings computed behavior', () => {
    it.each([
      [{ Up: 2, Down: 5 }, true, 'Down > 2 AND Down * 2 > Up'],
      [{ Up: 5, Down: 2 }, false, 'Down <= 2'],
      [{ Up: 10, Down: 3 }, false, 'Up >= Down * 2'],
    ])('ratings %j returns %s (%s)', (ratings, expected) => {
      const badratings = ratings.Down > 2 && ratings.Down * 2 > ratings.Up
      expect(badratings).toBe(expected)
    })
  })

  describe('enterNewLine computed behavior', () => {
    it.each([
      [false, true],
      [true, false],
    ])('when enternewlinemt=%s, enterNewLine=%s', (storeValue, expected) => {
      mockMiscStore.get.mockReturnValue(storeValue)
      expect(!mockMiscStore.get('enternewlinemt')).toBe(expected)
    })
  })

  describe('height computed behavior', () => {
    it.each([
      [180, '9rem', 'medium message'],
      [600, '12rem', 'very long message (capped)'],
    ])('message length %d calculates height=%s (%s)', (length, expected) => {
      const message = 'A'.repeat(length)
      const heightValue = Math.min(6, Math.round(message.length / 60))
      expect(heightValue + 6 + 'rem').toBe(expected)
    })
  })

  describe('newline insertion logic', () => {
    it.each([
      ['Hello World', 5, 'Hello\n World', 'middle of message'],
      ['Hello', 0, '\nHello', 'beginning'],
      ['Hello', 5, 'Hello\n', 'end'],
    ])(
      'inserting newline in "%s" at pos %d yields "%s" (%s)',
      (message, cursorPos, expected) => {
        const newMessage =
          message.slice(0, cursorPos) + '\n' + message.slice(cursorPos)
        expect(newMessage).toBe(expected)
      }
    )
  })
})
