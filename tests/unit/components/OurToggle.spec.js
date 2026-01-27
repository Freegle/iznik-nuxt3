import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OurToggle from '~/components/OurToggle.vue'

describe('OurToggle', () => {
  function createWrapper(props = {}) {
    return mount(OurToggle, {
      props,
      global: {
        stubs: {
          Toggle: {
            template:
              '<button class="toggle" :class="{ on: modelValue }" @click="$emit(\'update:modelValue\', !modelValue)">{{ modelValue ? onLabel : offLabel }}</button>',
            props: ['modelValue', 'onLabel', 'offLabel', 'disabled'],
            emits: ['update:modelValue'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders toggle container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.our-toggle').exists()).toBe(true)
    })

    it('renders toggle component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.toggle').exists()).toBe(true)
    })
  })

  describe('variants', () => {
    it.each([
      ['green', 'green'],
      ['modgreen', 'modgreen'],
    ])('applies %s variant class', (variant, expectedClass) => {
      const wrapper = createWrapper({ variant })
      expect(wrapper.find('.our-toggle').classes()).toContain(expectedClass)
    })

    it('defaults to green variant', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.our-toggle').classes()).toContain('green')
    })
  })

  describe('sizes', () => {
    it.each(['sm', 'md', 'lg'])('applies %s size class', (size) => {
      const wrapper = createWrapper({ size })
      expect(wrapper.find('.our-toggle').classes()).toContain(`toggle-${size}`)
    })

    it('defaults to md size', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.our-toggle').classes()).toContain('toggle-md')
    })
  })

  describe('labels', () => {
    it('uses default On/Off labels', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.toggle').text()).toBe('Off')
    })

    it('uses custom labels', () => {
      const wrapper = createWrapper({
        labels: { checked: 'Yes', unchecked: 'No' },
      })
      expect(wrapper.find('.toggle').text()).toBe('No')
    })

    it('shows checked label when on', () => {
      const wrapper = createWrapper({
        modelValue: true,
        labels: { checked: 'Active', unchecked: 'Inactive' },
      })
      expect(wrapper.find('.toggle').text()).toBe('Active')
    })
  })

  describe('v-model', () => {
    it('emits update:modelValue when toggled', async () => {
      const wrapper = createWrapper({ modelValue: false })
      await wrapper.find('.toggle').trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([true])
    })

    it('emits change event for legacy support', async () => {
      const wrapper = createWrapper({ modelValue: false })
      await wrapper.find('.toggle').trigger('click')
      expect(wrapper.emitted('change')).toBeTruthy()
    })
  })

  describe('disabled state', () => {
    it('accepts disabled prop', () => {
      const wrapper = createWrapper({ disabled: true })
      expect(wrapper.props('disabled')).toBe(true)
    })
  })
})
