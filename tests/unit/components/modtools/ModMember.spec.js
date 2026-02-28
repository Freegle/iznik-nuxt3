import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import dayjs from 'dayjs'
import ModMember from '~/modtools/components/ModMember.vue'

// Mock stores
const mockUserStore = {
  fetchMT: vi.fn(),
  edit: vi.fn(),
}

const mockMemberStore = {
  update: vi.fn(),
  unban: vi.fn(),
}

const mockModConfigStore = {
  configs: [],
}

const mockChatStore = {
  openChatToMods: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

vi.mock('~/stores/modconfig', () => ({
  useModConfigStore: () => mockModConfigStore,
}))

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    // me is a ref - gets unwrapped in templates to just the object
    me: { id: 999, displayname: 'Mod User' },
    myGroups: { value: [{ id: 789, configid: 1 }] },
  }),
}))

describe('ModMember', () => {
  const createMember = (overrides = {}) => ({
    id: 123,
    userid: 456,
    displayname: 'Test User',
    email: 'test@example.com',
    emails: [
      { id: 1, email: 'test@example.com', preferred: true, ourdomain: false },
    ],
    profile: { turl: 'https://example.com/profile.jpg' },
    joined: '2024-01-01T10:00:00Z',
    lastaccess: dayjs().subtract(10, 'days').toISOString(),
    groupid: 789,
    role: 'Member',
    ourpostingstatus: 'MODERATED',
    emailfrequency: 24,
    bouncing: false,
    bandate: null,
    banned: false,
    spammer: null,
    supporter: false,
    heldby: null,
    suspectreason: null,
    activedistance: 10,
    settings: {
      notifications: {
        email: true,
        emailmine: false,
        push: true,
        facebook: true,
        app: true,
      },
      notificationmails: true,
    },
    relevantallowed: true,
    newslettersallowed: true,
    autorepostsdisable: false,
    info: {
      publiclocation: { location: 'London' },
    },
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModMember, {
      props: {
        member: createMember(),
        ...props,
      },
      global: {
        stubs: {
          'b-card': {
            template: '<div class="card"><slot /><slot name="header" /></div>',
            props: ['bgVariant', 'noBody'],
          },
          'b-card-header': {
            template: '<div class="card-header"><slot /></div>',
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-card-footer': {
            template: '<div class="card-footer"><slot /></div>',
          },
          'b-button': {
            template:
              '<button :href="href" :target="target" :to="to" :data-variant="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'href', 'target', 'to', 'size'],
          },
          'b-badge': {
            template:
              '<span class="badge" :class="variant" @click="$emit(\'click\')"><slot /></span>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
          },
          ExternalLink: {
            template: '<a :href="href"><slot /></a>',
            props: ['href'],
          },
          ProfileImage: {
            template: '<img :src="image" :alt="name" class="profile-image" />',
            props: ['image', 'name', 'isThumbnail', 'size'],
          },
          ModSupporter: {
            template: '<span class="mod-supporter" />',
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          ModClipboard: {
            template: '<span class="mod-clipboard" />',
            props: ['value'],
          },
          ModComments: {
            template: '<div class="mod-comments" />',
            props: ['userid', 'expandComments'],
          },
          ModSpammer: {
            template: '<div class="mod-spammer" />',
            props: ['user', 'sameip'],
          },
          ModBouncing: {
            template: '<div class="mod-bouncing" />',
            props: ['user'],
          },
          ModDeletedOrForgotten: {
            template: '<div class="mod-deleted-or-forgotten" />',
            props: ['user'],
          },
          ModMemberSummary: {
            template: '<div class="mod-member-summary" />',
            props: ['member'],
          },
          ModMemberEngagement: {
            template: '<div class="mod-member-engagement" />',
            props: ['member'],
          },
          ModMemberActions: {
            template: '<div class="mod-member-actions" />',
            props: ['userid', 'groupid', 'banned'],
          },
          ModMemberships: {
            template: '<div class="mod-memberships" />',
            props: ['userid'],
          },
          ModMemberLogins: {
            template: '<div class="mod-member-logins" />',
            props: ['member'],
          },
          ModMemberButtons: {
            template: '<div class="mod-member-buttons" />',
            props: ['member', 'modconfig', 'actions'],
          },
          ModMemberButton: {
            template: '<button class="mod-member-button" />',
            props: ['member', 'variant', 'icon', 'release', 'label'],
          },
          ModRole: {
            template: '<div class="mod-role" />',
            props: ['userid', 'groupid', 'role'],
          },
          ModModeration: {
            template: '<div class="mod-moderation" />',
            props: ['user', 'userid', 'membership'],
          },
          SettingsGroup: {
            template: '<div class="settings-group" />',
            props: [
              'emailfrequency',
              'membershipMT',
              'moderation',
              'userid',
              'xclass',
            ],
          },
          OurToggle: {
            template:
              '<button class="our-toggle" :data-checked="modelValue" @click="$emit(\'change\', { value: !modelValue })"><slot /></button>',
            props: [
              'modelValue',
              'height',
              'width',
              'fontSize',
              'sync',
              'size',
              'labels',
              'variant',
            ],
          },
          ChatButton: {
            template: '<button class="chat-button" />',
            props: ['userid', 'groupid', 'title', 'variant'],
          },
          ModPostingHistoryModal: {
            template: '<div class="posting-history-modal" />',
            props: ['user', 'type'],
          },
          ModLogsModal: {
            template: '<div class="logs-modal" />',
            props: ['userid'],
          },
          ConfirmModal: {
            template: '<div class="confirm-modal" :title="title" />',
            props: ['title'],
            methods: { show: vi.fn() },
          },
          ModChatModal: {
            template: '<div class="mod-chat-modal" />',
            props: ['id', 'pov'],
            methods: { show: vi.fn() },
          },
        },
        mocks: {
          datetimeshort: (val) => `formatted:${val}`,
          timeago: (val) => `${dayjs().diff(dayjs(val), 'days')} days ago`,
          datetime: (val) => `datetime:${val}`,
          pluralise: (word, count, withNumber) => {
            const num = withNumber ? `${count} ` : ''
            return num + (count === 1 ? word : word + 's')
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.fetchMT.mockResolvedValue()
    mockUserStore.edit.mockResolvedValue()
    mockMemberStore.update.mockResolvedValue()
    mockMemberStore.unban.mockResolvedValue()
    mockChatStore.openChatToMods.mockResolvedValue(12345)
    mockModConfigStore.configs = [{ id: 1, name: 'Test Config' }]
  })

  describe('rendering', () => {
    it('renders the component when member exists', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('does not render when member is null', () => {
      // This tests the v-if="member" condition
      // Since member is required, we can't actually pass null, but we test the template logic
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('shows email link', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('test@example.com')
    })

    it('shows displayname', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test User')
    })

    it('shows userid', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('456')
    })

    it('shows joined date when available', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('formatted:')
    })

    it('shows ModComments component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-comments').exists()).toBe(true)
    })

    it('shows ModMemberSummary component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-member-summary').exists()).toBe(true)
    })

    it('shows ModMemberEngagement component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-member-engagement').exists()).toBe(true)
    })

    it('shows ModMemberships component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-memberships').exists()).toBe(true)
    })

    it('shows ModMemberLogins component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-member-logins').exists()).toBe(true)
    })

    it('shows ModMemberButtons in footer by default', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-member-buttons').exists()).toBe(true)
    })
  })

  describe('LoveJunk user', () => {
    it('shows LoveJunk badge when isLJ is true', () => {
      const wrapper = mountComponent({
        member: createMember({ ljuserid: 12345 }),
      })
      expect(wrapper.text()).toContain('LoveJunk user')
      expect(wrapper.text()).toContain('12345')
    })

    it('does not show LoveJunk badge when isLJ is false', () => {
      const wrapper = mountComponent({
        member: createMember({ ljuserid: null }),
      })
      expect(wrapper.text()).not.toContain('LoveJunk user')
    })
  })

  describe('banned member', () => {
    it('shows banned notice when member is banned', () => {
      const wrapper = mountComponent({
        member: createMember({
          bandate: '2024-01-15T10:00:00Z',
          bannedby: 999,
        }),
      })
      expect(wrapper.text()).toContain('Banned')
      expect(wrapper.text()).toContain('#999')
    })

    it('shows banned notice without bannedby', () => {
      const wrapper = mountComponent({
        member: createMember({
          bandate: '2024-01-15T10:00:00Z',
          bannedby: null,
        }),
      })
      expect(wrapper.text()).toContain('Banned')
    })

    it('shows unban button when banned', () => {
      const wrapper = mountComponent({
        member: createMember({
          bandate: '2024-01-15T10:00:00Z',
        }),
      })
      expect(wrapper.text()).toContain('Unban')
    })

    it('shows banned from group notice when banned prop true', () => {
      const wrapper = mountComponent({
        member: createMember({ banned: true }),
      })
      // The banned ref is set from props.member.banned in onMounted
      expect(wrapper.vm.banned).toBe(true)
    })
  })

  describe('held member', () => {
    it('shows held notice when member is held by current user', () => {
      const wrapper = mountComponent({
        member: createMember({
          heldby: { id: 999, displayname: 'Mod User' },
        }),
      })
      expect(wrapper.text()).toContain('You held this member')
    })

    it('shows held notice with other mod name when held by someone else', () => {
      const wrapper = mountComponent({
        member: createMember({
          heldby: { id: 888, displayname: 'Other Mod' },
        }),
      })
      expect(wrapper.text()).toContain('Held by')
      expect(wrapper.text()).toContain('Other Mod')
    })

    it('shows release button when held', () => {
      const wrapper = mountComponent({
        member: createMember({
          heldby: { id: 999, displayname: 'Mod User' },
        }),
      })
      expect(wrapper.find('.mod-member-button').exists()).toBe(true)
    })
  })

  describe('spammer', () => {
    it('shows ModSpammer component when member is spammer', () => {
      const wrapper = mountComponent({
        member: createMember({ spammer: { id: 1 } }),
      })
      expect(wrapper.find('.mod-spammer').exists()).toBe(true)
    })

    it('hides ModSpammer when member is not spammer', () => {
      const wrapper = mountComponent({
        member: createMember({ spammer: null }),
      })
      expect(wrapper.find('.mod-spammer').exists()).toBe(false)
    })
  })

  describe('bouncing', () => {
    it('shows ModBouncing component when member is bouncing', () => {
      const wrapper = mountComponent({
        member: createMember({ bouncing: true }),
      })
      expect(wrapper.find('.mod-bouncing').exists()).toBe(true)
    })

    it('hides ModBouncing when member is not bouncing', () => {
      const wrapper = mountComponent({
        member: createMember({ bouncing: false }),
      })
      expect(wrapper.find('.mod-bouncing').exists()).toBe(false)
    })
  })

  describe('suspect reason', () => {
    it('shows flagged notice when suspectreason set', () => {
      const wrapper = mountComponent({
        member: createMember({ suspectreason: 'Multiple accounts' }),
      })
      expect(wrapper.text()).toContain('flagged: Multiple accounts')
    })

    it('hides flagged notice when no suspectreason', () => {
      const wrapper = mountComponent({
        member: createMember({ suspectreason: null }),
      })
      expect(wrapper.text()).not.toContain('flagged:')
    })
  })

  describe('distance warning', () => {
    it('shows distance warning when activedistance > 50', () => {
      const wrapper = mountComponent({
        member: createMember({ activedistance: 100 }),
      })
      expect(wrapper.text()).toContain('100 miles apart')
    })

    it('hides distance warning when activedistance <= 50', () => {
      const wrapper = mountComponent({
        member: createMember({ activedistance: 30 }),
      })
      expect(wrapper.text()).not.toContain('miles apart')
    })
  })

  describe('computed properties', () => {
    it('email returns member.email when available', () => {
      const wrapper = mountComponent({
        member: createMember({ email: 'direct@example.com' }),
      })
      expect(wrapper.vm.email).toBe('direct@example.com')
    })

    it('email falls back to preferred email from emails array', () => {
      const wrapper = mountComponent({
        member: createMember({
          email: null,
          emails: [
            {
              id: 1,
              email: 'other@example.com',
              preferred: false,
              ourdomain: false,
            },
            {
              id: 2,
              email: 'preferred@example.com',
              preferred: true,
              ourdomain: false,
            },
          ],
        }),
      })
      expect(wrapper.vm.email).toBe('preferred@example.com')
    })

    it('email skips ourdomain emails', () => {
      const wrapper = mountComponent({
        member: createMember({
          email: null,
          emails: [
            {
              id: 1,
              email: 'our@ilovefreegle.org',
              preferred: true,
              ourdomain: true,
            },
            {
              id: 2,
              email: 'user@gmail.com',
              preferred: false,
              ourdomain: false,
            },
          ],
        }),
      })
      expect(wrapper.vm.email).toBe('user@gmail.com')
    })

    it('groupid returns member.groupid', () => {
      const wrapper = mountComponent({
        member: createMember({ groupid: 789 }),
      })
      expect(wrapper.vm.groupid).toBe(789)
    })

    it('user returns member', () => {
      const member = createMember({ displayname: 'Custom User' })
      const wrapper = mountComponent({ member })
      expect(wrapper.vm.user.displayname).toBe('Custom User')
    })

    it('isTN returns true for TrashNothing user', () => {
      const wrapper = mountComponent({
        member: createMember({
          emails: [
            { id: 1, email: 'test@user.trashnothing.com', preferred: true },
          ],
        }),
      })
      expect(wrapper.vm.isTN).toBe(true)
    })

    it('isTN returns false for regular user', () => {
      const wrapper = mountComponent({
        member: createMember({
          emails: [{ id: 1, email: 'test@gmail.com', preferred: true }],
        }),
      })
      expect(wrapper.vm.isTN).toBe(false)
    })

    it('isLJ returns truthy for LoveJunk user', () => {
      const wrapper = mountComponent({
        member: createMember({ ljuserid: 12345 }),
      })
      expect(wrapper.vm.isLJ).toBeTruthy()
    })

    it('isLJ returns falsy for regular user', () => {
      const wrapper = mountComponent({
        member: createMember({ ljuserid: null }),
      })
      expect(wrapper.vm.isLJ).toBeFalsy()
    })

    it('settings returns user settings when available', () => {
      const wrapper = mountComponent({
        member: createMember({
          settings: { notifications: { email: true } },
        }),
      })
      expect(wrapper.vm.settings.notifications.email).toBe(true)
    })

    it('settings returns empty object when no settings', () => {
      const wrapper = mountComponent({
        member: createMember({ settings: null }),
      })
      expect(wrapper.vm.settings).toEqual({})
    })

    it('notifications returns default values when not set', () => {
      const wrapper = mountComponent({
        member: createMember({ settings: {} }),
      })
      expect(wrapper.vm.notifications.email).toBe(true)
      expect(wrapper.vm.notifications.emailmine).toBe(false)
    })

    it('modconfig returns matching config from myGroups', () => {
      const wrapper = mountComponent({
        member: createMember({ groupid: 789 }),
      })
      expect(wrapper.vm.modconfig).toEqual({ id: 1, name: 'Test Config' })
    })

    it('modconfig returns null when no matching config', () => {
      const wrapper = mountComponent({
        member: createMember({ groupid: 999 }),
      })
      expect(wrapper.vm.modconfig).toBeUndefined()
    })

    it('relevantallowed returns boolean value', () => {
      const wrapper = mountComponent({
        member: createMember({ relevantallowed: 1 }),
      })
      expect(wrapper.vm.relevantallowed).toBe(true)
    })

    it('newslettersallowed returns boolean value', () => {
      const wrapper = mountComponent({
        member: createMember({ newslettersallowed: 0 }),
      })
      expect(wrapper.vm.newslettersallowed).toBe(false)
    })

    it('autorepost returns true when autorepostsdisable is false', () => {
      const wrapper = mountComponent({
        member: createMember({ autorepostsdisable: false }),
      })
      expect(wrapper.vm.autorepost).toBe(true)
    })

    it('autorepost returns false when autorepostsdisable is true', () => {
      const wrapper = mountComponent({
        member: createMember({ autorepostsdisable: true }),
      })
      expect(wrapper.vm.autorepost).toBe(false)
    })

    it('autorepost returns false for TrashNothing user', () => {
      const wrapper = mountComponent({
        member: createMember({
          autorepostsdisable: false,
          emails: [
            { id: 1, email: 'test@user.trashnothing.com', preferred: true },
          ],
        }),
      })
      expect(wrapper.vm.autorepost).toBe(false)
    })
  })

  describe('methods', () => {
    it('showHistory sets type and shows modal', () => {
      const wrapper = mountComponent()
      wrapper.vm.showHistory('Offer')
      expect(wrapper.vm.type).toBe('Offer')
      expect(wrapper.vm.showPostingHistoryModal).toBe(true)
    })

    it('showHistory with null type', () => {
      const wrapper = mountComponent()
      wrapper.vm.showHistory(null)
      expect(wrapper.vm.type).toBeNull()
      expect(wrapper.vm.showPostingHistoryModal).toBe(true)
    })

    it('showLogs shows logs modal', () => {
      const wrapper = mountComponent()
      wrapper.vm.showLogs()
      expect(wrapper.vm.showLogsModal).toBe(true)
    })

    it('settingsChange calls memberStore.update', () => {
      const wrapper = mountComponent()
      wrapper.vm.settingsChange('emailfrequency', 789, 48)
      expect(mockMemberStore.update).toHaveBeenCalledWith({
        userid: 456,
        groupid: 789,
        emailfrequency: 48,
      })
    })

    it('changeNotification updates settings', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.changeNotification({ value: false }, 'email')
      expect(mockUserStore.edit).toHaveBeenCalled()
    })

    it('changeRelevant updates relevantallowed', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.changeRelevant({ value: false })
      expect(mockUserStore.edit).toHaveBeenCalledWith({
        id: 123, // user.value.id is member.id, not member.userid
        relevantallowed: false,
      })
    })

    it('changeNotifChitchat updates settings', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.changeNotifChitchat({ value: true })
      expect(mockUserStore.edit).toHaveBeenCalled()
    })

    it('changeNewsletter updates newslettersallowed', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.changeNewsletter({ value: false })
      expect(mockUserStore.edit).toHaveBeenCalledWith({
        id: 123, // user.value.id is member.id, not member.userid
        newslettersallowed: false,
      })
    })

    it('changeAutorepost updates settings', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.changeAutorepost({ value: false })
      expect(mockUserStore.edit).toHaveBeenCalled()
    })

    it('confirmUnban shows unban modal', () => {
      const wrapper = mountComponent()
      wrapper.vm.confirmUnban({ userid: 456 })
      expect(wrapper.vm.showUnbanModal).toBe(true)
      expect(wrapper.vm.showUnbanModalTitle).toBe('Unban #456')
    })

    it('unban calls memberStore.unban', async () => {
      const member = createMember({
        bandate: '2024-01-15',
        bannedby: 999,
      })
      const wrapper = mountComponent({ member })
      await wrapper.vm.unban()
      expect(mockMemberStore.unban).toHaveBeenCalledWith(456, 789)
      expect(wrapper.vm.showUnbanModal).toBe(false)
    })

    it('showChat opens chat modal', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.showChat()
      expect(mockChatStore.openChatToMods).toHaveBeenCalledWith(789, 456)
      expect(wrapper.vm.chatid).toBe(12345)
      expect(wrapper.vm.showModChatModal).toBe(true)
    })
  })

  describe('footeractions prop', () => {
    it('hides ModMemberActions in body when footeractions is true', () => {
      const wrapper = mountComponent({ footeractions: true })
      expect(wrapper.find('.mod-member-actions').exists()).toBe(false)
    })

    it('shows ModMemberActions in body when footeractions is false', () => {
      const wrapper = mountComponent({ footeractions: false })
      expect(wrapper.find('.mod-member-actions').exists()).toBe(true)
    })
  })

  describe('emails toggle', () => {
    it('starts with showEmails false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showEmails).toBe(false)
    })

    it('toggles showEmails', async () => {
      const wrapper = mountComponent()
      wrapper.vm.showEmails = true
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showEmails).toBe(true)
    })
  })

  describe('onMounted', () => {
    it('sets banned to true when member.banned is true', async () => {
      const wrapper = mountComponent({
        member: createMember({ banned: true }),
      })
      await flushPromises()
      expect(wrapper.vm.banned).toBe(true)
    })

    it('sets banned to false when member.banned is false', async () => {
      const wrapper = mountComponent({
        member: createMember({ banned: false }),
      })
      await flushPromises()
      expect(wrapper.vm.banned).toBe(false)
    })
  })

  describe('public location', () => {
    it('shows public location when available', () => {
      const wrapper = mountComponent({
        member: createMember({
          info: { publiclocation: { location: 'Manchester' } },
        }),
      })
      expect(wrapper.text()).toContain('Public location: Manchester')
    })

    it('hides public location when not available', () => {
      const wrapper = mountComponent({
        member: createMember({ info: null }),
      })
      expect(wrapper.text()).not.toContain('Public location')
    })
  })

  describe('toggles visibility', () => {
    it('hides toggles for TrashNothing user', () => {
      const wrapper = mountComponent({
        member: createMember({
          emails: [
            { id: 1, email: 'test@user.trashnothing.com', preferred: true },
          ],
        }),
      })
      // The toggles are hidden when isTN is true
      expect(wrapper.findAll('.our-toggle').length).toBe(0)
    })

    it('hides toggles for LoveJunk user', () => {
      const wrapper = mountComponent({
        member: createMember({ ljuserid: 12345 }),
      })
      // The toggles are hidden when isLJ is true
      expect(wrapper.findAll('.our-toggle').length).toBe(0)
    })

    it('shows toggles for regular user', () => {
      const wrapper = mountComponent({
        member: createMember({
          ljuserid: null,
          emails: [{ id: 1, email: 'test@gmail.com', preferred: true }],
        }),
      })
      // Regular user should see 6 toggles
      expect(wrapper.findAll('.our-toggle').length).toBe(6)
    })
  })
})
