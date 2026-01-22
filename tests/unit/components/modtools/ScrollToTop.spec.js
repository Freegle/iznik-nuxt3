import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ScrollToTop from '~/modtools/components/ScrollToTop.vue'

describe('ScrollToTop', () => {
  let originalScrollY
  let addEventListenerSpy
  let removeEventListenerSpy
  let scrollToSpy

  // Helper to mount component
  function mountScrollToTop(props = {}) {
    return mount(ScrollToTop, {
      props,
      global: {
        stubs: {
          'b-button': {
            template:
              "<button :class=\"variant ? 'btn-' + variant : ''\" @click=\"$emit('click')\"><slot /></button>",
            props: ['variant'],
          },
          'v-icon': {
            template: '<i :data-icon="icon"></i>',
            props: ['icon'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock process.client
    global.process = {
      ...global.process,
      client: true,
    }

    // Save original scrollY
    originalScrollY = window.scrollY

    // Mock window.scrollY as a property
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    })

    // Spy on window methods
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore original scrollY
    Object.defineProperty(window, 'scrollY', {
      value: originalScrollY,
      configurable: true,
    })
  })

  describe('rendering', () => {
    it('renders a container div with pos class', () => {
      const wrapper = mountScrollToTop()
      expect(wrapper.find('div.pos').exists()).toBe(true)
    })

    it('hides button when scrollY is 0', () => {
      const wrapper = mountScrollToTop()
      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('hides button when scrollY is 50 or less', async () => {
      const wrapper = mountScrollToTop()
      // Simulate scroll to 50
      Object.defineProperty(window, 'scrollY', { value: 50 })
      // Find the scroll handler and call it
      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'scroll'
      )?.[1]
      if (scrollHandler) {
        scrollHandler()
        await wrapper.vm.$nextTick()
      }
      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('shows button when scrollY is greater than 50', async () => {
      const wrapper = mountScrollToTop()
      // Simulate scroll to 51
      Object.defineProperty(window, 'scrollY', { value: 51 })
      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'scroll'
      )?.[1]
      if (scrollHandler) {
        scrollHandler()
        await wrapper.vm.$nextTick()
      }
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('shows caret-up icon in button', async () => {
      const wrapper = mountScrollToTop()
      Object.defineProperty(window, 'scrollY', { value: 100 })
      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'scroll'
      )?.[1]
      if (scrollHandler) {
        scrollHandler()
        await wrapper.vm.$nextTick()
      }
      const icon = wrapper.find('i')
      expect(icon.exists()).toBe(true)
      expect(icon.attributes('data-icon')).toBe('caret-up')
    })

    it('shows "Top" text in button', async () => {
      const wrapper = mountScrollToTop()
      Object.defineProperty(window, 'scrollY', { value: 100 })
      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'scroll'
      )?.[1]
      if (scrollHandler) {
        scrollHandler()
        await wrapper.vm.$nextTick()
      }
      expect(wrapper.text()).toContain('Top')
    })
  })

  describe('prepend prop', () => {
    it('shows prepend text before "Top" when provided', async () => {
      const wrapper = mountScrollToTop({ prepend: 'Go to' })
      Object.defineProperty(window, 'scrollY', { value: 100 })
      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'scroll'
      )?.[1]
      if (scrollHandler) {
        scrollHandler()
        await wrapper.vm.$nextTick()
      }
      expect(wrapper.text()).toContain('Go to')
      expect(wrapper.text()).toContain('Top')
    })

    it('does not show prepend when not provided', async () => {
      const wrapper = mountScrollToTop()
      Object.defineProperty(window, 'scrollY', { value: 100 })
      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'scroll'
      )?.[1]
      if (scrollHandler) {
        scrollHandler()
        await wrapper.vm.$nextTick()
      }
      // The text should only be "Top" (with possible whitespace)
      expect(wrapper.text().trim()).toBe('Top')
    })
  })

  describe('scroll event handling', () => {
    it('adds scroll event listener on mount', () => {
      mountScrollToTop()
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )
    })

    it('removes scroll event listener on unmount', () => {
      const wrapper = mountScrollToTop()
      wrapper.unmount()
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )
    })
  })

  describe('scrollToTop functionality', () => {
    it('calls window.scrollTo(0, 0) when button clicked', async () => {
      const wrapper = mountScrollToTop()
      // Show the button first
      Object.defineProperty(window, 'scrollY', { value: 100 })
      const scrollHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'scroll'
      )?.[1]
      if (scrollHandler) {
        scrollHandler()
        await wrapper.vm.$nextTick()
      }

      // Click the button
      await wrapper.find('button').trigger('click')
      expect(scrollToSpy).toHaveBeenCalledWith(0, 0)
    })
  })
})
