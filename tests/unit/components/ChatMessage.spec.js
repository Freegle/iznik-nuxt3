import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense, ref } from 'vue'
import ChatMessage from '~/components/ChatMessage.vue'

const { mockChat, mockChatMessage, mockOtherUser } = vi.hoisted(() => {
  return {
    mockChat: {
      id: 1,
      chattype: 'User2User',
    },
    mockChatMessage: {
      id: 100,
      type: 'Default',
      message: 'Hello there!',
      userid: 200,
      deleted: false,
      imageid: null,
    },
    mockOtherUser: {
      id: 200,
      displayname: 'Other User',
    },
  }
})

const mockChatStore = {
  markUnread: vi.fn().mockResolvedValue(undefined),
  deleteMessage: vi.fn().mockResolvedValue(undefined),
}

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

vi.mock('~/composables/useChat', () => ({
  setupChat: vi.fn().mockResolvedValue({
    chat: ref(mockChat),
    otheruser: ref(mockOtherUser),
    chatmessage: ref(mockChatMessage),
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myid: ref(1),
  }),
}))

describe('ChatMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(ChatMessage, {
                id: 100,
                chatid: 1,
                ...props,
              }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'b-button': {
            template:
              '<button class="b-button" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
            emits: ['click'],
          },
          ChatMessageText: {
            template: '<div class="chat-message-text" />',
            props: ['id', 'chatid', 'pov', 'highlightEmails'],
          },
          ChatMessageImage: {
            template: '<div class="chat-message-image" />',
            props: ['id', 'chatid', 'pov'],
            emits: ['delete'],
          },
          ChatMessageInterested: {
            template: '<div class="chat-message-interested" />',
            props: ['id', 'chatid', 'pov', 'highlightEmails'],
          },
          ChatMessageCompleted: {
            template: '<div class="chat-message-completed" />',
            props: ['id', 'chatid', 'pov'],
          },
          ChatMessagePromised: {
            template: '<div class="chat-message-promised" />',
            props: ['id', 'chatid', 'pov'],
          },
          ChatMessageReneged: {
            template: '<div class="chat-message-reneged" />',
            props: ['id', 'chatid', 'pov'],
          },
          ChatMessageAddress: {
            template: '<div class="chat-message-address" />',
            props: ['id', 'chatid', 'pov'],
          },
          ChatMessageNudge: {
            template: '<div class="chat-message-nudge" />',
            props: ['id', 'chatid', 'pov'],
          },
          ChatMessageReport: {
            template: '<div class="chat-message-report" />',
            props: ['id', 'chatid', 'pov'],
          },
          ChatMessageModMail: {
            template: '<div class="chat-message-mod-mail" />',
            props: ['id', 'chatid', 'pov'],
          },
          ChatMessageReminder: {
            template: '<div class="chat-message-reminder" />',
            props: ['id', 'chatid', 'pov'],
          },
          ChatMessageDateRead: {
            template: '<div class="chat-message-date-read" />',
            props: ['id', 'chatid', 'last', 'pov'],
          },
          ChatMessageWarning: {
            template: '<div class="chat-message-warning" />',
          },
          ConfirmModal: {
            template: '<div class="confirm-modal" />',
            emits: ['confirm', 'hidden'],
          },
          ResultModal: {
            template: '<div class="result-modal" />',
            props: ['title'],
            emits: ['hidden'],
          },
          SupportLink: {
            template: '<a class="support-link" />',
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders chat message container', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders ChatMessageText for Default type', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-message-text').exists()).toBe(true)
    })

    it('renders ChatMessageDateRead', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-message-date-read').exists()).toBe(true)
    })
  })

  describe('message types', () => {
    it('renders Image type correctly', async () => {
      const { setupChat } = await import('~/composables/useChat')
      setupChat.mockResolvedValueOnce({
        chat: ref(mockChat),
        otheruser: ref(mockOtherUser),
        chatmessage: ref({ ...mockChatMessage, type: 'Image' }),
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-message-image').exists()).toBe(true)
    })

    it('renders Interested type correctly', async () => {
      const { setupChat } = await import('~/composables/useChat')
      setupChat.mockResolvedValueOnce({
        chat: ref(mockChat),
        otheruser: ref(mockOtherUser),
        chatmessage: ref({ ...mockChatMessage, type: 'Interested' }),
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-message-interested').exists()).toBe(true)
    })

    it('renders Completed type correctly', async () => {
      const { setupChat } = await import('~/composables/useChat')
      setupChat.mockResolvedValueOnce({
        chat: ref(mockChat),
        otheruser: ref(mockOtherUser),
        chatmessage: ref({ ...mockChatMessage, type: 'Completed' }),
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-message-completed').exists()).toBe(true)
    })

    it('renders Promised type correctly', async () => {
      const { setupChat } = await import('~/composables/useChat')
      setupChat.mockResolvedValueOnce({
        chat: ref(mockChat),
        otheruser: ref(mockOtherUser),
        chatmessage: ref({ ...mockChatMessage, type: 'Promised' }),
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-message-promised').exists()).toBe(true)
    })

    it('renders Reneged type correctly', async () => {
      const { setupChat } = await import('~/composables/useChat')
      setupChat.mockResolvedValueOnce({
        chat: ref(mockChat),
        otheruser: ref(mockOtherUser),
        chatmessage: ref({ ...mockChatMessage, type: 'Reneged' }),
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-message-reneged').exists()).toBe(true)
    })

    it('renders Address type correctly', async () => {
      const { setupChat } = await import('~/composables/useChat')
      setupChat.mockResolvedValueOnce({
        chat: ref(mockChat),
        otheruser: ref(mockOtherUser),
        chatmessage: ref({ ...mockChatMessage, type: 'Address' }),
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-message-address').exists()).toBe(true)
    })

    it('renders ModMail type correctly', async () => {
      const { setupChat } = await import('~/composables/useChat')
      setupChat.mockResolvedValueOnce({
        chat: ref(mockChat),
        otheruser: ref(mockOtherUser),
        chatmessage: ref({ ...mockChatMessage, type: 'ModMail' }),
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-message-mod-mail').exists()).toBe(true)
    })

    it('renders Reminder type correctly', async () => {
      const { setupChat } = await import('~/composables/useChat')
      setupChat.mockResolvedValueOnce({
        chat: ref(mockChat),
        otheruser: ref(mockOtherUser),
        chatmessage: ref({ ...mockChatMessage, type: 'Reminder' }),
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.chat-message-reminder').exists()).toBe(true)
    })
  })

  describe('selection', () => {
    it('applies selected class when clicked', async () => {
      const wrapper = await createWrapper()
      await wrapper.find('div').trigger('click')
      await flushPromises()
      expect(wrapper.find('.selected').exists()).toBe(true)
    })

    it('does not select deleted messages', async () => {
      const { setupChat } = await import('~/composables/useChat')
      setupChat.mockResolvedValueOnce({
        chat: ref(mockChat),
        otheruser: ref(mockOtherUser),
        chatmessage: ref({ ...mockChatMessage, deleted: true }),
      })
      const wrapper = await createWrapper()
      await wrapper.find('div').trigger('click')
      await flushPromises()
      expect(wrapper.find('.selected').exists()).toBe(false)
    })
  })

  describe('deleted state', () => {
    it('applies deleted class for deleted messages', async () => {
      const { setupChat } = await import('~/composables/useChat')
      setupChat.mockResolvedValueOnce({
        chat: ref(mockChat),
        otheruser: ref(mockOtherUser),
        chatmessage: ref({ ...mockChatMessage, deleted: true }),
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.deleted').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('passes last prop to ChatMessageDateRead', async () => {
      const wrapper = await createWrapper({ last: true })
      const dateRead = wrapper.findComponent('.chat-message-date-read')
      expect(dateRead.props('last')).toBe(true)
    })

    it('passes pov prop', async () => {
      const wrapper = await createWrapper({ pov: 200 })
      expect(wrapper.exists()).toBe(true)
    })

    it('passes highlightEmails prop', async () => {
      const wrapper = await createWrapper({ highlightEmails: true })
      const textMessage = wrapper.findComponent('.chat-message-text')
      expect(textMessage.props('highlightEmails')).toBe(true)
    })
  })

  describe('mark unread', () => {
    it('shows mark unread button when selected for other user message', async () => {
      const wrapper = await createWrapper()
      await wrapper.find('div').trigger('click')
      await flushPromises()
      expect(wrapper.text()).toContain('Mark unread')
    })

    it('calls markUnread on chat store when clicked', async () => {
      const wrapper = await createWrapper({ prevmessage: 99 })
      await wrapper.find('div').trigger('click')
      await flushPromises()
      const markUnreadBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Mark unread'))
      if (markUnreadBtn) {
        await markUnreadBtn.trigger('click')
        expect(mockChatStore.markUnread).toHaveBeenCalledWith(1, 99)
      }
    })
  })

  describe('delete message', () => {
    it('shows delete button when selected for own message', async () => {
      const { setupChat } = await import('~/composables/useChat')
      setupChat.mockResolvedValueOnce({
        chat: ref(mockChat),
        otheruser: ref(mockOtherUser),
        chatmessage: ref({ ...mockChatMessage, userid: 1 }),
      })
      const wrapper = await createWrapper()
      await wrapper.find('div').trigger('click')
      await flushPromises()
      expect(wrapper.text()).toContain('Delete')
    })
  })
})
