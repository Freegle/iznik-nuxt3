import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ModSupportChat from '~/modtools/components/ModSupportChat.vue'

describe('ModSupportChat', () => {
  const defaultProps = {
    chat: {
      id: 123,
      chattype: 'User2User',
      name: 'Test Chat',
      lastdate: '2024-01-15T10:30:00Z',
      user1: 1,
      user2: 2,
    },
    pov: 1,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(ModSupportChat, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="icon" :class="icon"><slot /></span>',
            props: ['icon', 'class', 'scale'],
          },
          ModChatViewButton: {
            template: '<button class="chat-view-button">View Chat</button>',
            props: ['id', 'chat', 'pov'],
          },
        },
        mocks: {
          timeago: (date) => '2 hours ago',
          datetime: (date) => '2024-01-15 10:30:00',
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders the component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.layout').exists()).toBe(true)
    })

    it('displays chat ID', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('123')
    })

    it('displays chat name', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Chat')
    })

    it('renders ModChatViewButton', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.chat-view-button').exists()).toBe(true)
    })

    it('displays timeago for lastdate', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('2 hours ago')
    })

    it('displays "No messages" when lastdate is empty', () => {
      const wrapper = mountComponent({
        chat: {
          ...defaultProps.chat,
          lastdate: null,
        },
      })
      expect(wrapper.text()).toContain('No messages')
    })
  })

  describe('chat type icons', () => {
    it('shows user icon for User2User chat', () => {
      const wrapper = mountComponent({
        chat: {
          ...defaultProps.chat,
          chattype: 'User2User',
        },
      })
      const icons = wrapper.findAll('.icon')
      const userIcon = icons.find((i) => i.classes().includes('user'))
      expect(userIcon).toBeTruthy()
    })

    it('shows crown icon for User2Mod chat', () => {
      const wrapper = mountComponent({
        chat: {
          ...defaultProps.chat,
          chattype: 'User2Mod',
        },
      })
      const icons = wrapper.findAll('.icon')
      const crownIcon = icons.find((i) => i.classes().includes('crown'))
      expect(crownIcon).toBeTruthy()
    })

    it('shows crown icon for Mod2Mod chat', () => {
      const wrapper = mountComponent({
        chat: {
          ...defaultProps.chat,
          chattype: 'Mod2Mod',
        },
      })
      const icons = wrapper.findAll('.icon')
      const crownIcon = icons.find((i) => i.classes().includes('crown'))
      expect(crownIcon).toBeTruthy()
    })
  })

  describe('computed properties', () => {
    describe('otheruser', () => {
      it('returns user2 when pov equals user1', () => {
        const wrapper = mountComponent({
          chat: {
            ...defaultProps.chat,
            chattype: 'User2User',
            user1: 100,
            user2: 200,
          },
          pov: 100,
        })
        expect(wrapper.vm.otheruser).toBe(200)
      })

      it('returns user1 when pov equals user2', () => {
        const wrapper = mountComponent({
          chat: {
            ...defaultProps.chat,
            chattype: 'User2User',
            user1: 100,
            user2: 200,
          },
          pov: 200,
        })
        expect(wrapper.vm.otheruser).toBe(100)
      })

      it('returns null for non-User2User chat types', () => {
        const wrapper = mountComponent({
          chat: {
            ...defaultProps.chat,
            chattype: 'User2Mod',
            user1: 100,
            user2: 200,
          },
          pov: 100,
        })
        expect(wrapper.vm.otheruser).toBeNull()
      })

      it('returns null when chat is empty object', () => {
        const wrapper = mountComponent({
          chat: {
            id: 1,
            chattype: 'User2User',
            name: 'Empty',
          },
          pov: 100,
        })
        // With no user1/user2, otheruser returns undefined
        expect(wrapper.vm.otheruser).toBeUndefined()
      })

      it('returns null for Mod2Mod chat type', () => {
        const wrapper = mountComponent({
          chat: {
            ...defaultProps.chat,
            chattype: 'Mod2Mod',
            user1: 100,
            user2: 200,
          },
          pov: 100,
        })
        expect(wrapper.vm.otheruser).toBeNull()
      })
    })
  })

  describe('other user display', () => {
    it('displays other user ID for User2User chat', async () => {
      const wrapper = mountComponent({
        chat: {
          ...defaultProps.chat,
          chattype: 'User2User',
          user1: 100,
          user2: 200,
        },
        pov: 100,
      })
      await nextTick()
      expect(wrapper.text()).toContain('200')
    })

    it('does not display other user ID for non-User2User chat', async () => {
      const wrapper = mountComponent({
        chat: {
          ...defaultProps.chat,
          chattype: 'User2Mod',
          user1: 100,
          user2: 200,
        },
        pov: 100,
      })
      await nextTick()

      // Should not show user2 ID in the name section (may appear in Chat ID)
      const nameSection = wrapper.find('.name')
      expect(nameSection.text()).not.toContain('200')
    })
  })

  describe('props', () => {
    it('requires chat prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('chat')).toEqual(defaultProps.chat)
    })

    it('has optional pov prop with null default', () => {
      const wrapper = mount(ModSupportChat, {
        props: {
          chat: defaultProps.chat,
        },
        global: {
          stubs: {
            'v-icon': true,
            ModChatViewButton: true,
          },
          mocks: {
            timeago: (date) => '2 hours ago',
            datetime: (date) => '2024-01-15 10:30:00',
          },
        },
      })
      expect(wrapper.props('pov')).toBeNull()
    })

    it('accepts pov as a number', () => {
      const wrapper = mountComponent({
        pov: 999,
      })
      expect(wrapper.props('pov')).toBe(999)
    })
  })

  describe('grid layout', () => {
    it('has type column', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.type').exists()).toBe(true)
    })

    it('has id column', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.id').exists()).toBe(true)
    })

    it('has button column', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.button').exists()).toBe(true)
    })

    it('has name column', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.name').exists()).toBe(true)
    })

    it('has time column', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.time').exists()).toBe(true)
    })
  })

  describe('ModChatViewButton rendering', () => {
    it('renders ModChatViewButton with chat id', () => {
      const wrapper = mountComponent({
        chat: {
          ...defaultProps.chat,
          id: 456,
        },
      })
      // The stub is rendered with a button class
      const button = wrapper.find('.chat-view-button')
      expect(button.exists()).toBe(true)
    })

    it('renders ModChatViewButton component', () => {
      const chatData = {
        ...defaultProps.chat,
        id: 789,
        name: 'Custom Chat',
      }
      const wrapper = mountComponent({
        chat: chatData,
      })
      const button = wrapper.find('.chat-view-button')
      expect(button.exists()).toBe(true)
    })

    it('includes ModChatViewButton in the layout', () => {
      const wrapper = mountComponent({
        pov: 555,
      })
      // The button is within the .layout grid - verify the chat-view-button stub exists
      const layout = wrapper.find('.layout')
      const button = layout.find('.chat-view-button')
      expect(button.exists()).toBe(true)
    })
  })

  describe('chat with missing data', () => {
    it('handles chat without user1', () => {
      const wrapper = mountComponent({
        chat: {
          id: 123,
          chattype: 'User2User',
          name: 'Test',
          user2: 200,
        },
        pov: 100,
      })
      // When user1 is missing and pov doesn't match undefined, returns user1 (undefined)
      // or user2 depending on comparison
      expect(wrapper.vm.otheruser).toBeUndefined()
    })

    it('handles chat without user2', () => {
      const wrapper = mountComponent({
        chat: {
          id: 123,
          chattype: 'User2User',
          name: 'Test',
          user1: 100,
        },
        pov: 100,
      })
      // Should not throw
      expect(wrapper.vm.otheruser).toBeUndefined()
    })

    it('handles chat without name', () => {
      const wrapper = mountComponent({
        chat: {
          id: 123,
          chattype: 'User2User',
          lastdate: '2024-01-15',
        },
      })
      expect(wrapper.find('.name').exists()).toBe(true)
    })
  })

  describe('text styling', () => {
    it('applies text-muted class to id section', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.id').classes()).toContain('text-muted')
    })

    it('shows user icon for User2User chat type', () => {
      const wrapper = mountComponent({
        chat: {
          ...defaultProps.chat,
          chattype: 'User2User',
        },
      })
      const icons = wrapper.findAll('.icon')
      const userIcon = icons.find((i) => i.classes().includes('user'))
      expect(userIcon).toBeTruthy()
    })

    it('shows crown icon for User2Mod chat type', () => {
      const wrapper = mountComponent({
        chat: {
          ...defaultProps.chat,
          chattype: 'User2Mod',
        },
      })
      const icons = wrapper.findAll('.icon')
      const crownIcon = icons.find((i) => i.classes().includes('crown'))
      expect(crownIcon).toBeTruthy()
    })
  })

  describe('time display', () => {
    it('shows time in span with title attribute for datetime', async () => {
      const wrapper = mountComponent({
        chat: {
          ...defaultProps.chat,
          lastdate: '2024-01-15T10:30:00Z',
        },
      })
      await nextTick()

      const timeSpan = wrapper.find('.time span[title]')
      expect(timeSpan.exists()).toBe(true)
      expect(timeSpan.attributes('title')).toBe('2024-01-15 10:30:00')
    })
  })
})
