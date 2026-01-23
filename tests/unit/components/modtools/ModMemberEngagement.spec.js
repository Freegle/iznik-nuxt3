import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import ModMemberEngagement from '~/modtools/components/ModMemberEngagement.vue'

describe('ModMemberEngagement', () => {
  const createMember = (overrides = {}) => ({
    id: 123,
    displayname: 'Test User',
    lastaccess: dayjs().subtract(10, 'days').toISOString(),
    engagement: 'Frequent',
    supporter: false,
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModMemberEngagement, {
      props: {
        member: createMember(),
        ...props,
      },
      global: {
        stubs: {
          'b-badge': {
            template: '<span class="badge" :class="variant"><slot /></span>',
            props: ['variant'],
          },
          ModSupporter: {
            template: '<span class="mod-supporter" />',
          },
        },
        mocks: {
          timeago: (val) => `${dayjs().diff(dayjs(val), 'days')} days ago`,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the component when member exists', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('does not render content when member has no data', () => {
      // member prop is required, but the template uses v-if="member"
      // which handles falsy member gracefully
      const wrapper = mountComponent({
        member: createMember({ lastaccess: null }),
      })
      expect(wrapper.text()).not.toContain('Last active')
    })

    it('shows last active message when lastaccess exists', () => {
      const wrapper = mountComponent({
        member: createMember({
          lastaccess: dayjs().subtract(5, 'days').toISOString(),
        }),
      })
      expect(wrapper.text()).toContain('Last active:')
    })

    it('hides last active when lastaccess is null', () => {
      const wrapper = mountComponent({
        member: createMember({ lastaccess: null }),
      })
      expect(wrapper.text()).not.toContain('Last active:')
    })

    it('shows engagement badge', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'Frequent' }),
      })
      expect(wrapper.find('.badge').exists()).toBe(true)
      expect(wrapper.find('.badge').text()).toBe('Frequent')
    })

    it('shows ModSupporter when member is a supporter', () => {
      const wrapper = mountComponent({
        member: createMember({ supporter: true }),
      })
      expect(wrapper.find('.mod-supporter').exists()).toBe(true)
    })

    it('hides ModSupporter when member is not a supporter', () => {
      const wrapper = mountComponent({
        member: createMember({ supporter: false }),
      })
      expect(wrapper.find('.mod-supporter').exists()).toBe(false)
    })
  })

  describe('inactive computed', () => {
    it('returns true when lastaccess is more than 6 months ago', () => {
      const wrapper = mountComponent({
        member: createMember({
          lastaccess: dayjs().subtract(200, 'days').toISOString(),
        }),
      })
      expect(wrapper.vm.inactive).toBe(true)
    })

    it('returns false when lastaccess is less than 6 months ago', () => {
      const wrapper = mountComponent({
        member: createMember({
          lastaccess: dayjs().subtract(100, 'days').toISOString(),
        }),
      })
      expect(wrapper.vm.inactive).toBe(false)
    })

    it('returns false when lastaccess is exactly at the boundary (182 days)', () => {
      const wrapper = mountComponent({
        member: createMember({
          lastaccess: dayjs().subtract(182, 'days').toISOString(),
        }),
      })
      // 365/2 = 182.5, so 182 days is less than that
      expect(wrapper.vm.inactive).toBe(false)
    })

    it('returns true when lastaccess is exactly at the boundary (183 days)', () => {
      const wrapper = mountComponent({
        member: createMember({
          lastaccess: dayjs().subtract(183, 'days').toISOString(),
        }),
      })
      // 365/2 = 182.5, so 183 days is >= that
      expect(wrapper.vm.inactive).toBe(true)
    })

    it('returns falsy when member has no lastaccess', () => {
      const wrapper = mountComponent({
        member: createMember({ lastaccess: null }),
      })
      // The expression returns null/false/falsy when lastaccess is null
      expect(wrapper.vm.inactive).toBeFalsy()
    })

    it('shows warning message when inactive', () => {
      const wrapper = mountComponent({
        member: createMember({
          lastaccess: dayjs().subtract(200, 'days').toISOString(),
        }),
      })
      expect(wrapper.text()).toContain("won't send mails")
    })

    it('applies text-danger class when inactive', () => {
      const wrapper = mountComponent({
        member: createMember({
          lastaccess: dayjs().subtract(200, 'days').toISOString(),
        }),
      })
      expect(wrapper.find('.text-danger').exists()).toBe(true)
    })
  })

  describe('engagement computed', () => {
    it('maps "At Risk" to "Dormant Soon"', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'At Risk' }),
      })
      expect(wrapper.vm.engagement).toBe('Dormant Soon')
    })

    it('maps "Obsessed" to "Very Frequent"', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'Obsessed' }),
      })
      expect(wrapper.vm.engagement).toBe('Very Frequent')
    })

    it('returns engagement value unchanged for other values', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'Frequent' }),
      })
      expect(wrapper.vm.engagement).toBe('Frequent')
    })

    it('returns "New" unchanged', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'New' }),
      })
      expect(wrapper.vm.engagement).toBe('New')
    })

    it('returns "Occasional" unchanged', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'Occasional' }),
      })
      expect(wrapper.vm.engagement).toBe('Occasional')
    })

    it('returns "Inactive" unchanged', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'Inactive' }),
      })
      expect(wrapper.vm.engagement).toBe('Inactive')
    })

    it('returns "Dormant" unchanged', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'Dormant' }),
      })
      expect(wrapper.vm.engagement).toBe('Dormant')
    })
  })

  describe('variant computed', () => {
    it('returns "info" for New engagement', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'New' }),
      })
      expect(wrapper.vm.variant).toBe('info')
    })

    it('returns "secondary" for Occasional engagement', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'Occasional' }),
      })
      expect(wrapper.vm.variant).toBe('secondary')
    })

    it('returns "primary" for Frequent engagement', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'Frequent' }),
      })
      expect(wrapper.vm.variant).toBe('primary')
    })

    it('returns "danger" for Obsessed engagement', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'Obsessed' }),
      })
      expect(wrapper.vm.variant).toBe('danger')
    })

    it('returns "light" for Inactive engagement', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'Inactive' }),
      })
      expect(wrapper.vm.variant).toBe('light')
    })

    it('returns "light" for AtRisk engagement', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'AtRisk' }),
      })
      expect(wrapper.vm.variant).toBe('light')
    })

    it('returns "dark" for Dormant engagement', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'Dormant' }),
      })
      expect(wrapper.vm.variant).toBe('dark')
    })

    it('returns "light" as default for unknown engagement', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: 'Unknown' }),
      })
      expect(wrapper.vm.variant).toBe('light')
    })
  })

  describe('props', () => {
    it('accepts member prop', () => {
      const member = createMember({ displayname: 'Custom User' })
      const wrapper = mountComponent({ member })
      expect(wrapper.props('member').displayname).toBe('Custom User')
    })
  })

  describe('edge cases', () => {
    it('handles member with undefined engagement', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: undefined }),
      })
      expect(wrapper.vm.variant).toBe('light')
    })

    it('handles member with empty string engagement', () => {
      const wrapper = mountComponent({
        member: createMember({ engagement: '' }),
      })
      expect(wrapper.vm.variant).toBe('light')
    })
  })
})
