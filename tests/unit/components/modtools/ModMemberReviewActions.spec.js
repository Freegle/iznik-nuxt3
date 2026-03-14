import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import ModMemberReviewActions from '~/modtools/components/ModMemberReviewActions.vue'

// Mock member store with reactive list
const mockMemberStoreList = {}
const mockMemberStore = {
  list: mockMemberStoreList,
  remove: vi.fn(),
  spamignore: vi.fn(),
}

vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

// Mock user store
const mockUsers = {}
const mockUserStore = {
  byId: (id) => mockUsers[id] || null,
  fetch: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

// Mock group store
const mockGroups = {}
const mockGroupStore = {
  get: (id) => mockGroups[id] || null,
}

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
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
  const defaultMembership = () => ({
    id: 789,
    membershipid: 100,
    namedisplay: 'Test Group',
    added: dayjs().subtract(10, 'day').toISOString(),
    reviewreason: null,
    reviewrequestedat: null,
    reviewedat: null,
    heldby: null,
  })

  /**
   * Populate the mock member store list with a member record that the
   * component's computed `membership` will find by userid + membershipid.
   */
  function setupStoreData(membershipOverrides = {}) {
    const ms = { ...defaultMembership(), ...membershipOverrides }

    // Clear previous data
    Object.keys(mockMemberStoreList).forEach(
      (k) => delete mockMemberStoreList[k]
    )
    Object.keys(mockGroups).forEach((k) => delete mockGroups[k])
    Object.keys(mockUsers).forEach((k) => delete mockUsers[k])

    // The component searches memberStore.list for a member matching userid,
    // then finds a membership in its memberships array matching membershipid.
    mockMemberStoreList['member-456'] = {
      userid: 456,
      displayname: 'Test User',
      memberships: [ms, { id: 111, membershipid: 200, namedisplay: 'Other' }],
    }

    mockGroups[ms.id] = { namedisplay: ms.namedisplay }
    mockUsers[456] = { id: 456, displayname: 'Test User' }
  }

  function mountComponent(membershipOverrides = {}, propOverrides = {}) {
    setupStoreData(membershipOverrides)

    return mount(ModMemberReviewActions, {
      props: {
        userid: 456,
        membershipid: membershipOverrides.membershipid || 100,
        ...propOverrides,
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
              'userid',
              'membershipid',
              'groupid',
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
      const wrapper = mountComponent({ namedisplay: 'My Group' })
      expect(wrapper.text()).toContain('My Group')
    })

    it('truncates long group names', () => {
      const wrapper = mountComponent({
        namedisplay:
          'This is a very long group name that exceeds 32 characters',
      })
      expect(wrapper.text()).toContain('...')
    })

    it('does not truncate short group names', () => {
      const wrapper = mountComponent({ namedisplay: 'Short Name' })
      expect(wrapper.text()).not.toContain('...')
    })

    it('shows join date', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('joined')
    })

    it('shows review reason when present', () => {
      const wrapper = mountComponent({ reviewreason: 'Suspicious activity' })
      expect(wrapper.text()).toContain('Suspicious activity')
    })

    it('shows flagged date when present', () => {
      const wrapper = mountComponent({
        reviewreason: 'Suspicious',
        reviewrequestedat: dayjs().subtract(2, 'day').toISOString(),
      })
      expect(wrapper.text()).toContain('flagged')
    })
  })

  describe('join date styling', () => {
    it('shows danger class for recent joins (< 31 days)', () => {
      const wrapper = mountComponent({
        added: dayjs().subtract(10, 'day').toISOString(),
      })
      expect(wrapper.html()).toContain('text-danger')
    })

    it('shows muted class for old joins (>= 31 days)', () => {
      const wrapper = mountComponent({
        added: dayjs().subtract(60, 'day').toISOString(),
      })
      expect(wrapper.html()).toContain('text-muted')
    })
  })

  describe('held member notice', () => {
    it('shows notice when held by current user', () => {
      const wrapper = mountComponent({
        heldby: 999,
        reviewreason: 'Test',
      })
      expect(wrapper.text()).toContain('You held this member')
    })

    it('shows notice when held by another user', () => {
      const wrapper = mountComponent({
        heldby: 888,
        reviewreason: 'Test',
      })
      expect(wrapper.text()).toContain('Held by')
      expect(wrapper.text()).toContain('888')
    })

    it('does not show held notice when not held', () => {
      const wrapper = mountComponent({ heldby: null })
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })
  })

  describe('action buttons visibility', () => {
    it('shows Ignore button when needs review and not held', () => {
      const wrapper = mountComponent({
        heldby: null,
        reviewedat: null,
      })
      expect(wrapper.text()).toContain('Ignore')
    })

    it('shows Remove button when needs review and not held', () => {
      const wrapper = mountComponent({
        heldby: null,
        reviewedat: null,
      })
      expect(wrapper.text()).toContain('Remove')
    })

    it('shows Hold button when not held', () => {
      const wrapper = mountComponent({
        heldby: null,
        reviewedat: null,
      })
      expect(wrapper.findAll('.mod-member-button').length).toBeGreaterThan(0)
    })

    it('hides action buttons when not a mod on group', () => {
      const wrapper = mountComponent({ id: 999 })
      expect(wrapper.find('.spin-button').exists()).toBe(false)
    })

    it('shows Go to membership button', () => {
      const wrapper = mountComponent({ reviewedat: null })
      expect(wrapper.text()).toContain('Go to membership')
    })
  })

  describe('needsReview computed', () => {
    it('returns true when reviewedat is null', () => {
      const wrapper = mountComponent({ reviewedat: null })
      expect(wrapper.vm.needsReview).toBe(true)
    })

    it('returns true when reviewrequestedat >= reviewedat', () => {
      const wrapper = mountComponent({
        reviewrequestedat: dayjs().subtract(1, 'day').toISOString(),
        reviewedat: dayjs().subtract(2, 'day').toISOString(),
      })
      expect(wrapper.vm.needsReview).toBe(true)
    })

    it('returns false when reviewedat > reviewrequestedat', () => {
      const wrapper = mountComponent({
        reviewrequestedat: dayjs().subtract(3, 'day').toISOString(),
        reviewedat: dayjs().subtract(1, 'day').toISOString(),
      })
      expect(wrapper.vm.needsReview).toBe(false)
    })

    it('returns false when manually reviewed', () => {
      const wrapper = mountComponent()
      wrapper.vm.reviewed = true
      expect(wrapper.vm.needsReview).toBe(false)
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
      const wrapper = mountComponent()
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
      const wrapper = mountComponent()
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
      const wrapper = mountComponent({ reviewedat: null })
      const button = wrapper.find('button[to]')
      expect(button.attributes('to')).toBe('/members/approved/789/456')
    })
  })
})
