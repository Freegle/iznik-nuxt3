import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

// Constants from the component
const DAY_OF_WEEK = 4 // Thursday
const START = '1400'
const STARTHOUR = 13
const END = '1700'

// Mock misc store
const mockMiscStore = {
  time: new Date(),
}

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

// Create test component that mirrors ModZoomStock logic
const ModZoomStockTest = {
  template: `
    <div class="font-weight-bold">
      <div v-if="now" class="d-flex now-message">
        <a href="https://zoom.us/j/test" class="text-warning">ZoomStock happening now till 5pm!</a>
      </div>
      <div v-else-if="today" class="d-flex today-message">
        <a href="https://zoom.us/j/test" :class="colorClass">ZoomStock Thursdays - link will be here 2pm-5pm.</a>
      </div>
      <div v-else class="d-flex future-message">
        ZoomStock Thursdays @ 2pm-5pm, next {{ timeagoValue }}. Join other volunteers for a natter.
      </div>
    </div>
  `,
  props: {
    colorClass: {
      type: String,
      default: 'text-white',
    },
  },
  setup() {
    const nextOne = ref(null)

    const timeNow = computed(() => {
      return mockMiscStore.time ? dayjs().format('HHmm') : ''
    })

    const fromNow = computed(() => {
      return mockMiscStore.time && nextOne.value ? nextOne.value : null
    })

    const today = computed(() => {
      const d = dayjs()
      return d.day() === DAY_OF_WEEK && timeNow.value < START
    })

    const now = computed(() => {
      return (
        dayjs().day() === DAY_OF_WEEK &&
        timeNow.value >= START &&
        timeNow.value <= END
      )
    })

    // Simulate timeago function
    const timeagoValue = computed(() => {
      if (fromNow.value) {
        return fromNow.value.fromNow()
      }
      return ''
    })

    // Calculate nextOne as in the real component's onMounted
    function initNextOne() {
      let d = dayjs().hour(STARTHOUR).minute(0).second(0)

      if (d.day() < DAY_OF_WEEK) {
        d = d.day(DAY_OF_WEEK)
      } else {
        d = d.add(1, 'week').day(DAY_OF_WEEK)
      }
      nextOne.value = d
    }

    return {
      nextOne,
      timeNow,
      fromNow,
      today,
      now,
      timeagoValue,
      initNextOne,
    }
  },
}

