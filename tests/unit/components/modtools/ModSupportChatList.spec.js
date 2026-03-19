import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import ModSupportChatList from '~/modtools/components/ModSupportChatList.vue'

describe('ModSupportChatList', () => {
  const defaultChats = [
    { id: 1, name: 'Chat 1', chattype: 'User2User', lastdate: '2024-01-15' },
    { id: 2, name: 'Chat 2', chattype: 'User2Mod', lastdate: '2024-01-14' },
    { id: 3, name: 'Chat 3', chattype: 'User2User', lastdate: '2024-01-13' },
  ]

  const defaultProps = {
    chats: defaultChats,
    pov: 1,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())

    globalThis.__mockChatStore = {
      list: [],
      listMT: [],
      listByChatId: {},
      messageById: () => null,
      byChatId: () => null,
      fetchMessages: async () => {},
      fetchMT: async () => {},
    }
  })

  afterEach(() => {
    globalThis.__mockChatStore = null
  })

  function mountComponent(props = {}) {
    return mount(ModSupportChatList, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          ModSupportChat: {
            template:
              '<div class="support-chat" :data-chat-id="chatid">Chat {{ chatid }}</div>',
            props: ['chatid', 'pov'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
          },
          'b-button': {
            template:
              '<button class="b-button" @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders ModSupportChat components for initial chats', () => {
      const wrapper = mountComponent()
      const chats = wrapper.findAll('.support-chat')
      expect(chats.length).toBe(3)
    })
  })

  describe('props', () => {
    it('requires chats array prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('chats')).toEqual(defaultChats)
    })

    it('has optional pov prop with null default', () => {
      const wrapper = mount(ModSupportChatList, {
        props: {
          chats: defaultChats,
        },
        global: {
          stubs: {
            ModSupportChat: true,
            NoticeMessage: true,
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

  describe('computed: chatsShown', () => {
    it('returns empty array when chats is empty', () => {
      const wrapper = mountComponent({ chats: [] })
      expect(wrapper.vm.chatsShown).toEqual([])
    })

    it('returns first SHOW(3) chats initially', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.chatsShown.length).toBe(3)
      expect(wrapper.vm.chatsShown[0].id).toBe(1)
      expect(wrapper.vm.chatsShown[1].id).toBe(2)
      expect(wrapper.vm.chatsShown[2].id).toBe(3)
    })

    it('returns only SHOW(3) chats when there are more than 3', () => {
      const manyChats = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        name: `Chat ${i + 1}`,
        chattype: 'User2User',
      }))

      const wrapper = mountComponent({ chats: manyChats })
      expect(wrapper.vm.chatsShown.length).toBe(3)
    })

    it('returns all chats when showAll is true', async () => {
      const manyChats = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        name: `Chat ${i + 1}`,
        chattype: 'User2User',
      }))

      const wrapper = mountComponent({ chats: manyChats })
      wrapper.vm.showAll = true
      await nextTick()
      expect(wrapper.vm.chatsShown.length).toBe(6)
    })
  })

  describe('computed: chatsUnshown', () => {
    it('returns 0 when chats length <= SHOW(3)', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.chatsUnshown).toBe(0)
    })

    it('returns count of hidden chats when more than SHOW(3)', () => {
      const manyChats = Array.from({ length: 7 }, (_, i) => ({
        id: i + 1,
        name: `Chat ${i + 1}`,
        chattype: 'User2User',
      }))

      const wrapper = mountComponent({ chats: manyChats })
      expect(wrapper.vm.chatsUnshown).toBe(4)
    })

    it('returns 0 when chats is empty', () => {
      const wrapper = mountComponent({ chats: [] })
      expect(wrapper.vm.chatsUnshown).toBe(0)
    })
  })

  describe('Show +N button', () => {
    it('does not show button when chats <= SHOW(3)', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.b-button').exists()).toBe(false)
    })

    it('shows button with correct count when chats > SHOW(3)', () => {
      const manyChats = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `Chat ${i + 1}`,
        chattype: 'User2User',
      }))

      const wrapper = mountComponent({ chats: manyChats })
      const button = wrapper.find('.b-button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toContain('Show +5')
    })

    it('clicking the button reveals all chats', async () => {
      const manyChats = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `Chat ${i + 1}`,
        chattype: 'User2User',
      }))

      const wrapper = mountComponent({ chats: manyChats })
      expect(wrapper.findAll('.support-chat').length).toBe(3)

      await wrapper.find('.b-button').trigger('click')
      await nextTick()

      expect(wrapper.findAll('.support-chat').length).toBe(8)
    })

    it('hides the button after clicking', async () => {
      const manyChats = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `Chat ${i + 1}`,
        chattype: 'User2User',
      }))

      const wrapper = mountComponent({ chats: manyChats })
      expect(wrapper.find('.b-button').exists()).toBe(true)

      await wrapper.find('.b-button').trigger('click')
      await nextTick()

      expect(wrapper.find('.b-button').exists()).toBe(false)
    })
  })

  describe('ModSupportChat rendering', () => {
    it('renders a ModSupportChat for each visible chat', () => {
      const wrapper = mountComponent()
      const chats = wrapper.findAll('.support-chat')
      expect(chats.length).toBe(3)
    })

    it('passes chat data to ModSupportChat via stub', () => {
      const wrapper = mountComponent()
      const chats = wrapper.findAll('.support-chat')
      expect(chats.length).toBeGreaterThan(0)
      expect(chats[0].text()).toContain('Chat 1')
    })

    it('renders chats with correct pov', () => {
      const wrapper = mountComponent({ pov: 555 })
      const chats = wrapper.findAll('.support-chat')
      expect(chats.length).toBeGreaterThan(0)
    })

    it('uses correct key for each chat', () => {
      const wrapper = mountComponent()
      const chats = wrapper.findAll('.support-chat')
      expect(chats[0].attributes('data-chat-id')).toBe('1')
      expect(chats[1].attributes('data-chat-id')).toBe('2')
      expect(chats[2].attributes('data-chat-id')).toBe('3')
    })
  })

  describe('empty state', () => {
    it('shows "No chats" message when chats is empty', () => {
      const wrapper = mountComponent({ chats: [] })
      expect(wrapper.text()).toContain('No chats')
    })

    it('does not show "No chats" when there are visible chats', () => {
      const wrapper = mountComponent()
      const noticeMessages = wrapper.findAll('.notice-message')
      const noChatsMessages = noticeMessages.filter((n) =>
        n.text().includes('No chats')
      )
      expect(noChatsMessages.length).toBe(0)
    })
  })

  describe('chats array updates', () => {
    it('updates chatsShown when chats prop changes', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.chatsShown.length).toBe(3)

      await wrapper.setProps({
        chats: [
          ...defaultChats,
          { id: 4, name: 'Chat 4', chattype: 'User2User' },
          { id: 5, name: 'Chat 5', chattype: 'User2User' },
        ],
      })

      // Still only shows SHOW(3) because showAll is false
      expect(wrapper.vm.chatsShown.length).toBe(3)
      // But chatsUnshown now reflects the extra items
      expect(wrapper.vm.chatsUnshown).toBe(2)
    })

    it('shows all new chats when showAll is true', async () => {
      const wrapper = mountComponent()
      wrapper.vm.showAll = true
      await nextTick()

      await wrapper.setProps({
        chats: [
          ...defaultChats,
          { id: 4, name: 'Chat 4', chattype: 'User2User' },
          { id: 5, name: 'Chat 5', chattype: 'User2User' },
        ],
      })

      expect(wrapper.vm.chatsShown.length).toBe(5)
    })

    it('handles empty array update', async () => {
      const wrapper = mountComponent()
      await wrapper.setProps({ chats: [] })
      expect(wrapper.vm.chatsShown.length).toBe(0)
    })
  })

  describe('pov propagation', () => {
    it('updates pov when prop changes', async () => {
      const wrapper = mountComponent({ pov: 100 })
      expect(wrapper.props('pov')).toBe(100)

      await wrapper.setProps({ pov: 200 })
      expect(wrapper.props('pov')).toBe(200)
    })
  })

  describe('chat ordering', () => {
    it('preserves the order of chats from props', () => {
      const orderedChats = [
        { id: 5, name: 'Fifth Chat' },
        { id: 2, name: 'Second Chat' },
        { id: 8, name: 'Eighth Chat' },
      ]

      const wrapper = mountComponent({ chats: orderedChats })
      const chats = wrapper.findAll('.support-chat')
      expect(chats[0].attributes('data-chat-id')).toBe('5')
      expect(chats[1].attributes('data-chat-id')).toBe('2')
      expect(chats[2].attributes('data-chat-id')).toBe('8')
    })
  })

  describe('edge cases', () => {
    it('handles empty chats array gracefully', () => {
      const wrapper = mount(ModSupportChatList, {
        props: { chats: [] },
        global: {
          stubs: {
            ModSupportChat: true,
            NoticeMessage: {
              template: '<div class="notice-message"><slot /></div>',
            },
          },
        },
      })
      expect(wrapper.vm.chatsShown).toEqual([])
    })
  })

  describe('store population', () => {
    it('populates chat store with chat objects on mount', () => {
      mountComponent()
      expect(globalThis.__mockChatStore.listByChatId[1]).toEqual(
        defaultChats[0]
      )
      expect(globalThis.__mockChatStore.listByChatId[2]).toEqual(
        defaultChats[1]
      )
      expect(globalThis.__mockChatStore.listByChatId[3]).toEqual(
        defaultChats[2]
      )
    })

    it('updates chat store when chats prop changes', async () => {
      const wrapper = mountComponent()
      const newChat = { id: 99, name: 'New Chat', chattype: 'User2Mod' }

      await wrapper.setProps({
        chats: [...defaultChats, newChat],
      })

      expect(globalThis.__mockChatStore.listByChatId[99]).toEqual(newChat)
    })
  })
})
