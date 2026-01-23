import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VisibleWhen from '~/components/VisibleWhen.vue'

// Mock misc store
let breakpointValue = 'md'

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    get breakpoint() {
      return breakpointValue
    },
  }),
}))

// Mock process.server
vi.stubGlobal('process', { server: false })

describe('VisibleWhen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    breakpointValue = 'md'
  })

  function createWrapper(props = {}, slots = {}) {
    return mount(VisibleWhen, {
      props,
      slots: {
        default: '<div class="slot-content">Content</div>',
        ...slots,
      },
    })
  }

  describe('rendering with at prop', () => {
    it('shows slot when breakpoint matches at array', () => {
      breakpointValue = 'md'
      const wrapper = createWrapper({ at: ['md', 'lg'] })
      expect(wrapper.find('.slot-content').exists()).toBe(true)
    })

    it('hides slot when breakpoint not in at array', () => {
      breakpointValue = 'xs'
      const wrapper = createWrapper({ at: ['md', 'lg'] })
      expect(wrapper.find('.slot-content').exists()).toBe(false)
    })

    it('handles single breakpoint in at array', () => {
      breakpointValue = 'xl'
      const wrapper = createWrapper({ at: ['xl'] })
      expect(wrapper.find('.slot-content').exists()).toBe(true)
    })
  })

  describe('rendering with not prop', () => {
    it('shows slot when breakpoint not in not array', () => {
      breakpointValue = 'lg'
      const wrapper = createWrapper({ not: ['xs', 'sm'] })
      expect(wrapper.find('.slot-content').exists()).toBe(true)
    })

    it('hides slot when breakpoint in not array', () => {
      breakpointValue = 'xs'
      const wrapper = createWrapper({ not: ['xs', 'sm'] })
      expect(wrapper.find('.slot-content').exists()).toBe(false)
    })
  })

  describe('when breakpoint not determined', () => {
    it('hides slot when breakpoint is null', () => {
      breakpointValue = null
      const wrapper = createWrapper({ at: ['md'] })
      expect(wrapper.find('.slot-content').exists()).toBe(false)
    })

    it('hides slot when breakpoint is undefined', () => {
      breakpointValue = undefined
      const wrapper = createWrapper({ at: ['md'] })
      expect(wrapper.find('.slot-content').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('at prop is optional', () => {
      const props = VisibleWhen.props
      expect(props.at.required).toBe(false)
    })

    it('at prop defaults to null', () => {
      const props = VisibleWhen.props
      expect(props.at.default).toBe(null)
    })

    it('at prop is Array type', () => {
      const props = VisibleWhen.props
      expect(props.at.type).toBe(Array)
    })

    it('not prop is optional', () => {
      const props = VisibleWhen.props
      expect(props.not.required).toBe(false)
    })

    it('not prop defaults to null', () => {
      const props = VisibleWhen.props
      expect(props.not.default).toBe(null)
    })

    it('not prop is Array type', () => {
      const props = VisibleWhen.props
      expect(props.not.type).toBe(Array)
    })
  })

  describe('breakpoints', () => {
    it('shows for xs breakpoint when specified', () => {
      breakpointValue = 'xs'
      const wrapper = createWrapper({ at: ['xs'] })
      expect(wrapper.find('.slot-content').exists()).toBe(true)
    })

    it('shows for sm breakpoint when specified', () => {
      breakpointValue = 'sm'
      const wrapper = createWrapper({ at: ['sm'] })
      expect(wrapper.find('.slot-content').exists()).toBe(true)
    })

    it('shows for lg breakpoint when specified', () => {
      breakpointValue = 'lg'
      const wrapper = createWrapper({ at: ['lg'] })
      expect(wrapper.find('.slot-content').exists()).toBe(true)
    })

    it('shows for xl breakpoint when specified', () => {
      breakpointValue = 'xl'
      const wrapper = createWrapper({ at: ['xl'] })
      expect(wrapper.find('.slot-content').exists()).toBe(true)
    })
  })
})
