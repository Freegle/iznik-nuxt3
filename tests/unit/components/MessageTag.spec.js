import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MessageTag from '~/components/MessageTag.vue'

const mockMessage = {
  id: 123,
  type: 'Offer',
  groups: [{ groupid: 1 }],
}

const mockGroup = {
  id: 1,
  settings: {
    keywords: {
      offer: 'OFFERING',
      wanted: 'SEEKING',
    },
  },
}

const mockMessageStore = {
  byId: vi.fn().mockReturnValue(mockMessage),
  fetch: vi.fn().mockResolvedValue(mockMessage),
}

const mockGroupStore = {
  get: vi.fn().mockReturnValue(mockGroup),
  fetch: vi.fn().mockResolvedValue(mockGroup),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

describe('MessageTag', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageStore.byId.mockReturnValue({ ...mockMessage })
    mockGroupStore.get.mockReturnValue({ ...mockGroup })
  })

  function createWrapper(props = {}) {
    return mount(MessageTag, {
      props: {
        id: 123,
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('renders tagbadge container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.tagbadge').exists()).toBe(true)
    })

    it('applies font-weight-bold class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.font-weight-bold').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 456 })
      expect(wrapper.props('id')).toBe(456)
    })

    it('has optional def prop with false default', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('def')).toBe(false)
    })

    it('applies tagdef class when def is true', () => {
      const wrapper = createWrapper({ def: true })
      expect(wrapper.find('.tagdef').exists()).toBe(true)
    })

    it('has optional inline prop with false default', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('inline')).toBe(false)
    })

    it('applies inline class when inline is true', () => {
      const wrapper = createWrapper({ inline: true })
      expect(wrapper.find('.inline').exists()).toBe(true)
    })
  })

  describe('tag display', () => {
    it('displays custom offer keyword from group settings', () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        type: 'Offer',
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toBe('OFFERING')
    })

    it('displays custom wanted keyword from group settings', () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        type: 'Wanted',
      })
      mockGroupStore.get.mockReturnValue({
        ...mockGroup,
        settings: {
          keywords: { wanted: 'SEEKING' },
        },
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toBe('SEEKING')
    })

    it('falls back to OFFER when no custom keyword', () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        type: 'Offer',
      })
      mockGroupStore.get.mockReturnValue({
        ...mockGroup,
        settings: { keywords: {} },
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toBe('OFFER')
    })

    it('falls back to WANTED when no custom keyword', () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        type: 'Wanted',
      })
      mockGroupStore.get.mockReturnValue({
        ...mockGroup,
        settings: { keywords: {} },
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toBe('WANTED')
    })
  })

  describe('wanted styling', () => {
    it('applies tagbadge--wanted class for Wanted type', () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        type: 'Wanted',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.tagbadge--wanted').exists()).toBe(true)
    })

    it('does not apply tagbadge--wanted for Offer type', () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        type: 'Offer',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.tagbadge--wanted').exists()).toBe(false)
    })
  })

  describe('data fetching on mount', () => {
    it('fetches message on mount', async () => {
      createWrapper({ id: 789 })
      await flushPromises()
      expect(mockMessageStore.fetch).toHaveBeenCalledWith(789)
    })

    it('fetches groups for the message', async () => {
      mockMessageStore.fetch.mockResolvedValue({
        ...mockMessage,
        groups: [{ groupid: 1 }, { groupid: 2 }],
      })
      createWrapper()
      await flushPromises()
      expect(mockGroupStore.fetch).toHaveBeenCalledWith(1)
      expect(mockGroupStore.fetch).toHaveBeenCalledWith(2)
    })

    it('handles message without groups', async () => {
      mockMessageStore.fetch.mockResolvedValue({
        ...mockMessage,
        groups: null,
      })
      createWrapper()
      await flushPromises()
      expect(mockGroupStore.fetch).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles null message', () => {
      mockMessageStore.byId.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.text()).toBe('')
    })

    it('handles message with no groups', () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        groups: [],
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toBe('')
    })

    it('handles group not found in store', () => {
      mockGroupStore.get.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.text()).toBe('')
    })
  })
})
