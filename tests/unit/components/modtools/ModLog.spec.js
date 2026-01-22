import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModLog from '~/modtools/components/ModLog.vue'

describe('ModLog', () => {
  function createWrapper(log) {
    return mount(ModLog, {
      props: { log },
      global: {
        stubs: {
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols', 'lg'],
          },
          ModLogUser: {
            template:
              '<span class="mod-log-user" :data-id="user?.id">{{ user?.displayname }}</span>',
            props: ['user'],
          },
          ModLogGroup: {
            template: '<span class="mod-log-group">Group</span>',
            props: ['log', 'tag'],
          },
          ModLogMessage: {
            template: '<span class="mod-log-message">Message</span>',
            props: ['log', 'notext', 'tag'],
          },
          ModLogStdMsg: {
            template: '<span class="mod-log-stdmsg">StdMsg</span>',
            props: ['log'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders timestamp column', () => {
      const wrapper = createWrapper({
        id: 1,
        timestamp: '2024-01-15T10:00:00Z',
        type: 'User',
        subtype: 'Login',
      })
      expect(wrapper.text()).toContain('formatted:2024-01-15T10:00:00Z')
    })

    it('renders user column with ModLogUser', () => {
      const wrapper = createWrapper({
        id: 1,
        timestamp: '2024-01-15T10:00:00Z',
        type: 'User',
        subtype: 'Login',
        byuser: { id: 123, displayname: 'Test User' },
      })
      expect(wrapper.find('.mod-log-user').exists()).toBe(true)
    })

    it('renders action column', () => {
      const wrapper = createWrapper({
        id: 1,
        timestamp: '2024-01-15T10:00:00Z',
        type: 'User',
        subtype: 'Login',
      })
      expect(wrapper.text()).toContain('Logged in')
    })
  })

  describe('sourceheader computed', () => {
    it('returns null when message has no sourceheader', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Received',
        message: { type: 'Offer' },
      })
      expect(wrapper.vm.sourceheader).toBeNull()
    })

    it('strips Yahoo- prefix from sourceheader', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Received',
        message: { type: 'Offer', sourceheader: 'Yahoo-Web' },
      })
      expect(wrapper.vm.sourceheader).toBe('Web')
    })

    it('returns sourceheader as-is when no Yahoo- prefix', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Received',
        message: { type: 'Offer', sourceheader: 'Email' },
      })
      expect(wrapper.vm.sourceheader).toBe('Email')
    })
  })

  describe('postingStatus computed', () => {
    it('returns "Unchanged" for UNCHANGED', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'OurPostingStatus',
        text: 'UNCHANGED',
        group: { id: 1, nameshort: 'Test' },
      })
      expect(wrapper.vm.postingStatus).toBe('Unchanged')
    })

    it('returns "Moderated" for MODERATED', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'OurPostingStatus',
        text: 'MODERATED',
        group: { id: 1, nameshort: 'Test' },
      })
      expect(wrapper.vm.postingStatus).toBe('Moderated')
    })

    it('returns "Group Settings" for DEFAULT', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'OurPostingStatus',
        text: 'DEFAULT',
        group: { id: 1, nameshort: 'Test' },
      })
      expect(wrapper.vm.postingStatus).toBe('Group Settings')
    })

    it('returns "Can\'t Post" for PROHIBITED', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'OurPostingStatus',
        text: 'PROHIBITED',
        group: { id: 1, nameshort: 'Test' },
      })
      expect(wrapper.vm.postingStatus).toBe("Can't Post")
    })

    it('returns null for unknown status', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'OurPostingStatus',
        text: 'UNKNOWN',
        group: { id: 1, nameshort: 'Test' },
      })
      expect(wrapper.vm.postingStatus).toBeNull()
    })
  })

  describe('byuser computed', () => {
    it('returns log.byuser', () => {
      const byuser = { id: 456, displayname: 'Mod User' }
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Login',
        byuser,
      })
      expect(wrapper.vm.byuser).toEqual(byuser)
    })

    it('returns undefined when log has no byuser', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Login',
      })
      expect(wrapper.vm.byuser).toBeUndefined()
    })
  })

  describe('Group log types', () => {
    it('shows Joined for Group/Joined', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Group',
        subtype: 'Joined',
        groupid: 1,
      })
      expect(wrapper.text()).toContain('Joined')
    })

    it('shows "added by" when user and byuser differ for Group/Joined', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Group',
        subtype: 'Joined',
        user: { id: 1, displayname: 'Member' },
        byuser: { id: 2, displayname: 'Mod' },
      })
      expect(wrapper.text()).toContain('added by')
    })

    it('shows "Clicked on Join button" for Manual text', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Group',
        subtype: 'Joined',
        text: 'Manual',
      })
      expect(wrapper.text()).toContain('Clicked on Join button')
    })

    it('shows Applied for Group/Applied', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Group',
        subtype: 'Applied',
        groupid: 1,
      })
      expect(wrapper.text()).toContain('Applied')
    })

    it('shows Left for Group/Left when same user', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Group',
        subtype: 'Left',
        user: { id: 1, displayname: 'User' },
        byuser: { id: 1, displayname: 'User' },
      })
      expect(wrapper.text()).toContain('Left')
    })

    it('shows Removed for Group/Left when different users', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Group',
        subtype: 'Left',
        user: { id: 1, displayname: 'Member' },
        byuser: { id: 2, displayname: 'Mod' },
      })
      expect(wrapper.text()).toContain('Removed member')
    })

    it('shows Edited for Group/Edit', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Group',
        subtype: 'Edit',
      })
      expect(wrapper.text()).toContain('Edited group settings')
    })

    it('shows Auto-approved for Group/Autoapproved', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Group',
        subtype: 'Autoapproved',
      })
      expect(wrapper.text()).toContain('Auto-approved')
    })

    it('shows unknown log type for unhandled subtypes', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Group',
        subtype: 'UnknownSubtype',
      })
      expect(wrapper.text()).toContain('Unknown log type')
    })
  })

  describe('Message log types', () => {
    it('shows Posted for Message/Received with Offer', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Received',
        message: { type: 'Offer', groups: [{ id: 1, collection: 'Approved' }] },
      })
      expect(wrapper.text()).toContain('Posted')
    })

    it('shows Pending status for pending messages', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Received',
        message: { type: 'Offer', groups: [{ id: 1, collection: 'Pending' }] },
      })
      expect(wrapper.text()).toContain('Pending')
    })

    it('shows Emailed for non-Offer/Wanted messages', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Received',
        message: {
          type: 'Other',
          subject: 'Test',
          envelopeto: 'test@example.com',
        },
      })
      expect(wrapper.text()).toContain('Emailed')
    })

    it('shows deleted notice for deleted messages', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Received',
        message: { id: 123, type: 'Other', deleted: true },
      })
      expect(wrapper.text()).toContain('deleted')
    })

    it('shows Autoreposted for Message/Autoreposted', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Autoreposted',
        text: '3',
      })
      expect(wrapper.text()).toContain('Autoreposted')
      expect(wrapper.text()).toContain('repost 3')
    })

    it('shows Manual repost for Message/Repost', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Repost',
      })
      expect(wrapper.text()).toContain('Manual repost')
    })

    it('shows Approved for Message/Approved', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Approved',
      })
      expect(wrapper.text()).toContain('Approved message')
    })

    it('shows Rejected with danger class for Message/Rejected', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Rejected',
      })
      expect(wrapper.text()).toContain('Rejected')
      expect(wrapper.find('.text-danger').exists()).toBe(true)
    })

    it('shows Modmail sent for Message/Replied', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Replied',
        text: 'Reply text',
      })
      expect(wrapper.text()).toContain('Modmail sent')
    })

    it('shows Deleted for Message/Deleted', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Deleted',
      })
      expect(wrapper.text()).toContain('Deleted')
    })

    it('shows Held for Message/Hold', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Hold',
      })
      expect(wrapper.text()).toContain('Held')
    })

    it('shows Released for Message/Release', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Release',
      })
      expect(wrapper.text()).toContain('Released')
    })

    it('shows Edited for Message/Edit', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Edit',
        text: 'Subject changed',
      })
      expect(wrapper.text()).toContain('Edited')
      expect(wrapper.text()).toContain('Subject changed')
    })

    it('shows Marked as for Message/Outcome', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Outcome',
        text: 'TAKEN',
      })
      expect(wrapper.text()).toContain('Marked')
      expect(wrapper.text()).toContain('TAKEN')
    })

    it('shows Sent spam for Message/ClassifiedSpam', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'ClassifiedSpam',
      })
      expect(wrapper.text()).toContain('Sent spam')
    })

    it('shows Flagged for Message/WorryWords', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'WorryWords',
        text: 'test warning',
      })
      expect(wrapper.text()).toContain('Flagged')
      expect(wrapper.text()).toContain('test warning')
    })
  })

  describe('User log types', () => {
    it('shows Logged in for User/Login', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Login',
        text: 'via email',
      })
      expect(wrapper.text()).toContain('Logged in')
      expect(wrapper.text()).toContain('via email')
    })

    it('shows Logged out for User/Logout', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Logout',
      })
      expect(wrapper.text()).toContain('Logged out')
    })

    it('shows User Created for User/Created', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Created',
      })
      expect(wrapper.text()).toContain('User Created')
    })

    it('shows Role changed for User/RoleChange', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'RoleChange',
        text: 'Moderator',
      })
      expect(wrapper.text()).toContain('Role')
      expect(wrapper.text()).toContain('changed to Moderator')
    })

    it('shows Merged for User/Merged', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Merged',
        text: 'User #456',
      })
      expect(wrapper.text()).toContain('Merged')
      expect(wrapper.text()).toContain('User #456')
    })

    it('shows Set Email Frequency for User/OurEmailFrequency', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'OurEmailFrequency',
        text: 'Daily',
      })
      expect(wrapper.text()).toContain('Set Email Frequency to Daily')
    })

    it('shows Approved member for User/Approved', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Approved',
        user: { id: 1, displayname: 'New Member' },
      })
      expect(wrapper.text()).toContain('Approved member')
    })

    it('shows Rejected member for User/Rejected', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Rejected',
        user: { id: 1, displayname: 'Rejected Member' },
      })
      expect(wrapper.text()).toContain('Rejected member')
    })

    it('shows Held member for User/Hold', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Hold',
        user: { id: 1, displayname: 'Held Member' },
      })
      expect(wrapper.text()).toContain('Held member')
    })

    it('shows Released member for User/Release', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Release',
        user: { id: 1, displayname: 'Released Member' },
      })
      expect(wrapper.text()).toContain('Released member')
    })

    it('shows Flagged for User/Suspect', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Suspect',
        user: { id: 1, displayname: 'Suspect User' },
        text: 'suspicious activity',
      })
      expect(wrapper.text()).toContain('Flagged')
      expect(wrapper.text()).toContain('suspicious activity')
    })

    it('shows Split for User/Split', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Split',
        text: 'into #789',
      })
      expect(wrapper.text()).toContain('Split out into two users')
    })

    it('shows Bounce for User/Bounce', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Bounce',
        text: 'Hard bounce',
      })
      expect(wrapper.text()).toContain('Hard bounce')
    })

    it('shows Postcode set for User/PostcodeChange', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'PostcodeChange',
        text: 'SW1A 1AA',
      })
      expect(wrapper.text()).toContain('Postcode set to SW1A 1AA')
    })
  })

  describe('Config log types', () => {
    it('shows Created config for Config/Created', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Config',
        subtype: 'Created',
        text: 'TestConfig',
      })
      expect(wrapper.text()).toContain('Created config TestConfig')
    })

    it('shows Deleted config for Config/Deleted', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Config',
        subtype: 'Deleted',
        text: 'OldConfig',
      })
      expect(wrapper.text()).toContain('Deleted config OldConfig')
    })

    it('shows Edited config for Config/Edit', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Config',
        subtype: 'Edit',
        config: { name: 'EditedConfig' },
      })
      expect(wrapper.text()).toContain('Edited config EditedConfig')
    })
  })

  describe('StdMsg log types', () => {
    it('shows Created standard message for StdMsg/Created', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'StdMsg',
        subtype: 'Created',
        text: 'Welcome Message',
      })
      expect(wrapper.text()).toContain(
        'Created standard message Welcome Message'
      )
    })

    it('shows Deleted standard message for StdMsg/Deleted', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'StdMsg',
        subtype: 'Deleted',
        text: 'Old Message',
      })
      expect(wrapper.text()).toContain('Deleted standard message Old Message')
    })

    it('shows Edited standard message for StdMsg/Edit', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'StdMsg',
        subtype: 'Edit',
        stdmsg: { name: 'Edited Message' },
      })
      expect(wrapper.text()).toContain('Edited standard message')
    })
  })

  describe('Chat log types', () => {
    it('shows Approved chat message for Chat/Approved', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Chat',
        subtype: 'Approved',
        user: { id: 1, displayname: 'Chat User' },
      })
      expect(wrapper.text()).toContain('Approved chat message')
    })

    it('shows unknown for unhandled Chat subtypes', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Chat',
        subtype: 'UnknownChat',
      })
      expect(wrapper.text()).toContain('Unknown log type')
    })
  })

  describe('user display logic', () => {
    it('shows log.user for Group/Joined when user differs from byuser', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Group',
        subtype: 'Joined',
        user: { id: 1, displayname: 'Member' },
        byuser: { id: 2, displayname: 'Mod' },
      })
      // Should show log.user (Member) in the user column
      const userCols = wrapper.findAll('.mod-log-user')
      expect(userCols.length).toBeGreaterThan(0)
    })

    it('shows byuser for non-Joined when user differs from byuser', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Approved',
        user: { id: 1, displayname: 'Member' },
        byuser: { id: 2, displayname: 'Mod' },
      })
      expect(wrapper.find('.mod-log-user').exists()).toBe(true)
    })

    it('shows message.fromuser when no user or byuser', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Received',
        message: {
          type: 'Offer',
          fromuser: { id: 3, displayname: 'Poster' },
        },
      })
      expect(wrapper.find('.mod-log-user').exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles log with minimal data', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Login',
        timestamp: '2024-01-01T00:00:00Z',
      })
      expect(wrapper.find('.row').exists()).toBe(true)
    })

    it('handles User/Deleted with byuser present', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Deleted',
        user: { id: 1, displayname: 'User' },
        byuser: { id: 2, displayname: 'Mod' },
        text: 'violation',
      })
      expect(wrapper.text()).toContain('Rejected member')
    })

    it('handles User/Deleted without byuser (self-leave)', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Deleted',
        user: { id: 1, displayname: 'User' },
        text: 'privacy',
      })
      expect(wrapper.text()).toContain('User left platform')
    })
  })
})
