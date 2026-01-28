import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import LoadingIndicator from '~/components/LoadingIndicator.vue'

const mockIsLoading = ref(false)

// Mock the auto-imported useLoadingIndicator composable
globalThis.useLoadingIndicator = vi.fn(() => ({
  isLoading: mockIsLoading,
}))

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
        stubs: {
          'b-img': {
            template:
              '<img class="b-img" :src="src" :alt="alt" :width="width" :height="height" />',
            props: ['src', 'alt', 'width', 'height', 'lazy'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders loading indicator container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.loading-indicator').exists()).toBe(true)
    })

    it('renders loading image', () => {
      const wrapper = createWrapper()
      const img = wrapper.find('.b-img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('/loader.gif')
      expect(img.attributes('alt')).toBe('Loading')
    })
  })

  describe('dimensions', () => {
    it('uses default width and height', () => {
      const wrapper = createWrapper()
      const img = wrapper.find('.b-img')
      expect(img.attributes('width')).toBe('100px')
      expect(img.attributes('height')).toBe('100px')
    })

    it('uses custom width', () => {
      const wrapper = createWrapper({ width: 50 })
      const img = wrapper.find('.b-img')
      expect(img.attributes('width')).toBe('50px')
    })

    it('uses custom height', () => {
      const wrapper = createWrapper({ height: 75 })
      const img = wrapper.find('.b-img')
      expect(img.attributes('height')).toBe('75px')
    })

    it('uses custom width and height together', () => {
      const wrapper = createWrapper({ width: 200, height: 150 })
      const img = wrapper.find('.b-img')
      expect(img.attributes('width')).toBe('200px')
      expect(img.attributes('height')).toBe('150px')
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
    it('has width prop defaulting to 100', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('width')).toBe(100)
    })

    it('has height prop defaulting to 100', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('height')).toBe(100)
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
