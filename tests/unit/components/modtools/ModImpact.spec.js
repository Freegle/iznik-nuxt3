import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModImpact from '~/modtools/components/ModImpact.vue'

describe('ModImpact', () => {
  const defaultProps = {
    totalWeight: 150.5,
    totalBenefit: 75000,
    totalCO2: 45.3,
  }

  function mountComponent(props = {}) {
    return mount(ModImpact, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-card': {
            template:
              '<div class="card"><slot /><slot name="body" /><slot name="header" /></div>',
            props: ['variant', 'noBody'],
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['class'],
          },
          'v-icon': {
            template: '<span class="icon" :class="icon" />',
            props: ['icon', 'scale'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders total weight in tonnes', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('151')
      expect(wrapper.text()).toContain('TONNES')
    })

    it('renders total benefit with pound sign', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('75,000')
      expect(wrapper.text()).toContain('BENEFIT')
    })

    it('renders total CO2', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('45.3')
      expect(wrapper.text()).toContain('TONNES CO2')
    })

    it('shows gifts column when totalGifts provided', () => {
      const wrapper = mountComponent({ totalGifts: 1000 })
      expect(wrapper.text()).toContain('1,000')
      expect(wrapper.text()).toContain('GIFT')
    })

    it('hides gifts column when totalGifts not provided', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('GIFT')
    })

    it('shows members column when totalMembers provided', () => {
      const wrapper = mountComponent({ totalMembers: 5000 })
      expect(wrapper.text()).toContain('5,000')
      expect(wrapper.text()).toContain('MEMBER')
    })

    it('shows group count when provided', () => {
      const wrapper = mountComponent({ groupCount: 15 })
      expect(wrapper.text()).toContain('15')
      expect(wrapper.text()).toContain('COMMUNIT')
    })

    it('shows range when provided and not fullStats', () => {
      const wrapper = mountComponent({ range: 'last 12 months' })
      expect(wrapper.text()).toContain('last 12 months')
    })

    it('renders border icons when border prop is true', () => {
      const wrapper = mountComponent({ border: true })
      const iconList = wrapper.find('.iconlist')
      expect(iconList.exists()).toBe(true)
    })

    it('does not render border icons when border prop is false', () => {
      const wrapper = mountComponent({ border: false })
      const iconList = wrapper.find('.iconlist')
      expect(iconList.exists()).toBe(false)
    })
  })

  describe('roundIt function', () => {
    it('rounds values >= 100 to whole numbers', () => {
      const wrapper = mountComponent({ totalWeight: 150.7 })
      expect(wrapper.text()).toContain('151')
    })

    it('rounds values < 100 to one decimal place', () => {
      const wrapper = mountComponent({ totalWeight: 45.37 })
      expect(wrapper.text()).toContain('45.4')
    })

    it('handles zero values', () => {
      const wrapper = mountComponent({ totalWeight: 0 })
      expect(wrapper.text()).toContain('0')
    })

    it('handles very small values', () => {
      const wrapper = mountComponent({ totalWeight: 0.05 })
      expect(wrapper.text()).toContain('0.1')
    })

    it('handles very large values', () => {
      const wrapper = mountComponent({ totalWeight: 999999 })
      expect(wrapper.text()).toContain('999,999')
    })
  })

  describe('computed properties', () => {
    describe('fullStats', () => {
      it('returns truthy when totalMembers is provided', () => {
        const wrapper = mountComponent({ totalMembers: 1000 })
        expect(wrapper.vm.fullStats).toBeTruthy()
      })

      it('returns falsy when totalMembers is not provided', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.fullStats).toBeFalsy()
      })

      it('returns falsy when totalMembers is null', () => {
        const wrapper = mountComponent({ totalMembers: null })
        expect(wrapper.vm.fullStats).toBeFalsy()
      })
    })

    describe('scale', () => {
      it('returns 3 when fullStats is true', () => {
        const wrapper = mountComponent({ totalMembers: 1000 })
        expect(wrapper.vm.scale).toBe(3)
      })

      it('returns 4 when fullStats is false', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.scale).toBe(4)
      })
    })

    describe('heading', () => {
      it('returns h5 when fullStats is true', () => {
        const wrapper = mountComponent({ totalMembers: 1000 })
        expect(wrapper.vm.heading).toBe('h5')
      })

      it('returns h2 when fullStats is false', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.heading).toBe('h2')
      })
    })

    describe('groupCountCommunties', () => {
      it('returns singular for 1 community', () => {
        const wrapper = mountComponent({ groupCount: 1 })
        expect(wrapper.vm.groupCountCommunties).toBe('1 COMMUNITY')
      })

      it('returns plural for multiple communities', () => {
        const wrapper = mountComponent({ groupCount: 5 })
        expect(wrapper.vm.groupCountCommunties).toBe('5 COMMUNITIES')
      })
    })

    describe('groupCountServes', () => {
      it('returns SERVES for 1', () => {
        const wrapper = mountComponent({ groupCount: 1 })
        expect(wrapper.vm.groupCountServes).toBe('1 SERVES')
      })

      it('returns SERVE for multiple', () => {
        const wrapper = mountComponent({ groupCount: 5 })
        expect(wrapper.vm.groupCountServes).toBe('5 SERVE')
      })
    })

    describe('totalGiftsPlural', () => {
      it('returns singular GIFT for 1', () => {
        const wrapper = mountComponent({ totalGifts: 1 })
        expect(wrapper.vm.totalGiftsPlural).toBe('1 GIFT')
      })

      it('returns plural GIFTS for multiple', () => {
        const wrapper = mountComponent({ totalGifts: 100 })
        expect(wrapper.vm.totalGiftsPlural).toBe('100 GIFTS')
      })
    })

    describe('totalMembersPlural', () => {
      it('returns singular MEMBER for 1', () => {
        const wrapper = mountComponent({ totalMembers: 1 })
        expect(wrapper.vm.totalMembersPlural).toBe('1 MEMBER')
      })

      it('returns plural MEMBERS for multiple', () => {
        const wrapper = mountComponent({ totalMembers: 500 })
        expect(wrapper.vm.totalMembersPlural).toBe('500 MEMBERS')
      })
    })
  })

  describe('props', () => {
    it('accepts required totalWeight prop', () => {
      const wrapper = mountComponent({ totalWeight: 200 })
      expect(wrapper.props('totalWeight')).toBe(200)
    })

    it('accepts required totalBenefit prop', () => {
      const wrapper = mountComponent({ totalBenefit: 100000 })
      expect(wrapper.props('totalBenefit')).toBe(100000)
    })

    it('accepts required totalCO2 prop', () => {
      const wrapper = mountComponent({ totalCO2: 80 })
      expect(wrapper.props('totalCO2')).toBe(80)
    })

    it('has default null for totalGifts', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('totalGifts')).toBeNull()
    })

    it('has default null for totalMembers', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('totalMembers')).toBeNull()
    })

    it('has default null for groupCount', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('groupCount')).toBeNull()
    })

    it('has default null for range', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('range')).toBeNull()
    })

    it('has default false for border', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('border')).toBe(false)
    })

    it('accepts start prop', () => {
      const wrapper = mountComponent({ start: '2024-01-01' })
      expect(wrapper.props('start')).toBe('2024-01-01')
    })

    it('accepts end prop', () => {
      const wrapper = mountComponent({ end: '2024-12-31' })
      expect(wrapper.props('end')).toBe('2024-12-31')
    })
  })

  describe('display with full stats', () => {
    const fullStatsProps = {
      totalWeight: 500,
      totalBenefit: 250000,
      totalCO2: 300,
      totalGifts: 10000,
      totalMembers: 25000,
      groupCount: 50,
      range: 'all time',
      start: '2020-01-01',
      end: '2024-12-31',
    }

    it('shows all stats columns when all props provided', () => {
      const wrapper = mountComponent(fullStatsProps)
      expect(wrapper.text()).toContain('500')
      expect(wrapper.text()).toContain('250,000')
      expect(wrapper.text()).toContain('300')
      expect(wrapper.text()).toContain('10,000')
      expect(wrapper.text()).toContain('25,000')
      expect(wrapper.text()).toContain('50')
    })

    it('uses smaller heading and scale for full stats', () => {
      const wrapper = mountComponent(fullStatsProps)
      expect(wrapper.vm.heading).toBe('h5')
      expect(wrapper.vm.scale).toBe(3)
    })

    it('shows end date in members section for fullStats', () => {
      const wrapper = mountComponent(fullStatsProps)
      expect(wrapper.text()).toContain('2024-12-31')
    })
  })

  describe('edge cases', () => {
    it('handles zero totalGifts', () => {
      const wrapper = mountComponent({ totalGifts: 0 })
      expect(wrapper.text()).not.toContain('GIFT')
    })

    it('handles decimal totalMembers', () => {
      const wrapper = mountComponent({ totalMembers: 1500.5 })
      expect(wrapper.text()).toContain('1,500.5')
    })

    it('handles negative values gracefully', () => {
      const wrapper = mountComponent({ totalWeight: -10 })
      expect(wrapper.text()).toContain('-10')
    })
  })
})
