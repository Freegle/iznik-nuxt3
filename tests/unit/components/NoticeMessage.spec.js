import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NoticeMessage from '~/components/NoticeMessage.vue'

describe('NoticeMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}, slots = {}) {
    return mount(NoticeMessage, {
      props: {
        ...props,
      },
      slots: {
        default: 'Test message content',
        ...slots,
      },
    })
  }

  describe('rendering', () => {
    it('renders notice container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.notice').exists()).toBe(true)
    })

    it('renders slot content', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Test message content')
    })

    it('renders custom slot content', () => {
      const wrapper = createWrapper({}, { default: '<span>Custom HTML</span>' })
      expect(wrapper.text()).toContain('Custom HTML')
    })
  })

  describe('variant classes', () => {
    it('applies info variant class by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.notice').classes()).toContain('notice--info')
    })

    it('applies primary variant class', () => {
      const wrapper = createWrapper({ variant: 'primary' })
      expect(wrapper.find('.notice').classes()).toContain('notice--primary')
    })

    it('applies warning variant class', () => {
      const wrapper = createWrapper({ variant: 'warning' })
      expect(wrapper.find('.notice').classes()).toContain('notice--warning')
    })

    it('applies danger variant class', () => {
      const wrapper = createWrapper({ variant: 'danger' })
      expect(wrapper.find('.notice').classes()).toContain('notice--danger')
    })
  })

  describe('props', () => {
    it('has variant prop defaulting to info', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('variant')).toBe('info')
    })

    it('accepts custom variant', () => {
      const wrapper = createWrapper({ variant: 'danger' })
      expect(wrapper.props('variant')).toBe('danger')
    })
  })

  describe('styling', () => {
    it('has p-2 padding class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.notice').classes()).toContain('p-2')
    })

    it('has notice base class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.notice').classes()).toContain('notice')
    })
  })
})
