import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, defineComponent, Suspense, h } from 'vue'
import InterestedInOthersModal from '~/components/InterestedInOthersModal.vue'

// Use vi.hoisted for mock setup
const { mockHide, mockFetchByUser, mockFetchUser, mockData } = vi.hoisted(
  () => ({
    mockHide: vi.fn(),
    mockFetchByUser: vi.fn().mockResolvedValue(),
    mockFetchUser: vi.fn().mockResolvedValue(),
    mockData: {
      messages: [],
      user: { id: 1, displayname: 'Test User', profile: { path: '/img.jpg' } },
    },
  })
)

// Mock useOurModal
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

// Mock message store
vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    fetchByUser: mockFetchByUser,
    byUser: () => mockData.messages,
  }),
}))

// Mock user store
vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    fetch: mockFetchUser,
    byId: () => mockData.user,
  }),
}))

describe('InterestedInOthersModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockData.messages = [
      { id: 1, subject: 'First item' },
      { id: 2, subject: 'Second item' },
      { id: 3, subject: 'Third item' },
    ]
    mockData.user = {
      id: 1,
      displayname: 'Test User',
      profile: { path: '/img.jpg' },
    }
  })

  // Wrap async component in Suspense for testing
  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      render() {
        return h(
          Suspense,
          {},
          {
            default: () =>
              h(InterestedInOthersModal, {
                msgid: 1,
                userid: 1,
                ...props,
              }),
            fallback: () => h('div', 'Loading...'),
          }
        )
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'b-modal': {
            template: `
              <div class="modal" data-testid="modal">
                <div class="modal-title"><slot name="title"></slot></div>
                <slot></slot>
                <div class="modal-footer"><slot name="footer"></slot></div>
              </div>
            `,
            props: ['scrollable', 'size'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          ProfileImage: {
            template: '<img :src="image" class="profile-image" />',
            props: ['image', 'isThumbnail', 'size'],
          },
          MessageList: {
            template:
              '<div class="message-list" :data-count="messagesForList.length"></div>',
            props: ['messagesForList', 'jobs', 'small'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('data fetching', () => {
    it('fetches messages for user on mount', async () => {
      await createWrapper({ userid: 123 })
      expect(mockFetchByUser).toHaveBeenCalledWith(123, true, true)
    })

    it('fetches user data on mount', async () => {
      await createWrapper({ userid: 456 })
      expect(mockFetchUser).toHaveBeenCalledWith(456)
    })
  })

  describe('rendering', () => {
    it('shows user displayname in title', async () => {
      mockData.user = {
        id: 1,
        displayname: 'Jane Doe',
        profile: { path: '/jane.jpg' },
      }
      const wrapper = await createWrapper()
      expect(wrapper.find('.modal-title').text()).toContain('Others from')
      expect(wrapper.find('.modal-title').text()).toContain('Jane Doe')
    })

    it('renders profile image when user has one', async () => {
      mockData.user = {
        id: 1,
        displayname: 'Jane',
        profile: { path: '/profile.jpg' },
      }
      const wrapper = await createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('shows instruction text', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Check out their other posts')
    })

    it('renders MessageList component', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.message-list').exists()).toBe(true)
    })

    it('shows Close button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Close')
    })
  })

  describe('otherMessages computed', () => {
    it('filters out current message from list', async () => {
      mockData.messages = [
        { id: 1, subject: 'Current' },
        { id: 2, subject: 'Other 1' },
        { id: 3, subject: 'Other 2' },
      ]
      const wrapper = await createWrapper({ msgid: 1 })
      const messageList = wrapper.find('.message-list')
      // Should show 2 messages (filtered out msgid 1)
      expect(messageList.attributes('data-count')).toBe('2')
    })

    it('shows all messages when msgid not in list', async () => {
      mockData.messages = [
        { id: 2, subject: 'Other 1' },
        { id: 3, subject: 'Other 2' },
      ]
      const wrapper = await createWrapper({ msgid: 999 })
      const messageList = wrapper.find('.message-list')
      expect(messageList.attributes('data-count')).toBe('2')
    })
  })

  describe('auto-hide behavior', () => {
    it('calls hide when no other messages to show', async () => {
      mockData.messages = [{ id: 1, subject: 'Only current message' }]
      await createWrapper({ msgid: 1 })
      // After filtering, there are no other messages, so hide should be called
      expect(mockHide).toHaveBeenCalled()
    })

    it('does not call hide when other messages exist', async () => {
      mockData.messages = [
        { id: 1, subject: 'Current' },
        { id: 2, subject: 'Another' },
      ]
      await createWrapper({ msgid: 1 })
      // After filtering, there's 1 other message, so hide should NOT be called
      expect(mockHide).not.toHaveBeenCalled()
    })
  })

  describe('close action', () => {
    it('calls hide when Close is clicked', async () => {
      const wrapper = await createWrapper()
      mockHide.mockClear() // Clear any auto-hide calls

      const closeBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Close'))
      await closeBtn.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })
  })
})
