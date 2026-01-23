import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ChatMessageNudge from '~/components/ChatMessageNudge.vue'

// Use vi.hoisted to ensure variables are available during mock factory execution
const { mockData } = vi.hoisted(() => {
  return {
    mockData: {
      me: { id: 1 },
      otheruser: { displayname: 'Test User' },
      chatmessage: { userid: 2 },
    },
  }
})

// Mock useMe composable
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    get me() {
      return mockData.me
    },
  }),
}))

// Mock useChatMessageBase composable
vi.mock('~/composables/useChat', () => ({
  useChatMessageBase: () => ({
    get otheruser() {
      return ref(mockData.otheruser)
    },
    get chatmessage() {
      return ref(mockData.chatmessage)
    },
  }),
}))

describe('ChatMessageNudge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockData.me = { id: 1 }
    mockData.otheruser = { displayname: 'Test User' }
    mockData.chatmessage = { userid: 2 }
  })

  function createWrapper(props = {}) {
    return mount(ChatMessageNudge, {
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
              '<div class="card" :class="\'border-\' + borderVariant"><slot /></div>',
            props: ['borderVariant'],
          },
          'b-card-title': {
            template: '<div class="card-title"><slot /></div>',
          },
          'b-card-text': { template: '<div class="card-text"><slot /></div>' },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders a card with warning border', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.border-warning').exists()).toBe(true)
    })

    it('renders bell icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.bell').exists()).toBe(true)
    })
  })

  describe('received nudge (from other user)', () => {
    beforeEach(() => {
      mockData.me = { id: 1 }
      mockData.chatmessage = { userid: 2 }
      mockData.otheruser = { displayname: 'Jane Doe' }
    })

    it('shows "You\'ve been nudged!" when message is from other user', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("You've been nudged!")
    })

    it('shows other user displayname in message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Jane Doe')
      expect(wrapper.text()).toContain('is waiting for you to reply')
    })

    it('shows "Someone" when otheruser is null', () => {
      mockData.otheruser = null
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Someone')
      expect(wrapper.text()).toContain('is waiting for you to reply')
    })
  })

  describe('sent nudge (from current user)', () => {
    beforeEach(() => {
      mockData.me = { id: 1 }
      mockData.chatmessage = { userid: 1 }
      mockData.otheruser = { displayname: 'Jane Doe' }
    })

    it('shows "You nudged them." when message is from current user', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('You nudged them.')
    })

    it('does not show waiting message for sent nudge', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('is waiting for you to reply')
    })
  })
})
