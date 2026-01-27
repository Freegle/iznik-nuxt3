import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, Suspense, h } from 'vue'
import ChatMessageSummary from '~/components/ChatMessageSummary.vue'

// Use vi.hoisted for mock setup
const { mockData, mockFetchMessage, mockFetchGroup } = vi.hoisted(() => ({
  mockData: {
    message: null,
    chat: null,
    userId: 1,
  },
  mockFetchMessage: vi.fn().mockResolvedValue(),
  mockFetchGroup: vi.fn().mockResolvedValue(),
}))

// Mock message store
vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    fetch: mockFetchMessage,
    byId: () => mockData.message,
  }),
}))

// Mock group store
vi.mock('~/stores/group', () => ({
  useGroupStore: () => ({
    fetch: mockFetchGroup,
  }),
}))

// Mock chat store
vi.mock('~/stores/chat', () => ({
  useChatStore: () => ({
    byChatId: () => mockData.chat,
  }),
}))

// Mock auth store
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    get user() {
      return { id: mockData.userId }
    },
  }),
}))

describe('ChatMessageSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockData.message = {
      id: 123,
      type: 'Offer',
      subject: 'Test item',
      outcomes: [],
      groups: [{ groupid: 1 }],
      fromuser: 2,
      promised: false,
      promisedtoyou: false,
      promises: [],
    }
    mockData.chat = { id: 1, otheruid: 2 }
    mockData.userId = 1
  })

  // Wrap async component in Suspense for testing
  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      render() {
        return h(
          Suspense,
          {},
          {
            default: () =>
              h(ChatMessageSummary, {
                id: 123,
                ...props,
              }),
            fallback: () => h('div', 'Loading...'),
          }
        )
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          ChatMessageCard: {
            template: '<div class="chat-message-card" :data-id="id"></div>',
            props: ['id'],
          },
          'notice-message': {
            template: '<div class="notice-message"><slot /></div>',
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders ChatMessageCard when message exists', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-message-card').exists()).toBe(true)
    })

    it('passes id to ChatMessageCard', async () => {
      const wrapper = await createWrapper({ id: 456 })
      expect(wrapper.find('.chat-message-card').attributes('data-id')).toBe(
        '456'
      )
    })
  })

  describe('deleted message', () => {
    it('shows deleted notice when message is null', async () => {
      mockData.message = null
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('This chat message refers to a post')
      expect(wrapper.text()).toContain('that no longer exists')
    })
  })

  describe('message with outcomes (completed)', () => {
    it('shows "no longer available" for Offer with outcomes', async () => {
      mockData.message = {
        id: 123,
        type: 'Offer',
        outcomes: [{ outcome: 'Taken' }],
        groups: [],
        fromuser: 2,
        promised: false,
      }
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('This is no longer available.')
    })

    it('shows "no longer looking" for Wanted with outcomes', async () => {
      mockData.message = {
        id: 123,
        type: 'Wanted',
        outcomes: [{ outcome: 'Received' }],
        groups: [],
        fromuser: 2,
        promised: false,
      }
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('They are no longer looking for this.')
    })

    it('shows outcome notice for deleted message', async () => {
      mockData.message = {
        id: 123,
        type: 'Offer',
        deleted: true,
        outcomes: [],
        groups: [],
        fromuser: 2,
        promised: false,
      }
      const wrapper = await createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
    })
  })

  describe('promised message (current user is poster)', () => {
    beforeEach(() => {
      mockData.userId = 1
      mockData.message = {
        id: 123,
        type: 'Offer',
        outcomes: [],
        groups: [],
        fromuser: 1, // current user posted
        promised: true,
        promises: [{ userid: 2 }],
      }
      mockData.chat = { id: 1, otheruid: 2 }
    })

    it('shows "promised to this freegler" when promised to chat partner', async () => {
      const wrapper = await createWrapper({ chatid: 1 })
      expect(wrapper.text()).toContain("You've promised it to this freegler.")
    })

    it('shows "promised to someone else" when not promised to chat partner', async () => {
      mockData.message.promises = [{ userid: 999 }]
      const wrapper = await createWrapper({ chatid: 1 })
      expect(wrapper.text()).toContain("You've promised it to someone else.")
    })
  })

  describe('promised message (current user is not poster)', () => {
    beforeEach(() => {
      mockData.userId = 1
      mockData.message = {
        id: 123,
        type: 'Offer',
        outcomes: [],
        groups: [],
        fromuser: 2, // other user posted
        promised: true,
        promisedtoyou: false,
        promises: [],
      }
    })

    it('shows "promised to you" when message is promised to current user', async () => {
      mockData.message.promisedtoyou = true
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('This is promised to you.')
    })

    it('shows "promised to someone else" when not promised to current user', async () => {
      mockData.message.promisedtoyou = false
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain(
        'This is promised to someone else at the moment.'
      )
    })
  })

  describe('data fetching', () => {
    it('fetches message on mount', async () => {
      await createWrapper({ id: 789 })
      expect(mockFetchMessage).toHaveBeenCalledWith(789)
    })

    it('fetches groups for message', async () => {
      mockData.message = {
        id: 123,
        type: 'Offer',
        outcomes: [],
        groups: [{ groupid: 10 }, { groupid: 20 }],
        fromuser: 2,
        promised: false,
      }
      await createWrapper()
      // Group fetch happens for each group in the message
      expect(mockFetchGroup).toHaveBeenCalledWith(10)
      expect(mockFetchGroup).toHaveBeenCalledWith(20)
    })
  })
})
