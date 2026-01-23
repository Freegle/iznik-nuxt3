import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModClipboard from '~/modtools/components/ModClipboard.vue'

describe('ModClipboard', () => {
  // Mock clipboard API
  const mockClipboardWriteText = vi.fn()

  // Helper to mount component with specific value
  function mountModClipboard(value = 'test text') {
    return mount(ModClipboard, {
      props: { value },
      global: {
        stubs: {
          'b-button': {
            template:
              "<button :class=\"['btn', variant ? 'btn-' + variant : '']\" @click=\"$emit('click')\"><slot /></button>",
            props: ['variant', 'size'],
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
    vi.useFakeTimers()

    // Mock navigator.clipboard using Object.defineProperty
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockClipboardWriteText.mockResolvedValue(undefined),
      },
      configurable: true,
      writable: true,
    })

    // Mock process.client (Nuxt environment)
    global.process = {
      ...global.process,
      client: true,
      env: {
        IS_APP: false,
      },
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders a button element', () => {
      const wrapper = mountModClipboard()
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('button has secondary variant', () => {
      const wrapper = mountModClipboard()
      expect(wrapper.find('button').classes()).toContain('btn-secondary')
    })

    it('shows copy icon by default', () => {
      const wrapper = mountModClipboard()
      const icon = wrapper.find('i')
      expect(icon.exists()).toBe(true)
      expect(icon.attributes('data-icon')).toBe('copy')
    })
  })

  describe('copy functionality', () => {
    it('calls clipboard.writeText with the value prop when clicked', async () => {
      const wrapper = mountModClipboard('text to copy')
      await wrapper.find('button').trigger('click')

      // Check that writeText was called with correct value (may be called multiple times due to event bubbling)
      expect(mockClipboardWriteText).toHaveBeenCalledWith('text to copy')
    })

    it('shows check icon after clicking copy', async () => {
      const wrapper = mountModClipboard()
      await wrapper.find('button').trigger('click')

      // Wait for the async copy to complete
      await wrapper.vm.$nextTick()

      const icon = wrapper.find('i')
      expect(icon.attributes('data-icon')).toBe('check')
    })

    it('reverts to copy icon after 1 second', async () => {
      const wrapper = mountModClipboard()
      await wrapper.find('button').trigger('click')
      await wrapper.vm.$nextTick()

      // Icon should be check
      expect(wrapper.find('i').attributes('data-icon')).toBe('check')

      // Advance time by 1 second
      vi.advanceTimersByTime(1000)
      await wrapper.vm.$nextTick()

      // Icon should be back to copy
      expect(wrapper.find('i').attributes('data-icon')).toBe('copy')
    })

    it('does not revert before 1 second', async () => {
      const wrapper = mountModClipboard()
      await wrapper.find('button').trigger('click')
      await wrapper.vm.$nextTick()

      // Advance time by 999ms
      vi.advanceTimersByTime(999)
      await wrapper.vm.$nextTick()

      // Icon should still be check
      expect(wrapper.find('i').attributes('data-icon')).toBe('check')
    })
  })
})
