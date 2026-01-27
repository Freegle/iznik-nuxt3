import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OurDatePicker from '~/components/OurDatePicker.vue'

// Mock the DatePicker module since it's an external import
vi.mock('vue-datepicker-next', () => ({
  default: {
    name: 'DatePicker',
    template:
      '<input type="text" class="date-picker" data-testid="date-picker" />',
    props: ['value', 'lang', 'type', 'format', 'placeholder', 'appendToBody'],
  },
}))

describe('OurDatePicker', () => {
  function createWrapper(props = {}) {
    const testDate = new Date('2024-01-15')
    return mount(OurDatePicker, {
      props: {
        modelValue: testDate,
        ...props,
      },
      global: {
        stubs: {
          'client-only': {
            template: '<div class="client-only"><slot /></div>',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders client-only wrapper', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.client-only').exists()).toBe(true)
    })

    it('renders DatePicker stub', () => {
      const wrapper = createWrapper()
      // The DatePicker stub renders with .date-picker class
      expect(wrapper.find('.date-picker').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts modelValue as Date', () => {
      const testDate = new Date('2024-06-15')
      const wrapper = createWrapper({ modelValue: testDate })
      expect(wrapper.props('modelValue')).toEqual(testDate)
    })

    it('defaults lang to en', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('lang')).toBe('en')
    })

    it('accepts custom lang', () => {
      const wrapper = createWrapper({ lang: 'fr' })
      expect(wrapper.props('lang')).toBe('fr')
    })

    it('defaults type to date', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('type')).toBe('date')
    })

    it('accepts custom type', () => {
      const wrapper = createWrapper({ type: 'datetime' })
      expect(wrapper.props('type')).toBe('datetime')
    })

    it('defaults format to YYYY-MM', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('format')).toBe('YYYY-MM')
    })

    it('accepts custom format', () => {
      const wrapper = createWrapper({ format: 'DD/MM/YYYY' })
      expect(wrapper.props('format')).toBe('DD/MM/YYYY')
    })

    it('defaults placeholder to empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('placeholder')).toBe('')
    })

    it('accepts custom placeholder', () => {
      const wrapper = createWrapper({ placeholder: 'Select date' })
      expect(wrapper.props('placeholder')).toBe('Select date')
    })
  })

  describe('date ref', () => {
    it('initializes date from modelValue', () => {
      const testDate = new Date('2024-03-20')
      const wrapper = createWrapper({ modelValue: testDate })
      expect(wrapper.vm.date.getTime()).toBe(testDate.getTime())
    })
  })
})
