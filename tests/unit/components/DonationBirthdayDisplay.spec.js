import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DonationBirthdayDisplay from '~/components/DonationBirthdayDisplay.vue'

describe('DonationBirthdayDisplay', () => {
  function createWrapper(props = {}) {
    return mount(DonationBirthdayDisplay, {
      props: {
        price: 5,
        ...props,
      },
      global: {
        stubs: {
          'b-input-group': {
            template: '<div class="input-group"><slot /></div>',
            props: ['prepend'],
          },
          'b-input': {
            template:
              '<input :type="type" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'type', 'min', 'step', 'size', 'placeholder'],
            emits: ['update:modelValue'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders birthday donation display container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.birthday-donation-display').exists()).toBe(true)
    })

    it('shows donation amount', () => {
      const wrapper = createWrapper({ price: 10 })
      expect(wrapper.text()).toContain('£10')
    })

    it('shows "You\'re kindly donating" message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("You're kindly donating")
    })

    it('renders other amount section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.other-amount-section').exists()).toBe(true)
    })
  })

  describe('price prop', () => {
    it.each([
      [5, '£5'],
      [10, '£10'],
      [25, '£25'],
      [100, '£100'],
    ])('displays price %d as %s', (price, expected) => {
      const wrapper = createWrapper({ price })
      expect(wrapper.text()).toContain(expected)
    })
  })

  describe('monthly prop', () => {
    it('shows "monthly" when monthly is true', () => {
      const wrapper = createWrapper({ monthly: true })
      expect(wrapper.text()).toContain('monthly')
    })

    it('does not show "monthly" when monthly is false', () => {
      const wrapper = createWrapper({ monthly: false })
      // Check specifically that "monthly" doesn't appear in the h4
      expect(wrapper.find('h4').text()).not.toContain('monthly')
    })

    it('defaults monthly to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('monthly')).toBe(false)
    })
  })

  describe('v-model', () => {
    it('emits update:modelValue when input changes', async () => {
      const wrapper = createWrapper({ modelValue: 5 })
      await wrapper.find('input').setValue('15')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('passes modelValue to input', () => {
      const wrapper = createWrapper({ modelValue: 20 })
      expect(wrapper.find('input').element.value).toBe('20')
    })

    it('defaults modelValue to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('modelValue')).toBeNull()
    })
  })
})
