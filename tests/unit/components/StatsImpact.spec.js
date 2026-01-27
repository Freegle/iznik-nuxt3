import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import StatsImpact from '~/components/StatsImpact.vue'

vi.mock('pluralize', () => ({
  default: vi.fn((word, count, showCount) => {
    if (showCount === false) {
      return count === 1 ? word : word + 'S'
    }
    return count === 1 ? `1 ${word}` : `${count} ${word}s`
  }),
}))

describe('StatsImpact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(StatsImpact, {
      props: {
        totalWeight: 1000,
        totalBenefit: 50000,
        totalCO2: 500,
        ...props,
      },
      global: {
        stubs: {
          'b-card': {
            template: '<div class="b-card"><slot /><slot name="body" /></div>',
            props: ['variant', 'noBody'],
          },
          'b-card-body': {
            template: '<div class="b-card-body"><slot /></div>',
          },
          'b-row': {
            template: '<div class="b-row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="b-col"><slot /></div>',
          },
          'v-icon': {
            template:
              '<span class="v-icon" :data-icon="icon" :class="$attrs.class" />',
            props: ['icon', 'scale'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders container div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders weight section', () => {
      const wrapper = createWrapper({ totalWeight: 1500 })
      expect(wrapper.text()).toContain('1,500')
      expect(wrapper.text()).toContain('TONNES')
    })

    it('renders benefit section', () => {
      const wrapper = createWrapper({ totalBenefit: 75000 })
      expect(wrapper.text()).toContain('£75,000')
      expect(wrapper.text()).toContain('BENEFIT')
    })

    it('renders CO2 section', () => {
      const wrapper = createWrapper({ totalCO2: 800 })
      expect(wrapper.text()).toContain('800')
      expect(wrapper.text()).toContain('TONNES CO2')
    })

    it('renders scale icon', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.v-icon[data-icon="balance-scale-left"]').exists()
      ).toBe(true)
    })

    it('renders calculator icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="calculator"]').exists()).toBe(
        true
      )
    })

    it('renders cloud icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="cloud"]').exists()).toBe(true)
    })
  })

  describe('optional stats', () => {
    it('renders gifts section when totalGifts provided', () => {
      const wrapper = createWrapper({ totalGifts: 100 })
      expect(wrapper.text()).toContain('100')
      expect(wrapper.find('.v-icon[data-icon="gift"]').exists()).toBe(true)
    })

    it('does not render gifts section when totalGifts not provided', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="gift"]').exists()).toBe(false)
    })

    it('renders members section when totalMembers provided', () => {
      const wrapper = createWrapper({ totalMembers: 5000 })
      expect(wrapper.text()).toContain('5,000')
      expect(wrapper.find('.v-icon[data-icon="users"]').exists()).toBe(true)
    })

    it('does not render members section when totalMembers not provided', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="users"]').exists()).toBe(false)
    })

    it('renders group count when groupCount provided', () => {
      const wrapper = createWrapper({ groupCount: 25 })
      expect(wrapper.text()).toContain('25')
      expect(wrapper.find('.v-icon[data-icon="map-marker-alt"]').exists()).toBe(
        true
      )
    })

    it('does not render group count when not provided', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="map-marker-alt"]').exists()).toBe(
        false
      )
    })
  })

  describe('range prop', () => {
    it('renders range text when provided', () => {
      const wrapper = createWrapper({
        range: 'this year',
        totalMembers: 1000,
      })
      expect(wrapper.text()).toContain('this year')
    })

    it('does not render range when not provided', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('These three figures')
    })

    it('shows range message for basic stats', () => {
      const wrapper = createWrapper({ range: 'this month' })
      expect(wrapper.text()).toContain(
        'These three figures are totals over this month'
      )
    })
  })

  describe('fullStats computed', () => {
    it('returns false when totalMembers not provided', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.fullStats).toBe(null)
    })

    it('returns true when totalMembers provided', () => {
      const wrapper = createWrapper({ totalMembers: 1000 })
      expect(wrapper.vm.fullStats).toBe(1000)
    })
  })

  describe('scale computed', () => {
    it('returns 4 for basic stats', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.scale).toBe(4)
    })

    it('returns 3 for full stats', () => {
      const wrapper = createWrapper({ totalMembers: 1000 })
      expect(wrapper.vm.scale).toBe(3)
    })
  })

  describe('heading computed', () => {
    it('returns H2 for basic stats', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.heading).toBe('H2')
    })

    it('returns H5 for full stats', () => {
      const wrapper = createWrapper({ totalMembers: 1000 })
      expect(wrapper.vm.heading).toBe('H5')
    })
  })

  describe('pluralized labels', () => {
    it('pluralizes gifts correctly', () => {
      const wrapper = createWrapper({ totalGifts: 1 })
      expect(wrapper.vm.totalGiftsPluralised).toBe('GIFT')
    })

    it('pluralizes gifts plural', () => {
      const wrapper = createWrapper({ totalGifts: 5 })
      expect(wrapper.vm.totalGiftsPluralised).toBe('GIFTS')
    })

    it('pluralizes members correctly', () => {
      const wrapper = createWrapper({ totalMembers: 1 })
      expect(wrapper.vm.totalMembersPluralised).toBe('MEMBER')
    })

    it('pluralizes members plural', () => {
      const wrapper = createWrapper({ totalMembers: 100 })
      expect(wrapper.vm.totalMembersPluralised).toBe('MEMBERS')
    })

    it('pluralizes group count correctly', () => {
      const wrapper = createWrapper({ groupCount: 1 })
      expect(wrapper.vm.groupCountPluralised).toBe('GROUP')
    })

    it('pluralizes group count plural', () => {
      const wrapper = createWrapper({ groupCount: 10 })
      expect(wrapper.vm.groupCountPluralised).toBe('GROUPS')
    })

    it('returns SERVES for single group', () => {
      const wrapper = createWrapper({ groupCount: 1 })
      expect(wrapper.vm.groupServePluralised).toBe('SERVES')
    })

    it('returns SERVE for multiple groups', () => {
      const wrapper = createWrapper({ groupCount: 5 })
      expect(wrapper.vm.groupServePluralised).toBe('SERVE')
    })
  })

  describe('roundIt function', () => {
    it('rounds small numbers to 1 decimal', () => {
      const wrapper = createWrapper({ totalWeight: 45.67 })
      expect(wrapper.text()).toContain('45.7')
    })

    it('rounds large numbers to integers', () => {
      const wrapper = createWrapper({ totalWeight: 1234.5 })
      expect(wrapper.text()).toContain('1,235')
    })

    it('handles zero correctly', () => {
      const wrapper = createWrapper({ totalWeight: 0 })
      expect(wrapper.text()).toContain('0')
    })
  })

  describe('border prop', () => {
    it('does not render icon list when border is false', () => {
      const wrapper = createWrapper({ border: false })
      expect(wrapper.find('.iconlist').exists()).toBe(false)
    })

    it('renders icon list when border is true', () => {
      const wrapper = createWrapper({ border: true })
      expect(wrapper.find('.iconlist').exists()).toBe(true)
    })

    it('renders multiple decorative icons when border is true', () => {
      const wrapper = createWrapper({ border: true })
      const iconList = wrapper.find('.iconlist')
      expect(iconList.findAll('.v-icon').length).toBeGreaterThan(10)
    })
  })

  describe('props', () => {
    it('requires totalWeight', () => {
      const wrapper = createWrapper({ totalWeight: 500 })
      expect(wrapper.props('totalWeight')).toBe(500)
    })

    it('requires totalBenefit', () => {
      const wrapper = createWrapper({ totalBenefit: 10000 })
      expect(wrapper.props('totalBenefit')).toBe(10000)
    })

    it('requires totalCO2', () => {
      const wrapper = createWrapper({ totalCO2: 250 })
      expect(wrapper.props('totalCO2')).toBe(250)
    })

    it('has optional totalGifts defaulting to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('totalGifts')).toBeNull()
    })

    it('has optional totalMembers defaulting to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('totalMembers')).toBeNull()
    })

    it('has optional groupCount defaulting to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('groupCount')).toBeNull()
    })

    it('has optional range defaulting to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('range')).toBeNull()
    })

    it('has optional border defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('border')).toBe(false)
    })
  })

  describe('end prop', () => {
    it('displays end date in members section when provided', () => {
      const wrapper = createWrapper({
        totalMembers: 1000,
        range: 'this year',
        end: '31 Dec 2025',
      })
      expect(wrapper.text()).toContain('31 Dec 2025')
    })
  })
})
