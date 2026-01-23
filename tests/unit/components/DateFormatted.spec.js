import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DateFormatted from '~/components/DateFormatted.vue'

// Mock the useTimeFormat composable
vi.mock('~/composables/useTimeFormat', () => ({
  dateonly: (val) => `dateonly:${val}`,
  datetime: (val) => `datetime:${val}`,
  datetimeshort: (val) => `datetimeshort:${val}`,
  dateshort: (val) => `dateshort:${val}`,
  weekdayshort: (val) => `weekdayshort:${val}`,
  dateonlyNoYear: (val) => `dateonlyNoYear:${val}`,
}))

describe('DateFormatted', () => {
  const testDate = '2024-06-15T10:30:00Z'

  function createWrapper(props = {}) {
    return mount(DateFormatted, {
      props: {
        value: testDate,
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders as a span element', () => {
      const wrapper = createWrapper()
      expect(wrapper.element.tagName.toLowerCase()).toBe('span')
    })
  })

  describe('props', () => {
    it('requires value prop', () => {
      const wrapper = createWrapper({ value: '2024-01-01' })
      expect(wrapper.props('value')).toBe('2024-01-01')
    })

    it('defaults format to datetime', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('format')).toBe('datetime')
    })

    it('accepts format prop', () => {
      const wrapper = createWrapper({ format: 'dateonly' })
      expect(wrapper.props('format')).toBe('dateonly')
    })
  })

  describe('datetime format (default)', () => {
    it('formats with datetime by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toBe(`datetime:${testDate}`)
    })

    it('formats explicitly with datetime format', () => {
      const wrapper = createWrapper({ format: 'datetime' })
      expect(wrapper.text()).toBe(`datetime:${testDate}`)
    })
  })

  describe('dateonly format', () => {
    it('formats with dateonly', () => {
      const wrapper = createWrapper({ format: 'dateonly' })
      expect(wrapper.text()).toBe(`dateonly:${testDate}`)
    })
  })

  describe('dateonlyNoYear format', () => {
    it('formats with dateonlyNoYear', () => {
      const wrapper = createWrapper({ format: 'dateonlyNoYear' })
      expect(wrapper.text()).toBe(`dateonlyNoYear:${testDate}`)
    })
  })

  describe('dateshort format', () => {
    it('formats with dateshort', () => {
      const wrapper = createWrapper({ format: 'dateshort' })
      expect(wrapper.text()).toBe(`dateshort:${testDate}`)
    })
  })

  describe('datetimeshort format', () => {
    it('formats with datetimeshort', () => {
      const wrapper = createWrapper({ format: 'datetimeshort' })
      expect(wrapper.text()).toBe(`datetimeshort:${testDate}`)
    })
  })

  describe('weekdaytime format', () => {
    it('formats with weekdayshort', () => {
      const wrapper = createWrapper({ format: 'weekdaytime' })
      expect(wrapper.text()).toBe(`weekdayshort:${testDate}`)
    })
  })

  describe('unknown format', () => {
    it('falls back to datetime for unknown format', () => {
      const wrapper = createWrapper({ format: 'unknown_format' })
      expect(wrapper.text()).toBe(`datetime:${testDate}`)
    })
  })

  describe('reactivity', () => {
    it('updates when value changes', async () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toBe(`datetime:${testDate}`)

      await wrapper.setProps({ value: '2025-01-01T00:00:00Z' })
      expect(wrapper.text()).toBe('datetime:2025-01-01T00:00:00Z')
    })

    it('updates when format changes', async () => {
      const wrapper = createWrapper({ format: 'datetime' })
      expect(wrapper.text()).toBe(`datetime:${testDate}`)

      await wrapper.setProps({ format: 'dateonly' })
      expect(wrapper.text()).toBe(`dateonly:${testDate}`)
    })
  })
})
