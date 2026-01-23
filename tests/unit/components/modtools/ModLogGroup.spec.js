import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModLogGroup from '~/modtools/components/ModLogGroup.vue'

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
  function createWrapper(log = null, tag = null) {
    return mount(ModLogGroup, {
      props: { log, tag },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
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
              id: 789,
              nameshort: 'AppliedGroup',
              namedisplay: 'Applied Group',
            },
          ],
        },
      })
      expect(wrapper.vm.loggroup.id).toBe(789)
    })

    it('finds group in user.memberof array when groupid matches', () => {
      const wrapper = createWrapper({
        groupid: 111,
        user: {
          memberof: [
            { id: 111, nameshort: 'MemberGroup', namedisplay: 'Member Group' },
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
              id: 222,
              nameshort: 'ByUserApplied',
              namedisplay: 'By User Applied',
            },
          ],
        },
      })
      expect(wrapper.vm.loggroup.id).toBe(222)
    })

    it('finds group in byuser.memberof array when user lookup fails', () => {
      const wrapper = createWrapper({
        groupid: 333,
        byuser: {
          memberof: [
            {
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
              id: 444,
              nameshort: 'AppliedFirst',
              namedisplay: 'Applied First',
            },
          ],
          memberof: [
            {
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

    it('falls back to memberof when not in applied', () => {
      const wrapper = createWrapper({
        groupid: 555,
        user: {
          applied: [{ id: 999, nameshort: 'Other', namedisplay: 'Other' }],
          memberof: [
            { id: 555, nameshort: 'InMemberof', namedisplay: 'In Memberof' },
          ],
        },
      })
      expect(wrapper.vm.loggroup.nameshort).toBe('InMemberof')
    })

    it('handles user with no applied array', () => {
      const wrapper = createWrapper({
        groupid: 666,
        user: {
          memberof: [
            { id: 666, nameshort: 'OnlyMember', namedisplay: 'Only Member' },
          ],
        },
      })
      expect(wrapper.vm.loggroup.nameshort).toBe('OnlyMember')
    })

    it('handles user with empty applied and memberof arrays', () => {
      const wrapper = createWrapper({
        groupid: 777,
        user: {
          applied: [],
          memberof: [],
        },
      })
      // Should fall back to myGroup or null
      expect(wrapper.vm.loggroup).toBeNull()
    })
  })

  describe('props', () => {
    it('defaults log to null (but component requires log)', () => {
      // The component always expects a log prop, so we test with a minimal log
      const wrapper = mount(ModLogGroup, { props: { log: {} } })
      expect(wrapper.props('log')).toEqual({})
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