describe('ModZoomStock', () => {
  function mountComponent(props = {}) {
    const wrapper = mount(ModZoomStockTest, {
      props: { colorClass: 'text-white', ...props },
    })
    wrapper.vm.initNextOne()
    return wrapper
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMiscStore.time = new Date()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders a container div', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.font-weight-bold').exists()).toBe(true)
    })

    it('shows one of the three possible states', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const hasNow = wrapper.find('.now-message').exists()
      const hasToday = wrapper.find('.today-message').exists()
      const hasFuture = wrapper.find('.future-message').exists()

      // Exactly one should be true
      const count = [hasNow, hasToday, hasFuture].filter(Boolean).length
      expect(count).toBe(1)
    })
  })

  describe('props', () => {
    it('accepts custom colorClass prop', () => {
      const wrapper = mountComponent({ colorClass: 'text-primary' })
      expect(wrapper.props('colorClass')).toBe('text-primary')
    })
  })

  describe('computed properties', () => {
    describe('timeNow', () => {
      it('returns formatted time string when miscStore.time is set', () => {
        const wrapper = mountComponent()
        const timeNow = wrapper.vm.timeNow
        // Should be a 4-digit string like "1430"
        expect(timeNow).toMatch(/^\d{4}$/)
      })

      it('returns empty string when miscStore.time is null', async () => {
        mockMiscStore.time = null
        const wrapper = mountComponent()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.timeNow).toBe('')
      })
    })

    describe('fromNow', () => {
      it('returns nextOne when miscStore.time is set', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.fromNow).not.toBeNull()
      })

      it('returns null when miscStore.time is null', async () => {
        mockMiscStore.time = null
        const wrapper = mountComponent()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.fromNow).toBeNull()
      })

      it('returns null when nextOne is not set', () => {
        const wrapper = mount(ModZoomStockTest)
        // Don't call initNextOne
        expect(wrapper.vm.fromNow).toBeNull()
      })
    })

    describe('today', () => {
      it('returns true on Thursday before 2pm', () => {
        // Mock a Thursday at 10am
        vi.useFakeTimers()
        const thursdayMorning = dayjs().day(4).hour(10).minute(0).second(0)
        vi.setSystemTime(thursdayMorning.toDate())

        const wrapper = mountComponent()
        expect(wrapper.vm.today).toBe(true)
      })

      it('returns false on Thursday after 2pm start time', () => {
        vi.useFakeTimers()
        const thursdayAfternoon = dayjs().day(4).hour(14).minute(30).second(0)
        vi.setSystemTime(thursdayAfternoon.toDate())

        const wrapper = mountComponent()
        expect(wrapper.vm.today).toBe(false)
      })

      it('returns false on non-Thursday days', () => {
        vi.useFakeTimers()
        const wednesday = dayjs().day(3).hour(10).minute(0).second(0)
        vi.setSystemTime(wednesday.toDate())

        const wrapper = mountComponent()
        expect(wrapper.vm.today).toBe(false)
      })
    })

    describe('now', () => {
      it('returns true on Thursday during ZoomStock hours (2pm-5pm)', () => {
        vi.useFakeTimers()
        const thursdayDuring = dayjs().day(4).hour(15).minute(0).second(0)
        vi.setSystemTime(thursdayDuring.toDate())

        const wrapper = mountComponent()
        expect(wrapper.vm.now).toBe(true)
      })

      it('returns true at exactly 2pm Thursday', () => {
        vi.useFakeTimers()
        const thursdayStart = dayjs().day(4).hour(14).minute(0).second(0)
        vi.setSystemTime(thursdayStart.toDate())

        const wrapper = mountComponent()
        expect(wrapper.vm.now).toBe(true)
      })

      it('returns true at exactly 5pm Thursday', () => {
        vi.useFakeTimers()
        const thursdayEnd = dayjs().day(4).hour(17).minute(0).second(0)
        vi.setSystemTime(thursdayEnd.toDate())

        const wrapper = mountComponent()
        expect(wrapper.vm.now).toBe(true)
      })

      it('returns false on Thursday before 2pm', () => {
        vi.useFakeTimers()
        const thursdayMorning = dayjs().day(4).hour(10).minute(0).second(0)
        vi.setSystemTime(thursdayMorning.toDate())

        const wrapper = mountComponent()
        expect(wrapper.vm.now).toBe(false)
      })

      it('returns false on Thursday after 5pm', () => {
        vi.useFakeTimers()
        const thursdayEvening = dayjs().day(4).hour(18).minute(0).second(0)
        vi.setSystemTime(thursdayEvening.toDate())

        const wrapper = mountComponent()
        expect(wrapper.vm.now).toBe(false)
      })

      it('returns false on non-Thursday at 3pm', () => {
        vi.useFakeTimers()
        const wednesdayAfternoon = dayjs().day(3).hour(15).minute(0).second(0)
        vi.setSystemTime(wednesdayAfternoon.toDate())

        const wrapper = mountComponent()
        expect(wrapper.vm.now).toBe(false)
      })
    })
  })

  describe('nextOne calculation', () => {
    it('sets nextOne to this Thursday if before Thursday', () => {
      vi.useFakeTimers()
      const monday = dayjs().day(1).hour(10).minute(0).second(0)
      vi.setSystemTime(monday.toDate())

      const wrapper = mountComponent()
      expect(wrapper.vm.nextOne.day()).toBe(DAY_OF_WEEK)
    })

    it('sets nextOne to next week Thursday if on or after Thursday', () => {
      vi.useFakeTimers()
      const friday = dayjs().day(5).hour(10).minute(0).second(0)
      vi.setSystemTime(friday.toDate())

      const wrapper = mountComponent()
      // nextOne should be Thursday of next week
      expect(wrapper.vm.nextOne.day()).toBe(DAY_OF_WEEK)
      // And it should be in the future
      expect(wrapper.vm.nextOne.isAfter(dayjs())).toBe(true)
    })

    it('sets nextOne with correct hour (1pm)', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.nextOne.hour()).toBe(STARTHOUR)
    })
  })

  describe('display content', () => {
    it('shows "happening now" message during ZoomStock', async () => {
      vi.useFakeTimers()
      const thursdayDuring = dayjs().day(4).hour(15).minute(0).second(0)
      vi.setSystemTime(thursdayDuring.toDate())

      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.now-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('ZoomStock happening now')
    })

    it('shows "today" message on Thursday before ZoomStock', async () => {
      vi.useFakeTimers()
      const thursdayMorning = dayjs().day(4).hour(10).minute(0).second(0)
      vi.setSystemTime(thursdayMorning.toDate())

      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.today-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('link will be here 2pm-5pm')
    })

    it('shows "future" message on non-ZoomStock times', async () => {
      vi.useFakeTimers()
      const wednesday = dayjs().day(3).hour(10).minute(0).second(0)
      vi.setSystemTime(wednesday.toDate())

      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.future-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('ZoomStock Thursdays @ 2pm-5pm')
    })

    it('contains Zoom link when now', async () => {
      vi.useFakeTimers()
      const thursdayDuring = dayjs().day(4).hour(15).minute(0).second(0)
      vi.setSystemTime(thursdayDuring.toDate())

      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const link = wrapper.find('a')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toContain('zoom.us')
    })

    it('applies colorClass to today link', async () => {
      vi.useFakeTimers()
      const thursdayMorning = dayjs().day(4).hour(10).minute(0).second(0)
      vi.setSystemTime(thursdayMorning.toDate())

      const wrapper = mountComponent({ colorClass: 'text-primary' })
      await wrapper.vm.$nextTick()

      const link = wrapper.find('.today-message a')
      expect(link.classes()).toContain('text-primary')
    })
  })

  describe('edge cases', () => {
    it('handles miscStore.time being undefined', async () => {
      mockMiscStore.time = undefined
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      // Should not throw, timeNow should be empty
      expect(wrapper.vm.timeNow).toBe('')
    })

    it('handles null nextOne gracefully', () => {
      const wrapper = mount(ModZoomStockTest)
      // Don't call initNextOne
      expect(wrapper.vm.fromNow).toBeNull()
      expect(wrapper.vm.timeagoValue).toBe('')
    })
  })
})
