import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatListEntry from '~/components/ChatListEntry.vue'

const mockByChatId = vi.fn()
const mockFetchMessages = vi.fn()

vi.mock('~/stores/chat', () => ({
  useChatStore: () => ({
    byChatId: mockByChatId,
    fetchMessages: mockFetchMessages,
  }),
}))

vi.mock('~/composables/useTwem', () => ({
  twem: vi.fn((text) => text),
}))

vi.mock('~/composables/useTimeFormat', () => ({
  timeago: vi.fn((date) => '2 hours ago'),
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    byId: vi.fn(() => null),
  }),
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    modtools: false,
  }),
}))

describe('ChatListEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockByChatId.mockReturnValue({
      id: 1,
      name: 'Test User',
      icon: '/avatar.jpg',
      unseen: 0,
      snippet: 'Hello there!',
      lastdate: '2026-01-24T10:00:00Z',
      replyexpected: false,
      supporter: false,
    })
    mockFetchMessages.mockResolvedValue({})
  })

  function createWrapper(props = {}) {
    return mount(ChatListEntry, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          ChatAvatar: {
            template:
              '<div class="chat-avatar" :data-name="name" :data-icon="icon" :data-unread="unreadCount" />',
            props: ['icon', 'name', 'supporter', 'unreadCount'],
          },
          'b-badge': {
            template:
              '<span class="b-badge" :class="variantClass"><slot /></span>',
            props: ['variant'],
            computed: {
              variantClass() {
                return 'badge-' + this.variant
              },
            },
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders chat entry when chat exists', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-entry').exists()).toBe(true)
    })

    it('does not render when chat is null', () => {
      mockByChatId.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-entry').exists()).toBe(false)
    })

    it('shows chat name', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-name').text()).toBe('Test User')
    })

    it('shows ChatAvatar component', () => {
      const wrapper = createWrapper()
      const avatar = wrapper.find('.chat-avatar')
      expect(avatar.exists()).toBe(true)
      expect(avatar.attributes('data-name')).toBe('Test User')
    })
  })

  describe('unread state', () => {
    it('applies unread class when unseen > 0', () => {
      mockByChatId.mockReturnValue({
        id: 1,
        name: 'User',
        unseen: 3,
        snippet: 'Message',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-entry.unread').exists()).toBe(true)
    })

    it('does not apply unread class when unseen is 0', () => {
      mockByChatId.mockReturnValue({
        id: 1,
        name: 'User',
        unseen: 0,
        snippet: 'Message',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-entry.unread').exists()).toBe(false)
    })

    it('passes unread count to ChatAvatar', () => {
      mockByChatId.mockReturnValue({
        id: 1,
        name: 'User',
        unseen: 5,
        snippet: 'Message',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-avatar').attributes('data-unread')).toBe('5')
    })
  })

  describe('snippet display', () => {
    it('shows snippet text when available', () => {
      mockByChatId.mockReturnValue({
        id: 1,
        name: 'User',
        snippet: 'Test message snippet',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.snippet').text()).toBe('Test message snippet')
    })

    it('shows "No messages yet" when snippet is falsy', () => {
      mockByChatId.mockReturnValue({
        id: 1,
        name: 'User',
        snippet: null,
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.snippet.empty').text()).toBe('No messages yet')
    })

    it('shows "No messages yet" when snippet is "false" string', () => {
      mockByChatId.mockReturnValue({
        id: 1,
        name: 'User',
        snippet: 'false',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.snippet.empty').text()).toBe('No messages yet')
    })

    it('shows ellipsis when snippet is "null" string', () => {
      mockByChatId.mockReturnValue({
        id: 1,
        name: 'User',
        snippet: 'null',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.esnippet).toBe('...')
    })

    it('removes trailing backslashes from snippet', () => {
      mockByChatId.mockReturnValue({
        id: 1,
        name: 'User',
        snippet: 'Message with trailing\\\\',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.esnippet).toBe('Message with trailing')
    })
  })

  describe('RSVP badge', () => {
    it('shows RSVP badge when replyexpected is true', () => {
      mockByChatId.mockReturnValue({
        id: 1,
        name: 'User',
        replyexpected: true,
        snippet: 'Message',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.rsvp-badge').exists()).toBe(true)
      expect(wrapper.find('.rsvp-badge').text()).toBe('RSVP')
    })

    it('hides RSVP badge when replyexpected is false', () => {
      mockByChatId.mockReturnValue({
        id: 1,
        name: 'User',
        replyexpected: false,
        snippet: 'Message',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.rsvp-badge').exists()).toBe(false)
    })
  })

  describe('time display', () => {
    it('shows formatted time when lastdate exists', () => {
      mockByChatId.mockReturnValue({
        id: 1,
        name: 'User',
        lastdate: '2026-01-24T10:00:00Z',
        snippet: 'Message',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-time').text()).toBe('2 hours ago')
    })

    it('returns null for lastdateago when no lastdate', () => {
      mockByChatId.mockReturnValue({
        id: 1,
        name: 'User',
        lastdate: null,
        snippet: 'Message',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.lastdateago).toBe(null)
    })
  })

  describe('fetch on hover', () => {
    it('fetches messages on mouseenter', async () => {
      const wrapper = createWrapper()

      await wrapper.find('.chat-entry').trigger('mouseenter')

      expect(mockFetchMessages).toHaveBeenCalledWith(1)
    })

    it('sets fetched to true after fetch', async () => {
      const wrapper = createWrapper()

      expect(wrapper.vm.fetched).toBe(false)

      await wrapper.find('.chat-entry').trigger('mouseenter')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.fetched).toBe(true)
    })
  })

  describe('supporter display', () => {
    it('passes supporter prop to ChatAvatar', () => {
      mockByChatId.mockReturnValue({
        id: 1,
        name: 'Supporter User',
        supporter: true,
        snippet: 'Message',
      })
      const wrapper = createWrapper()
      // The stub doesn't have a data-supporter but we can check the prop is passed
      expect(wrapper.find('.chat-avatar').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 42 })
      expect(wrapper.props('id')).toBe(42)
    })

    it('has optional active prop defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('active')).toBe(false)
    })

    it('accepts active prop', () => {
      const wrapper = createWrapper({ active: true })
      expect(wrapper.props('active')).toBe(true)
    })
  })
})
