import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { modalBootstrapStubs } from '../mocks/bootstrap-stubs'
import ChatRSVPModal from '~/components/ChatRSVPModal.vue'

const { mockPush, mockHide, mockRsvp, mockHideChat, mockData, mockUserId } =
  vi.hoisted(() => ({
    mockPush: vi.fn(),
    mockHide: vi.fn(),
    mockRsvp: vi.fn(),
    mockHideChat: vi.fn(),
    mockData: { messages: [] },
    mockUserId: { value: 1 },
  }))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

vi.mock('~/stores/chat', () => ({
  useChatStore: () => ({
    rsvp: mockRsvp,
    hide: mockHideChat,
    messagesById: () => mockData.messages,
  }),
}))

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
      global: { stubs: modalBootstrapStubs },
    })
  }

  describe('rendering', () => {
    it('shows title, user name, and response buttons', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.modal-title').text()).toBe('Do you expect a reply?')
      expect(wrapper.text()).toContain('Test User')
      expect(wrapper.text()).toContain('Yes, I expect a reply')
      expect(wrapper.text()).toContain('No reply expected')
    })
  })

  describe('rsvp actions', () => {
    it.each([
      ['Yes', 1],
      ['No', 0],
    ])(
      '%s button calls rsvp with %d when message exists',
      async (buttonText, rsvpValue) => {
        mockData.messages = [{ id: 100, chatid: 123, userid: '1' }]
        const wrapper = createWrapper()
        const btn = wrapper
          .findAll('button')
          .find((b) => b.text().includes(buttonText))
        await btn.trigger('click')
        expect(mockRsvp).toHaveBeenCalledWith(100, 123, rsvpValue)
        expect(mockHide).toHaveBeenCalled()
      }
    )

    it('does not call rsvp when no messages from current user', async () => {
      mockData.messages = [{ id: 1, chatid: 123, userid: '2' }]
      const wrapper = createWrapper()
      const yesBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Yes'))
      await yesBtn.trigger('click')
      expect(mockRsvp).not.toHaveBeenCalled()
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('mylast computed', () => {
    it('finds the last message from current user', async () => {
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
      expect(mockRsvp).toHaveBeenCalledWith(4, 123, 1)
    })
  })
})
