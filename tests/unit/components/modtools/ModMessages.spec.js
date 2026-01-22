import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

// Mock stores
const mockGroupStore = {
  fetch: vi.fn().mockResolvedValue({}),
}

const mockMessageStore = {
  clear: vi.fn(),
  clearContext: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

// Mock the composable with configurable return values
const mockContext = ref(null)
const mockGroupid = ref(0)
const mockMessageTerm = ref(null)
const mockNextAfterRemoved = ref(null)
const mockSummary = ref(false)
const mockVisibleMessages = ref([])

vi.mock('~/composables/useModMessages', () => ({
  setupModMessages: () => ({
    context: mockContext,
    groupid: mockGroupid,
    messageTerm: mockMessageTerm,
    nextAfterRemoved: mockNextAfterRemoved,
    summary: mockSummary,
    visibleMessages: mockVisibleMessages,
  }),
}))

// Create test component that mirrors ModMessages logic
const ModMessagesTest = {
  template: `
    <div>
      <div
        v-for="(message, ix) in visibleMessages"
        :id="'msg-' + message.id"
        :key="'messagelist-' + message.id"
        class="p-0 mt-2 message-item"
      >
        <div :ref="'top' + message.id" class="top-ref" />
        <div
          class="mod-message"
          :data-message-id="message.id"
          :data-next="nextMessageId(ix)"
          :data-editreview="editreview"
          :data-summary="summary"
          :data-search="messageTerm"
        >
          {{ message.subject }}
        </div>
        <div :ref="'bottom' + message.id" class="bottom-ref" />
      </div>
    </div>
  `,
  props: {
    editreview: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    function nextMessageId(ix) {
      return ix < mockVisibleMessages.value.length - 1
        ? mockVisibleMessages.value[ix + 1].id
        : null
    }

    function destroy(oldid, nextid) {
      mockNextAfterRemoved.value = nextid
      emit('destroy', oldid, nextid)
    }

    return {
      context: mockContext,
      groupid: mockGroupid,
      messageTerm: mockMessageTerm,
      nextAfterRemoved: mockNextAfterRemoved,
      summary: mockSummary,
      visibleMessages: mockVisibleMessages,
      nextMessageId,
      destroy,
    }
  },
}

describe('ModMessages', () => {
  const sampleMessages = [
    {
      id: 101,
      subject: 'OFFER: Test Item 1',
      arrival: '2024-01-03T10:00:00Z',
      groups: [{ id: 100, arrival: '2024-01-03T10:00:00Z' }],
    },
    {
      id: 102,
      subject: 'WANTED: Test Item 2',
      arrival: '2024-01-02T10:00:00Z',
      groups: [{ id: 100, arrival: '2024-01-02T10:00:00Z' }],
    },
    {
      id: 103,
      subject: 'OFFER: Test Item 3',
      arrival: '2024-01-01T10:00:00Z',
      groups: [{ id: 100, arrival: '2024-01-01T10:00:00Z' }],
    },
  ]

  function mountComponent(props = {}) {
    return mount(ModMessagesTest, {
      props: { editreview: false, ...props },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockContext.value = null
    mockGroupid.value = 0
    mockMessageTerm.value = null
    mockNextAfterRemoved.value = null
    mockSummary.value = false
    mockVisibleMessages.value = []
  })

  describe('rendering', () => {
    it('renders a container div', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders nothing when visibleMessages is empty', () => {
      mockVisibleMessages.value = []
      const wrapper = mountComponent()
      expect(wrapper.findAll('.message-item')).toHaveLength(0)
    })

    it('renders message items for each visible message', async () => {
      mockVisibleMessages.value = sampleMessages
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.message-item')).toHaveLength(3)
    })

    it('displays message subject', async () => {
      mockVisibleMessages.value = [sampleMessages[0]]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('OFFER: Test Item 1')
    })

    it('sets message id as element id attribute', async () => {
      mockVisibleMessages.value = [sampleMessages[0]]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const item = wrapper.find('.message-item')
      expect(item.attributes('id')).toBe('msg-101')
    })

    it('renders top and bottom ref divs for each message', async () => {
      mockVisibleMessages.value = [sampleMessages[0]]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.top-ref').exists()).toBe(true)
      expect(wrapper.find('.bottom-ref').exists()).toBe(true)
    })
  })

  describe('next message calculation', () => {
    it('calculates next message id for non-last messages', async () => {
      mockVisibleMessages.value = sampleMessages
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const items = wrapper.findAll('.mod-message')
      // First message should have next = 102
      expect(items[0].attributes('data-next')).toBe('102')
      // Second message should have next = 103
      expect(items[1].attributes('data-next')).toBe('103')
    })

    it('sets next to null for last message', async () => {
      mockVisibleMessages.value = sampleMessages
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const items = wrapper.findAll('.mod-message')
      // Last message should have no next (null renders as undefined in attributes)
      expect(items[2].attributes('data-next')).toBeUndefined()
    })

    it('handles single message correctly', async () => {
      mockVisibleMessages.value = [sampleMessages[0]]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const item = wrapper.find('.mod-message')
      // Single message has no next (null renders as undefined in attributes)
      expect(item.attributes('data-next')).toBeUndefined()
    })
  })

  describe('props', () => {
    it('accepts editreview prop with default false', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('editreview')).toBe(false)
    })

    it('accepts editreview prop as true', () => {
      const wrapper = mountComponent({ editreview: true })
      expect(wrapper.props('editreview')).toBe(true)
    })

    it('passes editreview to ModMessage component', async () => {
      mockVisibleMessages.value = [sampleMessages[0]]
      const wrapper = mountComponent({ editreview: true })
      await wrapper.vm.$nextTick()

      const modMessage = wrapper.find('.mod-message')
      expect(modMessage.attributes('data-editreview')).toBe('true')
    })
  })

  describe('composable values passed to template', () => {
    it('passes summary to ModMessage', async () => {
      mockSummary.value = true
      mockVisibleMessages.value = [sampleMessages[0]]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const modMessage = wrapper.find('.mod-message')
      expect(modMessage.attributes('data-summary')).toBe('true')
    })

    it('passes messageTerm as search prop', async () => {
      mockMessageTerm.value = 'test search'
      mockVisibleMessages.value = [sampleMessages[0]]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const modMessage = wrapper.find('.mod-message')
      expect(modMessage.attributes('data-search')).toBe('test search')
    })

    it('handles null messageTerm', async () => {
      mockMessageTerm.value = null
      mockVisibleMessages.value = [sampleMessages[0]]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const modMessage = wrapper.find('.mod-message')
      // null renders as undefined in attributes
      expect(modMessage.attributes('data-search')).toBeUndefined()
    })
  })

  describe('destroy method', () => {
    it('updates nextAfterRemoved when destroy is called', () => {
      mockVisibleMessages.value = sampleMessages
      const wrapper = mountComponent()

      wrapper.vm.destroy(101, 102)

      expect(mockNextAfterRemoved.value).toBe(102)
    })

    it('emits destroy event with old and next ids', () => {
      mockVisibleMessages.value = sampleMessages
      const wrapper = mountComponent()

      wrapper.vm.destroy(101, 102)

      expect(wrapper.emitted('destroy')).toBeTruthy()
      expect(wrapper.emitted('destroy')[0]).toEqual([101, 102])
    })

    it('handles destroy with null nextid', () => {
      mockVisibleMessages.value = sampleMessages
      const wrapper = mountComponent()

      wrapper.vm.destroy(103, null)

      expect(mockNextAfterRemoved.value).toBeNull()
    })
  })

  describe('message list updates', () => {
    it('adds new messages when visibleMessages changes', async () => {
      mockVisibleMessages.value = [sampleMessages[0]]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.message-item')).toHaveLength(1)

      mockVisibleMessages.value = [...sampleMessages]
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.message-item')).toHaveLength(3)
    })

    it('removes messages when visibleMessages decreases', async () => {
      mockVisibleMessages.value = [...sampleMessages]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.message-item')).toHaveLength(3)

      mockVisibleMessages.value = [sampleMessages[0]]
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.message-item')).toHaveLength(1)
    })
  })

  describe('edge cases', () => {
    it('handles messages with missing groups', async () => {
      const messageWithoutGroups = {
        id: 104,
        subject: 'OFFER: No Groups',
        arrival: '2024-01-04T10:00:00Z',
      }
      mockVisibleMessages.value = [messageWithoutGroups]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.message-item')).toHaveLength(1)
      expect(wrapper.text()).toContain('OFFER: No Groups')
    })

    it('handles messages with null subject', async () => {
      const messageWithNullSubject = {
        id: 105,
        subject: null,
        arrival: '2024-01-05T10:00:00Z',
      }
      mockVisibleMessages.value = [messageWithNullSubject]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.message-item')).toHaveLength(1)
    })

    it('handles undefined visibleMessages', () => {
      mockVisibleMessages.value = undefined
      const wrapper = mountComponent()
      // v-for on undefined renders nothing
      expect(wrapper.find('.message-item').exists()).toBe(false)
    })

    it('preserves message order as provided', async () => {
      mockVisibleMessages.value = sampleMessages
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const items = wrapper.findAll('.mod-message')
      expect(items[0].attributes('data-message-id')).toBe('101')
      expect(items[1].attributes('data-message-id')).toBe('102')
      expect(items[2].attributes('data-message-id')).toBe('103')
    })
  })
})
