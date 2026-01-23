import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ChatMessageCompleted from '~/components/ChatMessageCompleted.vue'

// Use vi.hoisted to ensure variables are available during mock factory execution
const { mockData, mockFetchMessage } = vi.hoisted(() => {
  return {
    mockData: {
      myid: 1,
      chatmessage: { id: 101, userid: 2, refmsgid: 200 },
      emessage: 'Test message',
      refmsg: { id: 200, type: 'Offer', subject: 'Test item' },
      refmsgid: 200,
    },
    mockFetchMessage: vi.fn().mockResolvedValue(),
  }
})

// Mock useChatMessageBase composable
vi.mock('~/composables/useChat', () => ({
  useChatMessageBase: () => ({
    get chatmessage() {
      return ref(mockData.chatmessage)
    },
    get emessage() {
      return ref(mockData.emessage)
    },
    get refmsg() {
      return ref(mockData.refmsg)
    },
    get refmsgid() {
      return ref(mockData.refmsgid)
    },
    get myid() {
      return mockData.myid
    },
  }),
}))

// Mock message store
vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    fetch: mockFetchMessage,
  }),
}))

describe('ChatMessageCompleted', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockData.myid = 1
    mockData.chatmessage = { id: 101, userid: 2, refmsgid: 200 }
    mockData.emessage = 'Test message'
    mockData.refmsg = { id: 200, type: 'Offer', subject: 'Test item' }
    mockData.refmsgid = 200
  })

  function createWrapper(props = {}) {
    return mount(ChatMessageCompleted, {
      props: {
        chatid: 123,
        id: 456,
        ...props,
      },
      global: {
        stubs: {
          ChatMessageCard: {
            template: '<div class="chat-message-card" :data-id="id"></div>',
            props: ['id', 'showLocation'],
          },
          'notice-message': {
            template: '<div class="notice-message"><slot /></div>',
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
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

    it('renders the completed wrapper', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.completed-wrapper').exists()).toBe(true)
    })

    it('renders ChatMessageCard', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-message-card').exists()).toBe(true)
    })

    it('passes refmsgid to ChatMessageCard', () => {
      mockData.refmsgid = 999
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-message-card').attributes('data-id')).toBe(
        '999'
      )
    })
  })

  describe('props', () => {
    it('requires chatid prop', () => {
      const wrapper = createWrapper({ chatid: 789 })
      expect(wrapper.props('chatid')).toBe(789)
    })

    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 999 })
      expect(wrapper.props('id')).toBe(999)
    })

    it('defaults last to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('last')).toBe(false)
    })

    it('accepts last prop', () => {
      const wrapper = createWrapper({ last: true })
      expect(wrapper.props('last')).toBe(true)
    })

    it('defaults pov to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('pov')).toBe(null)
    })

    it('defaults highlightEmails to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('highlightEmails')).toBe(false)
    })
  })

  describe('received completion (from other user)', () => {
    beforeEach(() => {
      mockData.myid = 1
      mockData.chatmessage = { id: 101, userid: 2, refmsgid: 200 }
    })

    it('shows received completion when message is from other user', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.completed-message').exists()).toBe(true)
      expect(wrapper.find('.completed-message--mine').exists()).toBe(false)
    })

    it('shows "no longer available" for Offer type', () => {
      mockData.refmsg = { id: 200, type: 'Offer' }
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('This is no longer available.')
    })

    it('shows "received" message for non-Offer type', () => {
      mockData.refmsg = { id: 200, type: 'Wanted' }
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Thanks, this has now been received.')
    })

    it('shows emessage when present', () => {
      mockData.emessage = 'Custom completion message'
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Custom completion message')
    })

    it('shows automated message note when no emessage', () => {
      mockData.emessage = null
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('This is an automated message.')
    })
  })

  describe('sent completion (from current user)', () => {
    beforeEach(() => {
      mockData.myid = 1
      mockData.chatmessage = { id: 101, userid: 1, refmsgid: 200 }
    })

    it('shows sent completion with --mine class when message is from current user', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.completed-message--mine').exists()).toBe(true)
    })

    it('shows "let them know" for Offer type from current user', () => {
      mockData.refmsg = { id: 200, type: 'Offer' }
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(
        "We've let them know this is no longer available."
      )
    })

    it('shows "received" message for non-Offer type from current user', () => {
      mockData.refmsg = { id: 200, type: 'Wanted' }
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('This has now been received.')
    })
  })

  describe('deleted reference message', () => {
    beforeEach(() => {
      mockData.refmsg = null
    })

    it('shows deleted message notice when refmsg is null (received)', () => {
      mockData.chatmessage = { id: 101, userid: 2, refmsgid: 200 }
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('This chat message refers to a post')
      expect(wrapper.text()).toContain('which has been deleted')
    })

    it('shows deleted message notice when refmsg is null (sent)', () => {
      mockData.chatmessage = { id: 101, userid: 1, refmsgid: 200 }
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('This chat message refers to a post')
    })
  })

  describe('message store fetch', () => {
    it('fetches refmsgid from message store when available', () => {
      mockData.refmsgid = 500
      createWrapper()
      expect(mockFetchMessage).toHaveBeenCalledWith(500)
    })
  })
})
