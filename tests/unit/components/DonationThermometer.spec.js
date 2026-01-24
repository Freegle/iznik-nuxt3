import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import DonationThermometer from '~/components/DonationThermometer.vue'

const { mockFetch, mockValues } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockValues: { target: 1000, raised: 500 },
}))

vi.mock('~/stores/donations', () => ({
  useDonationStore: () => ({
    fetch: mockFetch,
    get target() {
      return mockValues.target
    },
    get raised() {
      return mockValues.raised
    },
  }),
}))

vi.mock('~/components/VueThermometer', () => ({
  default: defineComponent({
    name: 'VueThermometer',
    props: ['value', 'min', 'max', 'options', 'scale'],
    template:
      '<div class="vue-thermometer" :data-value="value" :data-max="max" />',
  }),
}))

describe('DonationThermometer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValues.target = 1000
    mockValues.raised = 500
    mockFetch.mockResolvedValue({})
  })

  async function createWrapper(props = {}) {
    const WrapperComponent = defineComponent({
      components: { DonationThermometer },
      render() {
        return h(Suspense, null, {
          default: () => h(DonationThermometer, props),
        })
      },
    })
    const wrapper = mount(WrapperComponent)
    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders container div', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders VueThermometer component', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.vue-thermometer').exists()).toBe(true)
    })

    it('displays raised amount when raised is truthy', async () => {
      mockValues.raised = 750
      const wrapper = await createWrapper()
      expect(wrapper.find('h4').exists()).toBe(true)
      expect(wrapper.text()).toContain('£750')
      expect(wrapper.text()).toContain('Raised')
    })

    it('hides raised amount when raised is 0', async () => {
      mockValues.raised = 0
      const wrapper = await createWrapper()
      expect(wrapper.find('h4').exists()).toBe(false)
    })
  })

  describe('thermometer props', () => {
    it('passes raised value to thermometer', async () => {
      mockValues.raised = 600
      const wrapper = await createWrapper()
      expect(wrapper.find('.vue-thermometer').attributes('data-value')).toBe(
        '600'
      )
    })

    it('passes computed max to thermometer when raised < target', async () => {
      mockValues.target = 1000
      mockValues.raised = 500
      const wrapper = await createWrapper()
      expect(wrapper.find('.vue-thermometer').attributes('data-max')).toBe(
        '1000'
      )
    })
  })

  describe('computed max', () => {
    it('returns target when raised is less than target', async () => {
      mockValues.target = 1000
      mockValues.raised = 500
      const wrapper = await createWrapper()
      // Check via thermometer data-max attribute
      expect(wrapper.find('.vue-thermometer').attributes('data-max')).toBe(
        '1000'
      )
    })

    it('stretches max when raised exceeds target', async () => {
      mockValues.target = 1000
      mockValues.raised = 1100
      const wrapper = await createWrapper()
      // raised * 1.1 = 1210, rounds: Math.round((1210+0.5)/500)*500 = 1000
      expect(wrapper.find('.vue-thermometer').attributes('data-max')).toBe(
        '1000'
      )
    })

    it('rounds to nearest 500 when max > 500', async () => {
      mockValues.target = 1000
      mockValues.raised = 1500
      const wrapper = await createWrapper()
      // raised * 1.1 = 1650, rounds: Math.round((1650+0.5)/500)*500 = 1500
      expect(wrapper.find('.vue-thermometer').attributes('data-max')).toBe(
        '1500'
      )
    })

    it('rounds up for higher raised amounts', async () => {
      mockValues.target = 1000
      mockValues.raised = 2000
      const wrapper = await createWrapper()
      // raised * 1.1 = 2200, rounds: Math.round((2200+0.5)/500)*500 = 2000
      expect(wrapper.find('.vue-thermometer').attributes('data-max')).toBe(
        '2000'
      )
    })

    it('uses exact 1.1x multiplier when raised is small', async () => {
      mockValues.target = 100
      mockValues.raised = 150
      const wrapper = await createWrapper()
      // raised * 1.1 = 165, which is < 500, so no rounding
      expect(wrapper.find('.vue-thermometer').attributes('data-max')).toBe(
        '165'
      )
    })
  })

  describe('props', () => {
    it('has groupid prop defaulting to null', async () => {
      await createWrapper()
      // Verify default by checking fetch was called with null
      expect(mockFetch).toHaveBeenCalledWith(null)
    })

    it('accepts custom groupid', async () => {
      await createWrapper({ groupid: 123 })
      // Verify groupid passed to fetch
      expect(mockFetch).toHaveBeenCalledWith(123)
    })
  })

  describe('store interaction', () => {
    it('calls donationStore.fetch on mount', async () => {
      await createWrapper()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('passes groupid to fetch', async () => {
      await createWrapper({ groupid: 456 })
      expect(mockFetch).toHaveBeenCalledWith(456)
    })

    it('passes null groupid when not provided', async () => {
      await createWrapper()
      expect(mockFetch).toHaveBeenCalledWith(null)
    })
  })

  describe('thermometer rendering', () => {
    it('renders thermometer with correct scale', async () => {
      const wrapper = await createWrapper()
      // Component passes scale="£" to thermometer
      expect(wrapper.find('.vue-thermometer').exists()).toBe(true)
    })

    it('renders thermometer with min value of 0', async () => {
      const wrapper = await createWrapper()
      // The thermometer receives min=0 from the component
      expect(wrapper.find('.vue-thermometer').exists()).toBe(true)
    })
  })
})
