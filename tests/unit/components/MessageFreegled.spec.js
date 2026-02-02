import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageFreegled from '~/components/MessageFreegled.vue'

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

describe('MessageFreegled', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockById.mockReturnValue({ fromuser: 123, type: 'Offer' })
    mockMyid.mockReturnValue(456)
  })

  function createWrapper(props = {}) {
    return mount(MessageFreegled, {
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
    it('renders container', () => {
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.freegleg').exists()).toBe(true)
    })

    it('shows freegled image when summary true', () => {
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.b-img').exists()).toBe(true)
      expect(wrapper.find('.b-img').attributes('src')).toBe('/freegled.jpg')
    })

    it('shows popover when summary and message not from me', () => {
      mockById.mockReturnValue({ fromuser: 123, type: 'Offer' })
      mockMyid.mockReturnValue(456)
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.b-popover').exists()).toBe(true)
    })

    it('hides popover when message is from me', () => {
      mockById.mockReturnValue({ fromuser: 456, type: 'Offer' })
      mockMyid.mockReturnValue(456)
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.b-popover').exists()).toBe(false)
    })
  })

  describe('rendering in non-summary mode', () => {
    it('shows warning notice', () => {
      const wrapper = createWrapper({ summary: false })
      const notice = wrapper.find('.notice-message')
      expect(notice.exists()).toBe(true)
      expect(notice.classes()).toContain('warning')
      expect(notice.text()).toContain('successfully freegled')
    })

    it('does not show image in non-summary mode', () => {
      const wrapper = createWrapper({ summary: false })
      expect(wrapper.find('.b-img').exists()).toBe(false)
    })
  })

  describe('title computed property', () => {
    it('returns offer message for Offer type', () => {
      mockById.mockReturnValue({ fromuser: 123, type: 'Offer' })
      const wrapper = createWrapper({ summary: true })
      const popover = wrapper.find('.b-popover')
      expect(popover.attributes('content')).toContain('someone took it')
    })

    it('returns wanted message for non-Offer type', () => {
      mockById.mockReturnValue({ fromuser: 123, type: 'Wanted' })
      const wrapper = createWrapper({ summary: true })
      const popover = wrapper.find('.b-popover')
      expect(popover.attributes('content')).toContain(
        'they got what they were looking for'
      )
    })

    it('includes reminder about marking posts', () => {
      mockById.mockReturnValue({ fromuser: 123, type: 'Offer' })
      const wrapper = createWrapper({ summary: true })
      const popover = wrapper.find('.b-popover')
      expect(popover.attributes('content')).toContain(
        'Mark your posts as TAKEN/RECEIVED'
      )
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 42 })
      expect(wrapper.props('id')).toBe(42)
    })

    it('defaults summary to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('summary')).toBe(false)
    })

    it('accepts summary prop', () => {
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.props('summary')).toBe(true)
    })
  })
})
