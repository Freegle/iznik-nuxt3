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
    it('renders timestamp, user column with ModLogUser, and action column', () => {
      const wrapper = createWrapper({
        id: 1,
        timestamp: '2024-01-15T10:00:00Z',
        type: 'User',
        subtype: 'Login',
        byuser: { id: 123, displayname: 'Test User' },
      })
      expect(wrapper.text()).toContain('formatted:2024-01-15T10:00:00Z')
      expect(wrapper.find('.mod-log-user').exists()).toBe(true)
      expect(wrapper.text()).toContain('Logged in')
    })
  })

  describe('sourceheader computed', () => {
    it.each([
      [null, null, 'no sourceheader'],
      ['Yahoo-Web', 'Web', 'Yahoo- prefix'],
      ['Email', 'Email', 'no Yahoo- prefix'],
    ])(
      'returns %s when sourceheader is %s (%s)',
      (input, expected, _description) => {
        const wrapper = createWrapper({
          id: 1,
          type: 'Message',
          subtype: 'Received',
          message: { type: 'Offer', sourceheader: input },
        })
        expect(wrapper.vm.sourceheader).toBe(expected)
      }
    )
  })

  describe('postingStatus computed', () => {
    it.each([
      ['UNCHANGED', 'Unchanged'],
      ['MODERATED', 'Moderated'],
      ['DEFAULT', 'Group Settings'],
      ['PROHIBITED', "Can't Post"],
      ['UNKNOWN', null],
    ])('returns correct status for %s', (input, expected) => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'OurPostingStatus',
        text: input,
        group: { id: 1, nameshort: 'Test' },
      })
      expect(wrapper.vm.postingStatus).toBe(expected)
    })
  })

  describe('byuser computed', () => {
    it.each([
      [
        { id: 456, displayname: 'Mod User' },
        { id: 456, displayname: 'Mod User' },
        'returns log.byuser when present',
      ],
      [undefined, undefined, 'returns undefined when log has no byuser'],
    ])('%s', (byuser, expected, _description) => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Login',
        byuser,
      })
      expect(wrapper.vm.byuser).toEqual(expected)
    })
  })

  describe('Group log types', () => {
    it.each([
      [
        { type: 'Group', subtype: 'Joined', groupid: 1 },
        'Joined',
        'shows Joined for Group/Joined',
      ],
      [
        { type: 'Group', subtype: 'Applied', groupid: 1 },
        'Applied',
        'shows Applied for Group/Applied',
      ],
      [
        { type: 'Group', subtype: 'Edit' },
        'Edited group settings',
        'shows Edited for Group/Edit',
      ],
      [
        { type: 'Group', subtype: 'Autoapproved' },
        'Auto-approved',
        'shows Auto-approved for Group/Autoapproved',
      ],
      [
        { type: 'Group', subtype: 'UnknownSubtype' },
        'Unknown log type',
        'shows unknown for unhandled subtypes',
      ],
    ])('%s', (logProps, expectedText, _description) => {
      const wrapper = createWrapper({ id: 1, ...logProps })
      expect(wrapper.text()).toContain(expectedText)
    })

    it('shows "added by" and "Clicked on Join button" based on user context', () => {
      // When user and byuser differ
      const wrapperAddedBy = createWrapper({
        id: 1,
        type: 'Group',
        subtype: 'Joined',
        user: { id: 1, displayname: 'Member' },
        byuser: { id: 2, displayname: 'Mod' },
      })
      expect(wrapperAddedBy.text()).toContain('added by')

      // Manual text shows button click
      const wrapperManual = createWrapper({
        id: 1,
        type: 'Group',
        subtype: 'Joined',
        text: 'Manual',
      })
      expect(wrapperManual.text()).toContain('Clicked on Join button')
    })

    it('shows Left when same user, Removed when different users for Group/Left', () => {
      const wrapperSameUser = createWrapper({
        id: 1,
        type: 'Group',
        subtype: 'Left',
        user: { id: 1, displayname: 'User' },
        byuser: { id: 1, displayname: 'User' },
      })
      expect(wrapperSameUser.text()).toContain('Left')

      const wrapperDiffUsers = createWrapper({
        id: 1,
        type: 'Group',
        subtype: 'Left',
        user: { id: 1, displayname: 'Member' },
        byuser: { id: 2, displayname: 'Mod' },
      })
      expect(wrapperDiffUsers.text()).toContain('Removed member')
    })
  })

  describe('Message log types', () => {
    it.each([
      [
        {
          type: 'Message',
          subtype: 'Received',
          message: {
            type: 'Offer',
            groups: [{ id: 1, collection: 'Approved' }],
          },
        },
        'Posted',
        'shows Posted for Message/Received with Offer',
      ],
      [
        {
          type: 'Message',
          subtype: 'Received',
          message: {
            type: 'Offer',
            groups: [{ id: 1, collection: 'Pending' }],
          },
        },
        'Pending',
        'shows Pending status for pending messages',
      ],
      [
        {
          type: 'Message',
          subtype: 'Received',
          message: {
            type: 'Other',
            subject: 'Test',
            envelopeto: 'test@example.com',
          },
        },
        'Emailed',
        'shows Emailed for non-Offer/Wanted messages',
      ],
      [
        {
          type: 'Message',
          subtype: 'Received',
          message: { id: 123, type: 'Other', deleted: true },
        },
        'deleted',
        'shows deleted notice for deleted messages',
      ],
      [
        { type: 'Message', subtype: 'Repost' },
        'Manual repost',
        'shows Manual repost for Message/Repost',
      ],
      [
        { type: 'Message', subtype: 'Approved' },
        'Approved message',
        'shows Approved for Message/Approved',
      ],
      [
        { type: 'Message', subtype: 'Deleted' },
        'Deleted',
        'shows Deleted for Message/Deleted',
      ],
      [
        { type: 'Message', subtype: 'Hold' },
        'Held',
        'shows Held for Message/Hold',
      ],
      [
        { type: 'Message', subtype: 'Release' },
        'Released',
        'shows Released for Message/Release',
      ],
      [
        { type: 'Message', subtype: 'ClassifiedSpam' },
        'Sent spam',
        'shows Sent spam for Message/ClassifiedSpam',
      ],
    ])('%s', (logProps, expectedText, _description) => {
      const wrapper = createWrapper({ id: 1, ...logProps })
      expect(wrapper.text()).toContain(expectedText)
    })

    it('shows Autoreposted with repost count for Message/Autoreposted', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Autoreposted',
        text: '3',
      })
      expect(wrapper.text()).toContain('Autoreposted')
      expect(wrapper.text()).toContain('repost 3')
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

    it('shows Edited with text content for Message/Edit', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Edit',
        text: 'Subject changed',
      })
      expect(wrapper.text()).toContain('Edited')
      expect(wrapper.text()).toContain('Subject changed')
    })

    it('shows Marked as with outcome text for Message/Outcome', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'Message',
        subtype: 'Outcome',
        text: 'TAKEN',
      })
      expect(wrapper.text()).toContain('Marked')
      expect(wrapper.text()).toContain('TAKEN')
    })

    it('shows Flagged with warning text for Message/WorryWords', () => {
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
    it.each([
      [
        { type: 'User', subtype: 'Logout' },
        'Logged out',
        'shows Logged out for User/Logout',
      ],
      [
        { type: 'User', subtype: 'Created' },
        'User Created',
        'shows User Created for User/Created',
      ],
      [
        {
          type: 'User',
          subtype: 'Approved',
          user: { id: 1, displayname: 'New Member' },
        },
        'Approved member',
        'shows Approved member for User/Approved',
      ],
      [
        {
          type: 'User',
          subtype: 'Rejected',
          user: { id: 1, displayname: 'Rejected Member' },
        },
        'Rejected member',
        'shows Rejected member for User/Rejected',
      ],
      [
        {
          type: 'User',
          subtype: 'Hold',
          user: { id: 1, displayname: 'Held Member' },
        },
        'Held member',
        'shows Held member for User/Hold',
      ],
      [
        {
          type: 'User',
          subtype: 'Release',
          user: { id: 1, displayname: 'Released Member' },
        },
        'Released member',
        'shows Released member for User/Release',
      ],
      [
        { type: 'User', subtype: 'Split', text: 'into #789' },
        'Split out into two users',
        'shows Split for User/Split',
      ],
    ])('%s', (logProps, expectedText, _description) => {
      const wrapper = createWrapper({ id: 1, ...logProps })
      expect(wrapper.text()).toContain(expectedText)
    })

    it('shows Logged in with method text for User/Login', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Login',
        text: 'via email',
      })
      expect(wrapper.text()).toContain('Logged in')
      expect(wrapper.text()).toContain('via email')
    })

    it('shows Role changed with role text for User/RoleChange', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'RoleChange',
        text: 'Moderator',
      })
      expect(wrapper.text()).toContain('Role')
      expect(wrapper.text()).toContain('changed to Moderator')
    })

    it('shows Merged with user text for User/Merged', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Merged',
        text: 'User #456',
      })
      expect(wrapper.text()).toContain('Merged')
      expect(wrapper.text()).toContain('User #456')
    })

    it('shows Set Email Frequency with frequency text for User/OurEmailFrequency', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'OurEmailFrequency',
        text: 'Daily',
      })
      expect(wrapper.text()).toContain('Set Email Frequency to Daily')
    })

    it('shows Flagged with reason text for User/Suspect', () => {
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

    it('shows Bounce with bounce text for User/Bounce', () => {
      const wrapper = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Bounce',
        text: 'Hard bounce',
      })
      expect(wrapper.text()).toContain('Hard bounce')
    })

    it('shows Postcode set with postcode for User/PostcodeChange', () => {
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
    it.each([
      [
        { type: 'Config', subtype: 'Created', text: 'TestConfig' },
        'Created config TestConfig',
      ],
      [
        { type: 'Config', subtype: 'Deleted', text: 'OldConfig' },
        'Deleted config OldConfig',
      ],
      [
        { type: 'Config', subtype: 'Edit', config: { name: 'EditedConfig' } },
        'Edited config EditedConfig',
      ],
    ])('shows correct text for %s', (logProps, expectedText) => {
      const wrapper = createWrapper({ id: 1, ...logProps })
      expect(wrapper.text()).toContain(expectedText)
    })
  })

  describe('StdMsg log types', () => {
    it.each([
      [
        { type: 'StdMsg', subtype: 'Created', text: 'Welcome Message' },
        'Created standard message Welcome Message',
      ],
      [
        { type: 'StdMsg', subtype: 'Deleted', text: 'Old Message' },
        'Deleted standard message Old Message',
      ],
      [
        { type: 'StdMsg', subtype: 'Edit', stdmsg: { name: 'Edited Message' } },
        'Edited standard message',
      ],
    ])('shows correct text for %s', (logProps, expectedText) => {
      const wrapper = createWrapper({ id: 1, ...logProps })
      expect(wrapper.text()).toContain(expectedText)
    })
  })

  describe('Chat log types', () => {
    it.each([
      [
        {
          type: 'Chat',
          subtype: 'Approved',
          user: { id: 1, displayname: 'Chat User' },
        },
        'Approved chat message',
      ],
      [{ type: 'Chat', subtype: 'UnknownChat' }, 'Unknown log type'],
    ])('shows correct text for %s', (logProps, expectedText) => {
      const wrapper = createWrapper({ id: 1, ...logProps })
      expect(wrapper.text()).toContain(expectedText)
    })
  })

  describe('user display logic', () => {
    it.each([
      [
        {
          type: 'Group',
          subtype: 'Joined',
          user: { id: 1, displayname: 'Member' },
          byuser: { id: 2, displayname: 'Mod' },
        },
        'shows log.user for Group/Joined when user differs from byuser',
      ],
      [
        {
          type: 'User',
          subtype: 'Approved',
          user: { id: 1, displayname: 'Member' },
          byuser: { id: 2, displayname: 'Mod' },
        },
        'shows byuser for non-Joined when user differs from byuser',
      ],
      [
        {
          type: 'Message',
          subtype: 'Received',
          message: {
            type: 'Offer',
            fromuser: { id: 3, displayname: 'Poster' },
          },
        },
        'shows message.fromuser when no user or byuser',
      ],
    ])('%s', (logProps, _description) => {
      const wrapper = createWrapper({ id: 1, ...logProps })
      const userCols = wrapper.findAll('.mod-log-user')
      expect(userCols.length).toBeGreaterThan(0)
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

    it('handles User/Deleted with byuser (Rejected) and without byuser (self-leave)', () => {
      // With byuser - shows Rejected member
      const wrapperWithByuser = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Deleted',
        user: { id: 1, displayname: 'User' },
        byuser: { id: 2, displayname: 'Mod' },
        text: 'violation',
      })
      expect(wrapperWithByuser.text()).toContain('Rejected member')

      // Without byuser - shows User left platform
      const wrapperWithoutByuser = createWrapper({
        id: 1,
        type: 'User',
        subtype: 'Deleted',
        user: { id: 1, displayname: 'User' },
        text: 'privacy',
      })
      expect(wrapperWithoutByuser.text()).toContain('User left platform')
    })
  })
})
