import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModSupportUser from '~/modtools/components/ModSupportUser.vue'

// Mock the user store
const mockFetchMT = vi.fn()
const mockFetch = vi.fn()
const mockEdit = vi.fn()
const mockPurge = vi.fn()
const mockAddEmail = vi.fn()
const mockById = vi.fn()

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    byId: mockById,
    fetchMT: mockFetchMT,
    fetch: mockFetch,
    edit: mockEdit,
    purge: mockPurge,
    addEmail: mockAddEmail,
  }),
}))

// Mock timeago and date formatters
vi.stubGlobal(
  'timeago',
  vi.fn((date) => '2 days ago')
)
vi.stubGlobal(
  'dateonly',
  vi.fn((date) => '15/01/2024')
)
vi.stubGlobal(
  'dateshort',
  vi.fn((date) => 'Jan 15')
)
vi.stubGlobal(
  'datetime',
  vi.fn((date) => '15/01/2024 10:30')
)
vi.stubGlobal(
  'datetimeshort',
  vi.fn((date) => 'Jan 15, 10:30')
)

describe('ModSupportUser', () => {
  const createUser = (overrides = {}) => ({
    id: 123,
    email: 'test@example.com',
    displayname: 'Test User',
    lastaccess: new Date().toISOString(),
    systemrole: 'User',
    bouncing: false,
    spammer: null,
    memberof: [],
    emails: [{ id: 1, email: 'test@example.com', preferred: true }],
    applied: [],
    membershiphistory: [],
    messagehistory: [],
    emailhistory: [],
    chatrooms: [],
    newsfeed: [],
    newsfeedmodstatus: 'Unmoderated',
    ...overrides,
  })

  async function mountComponent(props = {}, userOverrides = {}) {
    const user = createUser(userOverrides)
    mockById.mockReturnValue(user)
    mockFetchMT.mockResolvedValue()

    const wrapper = mount(ModSupportUser, {
      props: {
        id: 123,
        expand: false,
        ...props,
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          'b-card': {
            template: '<div class="card"><slot /><slot name="header" /></div>',
            props: ['noBody'],
          },
          'b-card-header': {
            template:
              '<div class="card-header" @click="$emit(\'click\')"><slot /></div>',
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols', 'lg', 'md'],
          },
          'b-button': {
            template:
              '<button :variant="variant" :disabled="disabled" :href="href" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'disabled', 'href'],
          },
          'b-input-group': {
            template:
              '<div class="input-group"><slot /><slot name="append" /></div>',
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" :type="type" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'type', 'placeholder', 'autocomplete'],
          },
          'b-form-select': {
            template:
              '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
            props: ['modelValue'],
          },
          'b-form-select-option': {
            template: '<option :value="value"><slot /></option>',
            props: ['value'],
          },
          'v-icon': {
            template: '<span class="icon" :class="icon" />',
            props: ['icon', 'scale'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          ModClipboard: {
            template: '<span class="clipboard" />',
            props: ['value'],
          },
          ModBouncing: {
            template: '<div class="mod-bouncing" />',
            props: ['user'],
          },
          ModSpammer: {
            template: '<div class="mod-spammer" />',
            props: ['user'],
          },
          ModComments: {
            template: '<div class="mod-comments" />',
            props: ['userid'],
          },
          ModMergeButton: {
            template: '<button class="merge-button" />',
          },
          ModDeletedOrForgotten: {
            template: '<div class="deleted-or-forgotten" />',
            props: ['user'],
          },
          ModMemberLogins: {
            template: '<div class="member-logins" />',
            props: ['member'],
          },
          ModMemberSummary: {
            template: '<div class="member-summary" />',
            props: ['member'],
          },
          ModSupportMembership: {
            template: '<div class="support-membership" />',
            props: ['membership', 'userid'],
          },
          ModSupportChatList: {
            template: '<div class="chat-list" />',
            props: ['chats', 'pov'],
          },
          ModLogsModal: {
            template: '<div class="logs-modal" />',
            props: ['userid'],
            methods: { show: vi.fn() },
          },
          ConfirmModal: {
            template: '<div class="confirm-modal" />',
            props: ['title', 'message'],
            methods: { show: vi.fn() },
          },
          ProfileModal: {
            template: '<div class="profile-modal" />',
            props: ['id'],
            methods: { show: vi.fn() },
          },
          ModSpammerReport: {
            template: '<div class="spammer-report" />',
            props: ['user'],
            methods: { show: vi.fn() },
          },
          ModCommentAddModal: {
            template: '<div class="comment-add-modal" />',
            props: ['user'],
          },
          SpinButton: {
            template:
              '<button @click="$emit(\'handle\', () => {})"><slot /></button>',
            props: ['variant', 'iconName', 'label'],
          },
          ExternalLink: {
            template: '<a :href="href" class="external-link"><slot /></a>',
            props: ['href'],
          },
        },
      },
    })
    await flushPromises()
    return wrapper
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockFetchMT.mockResolvedValue()
    mockFetch.mockResolvedValue()
    mockEdit.mockResolvedValue()
    mockPurge.mockResolvedValue()
    mockAddEmail.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders card when user exists', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('renders user email in header', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.text()).toContain('test@example.com')
    })

    it('renders user ID', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.text()).toContain('123')
    })

    it('shows admin notice when user is Admin', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        { systemrole: 'Admin' }
      )
      expect(wrapper.text()).toContain('admin rights')
    })

    it('shows support notice when user is Support', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        { systemrole: 'Support' }
      )
      expect(wrapper.text()).toContain('support rights')
    })

    it('shows ModBouncing when user is bouncing', async () => {
      const wrapper = await mountComponent({ expand: true }, { bouncing: true })
      expect(wrapper.find('.mod-bouncing').exists()).toBe(true)
    })

    it('shows ModSpammer when user is spammer', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        { spammer: { byuserid: 456 } }
      )
      expect(wrapper.find('.mod-spammer').exists()).toBe(true)
    })

    it('shows TN user id when present', async () => {
      const wrapper = await mountComponent({}, { tnuserid: 12345 })
      expect(wrapper.text()).toContain('TN user id')
      expect(wrapper.text()).toContain('12345')
    })
  })

  describe('props', () => {
    it('accepts expand prop as true', async () => {
      const wrapper = await mountComponent({ expand: true })
      expect(wrapper.props('expand')).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('preferredemail returns email when set', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.vm.preferredemail).toBe('test@example.com')
    })

    it('preferredemail falls back to preferred email in list', async () => {
      const wrapper = await mountComponent(
        {},
        {
          email: null,
          emails: [
            { id: 1, email: 'other@test.com', preferred: false },
            { id: 2, email: 'preferred@test.com', preferred: true },
          ],
        }
      )
      expect(wrapper.vm.preferredemail).toBe('preferred@test.com')
    })

    it('preferredemail falls back to first email', async () => {
      const wrapper = await mountComponent(
        {},
        {
          email: null,
          emails: [
            { id: 1, email: 'first@test.com', preferred: false },
            { id: 2, email: 'second@test.com', preferred: false },
          ],
        }
      )
      expect(wrapper.vm.preferredemail).toBe('first@test.com')
    })

    it('reportUser returns correct format', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.vm.reportUser).toEqual({
        userid: 123,
        displayname: 'Test User',
      })
    })

    it('admin returns true when systemrole is Admin', async () => {
      const wrapper = await mountComponent({}, { systemrole: 'Admin' })
      expect(wrapper.vm.admin).toBe(true)
    })

    it('admin returns false when systemrole is not Admin', async () => {
      const wrapper = await mountComponent({}, { systemrole: 'User' })
      expect(wrapper.vm.admin).toBe(false)
    })

    it('freegleMemberships filters and sorts groups', async () => {
      const wrapper = await mountComponent(
        {},
        {
          memberof: [
            { id: 1, nameshort: 'ZGroup', type: 'Freegle' },
            { id: 2, nameshort: 'AGroup', type: 'Freegle' },
            { id: 3, nameshort: 'Other', type: 'Other' },
          ],
        }
      )
      const memberships = wrapper.vm.freegleMemberships
      expect(memberships).toHaveLength(2)
      expect(memberships[0].nameshort).toBe('AGroup')
      expect(memberships[1].nameshort).toBe('ZGroup')
    })

    it('otherEmails filters out primary and ourdomain emails', async () => {
      const wrapper = await mountComponent(
        {},
        {
          email: 'primary@test.com',
          emails: [
            { id: 1, email: 'primary@test.com' },
            { id: 2, email: 'other@test.com' },
            { id: 3, email: 'freegle@users.ilovefreegle.org', ourdomain: true },
          ],
        }
      )
      expect(wrapper.vm.otherEmails).toHaveLength(1)
      expect(wrapper.vm.otherEmails[0].email).toBe('other@test.com')
    })

    it('chatsFiltered excludes Mod2Mod and sorts by date', async () => {
      const wrapper = await mountComponent(
        {},
        {
          chatrooms: [
            { id: 1, chattype: 'Mod2Mod', lastdate: '2024-01-01' },
            { id: 2, chattype: 'User2User', lastdate: '2024-01-15' },
            { id: 3, chattype: 'User2Mod', lastdate: '2024-01-10' },
          ],
        }
      )
      const chats = wrapper.vm.chatsFiltered
      expect(chats).toHaveLength(2)
      expect(chats[0].id).toBe(2) // Most recent first
      expect(chats[1].id).toBe(3)
    })
  })

  describe('methods', () => {
    it('maybeExpand toggles expanded state', async () => {
      // Mock window.getSelection
      vi.stubGlobal('window', {
        ...window,
        getSelection: () => ({ toString: () => '' }),
      })

      const wrapper = await mountComponent()
      const initialExpanded = wrapper.vm.expanded
      wrapper.vm.maybeExpand()
      expect(wrapper.vm.expanded).toBe(!initialExpanded)
    })

    it('maybeExpand does not toggle when text is selected', async () => {
      vi.stubGlobal('window', {
        ...window,
        getSelection: () => ({ toString: () => 'selected text' }),
      })

      const wrapper = await mountComponent()
      const initialExpanded = wrapper.vm.expanded
      wrapper.vm.maybeExpand()
      expect(wrapper.vm.expanded).toBe(initialExpanded)
    })

    it('showLogsModal sets showLogs to true', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.showLogsModal()
      expect(wrapper.vm.showLogs).toBe(true)
    })

    it('purge sets purgeConfirm to true', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.purge()
      expect(wrapper.vm.purgeConfirm).toBe(true)
    })

    it('purgeConfirmed calls store purge', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.purgeConfirmed()
      expect(mockPurge).toHaveBeenCalledWith(123)
    })

    it('spamReport sets showSpamModal to true', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.spamReport()
      expect(wrapper.vm.showSpamModal).toBe(true)
    })

    it('setPassword calls store edit with password', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.newpassword = 'newpass123'
      const callback = vi.fn()
      await wrapper.vm.setPassword(callback)
      expect(mockEdit).toHaveBeenCalledWith({
        id: 123,
        password: 'newpass123',
      })
      expect(callback).toHaveBeenCalled()
    })

    it('setPassword does nothing when password is empty', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.newpassword = null
      const callback = vi.fn()
      await wrapper.vm.setPassword(callback)
      expect(mockEdit).not.toHaveBeenCalled()
      expect(callback).toHaveBeenCalled()
    })

    it('addEmail calls store addEmail', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.newemail = 'newemail@test.com'
      wrapper.vm.newEmailAs = 1
      const callback = vi.fn()
      await wrapper.vm.addEmail(callback)
      expect(mockAddEmail).toHaveBeenCalledWith({
        id: 123,
        email: 'newemail@test.com',
        primary: true,
      })
      expect(callback).toHaveBeenCalled()
    })

    it('addEmail sets emailAddError on failure', async () => {
      mockAddEmail.mockRejectedValue(new Error('Email already exists'))
      const wrapper = await mountComponent()
      wrapper.vm.newemail = 'existing@test.com'
      const callback = vi.fn()
      await wrapper.vm.addEmail(callback)
      expect(wrapper.vm.emailAddError).toBe('Email already exists')
    })

    it('addAComment sets showAddCommentModal to true', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.addAComment()
      expect(wrapper.vm.showAddCommentModal).toBe(true)
    })
  })

  describe('trust level display', () => {
    it('shows None for no trust level', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        { trustlevel: null }
      )
      expect(wrapper.text()).toContain('None')
    })

    it('shows Basic trust level', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        { trustlevel: 'Basic' }
      )
      expect(wrapper.text()).toContain('Basic')
    })

    it('shows Moderate trust level', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        { trustlevel: 'Moderate' }
      )
      expect(wrapper.text()).toContain('Moderate')
    })

    it('shows Advanced trust level', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        { trustlevel: 'Advanced' }
      )
      expect(wrapper.text()).toContain('Advanced')
    })

    it('shows Declined trust level', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        { trustlevel: 'Declined' }
      )
      expect(wrapper.text()).toContain('Declined')
    })

    it('shows Disabled trust level', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        { trustlevel: 'Disabled' }
      )
      expect(wrapper.text()).toContain('Disabled')
    })
  })

  describe('gift aid display', () => {
    it('shows gift aid section when present', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        {
          giftaid: {
            id: 1,
            timestamp: new Date().toISOString(),
            period: 'Future',
          },
        }
      )
      expect(wrapper.text()).toContain('Gift Aid')
      expect(wrapper.text()).toContain('future donations')
    })
  })

  describe('donations display', () => {
    it('shows donations section when present', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        {
          donations: [
            {
              id: 1,
              GrossAmount: 10,
              timestamp: new Date().toISOString(),
              source: 'PayPal',
            },
          ],
        }
      )
      expect(wrapper.text()).toContain('Donations')
      expect(wrapper.text()).toContain('£10')
    })
  })

  describe('location display', () => {
    it('shows public location when available', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        {
          info: {
            publiclocation: { display: 'London, UK' },
          },
        }
      )
      expect(wrapper.text()).toContain('London, UK')
    })

    it('shows Unknown when no public location', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        {
          info: null,
        }
      )
      expect(wrapper.text()).toContain('Unknown')
    })

    it('shows lat/lng when private position available', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        {
          privateposition: { lat: 51.5074, lng: -0.1278 },
        }
      )
      expect(wrapper.text()).toContain('51.51')
      expect(wrapper.text()).toContain('-0.13')
    })
  })

  describe('bans display', () => {
    it('shows bans when present', async () => {
      const wrapper = await mountComponent(
        { expand: true },
        {
          bans: [
            {
              group: 'TestGroup',
              byemail: 'mod@test.com',
              date: new Date().toISOString(),
            },
          ],
        }
      )
      expect(wrapper.text()).toContain('Banned on')
      expect(wrapper.text()).toContain('TestGroup')
    })
  })

  describe('newsfeed moderation status', () => {
    it('updates newsfeedmodstatus when changed', async () => {
      const wrapper = await mountComponent(
        {},
        { newsfeedmodstatus: 'Unmoderated' }
      )
      wrapper.vm.newsfeedmodstatus = 'Suppressed'
      await wrapper.vm.$nextTick()
      expect(mockEdit).toHaveBeenCalledWith({
        id: 123,
        newsfeedmodstatus: 'Suppressed',
      })
    })
  })
})
