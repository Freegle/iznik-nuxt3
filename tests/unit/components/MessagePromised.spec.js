import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MessagePromised from '~/components/MessagePromised.vue'

const mockById = vi.fn()
const mockMyid = vi.fn()

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    byId: mockById,
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myid: mockMyid(),
  }),
}))

describe('MessagePromised', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockById.mockReturnValue({ fromuser: 123 })
    mockMyid.mockReturnValue(456)
  })

  function createWrapper(props = {}) {
    return mount(MessagePromised, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          'b-img': {
            template: '<img :src="src" class="b-img" />',
            props: ['src', 'lazy'],
          },
          'b-popover': {
            template:
              '<div class="b-popover" :content="content"><slot /></div>',
            props: [
              'content',
              'placement',
              'variant',
              'triggers',
              'target',
              'modelValue',
              'customClass',
            ],
            emits: ['shown', 'hidden'],
          },
          'notice-message': {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
        },
      },
    })
  }

  describe('rendering in summary mode', () => {
    it('renders container with clickme class', () => {
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.promised').exists()).toBe(true)
    })

    it('shows promised image when summary true', () => {
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.b-img').exists()).toBe(true)
      expect(wrapper.find('.b-img').attributes('src')).toBe('/promised.jpg')
    })

    it('shows popover when summary and message not from me', () => {
      mockById.mockReturnValue({ fromuser: 123 })
      mockMyid.mockReturnValue(456) // Different from fromuser
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.b-popover').exists()).toBe(true)
    })

    it('hides popover when message is from me', () => {
      mockById.mockReturnValue({ fromuser: 456 })
      mockMyid.mockReturnValue(456) // Same as fromuser
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.b-popover').exists()).toBe(false)
    })
  })

  describe('rendering in non-summary mode', () => {
    it('shows warning notice when not promised to me', () => {
      const wrapper = createWrapper({ summary: false, toMe: false })
      const notice = wrapper.find('.notice-message')
      expect(notice.exists()).toBe(true)
      expect(notice.classes()).toContain('warning')
      expect(notice.text()).toContain('already been promised to someone')
    })

    it('shows primary notice when promised to me', () => {
      const wrapper = createWrapper({ summary: false, toMe: true })
      const notice = wrapper.find('.notice-message')
      expect(notice.exists()).toBe(true)
      expect(notice.classes()).toContain('primary')
      expect(notice.text()).toContain('promised to you')
    })

    it('does not show image in non-summary mode', () => {
      const wrapper = createWrapper({ summary: false })
      expect(wrapper.find('.b-img').exists()).toBe(false)
    })
  })

  describe('click handling', () => {
    it('emits click event when clicked', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.promised').trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click').length).toBe(1)
    })
  })

  describe('title computed property', () => {
    it('returns warning message when not promised to me', () => {
      const wrapper = createWrapper({ summary: true, toMe: false })
      const popover = wrapper.find('.b-popover')
      expect(popover.attributes('content')).toContain(
        'already been promised to someone'
      )
    })

    it('returns confirmation message when promised to me', () => {
      const wrapper = createWrapper({ summary: true, toMe: true })
      const popover = wrapper.find('.b-popover')
      expect(popover.attributes('content')).toContain('promised to you')
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 42 })
      expect(wrapper.props('id')).toBe(42)
    })

    it('defaults toMe to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('toMe')).toBe(false)
    })

    it('defaults summary to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('summary')).toBe(false)
    })

    it('accepts toMe prop', () => {
      const wrapper = createWrapper({ toMe: true })
      expect(wrapper.props('toMe')).toBe(true)
    })

    it('accepts summary prop', () => {
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.props('summary')).toBe(true)
    })
  })
})
