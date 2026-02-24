import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import LoadingIndicator from '~/components/LoadingIndicator.vue'
import Spinner from '~/components/Spinner.vue'

const mockIsLoading = ref(false)

// Mock the auto-imported useLoadingIndicator composable
globalThis.useLoadingIndicator = vi.fn(() => ({
  isLoading: mockIsLoading,
}))

// Mock the auto-imported computed
globalThis.computed = (fn) => ({ value: fn() })

describe('LoadingIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsLoading.value = false
  })

  function createWrapper(props = {}) {
    return mount(LoadingIndicator, {
      props: {
        ...props,
      },
      global: {
        components: { Spinner },
      },
    })
  }

  describe('rendering', () => {
    it('renders loading indicator container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.loading-indicator').exists()).toBe(true)
    })

    it('renders spinner', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.spinner-border').exists()).toBe(true)
    })
  })

  describe('size', () => {
    it('uses default size of 50', () => {
      const wrapper = createWrapper()
      const spinner = wrapper.find('.spinner-border')
      expect(spinner.attributes('style')).toContain('width: 50px')
      expect(spinner.attributes('style')).toContain('height: 50px')
    })

    it('uses custom size', () => {
      const wrapper = createWrapper({ size: 30 })
      const spinner = wrapper.find('.spinner-border')
      expect(spinner.attributes('style')).toContain('width: 30px')
      expect(spinner.attributes('style')).toContain('height: 30px')
    })
  })

  describe('visibility', () => {
    it('has opacity 0 when not loading', () => {
      mockIsLoading.value = false
      const wrapper = createWrapper()
      expect(wrapper.find('.loading-indicator').attributes('style')).toContain(
        'opacity: 0'
      )
    })

    it('has opacity 1 when loading', () => {
      mockIsLoading.value = true
      const wrapper = createWrapper()
      expect(wrapper.find('.loading-indicator').attributes('style')).toContain(
        'opacity: 1'
      )
    })
  })

  describe('transition class', () => {
    it('does not apply transition class by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.loading-indicator').classes()).not.toContain(
        'loading-indicator--transitioned'
      )
    })

    it('applies transition class when withTransition is true', () => {
      const wrapper = createWrapper({ withTransition: true })
      expect(wrapper.find('.loading-indicator').classes()).toContain(
        'loading-indicator--transitioned'
      )
    })
  })

  describe('useLoadingIndicator composable', () => {
    it('calls useLoadingIndicator with throttle', () => {
      createWrapper({ throttle: 500 })
      expect(globalThis.useLoadingIndicator).toHaveBeenCalledWith({
        throttle: 500,
      })
    })

    it('calls useLoadingIndicator with default throttle 0', () => {
      createWrapper()
      expect(globalThis.useLoadingIndicator).toHaveBeenCalledWith({
        throttle: 0,
      })
    })
  })

  describe('props', () => {
    it('has size prop defaulting to 50', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('size')).toBe(50)
    })

    it('has throttle prop defaulting to 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('throttle')).toBe(0)
    })

    it('has withTransition prop defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('withTransition')).toBe(false)
    })
  })
})
