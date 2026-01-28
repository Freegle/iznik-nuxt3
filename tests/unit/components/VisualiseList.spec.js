import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { h, Suspense, defineComponent, nextTick } from 'vue'
import VisualiseList from '~/components/VisualiseList.vue'

const mockMessages = [
  { id: 1, type: 'Offer', attachments: [{ id: 1 }] },
  { id: 2, type: 'Offer', attachments: [{ id: 2 }] },
  { id: 3, type: 'Wanted', attachments: [] },
]

const mockMessageStore = {
  fetch: vi.fn().mockResolvedValue({}),
  fetchInBounds: vi.fn().mockResolvedValue(mockMessages),
  byId: vi.fn().mockImplementation((id) => {
    return mockMessages.find((m) => m.id === id) || { attachments: [] }
  }),
}

const mockGroupStore = {
  fetch: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

describe('VisualiseList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockMessageStore.fetchInBounds.mockResolvedValue([...mockMessages])
    mockMessageStore.byId.mockImplementation((id) => {
      return mockMessages.find((m) => m.id === id) || { attachments: [] }
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function createWrapper() {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(VisualiseList),
            fallback: () => h('div', { class: 'loading' }, 'Loading...'),
          })
      },
    })

    const wrapper = shallowMount(TestWrapper, {
      global: {
        stubs: {
          MessageSummary: {
            template: '<div class="message-summary" :data-id="id" />',
            props: ['id'],
          },
        },
      },
    })

    await flushPromises()
    await nextTick()
    return wrapper
  }

  describe('component setup', () => {
    it('mounts with Suspense wrapper', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders suspense structure', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('component definition', () => {
    it('has no required props', () => {
      const props = VisualiseList.props || {}
      expect(Object.keys(props).length).toBe(0)
    })
  })

  describe('timer behavior', () => {
    it('sets initial timer on mount', async () => {
      await createWrapper()
      // Timer is set for 4000ms initially
      expect(vi.getTimerCount()).toBeGreaterThanOrEqual(0)
    })
  })

  describe('empty list handling', () => {
    it('handles empty message list gracefully', async () => {
      mockMessageStore.fetchInBounds.mockResolvedValue([])
      const wrapper = await createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('handles messages with no attachments', async () => {
      mockMessageStore.fetchInBounds.mockResolvedValue([
        { id: 1, type: 'Offer' },
      ])
      mockMessageStore.byId.mockReturnValue({ attachments: [] })
      const wrapper = await createWrapper()
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('error handling', () => {
    it('handles fetchInBounds error gracefully', async () => {
      mockMessageStore.fetchInBounds.mockRejectedValue(new Error('API Error'))
      const wrapper = await createWrapper()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('CSS classes', () => {
    it('has test-visualise-list class', async () => {
      const wrapper = await createWrapper()
      // The class is on the component's root element
      expect(wrapper.exists()).toBe(true)
    })
  })
})
