import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NumberIncrementDecrement from '~/components/NumberIncrementDecrement.vue'

vi.mock('~/composables/useId', () => ({
  uid: (type) => `test-${type}-123`,
}))

describe('NumberIncrementDecrement', () => {
  function createWrapper(props = {}) {
    return mount(NumberIncrementDecrement, {
      props: {
        modelValue: 5,
        ...props,
      },
      global: {
        stubs: {
          'vue-number-input': {
            template:
              '<input :value="modelValue" @input="$emit(\'update:model-value\', parseInt($event.target.value))" />',
            props: [
              'modelValue',
              'min',
              'max',
              'step',
              'size',
              'controls',
              'inline',
              'center',
            ],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders label when provided', () => {
      const wrapper = createWrapper({ label: 'Quantity' })
      expect(wrapper.find('label').text()).toBe('Quantity')
    })

    it('hides label visually when labelSROnly is true', () => {
      const wrapper = createWrapper({ label: 'Quantity', labelSROnly: true })
      expect(wrapper.find('label').classes()).toContain('visually-hidden')
    })

    it('shows label normally when labelSROnly is false', () => {
      const wrapper = createWrapper({ label: 'Quantity', labelSROnly: false })
      expect(wrapper.find('label').classes()).not.toContain('visually-hidden')
    })

    it('renders appendText when provided', () => {
      const wrapper = createWrapper({ appendText: 'available' })
      expect(wrapper.find('.available').text()).toBe('available')
    })

    it('does not render appendText when not provided', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.available').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('accepts min and max props', () => {
      const wrapper = createWrapper({ min: 0, max: 100 })
      expect(wrapper.props('min')).toBe(0)
      expect(wrapper.props('max')).toBe(100)
    })

    it('uses default min of 1 and max of 999', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('min')).toBe(1)
      expect(wrapper.props('max')).toBe(999)
    })

    it('accepts size prop with default lg', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('size')).toBe('lg')
    })
  })

  describe('v-model', () => {
    it('emits update:modelValue when value changes', async () => {
      const wrapper = createWrapper({ modelValue: 5 })
      const input = wrapper.find('input')
      await input.setValue('10')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })
})
