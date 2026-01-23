import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import ModMemberHappiness from '~/modtools/components/ModMemberHappiness.vue'

// Mock member store
const mockMemberStore = {
  get: vi.fn(),
  happinessReviewed: vi.fn(),
}

vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

// Mock useMe composable
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myGroup: vi.fn((groupid) => {
      if (groupid === 789) {
        return { id: 789, namedisplay: 'Test Group' }
      }
      return null
    }),
  }),
}))

describe('ModMemberHappiness', () => {
  const createMember = (overrides = {}) => ({
    id: 123,
    happiness: 'Happy',
    outcome: 'Taken',
    timestamp: dayjs().subtract(1, 'day').toISOString(),
    reviewed: false,
    comments: 'User left a comment',
    groupid: 789,
    user: {
      id: 456,
      displayname: 'Test User',
      email: 'test@example.com',
    },
    message: {
      id: 1001,
      subject: 'OFFER: Test item',
    },
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModMemberHappiness, {
      props: {
        id: 123,
        ...props,
      },
      global: {
        stubs: {
          'b-card': {
            template: '<div class="card"><slot /><slot name="header" /></div>',
            props: ['noBody'],
          },
          'b-card-header': {
            template:
              '<div class="card-header" :class="$attrs.class"><slot /></div>',
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols'],
          },
          'b-button': {
            template: '<button :to="to"><slot /></button>',
            props: ['to', 'variant'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon', 'scale'],
          },
          ChatButton: {
            template: '<div class="chat-button" />',
            props: ['userid', 'groupid', 'chattype', 'title', 'variant'],
          },
        },
        mocks: {
          timeago: (val) => `${dayjs().diff(dayjs(val), 'days')} days ago`,
        },
        directives: {
          'observe-visibility': {
            mounted(el, binding) {
              el._visibilityCallback = binding.value
            },
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMemberStore.get.mockReturnValue(createMember())
    mockMemberStore.happinessReviewed.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders the component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('displays user displayname', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test User')
    })

    it('displays user id', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('456')
    })

    it('displays user email', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('test@example.com')
    })

    it('displays message subject', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('OFFER: Test item')
    })

    it('displays message id', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('1001')
    })

    it('displays comments', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('User left a comment')
    })

    it('shows New badge when not reviewed', () => {
      mockMemberStore.get.mockReturnValue(createMember({ reviewed: false }))
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('New')
    })

    it('hides New badge when reviewed', () => {
      mockMemberStore.get.mockReturnValue(createMember({ reviewed: true }))
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('New')
    })

    it('displays outcome', () => {
      mockMemberStore.get.mockReturnValue(createMember({ outcome: 'Taken' }))
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Taken')
    })

    it('displays group name when available', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Group')
    })
  })

  describe('variant computed', () => {
    it('returns bg-success for Happy', () => {
      mockMemberStore.get.mockReturnValue(createMember({ happiness: 'Happy' }))
      const wrapper = mountComponent()
      expect(wrapper.vm.variant).toBe('bg-success')
    })

    it('returns bg-warning for Unhappy', () => {
      mockMemberStore.get.mockReturnValue(
        createMember({ happiness: 'Unhappy' })
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.variant).toBe('bg-warning')
    })

    it('returns bg-light for unknown happiness', () => {
      mockMemberStore.get.mockReturnValue(
        createMember({ happiness: 'Unknown' })
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.variant).toBe('bg-light')
    })

    it('returns bg-light for null happiness', () => {
      mockMemberStore.get.mockReturnValue(createMember({ happiness: null }))
      const wrapper = mountComponent()
      expect(wrapper.vm.variant).toBe('bg-light')
    })
  })

  describe('icon computed', () => {
    it('returns smile for Happy', () => {
      mockMemberStore.get.mockReturnValue(createMember({ happiness: 'Happy' }))
      const wrapper = mountComponent()
      expect(wrapper.vm.icon).toBe('smile')
    })

    it('returns frown for Unhappy', () => {
      mockMemberStore.get.mockReturnValue(
        createMember({ happiness: 'Unhappy' })
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.icon).toBe('frown')
    })

    it('returns meh for unknown happiness', () => {
      mockMemberStore.get.mockReturnValue(
        createMember({ happiness: 'Unknown' })
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.icon).toBe('meh')
    })
  })

  describe('outcomeIcon computed', () => {
    it('returns check for Taken', () => {
      mockMemberStore.get.mockReturnValue(createMember({ outcome: 'Taken' }))
      const wrapper = mountComponent()
      expect(wrapper.vm.outcomeIcon).toBe('check')
    })

    it('returns check for Received', () => {
      mockMemberStore.get.mockReturnValue(createMember({ outcome: 'Received' }))
      const wrapper = mountComponent()
      expect(wrapper.vm.outcomeIcon).toBe('check')
    })

    it('returns times for other outcomes', () => {
      mockMemberStore.get.mockReturnValue(
        createMember({ outcome: 'Withdrawn' })
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.outcomeIcon).toBe('times')
    })
  })

  describe('groupname computed', () => {
    it('returns group namedisplay when myGroup returns group', () => {
      mockMemberStore.get.mockReturnValue(createMember({ groupid: 789 }))
      const wrapper = mountComponent()
      expect(wrapper.vm.groupname).toBe('Test Group')
    })

    it('returns null when myGroup returns null', () => {
      mockMemberStore.get.mockReturnValue(createMember({ groupid: 999 }))
      const wrapper = mountComponent()
      expect(wrapper.vm.groupname).toBeNull()
    })
  })

  describe('visibilityChanged', () => {
    it('calls happinessReviewed when visible and not reviewed', () => {
      mockMemberStore.get.mockReturnValue(
        createMember({
          reviewed: false,
          user: { id: 456 },
          groupid: 789,
          id: 123,
        })
      )
      const wrapper = mountComponent()
      wrapper.vm.visibilityChanged(true)
      expect(mockMemberStore.happinessReviewed).toHaveBeenCalledWith({
        userid: 456,
        groupid: 789,
        happinessid: 123,
      })
    })

    it('does not call happinessReviewed when already reviewed', () => {
      mockMemberStore.get.mockReturnValue(createMember({ reviewed: true }))
      const wrapper = mountComponent()
      wrapper.vm.visibilityChanged(true)
      expect(mockMemberStore.happinessReviewed).not.toHaveBeenCalled()
    })

    it('does not call happinessReviewed when not visible', () => {
      mockMemberStore.get.mockReturnValue(createMember({ reviewed: false }))
      const wrapper = mountComponent()
      wrapper.vm.visibilityChanged(false)
      expect(mockMemberStore.happinessReviewed).not.toHaveBeenCalled()
    })
  })

  describe('member computed', () => {
    it('returns member from store by id', () => {
      const member = createMember({ id: 123 })
      mockMemberStore.get.mockReturnValue(member)
      const wrapper = mountComponent({ id: 123 })
      expect(wrapper.vm.member).toEqual(member)
      expect(mockMemberStore.get).toHaveBeenCalledWith(123)
    })
  })

  describe('props', () => {
    it('accepts id prop', () => {
      const wrapper = mountComponent({ id: 456 })
      expect(wrapper.props('id')).toBe(456)
    })
  })
})
