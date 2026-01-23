import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { Suspense, defineComponent, h } from 'vue'
import DonationThermometer from '~/components/DonationThermometer.vue'

// Mock donation store
const mockFetch = vi.fn().mockResolvedValue(undefined)
let targetValue = 1000
let raisedValue = 500

vi.mock('~/stores/donations', () => ({
  useDonationStore: () => ({
    fetch: mockFetch,
    get target() {
      return targetValue
    },
    get raised() {
      return raisedValue
    },
  }),
}))

describe('DonationThermometer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    targetValue = 1000
    raisedValue = 500
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      render() {
        return h(Suspense, null, {
          default: () => h(DonationThermometer, props),
        })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          VueThermometer: {
            template:
              '<div class="vue-thermometer" :data-value="value" :data-min="min" :data-max="max"></div>',
            props: ['value', 'min', 'max', 'options', 'scale'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('mounts successfully', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders thermometer component', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.vue-thermometer').exists()).toBe(true)
    })

    it('displays raised amount', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('£500')
      expect(wrapper.text()).toContain('Raised')
    })

    it('does not show raised heading when raised is 0', async () => {
      raisedValue = 0
      const wrapper = await createWrapper()
      expect(wrapper.find('h4').exists()).toBe(false)
    })
  })

  describe('thermometer values', () => {
    it('passes raised value to thermometer', async () => {
      const wrapper = await createWrapper()
      const thermometer = wrapper.find('.vue-thermometer')
      expect(thermometer.attributes('data-value')).toBe('500')
    })

    it('passes min value of 0 to thermometer', async () => {
      const wrapper = await createWrapper()
      const thermometer = wrapper.find('.vue-thermometer')
      expect(thermometer.attributes('data-min')).toBe('0')
    })

    it('uses target as max when raised is less than target', async () => {
      raisedValue = 500
      targetValue = 1000
      const wrapper = await createWrapper()
      const thermometer = wrapper.find('.vue-thermometer')
      expect(thermometer.attributes('data-max')).toBe('1000')
    })

    it('stretches max when raised exceeds target', async () => {
      raisedValue = 1200
      targetValue = 1000
      const wrapper = await createWrapper()
      const thermometer = wrapper.find('.vue-thermometer')
      // max should be raised * 1.1 = 1320, rounded to nearest 500 = 1500
      expect(thermometer.attributes('data-max')).toBe('1500')
    })

    it('calculates max correctly for smaller amounts', async () => {
      raisedValue = 300
      targetValue = 200
      const wrapper = await createWrapper()
      const thermometer = wrapper.find('.vue-thermometer')
      // max should be 300 * 1.1 = 330 (under 500, no rounding)
      expect(thermometer.attributes('data-max')).toBe('330')
    })
  })

  describe('store interactions', () => {
    it('fetches donation data on mount', async () => {
      await createWrapper()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('fetches with groupid when provided', async () => {
      await createWrapper({ groupid: 123 })
      expect(mockFetch).toHaveBeenCalledWith(123)
    })

    it('fetches with null groupid when not provided', async () => {
      await createWrapper()
      expect(mockFetch).toHaveBeenCalledWith(null)
    })
  })

  describe('props', () => {
    it('groupid is optional', () => {
      const props = DonationThermometer.props
      expect(props.groupid.required).toBe(false)
    })

    it('groupid defaults to null', () => {
      const props = DonationThermometer.props
      expect(props.groupid.default).toBe(null)
    })

    it('groupid is Number type', () => {
      const props = DonationThermometer.props
      expect(props.groupid.type).toBe(Number)
    })
  })
})
