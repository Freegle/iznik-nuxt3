import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModLogGroup from '~/modtools/components/ModLogGroup.vue'

// Mock logs store
const mockLogsStore = {
  list: [],
  byId: vi.fn(),
}

vi.mock('~/stores/logs', () => ({
  useLogsStore: () => mockLogsStore,
}))

// Mock useMe composable
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myGroup: vi.fn((groupid) =>
      groupid === 1
        ? { id: 1, nameshort: 'TestGroup', namedisplay: 'Test Group Display' }
        : null
    ),
  }),
}))

describe('ModLogGroup', () => {
  function createWrapper(logData = null, tag = null) {
    const logId = logData?.id || 1
    const log = logData ? { id: logId, ...logData } : null

    if (log) {
      mockLogsStore.list = [log]
      mockLogsStore.byId.mockImplementation(
        (id) => mockLogsStore.list.find((l) => l.id === id) || null
      )
    } else {
      mockLogsStore.list = []
      mockLogsStore.byId.mockReturnValue(null)
    }

    return mount(ModLogGroup, {
      props: { logid: logId, tag },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockLogsStore.list = []
  })

  describe('rendering', () => {
    it('renders nothing when loggroup is null', () => {
      // log with groupid that won't resolve to any group
      const wrapper = createWrapper({ groupid: 999 })
      expect(wrapper.find('span').exists()).toBe(false)
    })

    it('renders span when loggroup is found', () => {
      const wrapper = createWrapper({
        group: { id: 1, nameshort: 'TestGroup', namedisplay: 'Test Group' },
      })
      expect(wrapper.find('span').exists()).toBe(true)
    })

    it('renders link to group on ilovefreegle.org', () => {
      const wrapper = createWrapper({
        group: { id: 1, nameshort: 'FreegleTest', namedisplay: 'Freegle Test' },
      })
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe(
        'https://www.ilovefreegle.org/explore/FreegleTest'
      )
      expect(link.attributes('target')).toBe('_blank')
    })

    it('displays tag when provided', () => {
      const wrapper = createWrapper(
        { group: { id: 1, nameshort: 'Group1', namedisplay: 'Group 1' } },
        'on'
      )
      expect(wrapper.text()).toContain('on')
    })

    it('does not display tag when not provided', () => {
      const wrapper = createWrapper({
        group: { id: 1, nameshort: 'Group1', namedisplay: 'Group 1' },
      })
      expect(wrapper.text()).not.toContain('on')
      expect(wrapper.text()).not.toContain('for')
    })
  })

  describe('loggroup computed property', () => {
    it('returns log.group when present', () => {
      const group = {
        id: 123,
        nameshort: 'Direct',
        namedisplay: 'Direct Group',
      }
      const wrapper = createWrapper({ group })
      expect(wrapper.vm.loggroup).toEqual(group)
    })

    it('returns message.groups[0] when log.group is null but message has groups', () => {
      const wrapper = createWrapper({
        message: {
          groups: [
            {
              id: 456,
              nameshort: 'MessageGroup',
              namedisplay: 'Message Group',
            },
          ],
        },
      })
      expect(wrapper.vm.loggroup.id).toBe(456)
    })

    it('finds group in user.applied array when groupid matches', () => {
      const wrapper = createWrapper({
        groupid: 789,
        user: {
          applied: [
            {
              groupid: 789,
              id: 789,
              nameshort: 'AppliedGroup',
              namedisplay: 'Applied Group',
            },
          ],
        },
      })
      expect(wrapper.vm.loggroup.id).toBe(789)
    })

    it('finds group in user.memberships array when groupid matches', () => {
      const wrapper = createWrapper({
        groupid: 111,
        user: {
          memberships: [
            {
              groupid: 111,
              id: 111,
              nameshort: 'MemberGroup',
              namedisplay: 'Member Group',
            },
          ],
        },
      })
      expect(wrapper.vm.loggroup.id).toBe(111)
    })

    it('finds group in byuser.applied array when user lookup fails', () => {
      const wrapper = createWrapper({
        groupid: 222,
        byuser: {
          applied: [
            {
              groupid: 222,
              id: 222,
              nameshort: 'ByUserApplied',
              namedisplay: 'By User Applied',
            },
          ],
        },
      })
      expect(wrapper.vm.loggroup.id).toBe(222)
    })

    it('finds group in byuser.memberships array when user lookup fails', () => {
      const wrapper = createWrapper({
        groupid: 333,
        byuser: {
          memberships: [
            {
              groupid: 333,
              id: 333,
              nameshort: 'ByUserMember',
              namedisplay: 'By User Member',
            },
          ],
        },
      })
      expect(wrapper.vm.loggroup.id).toBe(333)
    })

    it('uses myGroup when user lookup fails', () => {
      const wrapper = createWrapper({
        groupid: 1, // myGroup returns a group for id 1
      })
      expect(wrapper.vm.loggroup.nameshort).toBe('TestGroup')
    })

    it('returns null when no group can be found', () => {
      const wrapper = createWrapper({
        groupid: 999, // myGroup returns null for this
      })
      expect(wrapper.vm.loggroup).toBeNull()
    })

    it('returns null when log has no group info', () => {
      const wrapper = createWrapper({ groupid: 999 })
      expect(wrapper.vm.loggroup).toBeNull()
    })
  })

  describe('groupname computed property', () => {
    it('returns nameshort when available', () => {
      const wrapper = createWrapper({
        group: { id: 1, nameshort: 'ShortName', namedisplay: 'Display Name' },
      })
      expect(wrapper.vm.groupname).toBe('ShortName')
    })

    it('returns namedisplay when nameshort is not available', () => {
      const wrapper = createWrapper({
        group: { id: 1, namedisplay: 'Display Name Only' },
      })
      expect(wrapper.vm.groupname).toBe('Display Name Only')
    })

    it('prefers nameshort over namedisplay', () => {
      const wrapper = createWrapper({
        group: { id: 1, nameshort: 'Preferred', namedisplay: 'Fallback' },
      })
      expect(wrapper.vm.groupname).toBe('Preferred')
    })
  })

  describe('scanUserForGroup function', () => {
    it('searches applied array first', () => {
      const wrapper = createWrapper({
        groupid: 444,
        user: {
          applied: [
            {
              groupid: 444,
              id: 444,
              nameshort: 'AppliedFirst',
              namedisplay: 'Applied First',
            },
          ],
          memberships: [
            {
              groupid: 444,
              id: 444,
              nameshort: 'MemberSecond',
              namedisplay: 'Member Second',
            },
          ],
        },
      })
      // Should find in applied first
      expect(wrapper.vm.loggroup.nameshort).toBe('AppliedFirst')
    })

    it('falls back to memberships when not in applied', () => {
      const wrapper = createWrapper({
        groupid: 555,
        user: {
          applied: [
            { groupid: 999, id: 999, nameshort: 'Other', namedisplay: 'Other' },
          ],
          memberships: [
            {
              groupid: 555,
              id: 555,
              nameshort: 'InMemberof',
              namedisplay: 'In Memberof',
            },
          ],
        },
      })
      expect(wrapper.vm.loggroup.nameshort).toBe('InMemberof')
    })

    it('handles user with no applied array', () => {
      const wrapper = createWrapper({
        groupid: 666,
        user: {
          memberships: [
            {
              groupid: 666,
              id: 666,
              nameshort: 'OnlyMember',
              namedisplay: 'Only Member',
            },
          ],
        },
      })
      expect(wrapper.vm.loggroup.nameshort).toBe('OnlyMember')
    })

    it('handles user with empty applied and memberships arrays', () => {
      const wrapper = createWrapper({
        groupid: 777,
        user: {
          applied: [],
          memberships: [],
        },
      })
      // Should fall back to myGroup or null
      expect(wrapper.vm.loggroup).toBeNull()
    })
  })

  describe('props', () => {
    it('accepts logid prop', () => {
      mockLogsStore.list = [{ id: 42 }]
      mockLogsStore.byId.mockImplementation(
        (id) => mockLogsStore.list.find((l) => l.id === id) || null
      )
      const wrapper = mount(ModLogGroup, { props: { logid: 42 } })
      expect(wrapper.props('logid')).toBe(42)
    })
  })

  describe('edge cases', () => {
    it('handles log with empty message.groups array', () => {
      const wrapper = createWrapper({
        groupid: 888,
        message: { groups: [] },
      })
      // Should not find via message.groups, might fall back
      expect(wrapper.vm.loggroup).toBeNull()
    })

    it('handles null user and byuser', () => {
      const wrapper = createWrapper({
        groupid: 999,
        user: null,
        byuser: null,
      })
      expect(wrapper.vm.loggroup).toBeNull()
    })
  })
})
