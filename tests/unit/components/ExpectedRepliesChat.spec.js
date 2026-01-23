import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { Suspense, defineComponent, h } from 'vue'
import ExpectedRepliesChat from '~/components/ExpectedRepliesChat.vue'

// Mock chat store with reactive state
let chatData = { name: 'John Smith' }
const mockFetchChat = vi.fn().mockResolvedValue(undefined)

vi.mock('~/stores/chat', () => ({
  useChatStore: () => ({
    fetchChat: mockFetchChat,
    byChatId: () => chatData,
  }),
}))

describe('ExpectedRepliesChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    chatData = { name: 'John Smith' }
  })

  // Wrap async component in Suspense
  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      render() {
        return h(Suspense, null, {
          default: () => h(ExpectedRepliesChat, { id: 123, ...props }),
        })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'b-button': {
            template:
              '<button :class="variant" :data-to="to"><slot /></button>',
            props: ['variant', 'size', 'to'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('displays chat name in button text', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Reply to John Smith now')
    })

    it('button has primary variant', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('button').classes()).toContain('primary')
    })

    it('button links to correct chat', async () => {
      const wrapper = await createWrapper({ id: 456 })
      expect(wrapper.find('button').attributes('data-to')).toBe('/chats/456')
    })
  })

  describe('store interactions', () => {
    it('fetches chat on mount', async () => {
      await createWrapper({ id: 789 })
      expect(mockFetchChat).toHaveBeenCalledWith(789)
    })
  })

  describe('with different chat names', () => {
    it('shows different chat name', async () => {
      chatData = { name: 'Jane Doe' }
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Reply to Jane Doe now')
    })

    it('handles null chat gracefully', async () => {
      chatData = null
      const wrapper = await createWrapper()
      // Should still render without error
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('id prop is Number type', () => {
      const props = ExpectedRepliesChat.props
      expect(props.id.type).toBe(Number)
    })
  })
})
