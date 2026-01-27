import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NumberIncrementDecrement from '~/components/NumberIncrementDecrement.vue'

vi.mock('~/composables/useId', () => ({
  uid: vi.fn(() => 'test-123'),
}))

vi.mock('@chenfengyuan/vue-number-input', () => ({
  default: {
    name: 'VueNumberInput',
    template:
      '<div class="vue-number-input" :class="$attrs.class"><input :value="modelValue" /></div>',
    props: [
      'modelValue',
      'controls',
      'inline',
      'center',
      'step',
      'min',
      'max',
      'size',
    ],
    emits: ['update:modelValue'],
  },
}))

describe('NumberIncrementDecrement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(NumberIncrementDecrement, {
      props: {
        modelValue: 5,
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('renders container div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders vue-number-input component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.vue-number-input').exists()).toBe(true)
    })

    it('renders label when provided', () => {
      const wrapper = createWrapper({ label: 'Quantity' })
      expect(wrapper.find('label').exists()).toBe(true)
      expect(wrapper.find('label').text()).toBe('Quantity')
    })

    it('hides label visually when labelSROnly is true', () => {
      const wrapper = createWrapper({ label: 'Quantity', labelSROnly: true })
      expect(wrapper.find('label').classes()).toContain('visually-hidden')
    })

    it('shows label visually when labelSROnly is false', () => {
      const wrapper = createWrapper({ label: 'Quantity', labelSROnly: false })
      expect(wrapper.find('label').classes()).not.toContain('visually-hidden')
    })

    it('renders appendText when provided', () => {
      const wrapper = createWrapper({ appendText: 'items available' })
      expect(wrapper.find('.available').exists()).toBe(true)
      expect(wrapper.find('.available').text()).toBe('items available')
    })

    it('hides appendText when not provided', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.available').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('requires modelValue prop', () => {
      const wrapper = createWrapper({ modelValue: 10 })
      expect(wrapper.props('modelValue')).toBe(10)
    })

    it('has min prop defaulting to 1', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('min')).toBe(1)
    })

    it('has max prop defaulting to 999', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('max')).toBe(999)
    })

    it('has label prop defaulting to empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('label')).toBe('')
    })

    it('has labelSROnly prop defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('labelSROnly')).toBe(false)
    })

    it('has appendText prop defaulting to empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('appendText')).toBe('')
    })

    it('has size prop defaulting to lg', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('size')).toBe('lg')
    })

    it('accepts custom min', () => {
      const wrapper = createWrapper({ min: 0 })
      expect(wrapper.props('min')).toBe(0)
    })

    it('accepts custom max', () => {
      const wrapper = createWrapper({ max: 100 })
      expect(wrapper.props('max')).toBe(100)
    })

    it('accepts custom size', () => {
      const wrapper = createWrapper({ size: 'small' })
      expect(wrapper.props('size')).toBe('small')
    })
  })

  describe('events', () => {
    it('emits update:modelValue when value changes', () => {
      const wrapper = createWrapper()

      wrapper.vm.update(10, 5)

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted[0]).toEqual([10, 5])
    })

    it('passes new and old values to emit', () => {
      const wrapper = createWrapper()

      wrapper.vm.update(20, 15)

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted[0][0]).toBe(20) // new value
      expect(emitted[0][1]).toBe(15) // old value
    })
  })

  describe('$id function', () => {
    it('generates unique id', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.$id('spinbutton')).toBe('test-123')
    })
  })

  describe('CSS classes', () => {
    it('applies inputsize class based on size prop', () => {
      const wrapper = createWrapper({ size: 'lg' })
      expect(wrapper.find('.vue-number-input').classes()).toContain(
        'inputsize-lg'
      )
    })

    it('applies small inputsize class when size is small', () => {
      const wrapper = createWrapper({ size: 'small' })
      expect(wrapper.find('.vue-number-input').classes()).toContain(
        'inputsize-small'
      )
    })
  })

  describe('appendText trimming', () => {
    it('trims whitespace from appendText', () => {
      const wrapper = createWrapper({ appendText: '  items  ' })
      expect(wrapper.find('.available').text()).toBe('items')
    })
  })
})
