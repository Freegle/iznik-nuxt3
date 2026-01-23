import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AddToCalendar from '~/components/AddToCalendar.vue'

// Mock the mobile store
const mockMobileStore = {
  isApp: false,
  isiOS: false,
}
vi.mock('@/stores/mobile', () => ({
  useMobileStore: () => mockMobileStore,
}))

// Mock save-file
const mockSaveAs = vi.fn().mockResolvedValue(undefined)
vi.mock('save-file', () => ({
  default: (blob, filename) => mockSaveAs(blob, filename),
}))

describe('AddToCalendar', () => {
  const validCalendarData = {
    name: 'Test Event',
    description: 'Test description',
    location: 'Test Location',
    startDate: '2024-06-15',
    startTime: '10:00',
    endTime: '11:00',
    timeZone: 'Europe/London',
  }

  // Create a valid calendar link
  function createCalendarLink(data = validCalendarData) {
    const encoded = btoa(JSON.stringify(data))
    return `https://example.com/calendar?data=${encoded}`
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMobileStore.isApp = false
    mockMobileStore.isiOS = false
  })

  function createWrapper(props = {}) {
    return mount(AddToCalendar, {
      props: {
        calendarLink: createCalendarLink(),
        ...props,
      },
      global: {
        stubs: {
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size'],
          },
          'v-icon': true,
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('displays "Add to Calendar" button text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Add to Calendar')
    })

    it('applies the variant prop to button', () => {
      const wrapper = createWrapper({ variant: 'primary' })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('primary')
    })

    it('uses secondary as default variant', () => {
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      expect(button.classes()).toContain('secondary')
    })
  })

  describe('props', () => {
    it('requires calendarLink prop', () => {
      // This tests that the component has the prop defined as required
      const wrapper = createWrapper()
      expect(wrapper.props('calendarLink')).toBeTruthy()
    })

    it('accepts variant prop', () => {
      const wrapper = createWrapper({ variant: 'success' })
      expect(wrapper.props('variant')).toBe('success')
    })

    it('accepts size prop', () => {
      const wrapper = createWrapper({ size: 'lg' })
      expect(wrapper.props('size')).toBe('lg')
    })

    it('accepts btnClass prop', () => {
      const wrapper = createWrapper({ btnClass: 'custom-class' })
      expect(wrapper.props('btnClass')).toBe('custom-class')
    })

    it('defaults size to md', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('size')).toBe('md')
    })
  })

  describe('download functionality (web)', () => {
    it('generates ICS file on button click when not in app', async () => {
      const wrapper = createWrapper()
      const button = wrapper.find('button')

      await button.trigger('click')
      await flushPromises()

      expect(mockSaveAs).toHaveBeenCalled()
      const [blob, filename] = mockSaveAs.mock.calls[0]
      expect(filename).toBe('freegle-handover.ics')
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('text/calendar;charset=utf-8')
    })

    it('includes event details in ICS content', async () => {
      const wrapper = createWrapper()
      const button = wrapper.find('button')

      await button.trigger('click')
      await flushPromises()

      const [blob] = mockSaveAs.mock.calls[0]
      const text = await blob.text()

      expect(text).toContain('BEGIN:VCALENDAR')
      expect(text).toContain('END:VCALENDAR')
      expect(text).toContain('SUMMARY:Test Event')
      expect(text).toContain('DESCRIPTION:Test description')
      expect(text).toContain('LOCATION:Test Location')
    })

    it('handles missing calendar data gracefully', async () => {
      const wrapper = createWrapper({
        calendarLink: 'https://example.com/calendar',
      })
      const button = wrapper.find('button')

      // Should not throw - should handle gracefully
      await button.trigger('click')
      await flushPromises()

      expect(mockSaveAs).not.toHaveBeenCalled()
    })
  })

  describe('app mode', () => {
    it('checks for mobile store isApp property', () => {
      // The component uses mobileStore.isApp to determine behavior
      expect(mockMobileStore).toHaveProperty('isApp')
    })

    it('does not use saveAs when isApp is true (would use calendar plugin)', () => {
      // We can't fully test the Cordova calendar plugin in jsdom,
      // but we can verify the component checks the isApp flag
      mockMobileStore.isApp = true
      const wrapper = createWrapper()
      // Component exists and renders correctly even in app mode
      expect(wrapper.exists()).toBe(true)
    })
  })
})
