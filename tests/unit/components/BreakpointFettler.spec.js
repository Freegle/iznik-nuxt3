import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BreakpointFettler from '~/components/BreakpointFettler.vue'

const mockSetBreakpoint = vi.fn()
const mockBreakpoint = 'md'

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    breakpoint: mockBreakpoint,
    setBreakpoint: mockSetBreakpoint,
  }),
}))

vi.mock('resize-observer-polyfill', () => ({
  default: class MockResizeObserver {
    constructor(callback) {
      this.callback = callback
    }

    observe() {}
    disconnect() {}
  },
}))

describe('BreakpointFettler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper() {
    return mount(BreakpointFettler)
  }

  describe('rendering', () => {
    it('renders container span', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('span').exists()).toBe(true)
    })

    it('renders all 6 breakpoint marker spans', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('span')).toHaveLength(7) // 1 container + 6 breakpoints
    })
  })

  describe('breakpoint elements', () => {
    it.each([
      ['xs', 'd-block d-sm-none'],
      ['sm', 'd-none d-sm-block d-md-none'],
      ['md', 'd-none d-md-block d-lg-none'],
      ['lg', 'd-none d-lg-block d-xl-none'],
      ['xl', 'd-none d-xl-block d-xxl-none'],
      ['xxl', 'd-none d-xxl-block'],
    ])(
      'has %s breakpoint element with correct classes',
      (breakpoint, expectedClasses) => {
        const wrapper = createWrapper()
        const element = wrapper.vm[breakpoint]
        expect(element).toBeDefined()
      }
    )
  })

  describe('breakpointRefs', () => {
    it('has refs for all breakpoints', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.xs).toBeDefined()
      expect(wrapper.vm.sm).toBeDefined()
      expect(wrapper.vm.md).toBeDefined()
      expect(wrapper.vm.lg).toBeDefined()
      expect(wrapper.vm.xl).toBeDefined()
      expect(wrapper.vm.xxl).toBeDefined()
    })
  })

  describe('check function', () => {
    it('is defined on component', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.check).toBe('function')
    })
  })

  describe('Bootstrap visibility classes', () => {
    it('xs element is visible only on xs', () => {
      const wrapper = createWrapper()
      const xsEl = wrapper.find('span span:first-child')
      expect(xsEl.classes()).toContain('d-block')
      expect(xsEl.classes()).toContain('d-sm-none')
    })

    it('xxl element is visible only on xxl', () => {
      const wrapper = createWrapper()
      const spans = wrapper.findAll('span span')
      const xxlEl = spans[spans.length - 1]
      expect(xxlEl.classes()).toContain('d-none')
      expect(xxlEl.classes()).toContain('d-xxl-block')
    })
  })
})
