import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import ModSupportChat from '~/modtools/components/ModSupportChat.vue'
import { useChatStore } from '~/stores/chat'

describe('ModSupportChat', () => {
  const defaultChat = {
    id: 123,
    chattype: 'User2User',
    name: 'Test Chat',
    lastdate: '2024-01-15T10:30:00Z',
    user1: 1,
    user2: 2,
  }

  const defaultProps = {
    chatid: 123,
    pov: 1,
  }

  let chatStore

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())

    const store = {
      list: [],
      listMT: [],
      listByChatId: {
        123: { ...defaultChat },
      },
      messageById: () => null,
      byChatId(id) {
        return this.listByChatId[id] || null
      },
      fetchMessages: async () => {},
      fetchMT: async () => {},
    }

    globalThis.__mockChatStore = store

    chatStore = useChatStore()
  })

  afterEach(() => {
    globalThis.__mockChatStore = null
  })

  function mountComponent(props = {}, chatOverrides = null) {
    if (chatOverrides) {
      const chatid = props.chatid || defaultProps.chatid
      chatStore.listByChatId[chatid] = chatOverrides
    }

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
            props: ['id', 'pov'],
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
      const wrapper = mountComponent(
        {},
        {
          ...defaultChat,
          lastdate: null,
        }
      )
      expect(wrapper.text()).toContain('No messages')
    })

    it('renders nothing when chat is not in store', () => {
      chatStore.listByChatId = {}
      const wrapper = mountComponent({ chatid: 999 })
      expect(wrapper.find('.layout').exists()).toBe(false)
    })
  })

  describe('chat type icons', () => {
    it('shows user icon for User2User chat', () => {
      const wrapper = mountComponent(
        {},
        {
          ...defaultChat,
          chattype: 'User2User',
        }
      )
      const icons = wrapper.findAll('.icon')
      const userIcon = icons.find((i) => i.classes().includes('user'))
      expect(userIcon).toBeTruthy()
    })

    it('shows crown icon for User2Mod chat', () => {
      const wrapper = mountComponent(
        {},
        {
          ...defaultChat,
          chattype: 'User2Mod',
        }
      )
      const icons = wrapper.findAll('.icon')
      const crownIcon = icons.find((i) => i.classes().includes('crown'))
      expect(crownIcon).toBeTruthy()
    })

    it('shows crown icon for Mod2Mod chat', () => {
      const wrapper = mountComponent(
        {},
        {
          ...defaultChat,
          chattype: 'Mod2Mod',
        }
      )
      const icons = wrapper.findAll('.icon')
      const crownIcon = icons.find((i) => i.classes().includes('crown'))
      expect(crownIcon).toBeTruthy()
    })
  })

  describe('computed properties', () => {
    describe('otheruser', () => {
      it('returns user2 when pov equals user1', () => {
        const wrapper = mountComponent(
          { chatid: 123, pov: 100 },
          {
            ...defaultChat,
            chattype: 'User2User',
            user1: 100,
            user2: 200,
          }
        )
        expect(wrapper.vm.otheruser).toBe(200)
      })

      it('returns user1 when pov equals user2', () => {
        const wrapper = mountComponent(
          { chatid: 123, pov: 200 },
          {
            ...defaultChat,
            chattype: 'User2User',
            user1: 100,
            user2: 200,
          }
        )
        expect(wrapper.vm.otheruser).toBe(100)
      })

      it('returns null for non-User2User chat types', () => {
        const wrapper = mountComponent(
          { chatid: 123, pov: 100 },
          {
            ...defaultChat,
            chattype: 'User2Mod',
            user1: 100,
            user2: 200,
          }
        )
        expect(wrapper.vm.otheruser).toBeNull()
      })

      it('returns null when chat is not found in store', () => {
        chatStore.listByChatId = {}
        const wrapper = mountComponent({ chatid: 999 })
        expect(wrapper.vm.otheruser).toBeNull()
      })

      it('returns null for Mod2Mod chat type', () => {
        const wrapper = mountComponent(
          { chatid: 123, pov: 100 },
          {
            ...defaultChat,
            chattype: 'Mod2Mod',
            user1: 100,
            user2: 200,
          }
        )
        expect(wrapper.vm.otheruser).toBeNull()
      })
    })
  })

  describe('other user display', () => {
    it('displays other user ID for User2User chat', async () => {
      const wrapper = mountComponent(
        { chatid: 123, pov: 100 },
        {
          ...defaultChat,
          chattype: 'User2User',
          user1: 100,
          user2: 200,
        }
      )
      await nextTick()
      expect(wrapper.text()).toContain('200')
    })

    it('does not display other user ID for non-User2User chat', async () => {
      const wrapper = mountComponent(
        { chatid: 123, pov: 100 },
        {
          ...defaultChat,
          chattype: 'User2Mod',
          user1: 100,
          user2: 200,
        }
      )
      await nextTick()

      // Should not show user2 ID in the name section (may appear in Chat ID)
      const nameSection = wrapper.find('.name')
      expect(nameSection.text()).not.toContain('200')
    })
  })

  describe('props', () => {
    it('has optional pov prop with null default', () => {
      const wrapper = mount(ModSupportChat, {
        props: {
          chatid: 123,
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
      chatStore.listByChatId[456] = {
        ...defaultChat,
        id: 456,
      }
      const wrapper = mountComponent({ chatid: 456 })
      const button = wrapper.find('.chat-view-button')
      expect(button.exists()).toBe(true)
    })

    it('renders ModChatViewButton component', () => {
      chatStore.listByChatId[789] = {
        ...defaultChat,
        id: 789,
        name: 'Custom Chat',
      }
      const wrapper = mountComponent({ chatid: 789 })
      const button = wrapper.find('.chat-view-button')
      expect(button.exists()).toBe(true)
    })

    it('includes ModChatViewButton in the layout', () => {
      const wrapper = mountComponent({
        pov: 555,
      })
      const layout = wrapper.find('.layout')
      const button = layout.find('.chat-view-button')
      expect(button.exists()).toBe(true)
    })
  })

  describe('chat with missing data', () => {
    it('handles chat without user1', () => {
      const wrapper = mountComponent(
        { chatid: 123, pov: 100 },
        {
          id: 123,
          chattype: 'User2User',
          name: 'Test',
          user2: 200,
        }
      )
      // When user1 is missing and pov doesn't match undefined, returns user1 (undefined)
      expect(wrapper.vm.otheruser).toBeUndefined()
    })

    it('handles chat without user2', () => {
      const wrapper = mountComponent(
        { chatid: 123, pov: 100 },
        {
          id: 123,
          chattype: 'User2User',
          name: 'Test',
          user1: 100,
        }
      )
      expect(wrapper.vm.otheruser).toBeUndefined()
    })

    it('handles chat without name', () => {
      const wrapper = mountComponent(
        { chatid: 123 },
        {
          id: 123,
          chattype: 'User2User',
          lastdate: '2024-01-15',
        }
      )
      expect(wrapper.find('.name').exists()).toBe(true)
    })
  })

  describe('text styling', () => {
    it('applies text-muted class to id section', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.id').classes()).toContain('text-muted')
    })

    it('shows user icon for User2User chat type', () => {
      const wrapper = mountComponent(
        {},
        {
          ...defaultChat,
          chattype: 'User2User',
        }
      )
      const icons = wrapper.findAll('.icon')
      const userIcon = icons.find((i) => i.classes().includes('user'))
      expect(userIcon).toBeTruthy()
    })

    it('shows crown icon for User2Mod chat type', () => {
      const wrapper = mountComponent(
        {},
        {
          ...defaultChat,
          chattype: 'User2Mod',
        }
      )
      const icons = wrapper.findAll('.icon')
      const crownIcon = icons.find((i) => i.classes().includes('crown'))
      expect(crownIcon).toBeTruthy()
    })
  })

  describe('time display', () => {
    it('shows time in span with title attribute for datetime', async () => {
      const wrapper = mountComponent(
        {},
        {
          ...defaultChat,
          lastdate: '2024-01-15T10:30:00Z',
        }
      )
      await nextTick()

      const timeSpan = wrapper.find('.time span[title]')
      expect(timeSpan.exists()).toBe(true)
      expect(timeSpan.attributes('title')).toBe('2024-01-15 10:30:00')
    })
  })
})
