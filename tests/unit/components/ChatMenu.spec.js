import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatMenu from '~/components/ChatMenu.vue'

// Create mock store that can be configured per test
const mockChatStore = {
  unreadCount: 0,
}

// Mock the chat store
vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

// Mock the router
const mockRouter = {
  push: vi.fn(),
}

vi.mock('#app', () => ({
  useRouter: () => mockRouter,
}))

describe('ChatMenu', () => {
  function mountChatMenu(props = {}) {
    return mount(ChatMenu, {
      props,
      global: {
        stubs: {
          'b-nav-item': {
            template:
              '<li class="nav-item"><a class="nav-link" href="#" @click="$emit(\'click\', $event)"><slot /></a></li>',
          },
          'b-badge': {
            template: '<span class="badge"><slot /></span>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<i :data-icon="icon"></i>',
            props: ['icon'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockChatStore.unreadCount = 0
  })

  describe('rendering', () => {
    it('renders a chat icon', () => {
      const wrapper = mountChatMenu()
      const icon = wrapper.find('i[data-icon="comments"]')
      expect(icon.exists()).toBe(true)
    })

    it('shows "Chats" text', () => {
      const wrapper = mountChatMenu()
      expect(wrapper.text()).toContain('Chats')
    })

    it('renders as b-nav-item by default (isListItem=true)', () => {
      const wrapper = mountChatMenu()
      expect(wrapper.find('li.nav-item').exists()).toBe(true)
    })

    it('renders as anchor when isListItem=false', () => {
      const wrapper = mountChatMenu({ isListItem: false })
      // When isListItem is false, component renders as 'a' instead of 'b-nav-item'
      expect(wrapper.find('a.nav-link.chat-menu-item').exists()).toBe(true)
    })

    it('has text-white class when isListItem=false', () => {
      const wrapper = mountChatMenu({ isListItem: false })
      expect(wrapper.find('.text-white').exists()).toBe(true)
    })

    it('does not have text-white class when isListItem=true', () => {
      const wrapper = mountChatMenu({ isListItem: true })
      // The nav-link element itself doesn't get text-white when isListItem is true
      const navLink = wrapper.find('.nav-link.chat-menu-item')
      expect(navLink.classes()).not.toContain('text-white')
    })
  })

  describe('chat count badge', () => {
    it('does not show badge when unreadCount is 0', () => {
      mockChatStore.unreadCount = 0
      const wrapper = mountChatMenu()
      expect(wrapper.find('.badge').exists()).toBe(false)
    })

    it('shows badge when unreadCount is greater than 0', () => {
      mockChatStore.unreadCount = 5
      const wrapper = mountChatMenu()
      const badge = wrapper.find('.badge')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('5')
    })

    it('caps displayed count at 99', () => {
      mockChatStore.unreadCount = 150
      const wrapper = mountChatMenu()
      const badge = wrapper.find('.badge')
      expect(badge.text()).toBe('99')
    })

    it('displays exact count when under 99', () => {
      mockChatStore.unreadCount = 42
      const wrapper = mountChatMenu()
      const badge = wrapper.find('.badge')
      expect(badge.text()).toBe('42')
    })

    it('shows badge when unread count > 0', () => {
      mockChatStore.unreadCount = 3
      const wrapper = mountChatMenu()
      const badge = wrapper.find('.badge')
      expect(badge.exists()).toBe(true)
    })
  })

  describe('navigation', () => {
    it('navigates to /chats when clicked', async () => {
      const wrapper = mountChatMenu()
      await wrapper.find('.nav-link').trigger('click')
      expect(mockRouter.push).toHaveBeenCalledWith('/chats')
    })

    it('prevents default on click event', () => {
      const wrapper = mountChatMenu()
      const event = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        stopImmediatePropagation: vi.fn(),
      }

      // Call toChats directly with the mock event
      wrapper.vm.toChats(event)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
      expect(event.stopImmediatePropagation).toHaveBeenCalled()
    })

    it('handles null event gracefully', () => {
      const wrapper = mountChatMenu()
      // Should not throw when called with null
      expect(() => wrapper.vm.toChats(null)).not.toThrow()
      expect(mockRouter.push).toHaveBeenCalledWith('/chats')
    })
  })

  describe('computed properties', () => {
    it('chatType returns b-nav-item when isListItem is true', () => {
      const wrapper = mountChatMenu({ isListItem: true })
      expect(wrapper.vm.chatType).toBe('b-nav-item')
    })

    it('chatType returns a when isListItem is false', () => {
      const wrapper = mountChatMenu({ isListItem: false })
      expect(wrapper.vm.chatType).toBe('a')
    })

    it('chatCount handles undefined unreadCount gracefully', () => {
      mockChatStore.unreadCount = undefined
      const wrapper = mountChatMenu()
      // Math.min(99, undefined) returns NaN, but component shouldn't crash
      // The v-if="chatCount" will be falsy for NaN
      expect(wrapper.find('.badge').exists()).toBe(false)
    })

    it('chatCount handles null unreadCount gracefully', () => {
      mockChatStore.unreadCount = null
      const wrapper = mountChatMenu()
      expect(wrapper.find('.badge').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('accepts isListItem prop as false', () => {
      const wrapper = mountChatMenu({ isListItem: false })
      expect(wrapper.props('isListItem')).toBe(false)
    })
  })
})
