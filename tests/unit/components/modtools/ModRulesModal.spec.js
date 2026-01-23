import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ModRulesModal from '~/modtools/components/ModRulesModal.vue'

// Mock hide function that tests can spy on
const mockHide = vi.fn()
const mockShow = vi.fn()

// Override the global useOurModal mock with our custom spy
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null), // Use proper Vue ref to avoid template ref warnings
    show: mockShow,
    hide: mockHide,
  }),
}))

describe('ModRulesModal', () => {
  function mountComponent() {
    return mount(ModRulesModal, {
      global: {
        stubs: {
          'b-modal': {
            template: `
              <div class="modal" id="modRulesModal">
                <div class="modal-title"><slot name="title" /></div>
                <div class="modal-body"><slot /></div>
                <div class="modal-footer"><slot name="footer" /></div>
              </div>
            `,
          },
          'b-button': {
            template:
              '<button :disabled="disabled || undefined" :data-variant="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'disabled'],
          },
          ModMissingRules: {
            name: 'ModMissingRules',
            template:
              '<div class="mod-missing-rules" :data-expanded="String(expanded)">ModMissingRules component</div>',
            props: ['expanded'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Set a fixed date for predictable delay calculation
    // April 6, 2024 is the start date, so setting to April 10, 2024 gives us 4 days
    vi.setSystemTime(new Date(2024, 3, 10)) // April 10, 2024 (month is 0-indexed)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders the modal', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('renders modal with correct id', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.modal').attributes('id')).toBe('modRulesModal')
    })

    it('displays the title "Please configure group rules"', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.modal-title').text()).toContain(
        'Please configure group rules'
      )
    })

    it('includes ModMissingRules component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-missing-rules').exists()).toBe(true)
    })

    it('includes ModMissingRules with expanded prop', () => {
      const wrapper = mountComponent()
      const modMissingRules = wrapper.findComponent({ name: 'ModMissingRules' })
      expect(modMissingRules.exists()).toBe(true)
      // The component template passes `expanded` as a boolean prop shorthand
      // When a stub receives a boolean attribute without a value, it gets either true or ''
      // depending on how the component is mounted. We verify it's truthy.
      const expandedProp = modMissingRules.props('expanded')
      expect(expandedProp === true || expandedProp === '').toBe(true)
    })

    it('has "Not now" button in footer', () => {
      const wrapper = mountComponent()
      const button = wrapper.find('.modal-footer button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toContain('Not now')
    })

    it('shows countdown in button when enableIn > 0', async () => {
      const wrapper = mountComponent()
      // Verify enableIn is set to delay value
      expect(wrapper.vm.enableIn).toBe(4)
      await wrapper.vm.$nextTick()
      const button = wrapper.find('.modal-footer button')
      // delay computed value is 4 days (April 10 - April 6)
      expect(button.text()).toContain('(4)')
    })

    it('does not show countdown when enableIn is 0', async () => {
      const wrapper = mountComponent()
      // Fast-forward past the countdown
      wrapper.vm.enableIn = 0
      await wrapper.vm.$nextTick()
      const button = wrapper.find('.modal-footer button')
      expect(button.text()).toBe('Not now')
    })
  })

  describe('delay computed property', () => {
    it('calculates days since April 6 of current year', () => {
      // We set date to April 10, which is 4 days after April 6
      const wrapper = mountComponent()
      expect(wrapper.vm.delay).toBe(4)
    })

    it('returns negative value before April 6', () => {
      vi.setSystemTime(new Date(2024, 3, 1)) // April 1, 2024
      const wrapper = mountComponent()
      expect(wrapper.vm.delay).toBe(-5)
    })

    it('returns 0 on April 6', () => {
      vi.setSystemTime(new Date(2024, 3, 6)) // April 6, 2024
      const wrapper = mountComponent()
      expect(wrapper.vm.delay).toBe(0)
    })

    it('calculates correctly for later dates', () => {
      vi.setSystemTime(new Date(2024, 3, 16)) // April 16, 2024 - 10 days after
      const wrapper = mountComponent()
      expect(wrapper.vm.delay).toBe(10)
    })
  })

  describe('enableIn countdown', () => {
    it('initializes enableIn to delay value on mount', () => {
      // delay is 4 days based on our mock date
      const wrapper = mountComponent()
      expect(wrapper.vm.enableIn).toBe(4)
    })

    it('decrements enableIn every second', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.enableIn).toBe(4)

      vi.advanceTimersByTime(1000)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.enableIn).toBe(3)

      vi.advanceTimersByTime(1000)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.enableIn).toBe(2)
    })

    it('stops countdown when enableIn reaches 0', async () => {
      const wrapper = mountComponent()

      // Fast-forward through all countdown seconds
      vi.advanceTimersByTime(5000) // 5 seconds to ensure it goes past 0
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.enableIn).toBe(0)
    })

    it('disables button while countdown is active', async () => {
      const wrapper = mountComponent()
      // enableIn is 4, so button should be disabled
      expect(wrapper.vm.enableIn).toBe(4)
      await wrapper.vm.$nextTick()
      const button = wrapper.find('.modal-footer button')
      // When disabled prop is true, the attribute should exist (empty string in Vue)
      expect(button.element.disabled).toBe(true)
    })

    it('enables button when countdown reaches 0', async () => {
      const wrapper = mountComponent()

      // Fast-forward through countdown
      vi.advanceTimersByTime(5000)
      await wrapper.vm.$nextTick()

      const button = wrapper.find('.modal-footer button')
      expect(button.attributes('disabled')).toBeUndefined()
    })
  })

  describe('modal functionality', () => {
    it('exposes show method from composable', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.show).toBeDefined()
      expect(typeof wrapper.vm.show).toBe('function')
    })

    it('exposes hide method from composable', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.hide).toBeDefined()
      expect(typeof wrapper.vm.hide).toBe('function')
    })

    it('calls hide when "Not now" button is clicked', async () => {
      const wrapper = mountComponent()
      // Enable the button first
      wrapper.vm.enableIn = 0
      await wrapper.vm.$nextTick()

      await wrapper.find('.modal-footer button').trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })

    it('button is disabled when enableIn > 0', async () => {
      const wrapper = mountComponent()
      // Button should be disabled since enableIn > 0
      expect(wrapper.vm.enableIn).toBeGreaterThan(0)
      await wrapper.vm.$nextTick()
      const button = wrapper.find('.modal-footer button')
      expect(button.element.disabled).toBe(true)
    })
  })

  describe('tick function', () => {
    it('clears timer ref when tick runs', async () => {
      const wrapper = mountComponent()
      // Timer is set on mount
      expect(wrapper.vm.timer).not.toBeNull()

      // After tick runs, it sets timer to null then creates new one
      vi.advanceTimersByTime(1000)
      await wrapper.vm.$nextTick()

      // Timer should be re-set if countdown continues
      if (wrapper.vm.enableIn > 0) {
        expect(wrapper.vm.timer).not.toBeNull()
      }
    })

    it('stops scheduling new timers when enableIn reaches 0', async () => {
      const wrapper = mountComponent()
      // Original countdown starts at 4
      expect(wrapper.vm.enableIn).toBe(4)

      // Advance time enough for all ticks to complete
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(1000)
        await wrapper.vm.$nextTick()
      }

      expect(wrapper.vm.enableIn).toBe(0)
      // Timer should be null after countdown completes
      expect(wrapper.vm.timer).toBeNull()
    })
  })

  describe('lifecycle hooks', () => {
    it('starts timer on mount', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.timer).not.toBeNull()
    })

    it('clears timer on unmount', () => {
      const wrapper = mountComponent()
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

      wrapper.unmount()

      expect(clearTimeoutSpy).toHaveBeenCalled()
      clearTimeoutSpy.mockRestore()
    })

    it('does not throw if timer is null on unmount', async () => {
      const wrapper = mountComponent()
      // Set enableIn to 0 and let countdown finish
      wrapper.vm.enableIn = 0
      await wrapper.vm.$nextTick()
      wrapper.vm.timer = null

      expect(() => wrapper.unmount()).not.toThrow()
    })
  })

  describe('modal attributes', () => {
    it('renders modal with correct structure', () => {
      const wrapper = mountComponent()
      const modal = wrapper.find('.modal')
      expect(modal.exists()).toBe(true)
      expect(wrapper.find('.modal-title').exists()).toBe(true)
      expect(wrapper.find('.modal-body').exists()).toBe(true)
      expect(wrapper.find('.modal-footer').exists()).toBe(true)
    })
  })

  describe('button variant', () => {
    it('button has secondary variant', () => {
      const wrapper = mountComponent()
      const button = wrapper.find('.modal-footer button')
      expect(button.attributes('data-variant')).toBe('secondary')
    })
  })

  describe('edge cases', () => {
    it('handles negative delay gracefully', () => {
      // Set date before April 6
      vi.setSystemTime(new Date(2024, 0, 1)) // January 1, 2024
      const wrapper = mountComponent()
      // delay will be negative, but enableIn will start countdown from that negative value
      // This tests that the component handles edge cases
      expect(wrapper.vm.delay).toBeLessThan(0)
    })

    it('handles delay on exactly midnight of April 6', () => {
      vi.setSystemTime(new Date(2024, 3, 6, 0, 0, 0)) // Midnight April 6
      const wrapper = mountComponent()
      expect(wrapper.vm.delay).toBe(0)
    })

    it('handles delay at end of day on April 6', () => {
      vi.setSystemTime(new Date(2024, 3, 6, 23, 59, 59)) // End of April 6
      const wrapper = mountComponent()
      // Should still be 0 since we use floor
      expect(wrapper.vm.delay).toBe(0)
    })
  })
})
