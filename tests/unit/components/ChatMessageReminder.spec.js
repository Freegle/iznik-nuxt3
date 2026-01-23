import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ChatMessageReminder from '~/components/ChatMessageReminder.vue'

// Use vi.hoisted to ensure variables are available during mock factory execution
const { mockData } = vi.hoisted(() => {
  return {
    mockData: {
      myid: 1,
      chat: { user: { id: 1 }, lastmsgseen: 100 },
      chatmessage: { id: 101, secondsago: 120, message: 'Test reminder' },
      emessage: 'Test reminder',
    },
  }
})

// Mock useChatMessageBase composable
vi.mock('~/composables/useChat', () => ({
  useChatMessageBase: () => ({
    get chat() {
      return ref(mockData.chat)
    },
    get chatmessage() {
      return ref(mockData.chatmessage)
    },
    get emessage() {
      return ref(mockData.emessage)
    },
    get myid() {
      return mockData.myid
    },
  }),
}))

describe('ChatMessageReminder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockData.myid = 1
    mockData.chat = { user: { id: 1 }, lastmsgseen: 100 }
    mockData.chatmessage = {
      id: 101,
      secondsago: 120,
      message: 'Test reminder',
    }
    mockData.emessage = 'Test reminder'
  })

  function createWrapper(props = {}) {
    return mount(ChatMessageReminder, {
      props: {
        chatid: 123,
        id: 456,
        ...props,
      },
      global: {
        stubs: {
          'b-row': { template: '<div class="row"><slot /></div>' },
          'b-col': { template: '<div class="col"><slot /></div>' },
          'b-card': {
            template:
              '<div class="card" :class="[\'border-\' + borderVariant, customClass]"><slot /></div>',
            props: ['borderVariant'],
            computed: {
              customClass() {
                return this.$attrs.class
              },
            },
          },
          'b-card-title': {
            template: '<div class="card-title"><slot /></div>',
          },
          'b-card-text': { template: '<div class="card-text"><slot /></div>' },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders a card with success border', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.border-success').exists()).toBe(true)
    })

    it('shows Reminder title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Reminder:')
    })

    it('shows automated message note', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('This is an automated message.')
    })
  })

  describe('message display', () => {
    it('displays the reminder message', () => {
      mockData.emessage = 'Please remember to collect your item!'
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Please remember to collect your item!')
    })

    it('shows bold text for new messages (secondsago < 60)', () => {
      mockData.chatmessage = {
        id: 101,
        secondsago: 30,
        message: 'New reminder',
      }
      mockData.chat = { user: { id: 1 }, lastmsgseen: 100 }
      const wrapper = createWrapper()
      expect(wrapper.find('.font-weight-bold').exists()).toBe(true)
    })

    it('shows bold text for unseen messages (id > lastmsgseen)', () => {
      mockData.chatmessage = {
        id: 150,
        secondsago: 120,
        message: 'Unseen reminder',
      }
      mockData.chat = { user: { id: 1 }, lastmsgseen: 100 }
      const wrapper = createWrapper()
      expect(wrapper.find('.font-weight-bold').exists()).toBe(true)
    })

    it('shows regular text for old seen messages', () => {
      mockData.chatmessage = {
        id: 50,
        secondsago: 120,
        message: 'Old reminder',
      }
      mockData.chat = { user: { id: 1 }, lastmsgseen: 100 }
      const wrapper = createWrapper()
      expect(wrapper.find('.preline').exists()).toBe(true)
    })
  })

  describe('amUser computed', () => {
    it('renders card when user matches chat user', () => {
      mockData.myid = 5
      mockData.chat = { user: { id: 5 }, lastmsgseen: 100 }
      const wrapper = createWrapper()
      // Just verify component renders without error when user matches
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('renders card when user does not match chat user', () => {
      mockData.myid = 5
      mockData.chat = { user: { id: 10 }, lastmsgseen: 100 }
      const wrapper = createWrapper()
      // Just verify component renders without error when user doesn't match
      expect(wrapper.find('.card').exists()).toBe(true)
    })
  })
})
