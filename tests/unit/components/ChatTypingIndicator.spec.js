import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatTypingIndicator from '~/components/ChatTypingIndicator.vue'

// Mock chat store
const mockChatStore = {
  byChatId: vi.fn(),
  fetchChat: vi.fn().mockResolvedValue({}),
}
vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

// Mock misc store
const mockMiscStore = {
  visible: true,
}
vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

// Mock constants
vi.mock('../constants', () => ({
  TYPING_TIME_INVERVAL: 10000,
}))

describe('ChatTypingIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockMiscStore.visible = true
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createWrapper(props = {}) {
    return mount(ChatTypingIndicator, {
      props: {
        chatid: 1,
        icon: 'https://example.com/avatar.jpg',
        ...props,
      },
      global: {
        stubs: {
          ProfileImage: {
            template: '<div class="profile-image" :data-name="name" />',
            props: ['image', 'name', 'isThumbnail', 'size'],
          },
          JumpingDots: {
            template: '<div class="jumping-dots" :data-size="size" />',
            props: ['size'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('does not show indicator when not typing', () => {
      mockChatStore.byChatId.mockReturnValue({
        lasttype: null,
        lastdate: new Date().toISOString(),
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.chatMessageWrapper').exists()).toBe(false)
    })

    it('does not show indicator when icon is empty string', () => {
      mockChatStore.byChatId.mockReturnValue({
        lasttype: new Date().toISOString(),
        lastdate: new Date(Date.now() - 1000).toISOString(),
      })
      const wrapper = createWrapper({ icon: '' })
      // Won't show because v-if requires both typing and icon
      expect(wrapper.find('.chatMessageWrapper').exists()).toBe(false)
    })

    it('shows indicator when typing and icon are present', () => {
      const now = new Date()
      mockChatStore.byChatId.mockReturnValue({
        lasttype: now.toISOString(),
        lastdate: new Date(now.getTime() - 5000).toISOString(),
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.chatMessageWrapper').exists()).toBe(true)
    })

    it('shows profile image with correct props', () => {
      const now = new Date()
      mockChatStore.byChatId.mockReturnValue({
        lasttype: now.toISOString(),
        lastdate: new Date(now.getTime() - 5000).toISOString(),
      })
      const wrapper = createWrapper({ name: 'Test User' })
      const profileImage = wrapper.find('.profile-image')
      expect(profileImage.exists()).toBe(true)
      expect(profileImage.attributes('data-name')).toBe('Test User')
    })

    it('shows jumping dots animation', () => {
      const now = new Date()
      mockChatStore.byChatId.mockReturnValue({
        lasttype: now.toISOString(),
        lastdate: new Date(now.getTime() - 5000).toISOString(),
      })
      const wrapper = createWrapper()
      const dots = wrapper.find('.jumping-dots')
      expect(dots.exists()).toBe(true)
      expect(dots.attributes('data-size')).toBe('lg')
    })
  })

  describe('props', () => {
    it('requires chatid prop', () => {
      const wrapper = createWrapper({ chatid: 42 })
      expect(wrapper.props('chatid')).toBe(42)
    })

    it('requires icon prop', () => {
      const wrapper = createWrapper({ icon: 'https://example.com/pic.jpg' })
      expect(wrapper.props('icon')).toBe('https://example.com/pic.jpg')
    })

    it('defaults name to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('name')).toBe(null)
    })

    it('accepts custom name', () => {
      const wrapper = createWrapper({ name: 'John Doe' })
      expect(wrapper.props('name')).toBe('John Doe')
    })
  })

  describe('typing detection', () => {
    it('considers typing when lasttype is recent', () => {
      const now = new Date()
      mockChatStore.byChatId.mockReturnValue({
        lasttype: now.toISOString(),
        lastdate: new Date(now.getTime() - 5000).toISOString(),
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.chatMessageWrapper').exists()).toBe(true)
    })

    it('does not consider typing when lasttype is too old', () => {
      const now = new Date()
      mockChatStore.byChatId.mockReturnValue({
        lasttype: new Date(now.getTime() - 60000).toISOString(), // 60 seconds ago
        lastdate: new Date(now.getTime() - 70000).toISOString(),
      })
      const wrapper = createWrapper()
      // typing computed should return false
      expect(wrapper.find('.chatMessageWrapper').exists()).toBe(false)
    })

    it('does not consider typing when lastdate is after lasttype', () => {
      const now = new Date()
      mockChatStore.byChatId.mockReturnValue({
        lasttype: new Date(now.getTime() - 10000).toISOString(),
        lastdate: now.toISOString(), // Message sent after typing
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.chatMessageWrapper').exists()).toBe(false)
    })
  })

  describe('polling behavior', () => {
    it('sets up timer on mount', () => {
      createWrapper()
      // Timer should be set
      expect(vi.getTimerCount()).toBeGreaterThan(0)
    })

    it('fetches chat when window is visible', async () => {
      mockMiscStore.visible = true
      const now = new Date()
      mockChatStore.byChatId.mockReturnValue({
        lasttype: now.toISOString(),
        lastdate: new Date(now.getTime() - 5000).toISOString(),
      })
      createWrapper({ chatid: 123 })

      // Advance timer to trigger check
      await vi.advanceTimersByTimeAsync(10000)

      expect(mockChatStore.fetchChat).toHaveBeenCalledWith(123)
    })

    it('does not fetch chat when window is not visible', async () => {
      mockMiscStore.visible = false
      mockChatStore.byChatId.mockReturnValue({
        lasttype: null,
        lastdate: null,
      })
      createWrapper()

      // Advance timer
      await vi.advanceTimersByTimeAsync(10000)

      expect(mockChatStore.fetchChat).not.toHaveBeenCalled()
    })

    it('clears timer on unmount', () => {
      const wrapper = createWrapper()
      const initialTimerCount = vi.getTimerCount()
      wrapper.unmount()
      // Timer should be cleared
      expect(vi.getTimerCount()).toBeLessThan(initialTimerCount)
    })
  })

  describe('chat computed', () => {
    it('gets chat from store by chatid', () => {
      const mockChat = { id: 1, lasttype: null, lastdate: null }
      mockChatStore.byChatId.mockReturnValue(mockChat)
      createWrapper({ chatid: 1 })
      expect(mockChatStore.byChatId).toHaveBeenCalledWith(1)
    })
  })
})
