import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ChatRSVPModal from '~/components/ChatRSVPModal.vue'

// Use vi.hoisted to ensure variables are available during mock factory execution
const { mockPush, mockHide, mockRsvp, mockHideChat, mockData, mockUserId } =
  vi.hoisted(() => {
    return {
      mockPush: vi.fn(),
      mockHide: vi.fn(),
      mockRsvp: vi.fn(),
      mockHideChat: vi.fn(),
      mockData: { messages: [] },
      mockUserId: { value: 1 },
    }
  })

// Mock useRouter
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock useOurModal
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

// Mock chat store
vi.mock('~/stores/chat', () => ({
  useChatStore: () => ({
    rsvp: mockRsvp,
    hide: mockHideChat,
    messagesById: () => mockData.messages,
  }),
}))

// Mock auth store - use getter to make user reactive
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    get user() {
      return { id: mockUserId.value }
    },
  }),
}))

describe('ChatRSVPModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUserId.value = 1
    mockData.messages = []
  })

  function createWrapper(props = {}) {
    return mount(ChatRSVPModal, {
      props: {
        id: 123,
        user: { displayname: 'Test User' },
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template: `
              <div class="modal" data-testid="modal">
                <div class="modal-title">{{ title }}</div>
                <slot></slot>
                <div class="modal-footer"><slot name="footer"></slot></div>
              </div>
            `,
            props: [
              'title',
              'scrollable',
              'noStacking',
              'noCloseOnBackdrop',
              'hideHeaderClose',
              'noCloseOnEsc',
            ],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
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

    it('shows default title when not chase up', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.modal-title').text()).toBe('Do you expect a reply?')
    })

    it('shows user displayname in message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Test User')
    })

    it('shows Yes button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Yes, I expect a reply')
    })

    it('shows No button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('No reply expected')
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 456 })
      expect(wrapper.props('id')).toBe(456)
    })

    it('requires user prop with displayname', () => {
      const wrapper = createWrapper({
        user: { displayname: 'Jane Smith', id: 789 },
      })
      expect(wrapper.props('user').displayname).toBe('Jane Smith')
    })
  })

  describe('yes action', () => {
    it('calls hide when Yes is clicked', async () => {
      const wrapper = createWrapper()
      const yesBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Yes'))
      await yesBtn.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })

    it('calls rsvp with 1 when Yes is clicked and has last message', async () => {
      // Set mock data BEFORE creating wrapper
      const mockMsg = { id: 100, chatid: 123, userid: '1' }
      mockData.messages = [mockMsg]

      const wrapper = createWrapper()
      const yesBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Yes'))
      await yesBtn.trigger('click')

      expect(mockRsvp).toHaveBeenCalledWith(100, 123, 1)
    })
  })

  describe('no action', () => {
    it('calls hide when No is clicked', async () => {
      const wrapper = createWrapper()
      const noBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('No'))
      await noBtn.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })

    it('calls rsvp with 0 when No is clicked and has last message', async () => {
      // Set mock data BEFORE creating wrapper
      const mockMsg = { id: 100, chatid: 123, userid: '1' }
      mockData.messages = [mockMsg]

      const wrapper = createWrapper()
      const noBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('No'))
      await noBtn.trigger('click')

      expect(mockRsvp).toHaveBeenCalledWith(100, 123, 0)
    })
  })

  describe('mylast computed', () => {
    it('finds the last message from current user', async () => {
      // Set mock data BEFORE creating wrapper
      mockData.messages = [
        { id: 1, chatid: 123, userid: '2' },
        { id: 2, chatid: 123, userid: '1' },
        { id: 3, chatid: 123, userid: '2' },
        { id: 4, chatid: 123, userid: '1' },
      ]

      const wrapper = createWrapper()
      const yesBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Yes'))
      await yesBtn.trigger('click')

      // Should use message id 4 (last message from user 1)
      expect(mockRsvp).toHaveBeenCalledWith(4, 123, 1)
    })

    it('returns null when no messages from current user', async () => {
      // Set mock data BEFORE creating wrapper
      mockData.messages = [
        { id: 1, chatid: 123, userid: '2' },
        { id: 2, chatid: 123, userid: '3' },
      ]

      const wrapper = createWrapper()
      const yesBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Yes'))
      await yesBtn.trigger('click')

      // Should not call rsvp since no matching message
      expect(mockRsvp).not.toHaveBeenCalled()
      expect(mockHide).toHaveBeenCalled()
    })
  })
})
