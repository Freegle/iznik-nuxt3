import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import ModDashboardImpact from '~/modtools/components/ModDashboardImpact.vue'

// Extend dayjs with plugins required by the component
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

// Mock the composable
const mockLoading = ref(false)
const mockWeight = ref(null)

vi.mock('~/modtools/composables/useModDashboard', () => ({
  useModDashboard: () => ({
    loading: mockLoading,
    Weight: mockWeight,
  }),
}))

// Mock the reuse benefit composable
vi.mock('~/composables/useReuseBenefit', () => ({
  getBenefitPerTonne: () => 1000,
  CO2_PER_TONNE: 0.51,
}))

describe('ModDashboardImpact', () => {
  const defaultProps = {
    groupid: 123,
    groupName: 'Test Group',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
  }

  const mockWeightData = [
    { date: '2024-01-05', count: 500 }, // 500g
    { date: '2024-01-10', count: 1000 }, // 1kg
    { date: '2024-01-15', count: 2500 }, // 2.5kg
    { date: '2024-01-20', count: 6000 }, // 6kg
  ]

  function mountComponent(props = {}) {
    return mount(ModDashboardImpact, {
      props: { ...defaultProps, ...props },
      global: {
        plugins: [createPinia()],
        stubs: {
          'b-card': {
            template: '<div class="card"><slot /></div>',
            props: ['noBody'],
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
          },
          ModImpact: {
            template:
              '<div class="mod-impact" :data-range="range" :data-benefit="totalBenefit" :data-co2="totalCO2" :data-weight="totalWeight">Impact</div>',
            props: ['range', 'totalBenefit', 'totalCO2', 'totalWeight'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockLoading.value = false
    mockWeight.value = null
  })

  describe('rendering', () => {
    it('renders heading with group name', () => {
      mockWeight.value = mockWeightData
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Impact')
      expect(wrapper.text()).toContain('Test Group')
    })

    it('renders descriptive paragraph', () => {
      mockWeight.value = mockWeightData
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'This is our estimate of the impact your active communities have had'
      )
    })

    it('shows loading state when loading', () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Loading')
    })

    it('shows pulsate class when loading', () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.find('.pulsate').exists()).toBe(true)
    })

    it('shows text-faded class when loading', () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.find('.text-faded').exists()).toBe(true)
    })

    it('hides loading and shows ModImpact when not loading', () => {
      mockLoading.value = false
      mockWeight.value = mockWeightData
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('Loading')
      expect(wrapper.find('.mod-impact').exists()).toBe(true)
    })
  })

  describe('date formatting', () => {
    it('formats start date correctly', () => {
      mockWeight.value = mockWeightData
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      expect(modImpact.attributes('data-range')).toContain('2024-01-01')
    })

    it('formats end date correctly', () => {
      mockWeight.value = mockWeightData
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      expect(modImpact.attributes('data-range')).toContain('2024-01-31')
    })

    it('formats range with dash separator', () => {
      mockWeight.value = mockWeightData
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      expect(modImpact.attributes('data-range')).toBe('2024-01-01 - 2024-01-31')
    })
  })

  describe('totalWeight computed property', () => {
    it('calculates total weight correctly (grams to kg)', () => {
      mockWeight.value = mockWeightData
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      // Total: 500 + 1000 + 2500 + 6000 = 10000g / 1000 = 10kg
      expect(modImpact.attributes('data-weight')).toBe('10')
    })

    it('returns 0 when no weight data', () => {
      mockWeight.value = null
      mockLoading.value = false
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      expect(modImpact.attributes('data-weight')).toBe('0')
    })

    it('returns 0 when weight array is empty', () => {
      mockWeight.value = []
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      expect(modImpact.attributes('data-weight')).toBe('0')
    })

    it('only includes weights within date range', () => {
      mockWeight.value = [
        { date: '2023-12-15', count: 1000 }, // Before range
        { date: '2024-01-10', count: 2000 }, // In range
        { date: '2024-02-15', count: 1000 }, // After range
      ]
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      // Only 2000g in range / 1000 = 2kg
      expect(modImpact.attributes('data-weight')).toBe('2')
    })

    it('includes weights on start date boundary', () => {
      mockWeight.value = [{ date: '2024-01-01', count: 5000 }]
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      // 5000g / 1000 = 5kg
      expect(modImpact.attributes('data-weight')).toBe('5')
    })

    it('includes weights on end date boundary', () => {
      mockWeight.value = [{ date: '2024-01-31', count: 5000 }]
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      // 5000g / 1000 = 5kg
      expect(modImpact.attributes('data-weight')).toBe('5')
    })
  })

  describe('totalBenefit computed property', () => {
    it('calculates benefit based on weight and benefit per tonne', () => {
      mockWeight.value = mockWeightData
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      // 10kg * 1000 (mocked benefit per tonne) = 10000
      expect(modImpact.attributes('data-benefit')).toBe('10000')
    })

    it('returns 0 when no weight data', () => {
      mockWeight.value = null
      mockLoading.value = false
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      expect(modImpact.attributes('data-benefit')).toBe('0')
    })

    it('calculates benefit correctly for larger weight', () => {
      // 100000g / 1000 = 100kg; 100 * 1000 = 100000
      mockWeight.value = [{ date: '2024-01-15', count: 100000 }]
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      expect(modImpact.attributes('data-benefit')).toBe('100000')
    })
  })

  describe('totalCO2 computed property', () => {
    it('calculates CO2 based on weight and CO2 per tonne', () => {
      mockWeight.value = mockWeightData
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      // 10kg * 0.51 = 5.1
      expect(modImpact.attributes('data-co2')).toBe('5.1')
    })

    it('returns 0 when no weight data', () => {
      mockWeight.value = null
      mockLoading.value = false
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      expect(modImpact.attributes('data-co2')).toBe('0')
    })

    it('calculates CO2 correctly for specific weight', () => {
      // 2000g / 1000 = 2kg; 2 * 0.51 = 1.02
      mockWeight.value = [{ date: '2024-01-15', count: 2000 }]
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      expect(modImpact.attributes('data-co2')).toBe('1.02')
    })
  })

  describe('props', () => {
    it('accepts groupid prop', () => {
      mockWeight.value = mockWeightData
      const wrapper = mountComponent()
      expect(wrapper.props('groupid')).toBe(123)
    })

    it('accepts null groupid (default)', () => {
      mockWeight.value = mockWeightData
      const wrapper = mountComponent({ groupid: null })
      expect(wrapper.props('groupid')).toBeNull()
    })

    it('accepts groupName prop', () => {
      mockWeight.value = mockWeightData
      const wrapper = mountComponent()
      expect(wrapper.props('groupName')).toBe('Test Group')
    })

    it('accepts start date prop', () => {
      mockWeight.value = mockWeightData
      const wrapper = mountComponent()
      expect(wrapper.props('start')).toEqual(new Date('2024-01-01'))
    })

    it('accepts end date prop', () => {
      mockWeight.value = mockWeightData
      const wrapper = mountComponent()
      expect(wrapper.props('end')).toEqual(new Date('2024-01-31'))
    })

    it('displays different group name', () => {
      mockWeight.value = mockWeightData
      const wrapper = mountComponent({ groupName: 'Another Group' })
      expect(wrapper.text()).toContain('Another Group')
    })
  })

  describe('edge cases', () => {
    it('handles large weights correctly', () => {
      // 100000000g / 1000 = 100000kg
      mockWeight.value = [{ date: '2024-01-15', count: 100000000 }]
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      expect(modImpact.attributes('data-weight')).toBe('100000')
    })

    it('handles fractional weights correctly', () => {
      // 1g / 1000 = 0.001kg
      mockWeight.value = [{ date: '2024-01-15', count: 1 }]
      const wrapper = mountComponent()
      const modImpact = wrapper.find('.mod-impact')
      expect(modImpact.attributes('data-weight')).toBe('0.001')
    })

    it('handles different date ranges', () => {
      mockWeight.value = [
        { date: '2024-06-01', count: 5000 },
        { date: '2024-06-15', count: 5000 },
      ]
      const wrapper = mountComponent({
        start: new Date('2024-06-01'),
        end: new Date('2024-06-30'),
      })
      const modImpact = wrapper.find('.mod-impact')
      expect(modImpact.attributes('data-range')).toBe('2024-06-01 - 2024-06-30')
      // 10000g / 1000 = 10kg
      expect(modImpact.attributes('data-weight')).toBe('10')
    })
  })

  describe('loading and data transitions', () => {
    it('shows loading when loading with data', () => {
      mockLoading.value = true
      mockWeight.value = mockWeightData
      const wrapper = mountComponent()
      expect(wrapper.find('.pulsate').exists()).toBe(true)
    })

    it('shows data when loading completes', async () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Loading')

      mockLoading.value = false
      mockWeight.value = mockWeightData
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.mod-impact').exists()).toBe(true)
    })
  })
})
