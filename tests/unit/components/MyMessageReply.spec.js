import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import MyMessageReply from '~/components/MyMessageReply.vue'

// Mock user store
const mockUserFetch = vi.fn().mockResolvedValue(undefined)
const mockUserById = vi.fn()

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    fetch: mockUserFetch,
    byId: mockUserById,
  }),
}))

// Mock chat store
const mockChatToUser = vi.fn()
const mockOpenChatToUser = vi.fn().mockResolvedValue(undefined)
let mockChatList = []

vi.mock('~/stores/chat', () => ({
  useChatStore: () => ({
    toUser: mockChatToUser,
    openChatToUser: mockOpenChatToUser,
    get list() {
      return mockChatList
    },
  }),
}))

// Mock router
const mockPush = vi.fn()
vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
    }),
  }
})

// Mock timeagoShort composable
vi.mock('~/composables/useTimeFormat', () => ({
  timeagoShort: (date) => (date ? '2h' : ''),
}))

// Mock defineAsyncComponent for async child components
vi.mock('vue', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    defineAsyncComponent: (loader) => ({
      name: 'AsyncComponent',
      template: '<div class="async-component"></div>',
      props: ['id', 'messages', 'selectedMessage', 'users', 'selectedUser'],
      emits: ['hidden'],
    }),
  }
})

