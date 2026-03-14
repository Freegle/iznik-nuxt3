import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import ModMemberReviewActions from '~/modtools/components/ModMemberReviewActions.vue'

// Mock member store
const mockMemberStore = {
  remove: vi.fn(),
  spamignore: vi.fn(),
}

vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

// Mock useMe composable
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: { id: 999, displayname: 'Mod User' },
    myid: 999,
  }),
}))

// Mock useModMe composable
vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    amAModOn: (groupid) => groupid === 789,
  }),
}))

describe('ModMemberReviewActions', () => {
  const createMember = (overrides = {}) => ({
    userid: 456,
    displayname: 'Test User',
    memberof: [
      { id: 789, namedisplay: 'Test Group' },
      { id: 111, namedisplay: 'Other Group' },
    ],
    ...overrides,
  })

  const createMembership = (overrides = {}) => ({
    id: 789,
    namedisplay: 'Test Group',
    added: dayjs().subtract(10, 'day').toISOString(),
    reviewreason: null,
    reviewrequestedat: null,
    reviewedat: null,
    heldby: null,
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModMemberReviewActions, {
      props: {
        memberid: 123,
        member: createMember(),
        membership: createMembership(),
        ...props,
      },
      global: {
        stubs: {
          'b-card': {
            template: '<div class="card"><slot /></div>',
            props: ['noBody'],
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
            props: ['class'],
          },
          'b-button': {
            template:
              '<button :to="to" @click="$emit(\'click\')"><slot /></button>',
            props: ['to', 'variant'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon', 'scale'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" :data-label="label" @click="$emit(\'handle\', () => {})">{{ label }}</button>',
            props: ['iconName', 'spinclass', 'variant', 'label'],
          },
          ModMemberButton: {
            template: '<div class="mod-member-button" />',
            props: [
              'member',
              'variant',
              'icon',
              'reviewhold',
              'reviewrelease',
              'reviewgroupid',
              'label',
            ],
          },
          ConfirmModal: {
            template: '<div class="confirm-modal" />',
            props: ['title'],
            methods: { show: vi.fn() },
          },
        },
        mocks: {
          timeago: (val) => `${dayjs().diff(dayjs(val), 'days')} days ago`,
          daysago: (d) => dayjs().diff(dayjs(d), 'day'),
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockMemberStore.remove.mockResolvedValue()
    mockMemberStore.spamignore.mockResolvedValue()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('displays group namedisplay', () => {
      const wrapper = mountComponent({
        membership: createMembership({ namedisplay: 'My Group' }),
      })
      expect(wrapper.text()).toContain('My Group')
    })

    it('truncates long group names', () => {
      const wrapper = mountComponent({
        membership: createMembership({
          namedisplay:
            'This is a very long group name that exceeds 32 characters',
        }),
      })
      expect(wrapper.text()).toContain('...')
    })

    it('does not truncate short group names', () => {
      const wrapper = mountComponent({
        membership: createMembership({ namedisplay: 'Short Name' }),
      })
      expect(wrapper.text()).not.toContain('...')
    })

    it('shows join date', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('joined')
    })

    it('shows review reason when present', () => {
      const wrapper = mountComponent({
        membership: createMembership({ reviewreason: 'Suspicious activity' }),
      })
      expect(wrapper.text()).toContain('Suspicious activity')
    })

    it('shows flagged date when present', () => {
      const wrapper = mountComponent({
        membership: createMembership({
          reviewreason: 'Suspicious',
          reviewrequestedat: dayjs().subtract(2, 'day').toISOString(),
        }),
      })
      expect(wrapper.text()).toContain('flagged')
    })
  })

  describe('join date styling', () => {
    it('shows danger class for recent joins (< 31 days)', () => {
      const wrapper = mountComponent({
        membership: createMembership({
          added: dayjs().subtract(10, 'day').toISOString(),
        }),
      })
      expect(wrapper.html()).toContain('text-danger')
    })

    it('shows muted class for old joins (>= 31 days)', () => {
      const wrapper = mountComponent({
        membership: createMembership({
          added: dayjs().subtract(60, 'day').toISOString(),
        }),
      })
      expect(wrapper.html()).toContain('text-muted')
    })
  })

  describe('held member notice', () => {
    it('shows notice when held by current user', () => {
      const wrapper = mountComponent({
        membership: createMembership({
          heldby: 999,
          reviewreason: 'Test',
        }),
      })
      expect(wrapper.text()).toContain('You held this member')
    })

    it('shows notice when held by another user', () => {
      const wrapper = mountComponent({
        membership: createMembership({
          heldby: 888,
          reviewreason: 'Test',
        }),
      })
      expect(wrapper.text()).toContain('Held by')
      expect(wrapper.text()).toContain('888')
    })

    it('does not show held notice when not held', () => {
      const wrapper = mountComponent({
        membership: createMembership({ heldby: null }),
      })
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })
  })

  describe('action buttons visibility', () => {
    it('shows Ignore button when needs review and not held', () => {
      const wrapper = mountComponent({
        membership: createMembership({
          heldby: null,
          reviewedat: null,
        }),
      })
      expect(wrapper.text()).toContain('Ignore')
    })

    it('shows Remove button when needs review and not held', () => {
      const wrapper = mountComponent({
        membership: createMembership({
          heldby: null,
          reviewedat: null,
        }),
      })
      expect(wrapper.text()).toContain('Remove')
    })

    it('shows Hold button when not held', () => {
      const wrapper = mountComponent({
        membership: createMembership({
          heldby: null,
          reviewedat: null,
        }),
      })
      expect(wrapper.findAll('.mod-member-button').length).toBeGreaterThan(0)
    })

    it('hides action buttons when not a mod on group', () => {
      const wrapper = mountComponent({
        membership: createMembership({ id: 999 }),
      })
      expect(wrapper.find('.spin-button').exists()).toBe(false)
    })

    it('shows Go to membership button', () => {
      const wrapper = mountComponent({
        membership: createMembership({ reviewedat: null }),
      })
      expect(wrapper.text()).toContain('Go to membership')
    })
  })

  describe('needsReview computed', () => {
    it('returns true when reviewedat is null', () => {
      const wrapper = mountComponent({
        membership: createMembership({ reviewedat: null }),
      })
      expect(wrapper.vm.needsReview).toBe(true)
    })

    it('returns true when reviewrequestedat >= reviewedat', () => {
      const wrapper = mountComponent({
        membership: createMembership({
          reviewrequestedat: dayjs().subtract(1, 'day').toISOString(),
          reviewedat: dayjs().subtract(2, 'day').toISOString(),
        }),
      })
      expect(wrapper.vm.needsReview).toBe(true)
    })

    it('returns false when reviewedat > reviewrequestedat', () => {
      const wrapper = mountComponent({
        membership: createMembership({
          reviewrequestedat: dayjs().subtract(3, 'day').toISOString(),
          reviewedat: dayjs().subtract(1, 'day').toISOString(),
        }),
      })
      expect(wrapper.vm.needsReview).toBe(false)
    })

    it('returns false when manually reviewed', () => {
      const wrapper = mountComponent()
      wrapper.vm.reviewed = true
      expect(wrapper.vm.needsReview).toBe(false)
    })
  })

  describe('groupid computed', () => {
    it('returns group id when member is part of membership', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [{ id: 789 }, { id: 111 }],
        }),
        membership: createMembership({ id: 789 }),
      })
      expect(wrapper.vm.groupid).toBe(789)
    })

    it('returns null when member is not part of membership', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [{ id: 111 }],
        }),
        membership: createMembership({ id: 789 }),
      })
      expect(wrapper.vm.groupid).toBeNull()
    })
  })

  describe('remove method', () => {
    it('shows confirm modal', () => {
      const wrapper = mountComponent()
      const callback = vi.fn()
      wrapper.vm.remove(callback)
      expect(wrapper.vm.showConfirmModal).toBe(true)
    })

    it('sets reviewed to true after timeout', () => {
      const wrapper = mountComponent()
      const callback = vi.fn()
      wrapper.vm.remove(callback)
      vi.advanceTimersByTime(2000)
      expect(wrapper.vm.reviewed).toBe(true)
    })

    it('calls callback after timeout', () => {
      const wrapper = mountComponent()
      const callback = vi.fn()
      wrapper.vm.remove(callback)
      vi.advanceTimersByTime(2000)
      expect(callback).toHaveBeenCalled()
    })
  })

  describe('removeConfirmed method', () => {
    it('calls memberStore.remove with correct params', async () => {
      const wrapper = mountComponent({
        member: createMember({ userid: 456 }),
        membership: createMembership({ id: 789 }),
      })
      await wrapper.vm.removeConfirmed()
      expect(mockMemberStore.remove).toHaveBeenCalledWith(456, 789)
    })

    it('sets reviewed to true after timeout', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.removeConfirmed()
      vi.advanceTimersByTime(2000)
      expect(wrapper.vm.reviewed).toBe(true)
    })

    it('emits forcerefresh after timeout', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.removeConfirmed()
      vi.advanceTimersByTime(2000)
      expect(wrapper.emitted('forcerefresh')).toBeTruthy()
    })
  })

  describe('ignore method', () => {
    it('calls memberStore.spamignore with correct params', async () => {
      const wrapper = mountComponent({
        member: createMember({ userid: 456 }),
        membership: createMembership({ id: 789 }),
      })
      const callback = vi.fn()
      await wrapper.vm.ignore(callback)
      expect(mockMemberStore.spamignore).toHaveBeenCalledWith({
        userid: 456,
        groupid: 789,
      })
    })

    it('sets reviewed to true after timeout', async () => {
      const wrapper = mountComponent()
      const callback = vi.fn()
      await wrapper.vm.ignore(callback)
      vi.advanceTimersByTime(2000)
      expect(wrapper.vm.reviewed).toBe(true)
    })

    it('calls callback after timeout', async () => {
      const wrapper = mountComponent()
      const callback = vi.fn()
      await wrapper.vm.ignore(callback)
      vi.advanceTimersByTime(2000)
      expect(callback).toHaveBeenCalled()
    })

    it('emits forcerefresh after timeout', async () => {
      const wrapper = mountComponent()
      const callback = vi.fn()
      await wrapper.vm.ignore(callback)
      vi.advanceTimersByTime(2000)
      expect(wrapper.emitted('forcerefresh')).toBeTruthy()
    })
  })

  describe('daysago function', () => {
    it('returns correct number of days', () => {
      const wrapper = mountComponent()
      const fiveDaysAgo = dayjs().subtract(5, 'day').toISOString()
      expect(wrapper.vm.daysago(fiveDaysAgo)).toBe(5)
    })

    it('returns 0 for today', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.daysago(dayjs().toISOString())).toBe(0)
    })
  })

  describe('forcerefresh method', () => {
    it('emits forcerefresh event', () => {
      const wrapper = mountComponent()
      wrapper.vm.forcerefresh()
      expect(wrapper.emitted('forcerefresh')).toBeTruthy()
    })
  })

  describe('link destinations', () => {
    it('Go to membership links to correct URL', () => {
      const wrapper = mountComponent({
        member: createMember({ userid: 456 }),
        membership: createMembership({ id: 789, reviewedat: null }),
      })
      const button = wrapper.find('button[to]')
      expect(button.attributes('to')).toBe('/members/approved/789/456')
    })
  })
})
