import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DateFormatted from '~/components/DateFormatted.vue'

const mockDateonly = vi.fn((val) => `dateonly:${val}`)
const mockDatetime = vi.fn((val) => `datetime:${val}`)
const mockDatetimeshort = vi.fn((val) => `datetimeshort:${val}`)
const mockDateshort = vi.fn((val) => `dateshort:${val}`)
const mockWeekdayshort = vi.fn((val) => `weekdayshort:${val}`)
const mockDateonlyNoYear = vi.fn((val) => `dateonlyNoYear:${val}`)

vi.mock('~/composables/useTimeFormat', () => ({
  dateonly: (val) => mockDateonly(val),
  datetime: (val) => mockDatetime(val),
  datetimeshort: (val) => mockDatetimeshort(val),
  dateshort: (val) => mockDateshort(val),
  weekdayshort: (val) => mockWeekdayshort(val),
  dateonlyNoYear: (val) => mockDateonlyNoYear(val),
}))

describe('DateFormatted', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(DateFormatted, {
      props: {
        value: '2024-01-15T10:30:00Z',
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('renders a span element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('span').exists()).toBe(true)
    })

    it('displays formatted date', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('datetime:2024-01-15T10:30:00Z')
    })
  })

  describe('format handling', () => {
    it('uses datetime format by default', () => {
      createWrapper()
      expect(mockDatetime).toHaveBeenCalledWith('2024-01-15T10:30:00Z')
    })

    it('uses dateonly format when specified', () => {
      createWrapper({ format: 'dateonly' })
      expect(mockDateonly).toHaveBeenCalledWith('2024-01-15T10:30:00Z')
    })

    it('uses dateonlyNoYear format when specified', () => {
      createWrapper({ format: 'dateonlyNoYear' })
      expect(mockDateonlyNoYear).toHaveBeenCalledWith('2024-01-15T10:30:00Z')
    })

    it('uses dateshort format when specified', () => {
      createWrapper({ format: 'dateshort' })
      expect(mockDateshort).toHaveBeenCalledWith('2024-01-15T10:30:00Z')
    })

    it('uses datetimeshort format when specified', () => {
      createWrapper({ format: 'datetimeshort' })
      expect(mockDatetimeshort).toHaveBeenCalledWith('2024-01-15T10:30:00Z')
    })

    it('uses weekdayshort format for weekdaytime', () => {
      createWrapper({ format: 'weekdaytime' })
      expect(mockWeekdayshort).toHaveBeenCalledWith('2024-01-15T10:30:00Z')
    })

    it('falls back to datetime for unknown format', () => {
      createWrapper({ format: 'unknown' })
      expect(mockDatetime).toHaveBeenCalledWith('2024-01-15T10:30:00Z')
    })
  })

  describe('props', () => {
    it('requires value prop', () => {
      const wrapper = createWrapper({ value: '2024-06-20T14:00:00Z' })
      expect(wrapper.props('value')).toBe('2024-06-20T14:00:00Z')
    })

    it('has format prop defaulting to datetime', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('format')).toBe('datetime')
    })

    it('accepts custom format', () => {
      const wrapper = createWrapper({ format: 'dateonly' })
      expect(wrapper.props('format')).toBe('dateonly')
    })
  })

  describe('computed formatted', () => {
    it('returns formatted value for datetime', () => {
      const wrapper = createWrapper({ format: 'datetime' })
      expect(wrapper.vm.formatted).toBe('datetime:2024-01-15T10:30:00Z')
    })

    it('returns formatted value for dateonly', () => {
      const wrapper = createWrapper({ format: 'dateonly' })
      expect(wrapper.vm.formatted).toBe('dateonly:2024-01-15T10:30:00Z')
    })

    it('returns formatted value for dateshort', () => {
      const wrapper = createWrapper({ format: 'dateshort' })
      expect(wrapper.vm.formatted).toBe('dateshort:2024-01-15T10:30:00Z')
    })

    it('returns formatted value for datetimeshort', () => {
      const wrapper = createWrapper({ format: 'datetimeshort' })
      expect(wrapper.vm.formatted).toBe('datetimeshort:2024-01-15T10:30:00Z')
    })

    it('returns formatted value for weekdaytime', () => {
      const wrapper = createWrapper({ format: 'weekdaytime' })
      expect(wrapper.vm.formatted).toBe('weekdayshort:2024-01-15T10:30:00Z')
    })

    it('returns formatted value for dateonlyNoYear', () => {
      const wrapper = createWrapper({ format: 'dateonlyNoYear' })
      expect(wrapper.vm.formatted).toBe('dateonlyNoYear:2024-01-15T10:30:00Z')
    })
  })

  describe('different date values', () => {
    it('formats different date strings', () => {
      const wrapper = createWrapper({ value: '2023-12-25T08:00:00Z' })
      expect(wrapper.text()).toContain('datetime:2023-12-25T08:00:00Z')
    })

    it('handles ISO date strings', () => {
      createWrapper({ value: '2024-03-10T15:45:30.000Z' })
      expect(mockDatetime).toHaveBeenCalledWith('2024-03-10T15:45:30.000Z')
    })
  })
})
