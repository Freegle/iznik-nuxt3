import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import LoadingIndicator from '~/components/LoadingIndicator.vue'

// Mock useLoadingIndicator globally
const isLoadingRef = ref(true)
beforeEach(() => {
  isLoadingRef.value = true
  globalThis.useLoadingIndicator = vi.fn(() => ({
    isLoading: isLoadingRef,
  }))
})

describe('LoadingIndicator', () => {
  function createWrapper(props = {}) {
    return mount(LoadingIndicator, {
      props,
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
    it('has loading-indicator class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.loading-indicator').exists()).toBe(true)
    })

    it('renders loader image', () => {
      const wrapper = createWrapper()
      const img = wrapper.find('.b-img')
      expect(img.attributes('src')).toBe('/loader.gif')
      expect(img.attributes('alt')).toBe('Loading')
    })
  })

  describe('default props', () => {
    it('uses default width of 100', () => {
      const wrapper = createWrapper()
      const img = wrapper.find('.b-img')
      expect(img.attributes('width')).toBe('100px')
    })

    it('uses default height of 100', () => {
      const wrapper = createWrapper()
      const img = wrapper.find('.b-img')
      expect(img.attributes('height')).toBe('100px')
    })
  })

  describe('custom props', () => {
    it('accepts custom width', () => {
      const wrapper = createWrapper({ width: 50 })
      const img = wrapper.find('.b-img')
      expect(img.attributes('width')).toBe('50px')
    })

    it('accepts custom height', () => {
      const wrapper = createWrapper({ height: 75 })
      const img = wrapper.find('.b-img')
      expect(img.attributes('height')).toBe('75px')
    })

    it('adds transition class when withTransition is true', () => {
      const wrapper = createWrapper({ withTransition: true })
      expect(wrapper.find('.loading-indicator--transitioned').exists()).toBe(
        true
      )
    })

    it('has no transition class when withTransition is false', () => {
      const wrapper = createWrapper({ withTransition: false })
      expect(wrapper.find('.loading-indicator--transitioned').exists()).toBe(
        false
      )
    })
  })
})
