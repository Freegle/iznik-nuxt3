import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageDeadline from '~/components/MessageDeadline.vue'

// Mock message store
const mockByIdFn = vi.fn()

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    byId: mockByIdFn,
  }),
}))

describe('MessageDeadline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(MessageDeadline, {
      props: { id: 123, ...props },
      global: {
        stubs: {
          'b-badge': {
            template: '<span class="b-badge" :class="variant"><slot /></span>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<i :class="icon"></i>',
            props: ['icon'],
          },
          DateFormatted: {
            template: '<span class="date-formatted">{{ value }}</span>',
            props: ['value', 'format'],
          },
        },
        directives: {
          'b-tooltip': () => {},
        },
      },
    })
  }

  describe('rendering with deadline', () => {
    beforeEach(() => {
      mockByIdFn.mockReturnValue({
        deadline: '2026-02-15',
        type: 'Offer',
      })
    })

    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders badge when message has deadline', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-badge').exists()).toBe(true)
    })

    it('badge has info variant', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-badge').classes()).toContain('info')
    })

    it('shows Deadline text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Deadline')
    })

    it('renders info-circle icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.info-circle').exists()).toBe(true)
    })

    it('renders DateFormatted component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.date-formatted').exists()).toBe(true)
    })
  })

  describe('rendering without deadline', () => {
    beforeEach(() => {
      mockByIdFn.mockReturnValue({ type: 'Offer' })
    })

    it('does not render when message has no deadline', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-badge').exists()).toBe(false)
    })
  })

  describe('deadlineText computed', () => {
    it('shows Offer text for Offer type', () => {
      mockByIdFn.mockReturnValue({
        deadline: '2026-02-15',
        type: 'Offer',
      })
      const wrapper = createWrapper()
      // The tooltip text is applied via directive, but we can test the computed
      expect(wrapper.vm.deadlineText).toBe('Only available until this date.')
    })

    it('shows Wanted text for non-Offer type', () => {
      mockByIdFn.mockReturnValue({
        deadline: '2026-02-15',
        type: 'Wanted',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.deadlineText).toBe('Only needed before this date')
    })
  })

  describe('props', () => {
    beforeEach(() => {
      mockByIdFn.mockReturnValue({ deadline: '2026-02-15', type: 'Offer' })
    })

    it('requires id prop', () => {
      const props = MessageDeadline.props
      expect(props.id.required).toBe(true)
    })

    it('id prop is Number type', () => {
      const props = MessageDeadline.props
      expect(props.id.type).toBe(Number)
    })
  })

  describe('store interaction', () => {
    beforeEach(() => {
      mockByIdFn.mockReturnValue({ deadline: '2026-02-15', type: 'Offer' })
    })

    it('calls byId with message id', () => {
      createWrapper({ id: 456 })
      expect(mockByIdFn).toHaveBeenCalledWith(456)
    })
  })
})
