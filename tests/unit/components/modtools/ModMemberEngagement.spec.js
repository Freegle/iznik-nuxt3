import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import ModMemberEngagement from '~/modtools/components/ModMemberEngagement.vue'

// Mock user store
const mockUserStore = {
  byId: vi.fn(),
  fetch: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('ModMemberEngagement', () => {
  const createUser = (overrides = {}) => ({
    id: 123,
    displayname: 'Test User',
    lastaccess: dayjs().subtract(10, 'days').toISOString(),
    engagement: 'Frequent',
    supporter: false,
    ...overrides,
  })

  function mountComponent(props = {}) {
    const userData = props.member ? props.member : createUser()
    const { member: _unused, ...restProps } = props
    mockUserStore.byId.mockReturnValue(userData)
    return mount(ModMemberEngagement, {
      props: {
        userid: userData.id,
        ...restProps,
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
    mockUserStore.byId.mockReturnValue(null)
    mockUserStore.fetch.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders the component when member exists', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('does not render content when member has no data', () => {
      const wrapper = mountComponent({
        member: createUser({ lastaccess: null }),
      })
      expect(wrapper.text()).not.toContain('Last active')
    })

    it('shows last active message when lastaccess exists', () => {
      const wrapper = mountComponent({
        member: createUser({
          lastaccess: dayjs().subtract(5, 'days').toISOString(),
        }),
      })
      expect(wrapper.text()).toContain('Last active:')
    })

    it('hides last active when lastaccess is null', () => {
      const wrapper = mountComponent({
        member: createUser({ lastaccess: null }),
      })
      expect(wrapper.text()).not.toContain('Last active:')
    })

    it('shows engagement badge', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'Frequent' }),
      })
      expect(wrapper.find('.badge').exists()).toBe(true)
      expect(wrapper.find('.badge').text()).toBe('Frequent')
    })

    it('shows ModSupporter when member is a supporter', () => {
      const wrapper = mountComponent({
        member: createUser({ supporter: true }),
      })
      expect(wrapper.find('.mod-supporter').exists()).toBe(true)
    })

    it('hides ModSupporter when member is not a supporter', () => {
      const wrapper = mountComponent({
        member: createUser({ supporter: false }),
      })
      expect(wrapper.find('.mod-supporter').exists()).toBe(false)
    })
  })

  describe('inactive computed', () => {
    it('returns true when lastaccess is more than 6 months ago', () => {
      const wrapper = mountComponent({
        member: createUser({
          lastaccess: dayjs().subtract(200, 'days').toISOString(),
        }),
      })
      expect(wrapper.vm.inactive).toBe(true)
    })

    it('returns false when lastaccess is less than 6 months ago', () => {
      const wrapper = mountComponent({
        member: createUser({
          lastaccess: dayjs().subtract(100, 'days').toISOString(),
        }),
      })
      expect(wrapper.vm.inactive).toBe(false)
    })

    it('returns false when lastaccess is exactly at the boundary (182 days)', () => {
      const wrapper = mountComponent({
        member: createUser({
          lastaccess: dayjs().subtract(182, 'days').toISOString(),
        }),
      })
      // 365/2 = 182.5, so 182 days is less than that
      expect(wrapper.vm.inactive).toBe(false)
    })

    it('returns true when lastaccess is exactly at the boundary (183 days)', () => {
      const wrapper = mountComponent({
        member: createUser({
          lastaccess: dayjs().subtract(183, 'days').toISOString(),
        }),
      })
      // 365/2 = 182.5, so 183 days is >= that
      expect(wrapper.vm.inactive).toBe(true)
    })

    it('returns falsy when member has no lastaccess', () => {
      const wrapper = mountComponent({
        member: createUser({ lastaccess: null }),
      })
      // The expression returns null/false/falsy when lastaccess is null
      expect(wrapper.vm.inactive).toBeFalsy()
    })

    it('shows warning message when inactive', () => {
      const wrapper = mountComponent({
        member: createUser({
          lastaccess: dayjs().subtract(200, 'days').toISOString(),
        }),
      })
      expect(wrapper.text()).toContain("won't send mails")
    })

    it('applies text-danger class when inactive', () => {
      const wrapper = mountComponent({
        member: createUser({
          lastaccess: dayjs().subtract(200, 'days').toISOString(),
        }),
      })
      expect(wrapper.find('.text-danger').exists()).toBe(true)
    })
  })

  describe('engagement computed', () => {
    it('maps "At Risk" to "Dormant Soon"', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'At Risk' }),
      })
      expect(wrapper.vm.engagement).toBe('Dormant Soon')
    })

    it('maps "Obsessed" to "Very Frequent"', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'Obsessed' }),
      })
      expect(wrapper.vm.engagement).toBe('Very Frequent')
    })

    it('returns engagement value unchanged for other values', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'Frequent' }),
      })
      expect(wrapper.vm.engagement).toBe('Frequent')
    })

    it('returns "New" unchanged', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'New' }),
      })
      expect(wrapper.vm.engagement).toBe('New')
    })

    it('returns "Occasional" unchanged', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'Occasional' }),
      })
      expect(wrapper.vm.engagement).toBe('Occasional')
    })

    it('returns "Inactive" unchanged', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'Inactive' }),
      })
      expect(wrapper.vm.engagement).toBe('Inactive')
    })

    it('returns "Dormant" unchanged', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'Dormant' }),
      })
      expect(wrapper.vm.engagement).toBe('Dormant')
    })
  })

  describe('variant computed', () => {
    it('returns "info" for New engagement', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'New' }),
      })
      expect(wrapper.vm.variant).toBe('info')
    })

    it('returns "secondary" for Occasional engagement', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'Occasional' }),
      })
      expect(wrapper.vm.variant).toBe('secondary')
    })

    it('returns "primary" for Frequent engagement', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'Frequent' }),
      })
      expect(wrapper.vm.variant).toBe('primary')
    })

    it('returns "danger" for Obsessed engagement', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'Obsessed' }),
      })
      expect(wrapper.vm.variant).toBe('danger')
    })

    it('returns "light" for Inactive engagement', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'Inactive' }),
      })
      expect(wrapper.vm.variant).toBe('light')
    })

    it('returns "light" for AtRisk engagement', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'AtRisk' }),
      })
      expect(wrapper.vm.variant).toBe('light')
    })

    it('returns "dark" for Dormant engagement', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'Dormant' }),
      })
      expect(wrapper.vm.variant).toBe('dark')
    })

    it('returns "light" as default for unknown engagement', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: 'Unknown' }),
      })
      expect(wrapper.vm.variant).toBe('light')
    })
  })

  describe('edge cases', () => {
    it('handles member with undefined engagement', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: undefined }),
      })
      expect(wrapper.vm.variant).toBe('light')
    })

    it('handles member with empty string engagement', () => {
      const wrapper = mountComponent({
        member: createUser({ engagement: '' }),
      })
      expect(wrapper.vm.variant).toBe('light')
    })
  })
})