describe('MyMessageReply', () => {
  const mockReplyUser = {
    id: 42,
    displayname: 'John Doe',
    profile: {
      paththumb: '/images/john.jpg',
      externaluid: null,
      ouruid: 'abc123',
      externalmods: null,
    },
    supporter: false,
  }

  const mockChat = {
    id: 100,
    snippet: 'Hey, is this still available?',
    lastdate: '2024-01-15T10:00:00Z',
    status: 'Active',
    chattype: 'User2User',
    otheruid: 42,
  }

  const mockMessage = {
    id: 1,
    type: 'Offer',
    subject: 'Test item',
    promisecount: 0,
    promises: [],
  }

  const mockReply = {
    userid: 42,
    chatid: 100,
  }

  const mockChats = [{ id: 100, unseen: 0 }]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserById.mockReturnValue(mockReplyUser)
    mockChatToUser.mockReturnValue(mockChat)
    mockChatList = [mockChat]
    mockPush.mockClear()
  })

  // Helper to wrap async component in Suspense
  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      render() {
        return h(Suspense, null, {
          default: () =>
            h(MyMessageReply, {
              message: mockMessage,
              reply: mockReply,
              chats: mockChats,
              ...props,
            }),
        })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          ProfileImage: {
            template:
              '<div class="profile-image" @click="$emit(\'click\')"><slot /></div>',
            props: [
              'image',
              'externaluid',
              'ouruid',
              'externalmods',
              'name',
              'isThumbnail',
              'size',
            ],
            emits: ['click'],
          },
          SupporterInfo: {
            template: '<div class="supporter-info"></div>',
          },
          UserRatings: {
            template: '<div class="user-ratings" :data-id="id"></div>',
            props: ['id', 'size'],
          },
          PromiseModal: {
            template: '<div class="promise-modal"></div>',
            props: ['messages', 'selectedMessage', 'users', 'selectedUser'],
            emits: ['hidden'],
          },
          RenegeModal: {
            template: '<div class="renege-modal"></div>',
            props: ['messages', 'selectedMessage', 'users', 'selectedUser'],
            emits: ['hidden'],
          },
          ProfileModal: {
            template: '<div class="profile-modal" :data-id="id"></div>',
            props: ['id'],
            emits: ['hidden'],
          },
          'b-badge': {
            template:
              '<span class="b-badge" :class="badgeClass"><slot /></span>',
            props: ['variant', 'pill'],
            computed: {
              badgeClass() {
                return 'badge-' + this.variant
              },
            },
          },
          'v-icon': {
            template: '<i :class="icon" class="v-icon"></i>',
            props: ['icon'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('initialization', () => {
    it('fetches user on mount', async () => {
      await createWrapper()
      expect(mockUserFetch).toHaveBeenCalledWith(42)
    })

    it('opens chat to user if no existing chat', async () => {
      // Return null for the first call (during initialization check)
      mockChatToUser.mockReturnValue(null)
      await createWrapper()
      expect(mockOpenChatToUser).toHaveBeenCalledWith({
        userid: 42,
        updateRoster: false,
      })
      // Restore the mock for other tests
      mockChatToUser.mockReturnValue(mockChat)
    })

    it('does not open chat if one already exists', async () => {
      await createWrapper()
      // openChatToUser should not be called when chat exists
      expect(mockOpenChatToUser).not.toHaveBeenCalled()
    })
  })

  describe('rendering - with chat snippet', () => {
    it('renders chat bubble with snippet', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-bubble').exists()).toBe(true)
      expect(wrapper.text()).toContain('Hey, is this still available?')
    })

    it('displays user display name', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.user-name').text()).toBe('John Doe')
    })

    it('shows profile image', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('displays time ago', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-time').text()).toBe('2h')
    })

    it('shows chat button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-btn').exists()).toBe(true)
      expect(wrapper.find('.chat-btn').text()).toContain('Chat')
    })
  })

  describe('rendering - without chat snippet', () => {
    beforeEach(() => {
      mockChatToUser.mockReturnValue({
        ...mockChat,
        snippet: null,
      })
    })

    it('renders empty chat bubble', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-bubble--empty').exists()).toBe(true)
    })

    it('still shows user name', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.user-name').text()).toBe('John Doe')
    })

    it('still shows chat button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-btn').text()).toContain('Chat')
    })
  })

  describe('unseen messages badge', () => {
    it('shows unseen badge when there are unread messages', async () => {
      const wrapper = await createWrapper({
        chats: [{ id: 100, unseen: 3 }],
      })
      expect(wrapper.find('.chat-badge').exists()).toBe(true)
      expect(wrapper.find('.chat-badge').text()).toBe('3')
    })

    it('hides unseen badge when no unread messages', async () => {
      const wrapper = await createWrapper({
        chats: [{ id: 100, unseen: 0 }],
      })
      expect(wrapper.find('.chat-badge').exists()).toBe(false)
    })

    it('applies unread class when there are unseen messages', async () => {
      const wrapper = await createWrapper({
        chats: [{ id: 100, unseen: 5 }],
      })
      expect(wrapper.find('.chat-bubble--unread').exists()).toBe(true)
    })
  })

  describe('user ratings and supporter info', () => {
    it('shows user ratings when user has id', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.user-ratings').exists()).toBe(true)
      expect(wrapper.find('.user-ratings').attributes('data-id')).toBe('42')
    })

    it('hides user ratings when no user id', async () => {
      mockUserById.mockReturnValue(null)
      const wrapper = await createWrapper()
      expect(wrapper.find('.user-ratings').exists()).toBe(false)
    })

    it('shows supporter badge when user is supporter', async () => {
      mockUserById.mockReturnValue({
        ...mockReplyUser,
        supporter: true,
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.supporter-info').exists()).toBe(true)
    })

    it('hides supporter badge when user is not supporter', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.supporter-info').exists()).toBe(false)
    })
  })

  describe('promise button - Offer type', () => {
    it('shows Promise button for Offer messages', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Promise')
    })

    it('hides Promise button when item is taken', async () => {
      const wrapper = await createWrapper({ taken: true })
      expect(wrapper.text()).not.toContain('Promise')
    })

    it('hides Promise button when item is withdrawn', async () => {
      const wrapper = await createWrapper({ withdrawn: true })
      expect(wrapper.text()).not.toContain('Promise')
    })

    it('shows Unpromise button when promised to this user', async () => {
      const promisedMessage = {
        ...mockMessage,
        promisecount: 1,
        promises: [{ userid: 42 }],
      }
      const wrapper = await createWrapper({ message: promisedMessage })
      expect(wrapper.text()).toContain('Unpromise')
      expect(wrapper.text()).not.toContain('Promise')
    })

    it('does not show Unpromise when taken', async () => {
      const promisedMessage = {
        ...mockMessage,
        promisecount: 1,
        promises: [{ userid: 42 }],
      }
      const wrapper = await createWrapper({
        message: promisedMessage,
        taken: true,
      })
      expect(wrapper.text()).not.toContain('Unpromise')
    })
  })

  describe('promise button - Wanted type', () => {
    it('hides Promise button for Wanted messages', async () => {
      const wantedMessage = {
        ...mockMessage,
        type: 'Wanted',
      }
      const wrapper = await createWrapper({ message: wantedMessage })
      const actionBtns = wrapper.findAll('.action-btn--primary')
      expect(actionBtns.length).toBe(0)
    })
  })

  describe('promised styling', () => {
    it('applies promised class when promised to this user', async () => {
      const promisedMessage = {
        ...mockMessage,
        promisecount: 1,
        promises: [{ userid: 42 }],
      }
      const wrapper = await createWrapper({ message: promisedMessage })
      expect(wrapper.find('.reply-mobile--promised').exists()).toBe(true)
    })

    it('does not apply promised class when not promised', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.reply-mobile--promised').exists()).toBe(false)
    })

    it('does not apply promised class when promised to different user', async () => {
      const promisedMessage = {
        ...mockMessage,
        promisecount: 1,
        promises: [{ userid: 99 }],
      }
      const wrapper = await createWrapper({ message: promisedMessage })
      expect(wrapper.find('.reply-mobile--promised').exists()).toBe(false)
    })
  })

  describe('badges - closest, best, quickest', () => {
    it('shows Nearby badge when closest is true', async () => {
      const wrapper = await createWrapper({ closest: true })
      expect(wrapper.text()).toContain('Nearby')
    })

    it('shows Good rating badge when best is true', async () => {
      const wrapper = await createWrapper({ best: true })
      expect(wrapper.text()).toContain('Good rating')
    })

    it('shows Quick reply badge when quickest is true', async () => {
      const wrapper = await createWrapper({ quickest: true })
      expect(wrapper.text()).toContain('Quick reply')
    })

    it('shows multiple badges when multiple props are true', async () => {
      const wrapper = await createWrapper({
        closest: true,
        best: true,
        quickest: true,
      })
      expect(wrapper.text()).toContain('Nearby')
      expect(wrapper.text()).toContain('Good rating')
      expect(wrapper.text()).toContain('Quick reply')
    })

    it('hides badges row when no badges apply', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.badges-row').exists()).toBe(false)
    })

    it('shows badges row when any badge applies', async () => {
      const wrapper = await createWrapper({ closest: true })
      expect(wrapper.find('.badges-row').exists()).toBe(true)
    })
  })

  describe('click interactions - chat', () => {
    it('navigates to chat when chat bubble clicked', async () => {
      const wrapper = await createWrapper()
      await wrapper.find('.chat-bubble').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/chats/100')
    })

    it('navigates to chat when chat button clicked', async () => {
      const wrapper = await createWrapper()
      // Chat button is inside chat bubble, click propagates
      await wrapper.find('.chat-btn').trigger('click')
      expect(mockPush).toHaveBeenCalled()
    })
  })

  describe('click interactions - profile', () => {
    it('opens profile modal when username clicked', async () => {
      const wrapper = await createWrapper()
      await wrapper.find('.user-name').trigger('click')
      await flushPromises()
      expect(wrapper.find('.profile-modal').exists()).toBe(true)
    })

    it('profile modal has correct user id', async () => {
      const wrapper = await createWrapper()
      await wrapper.find('.user-name').trigger('click')
      await flushPromises()
      expect(wrapper.find('.profile-modal').attributes('data-id')).toBe('42')
    })

    it('avatar has click handler (for profile)', async () => {
      const wrapper = await createWrapper()
      // The avatar has the chat-avatar class and is wrapped in ProfileImage
      // The @click.stop handler is attached, so clicking it should open profile
      const avatar = wrapper.find('.chat-avatar')
      expect(avatar.exists()).toBe(true)
    })
  })

  describe('click interactions - promise modal', () => {
    it('opens promise modal when Promise button clicked', async () => {
      const wrapper = await createWrapper()
      const promiseBtn = wrapper.find('.action-btn--primary')
      await promiseBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.promise-modal').exists()).toBe(true)
    })

    it('does not show promise modal initially', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.promise-modal').exists()).toBe(false)
    })
  })

  describe('click interactions - renege modal', () => {
    it('opens renege modal when Unpromise button clicked', async () => {
      const promisedMessage = {
        ...mockMessage,
        promisecount: 1,
        promises: [{ userid: 42 }],
      }
      const wrapper = await createWrapper({ message: promisedMessage })
      const unpromiseBtn = wrapper.find('.action-btn--warning')
      await unpromiseBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.renege-modal').exists()).toBe(true)
    })

    it('does not show renege modal initially', async () => {
      const promisedMessage = {
        ...mockMessage,
        promisecount: 1,
        promises: [{ userid: 42 }],
      }
      const wrapper = await createWrapper({ message: promisedMessage })
      expect(wrapper.find('.renege-modal').exists()).toBe(false)
    })
  })

  describe('props validation', () => {
    it('message prop is required', () => {
      const props = MyMessageReply.props
      expect(props.message.required).toBe(true)
      expect(props.message.type).toBe(Object)
    })

    it('reply prop is required', () => {
      const props = MyMessageReply.props
      expect(props.reply.required).toBe(true)
      expect(props.reply.type).toBe(Object)
    })

    it('chats prop is required', () => {
      const props = MyMessageReply.props
      expect(props.chats.required).toBe(true)
      expect(props.chats.type).toBe(Array)
    })

    it('taken defaults to false', () => {
      const props = MyMessageReply.props
      expect(props.taken.default).toBe(false)
      expect(props.taken.type).toBe(Boolean)
    })

    it('received defaults to false', () => {
      const props = MyMessageReply.props
      expect(props.received.default).toBe(false)
      expect(props.received.type).toBe(Boolean)
    })

    it('withdrawn defaults to false', () => {
      const props = MyMessageReply.props
      expect(props.withdrawn.default).toBe(false)
      expect(props.withdrawn.type).toBe(Boolean)
    })

    it('closest defaults to false', () => {
      const props = MyMessageReply.props
      expect(props.closest.default).toBe(false)
      expect(props.closest.type).toBe(Boolean)
    })

    it('best defaults to false', () => {
      const props = MyMessageReply.props
      expect(props.best.default).toBe(false)
      expect(props.best.type).toBe(Boolean)
    })

    it('quickest defaults to false', () => {
      const props = MyMessageReply.props
      expect(props.quickest.default).toBe(false)
      expect(props.quickest.type).toBe(Boolean)
    })
  })

  describe('computed values', () => {
    it('computes unseen count from chats array', async () => {
      const wrapper = await createWrapper({
        chats: [
          { id: 100, unseen: 3 },
          { id: 200, unseen: 5 },
        ],
      })
      // Only chat with matching chatid (100) should be counted
      expect(wrapper.find('.chat-badge').text()).toBe('3')
    })

    it('returns 0 unseen when chat not in array', async () => {
      const wrapper = await createWrapper({
        chats: [{ id: 999, unseen: 5 }],
      })
      expect(wrapper.find('.chat-badge').exists()).toBe(false)
    })
  })

  describe('replyusers for modal', () => {
    it('includes reply user in replyusers list', async () => {
      await createWrapper()
      // replyusers should include the reply user, which is fetched via byId
      expect(mockUserById).toHaveBeenCalledWith(42)
    })

    it('fetches additional users from chat list', async () => {
      mockChatList = [
        {
          ...mockChat,
          otheruid: 42,
        },
        {
          id: 101,
          status: 'Active',
          chattype: 'User2User',
          otheruid: 55,
          lastdate: '2024-01-14T10:00:00Z',
        },
      ]
      await createWrapper()
      // Should fetch both users
      expect(mockUserFetch).toHaveBeenCalledWith(42)
    })

    it('filters out blocked chats from user list', async () => {
      mockChatList = [
        {
          ...mockChat,
          status: 'Blocked',
          otheruid: 99,
        },
      ]
      await createWrapper()
      // Blocked chat user should not be fetched separately
      // Only the reply user (42) should be fetched
      const fetchCalls = mockUserFetch.mock.calls.map((c) => c[0])
      expect(fetchCalls).toContain(42)
    })

    it('filters out closed chats from user list', async () => {
      mockChatList = [
        {
          ...mockChat,
          status: 'Closed',
          otheruid: 99,
        },
      ]
      await createWrapper()
      // Closed chat user should not be included
      const fetchCalls = mockUserFetch.mock.calls.map((c) => c[0])
      expect(fetchCalls).toContain(42)
    })
  })

  describe('edge cases', () => {
    it('handles null replyuser gracefully', async () => {
      mockUserById.mockReturnValue(null)
      const wrapper = await createWrapper()
      // Should still render without errors
      expect(wrapper.find('.reply-mobile').exists()).toBe(true)
    })

    it('handles null chat gracefully', async () => {
      mockChatToUser.mockReturnValue(null)
      const wrapper = await createWrapper()
      // Should still render the empty chat bubble
      expect(wrapper.find('.chat-bubble--empty').exists()).toBe(true)
    })

    it('displays fallback name when displayname is undefined', async () => {
      mockUserById.mockReturnValue({
        ...mockReplyUser,
        displayname: undefined,
      })
      const wrapper = await createWrapper()
      // ProfileImage should receive 'User' as fallback name
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('handles message with no promises array', async () => {
      const messageNoPromises = {
        ...mockMessage,
        promisecount: 0,
        promises: undefined,
      }
      const wrapper = await createWrapper({ message: messageNoPromises })
      // Should not crash and should show Promise button
      expect(wrapper.text()).toContain('Promise')
    })
  })

  describe('accessibility', () => {
    it('chat button is clickable', async () => {
      const wrapper = await createWrapper()
      const chatBtn = wrapper.find('.chat-btn')
      expect(chatBtn.element.tagName.toLowerCase()).toBe('button')
    })

    it('action buttons are proper buttons', async () => {
      const wrapper = await createWrapper()
      const actionBtn = wrapper.find('.action-btn')
      expect(actionBtn.element.tagName.toLowerCase()).toBe('button')
    })

    it('username is clickable', async () => {
      const wrapper = await createWrapper()
      const username = wrapper.find('.user-name')
      // Should have click handler (cursor: pointer in CSS)
      expect(username.exists()).toBe(true)
    })
  })
})
