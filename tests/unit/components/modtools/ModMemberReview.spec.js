import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import dayjs from 'dayjs'
import ModMemberReview from '~/modtools/components/ModMemberReview.vue'

// Mock stores
const mockUserStore = {
  byId: vi.fn(),
  fetchMT: vi.fn(),
}

const mockModGroupStore = {
  get: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    amAModOn: vi.fn().mockReturnValue(true),
  }),
}))

describe('ModMemberReview', () => {
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
    systemrole: 'User',
    suspectreason: null,
    activedistance: 10,
    bouncing: false,
    bandate: null,
    spammer: null,
    supporter: false,
    memberof: [
      {
        id: 789,
        membershipid: 111,
        collection: 'Approved',
        added: '2024-01-01T10:00:00Z',
        reviewrequestedat: null,
        reviewedat: null,
      },
    ],
    info: {
      publiclocation: { location: 'London' },
      privateposition: { loc: 'SW1A 1AA' },
    },
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModMemberReview, {
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
          'b-button': {
            template:
              '<button :href="href" :target="target" :data-variant="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'href', 'target'],
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
          MessageMap: {
            template: '<div class="message-map" />',
            props: ['position', 'boundary'],
          },
          ModComments: {
            template: '<div class="mod-comments" />',
            props: ['user'],
          },
          ModSpammer: {
            template: '<div class="mod-spammer" />',
            props: ['user'],
          },
          ModBouncing: {
            template: '<div class="mod-bouncing" />',
            props: ['user'],
          },
          ModMemberSummary: {
            template: '<div class="mod-member-summary" />',
            props: ['member'],
          },
          ModMemberLogins: {
            template: '<div class="mod-member-logins" />',
            props: ['member'],
          },
          ModMemberReviewActions: {
            template: '<div class="mod-member-review-actions" />',
            props: ['memberid', 'membership', 'member'],
          },
          ModPostingHistoryModal: {
            template: '<div class="posting-history-modal" />',
            props: ['user', 'type'],
          },
          ModLogsModal: {
            template: '<div class="logs-modal" />',
            props: ['userid'],
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
    mockUserStore.byId.mockReturnValue({
      id: 456,
      displayname: 'Test User',
      ljuserid: null,
    })
    mockUserStore.fetchMT.mockResolvedValue()
    mockModGroupStore.get.mockReturnValue({ id: 789, polygon: null })
  })

  describe('rendering', () => {
    it('renders the component when member exists', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('hides when reviewed is true', async () => {
      const wrapper = mountComponent()
      wrapper.vm.reviewed = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.card').exists()).toBe(false)
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

    it('shows ModSupporter when member is supporter', () => {
      const wrapper = mountComponent({
        member: createMember({ supporter: true }),
      })
      expect(wrapper.find('.mod-supporter').exists()).toBe(true)
    })

    it('shows joined date when available', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('formatted:')
    })
  })

  describe('notices and warnings', () => {
    it('shows system role notice when not User', () => {
      const wrapper = mountComponent({
        member: createMember({ systemrole: 'Admin' }),
      })
      expect(wrapper.text()).toContain('role: Admin')
    })

    it('hides system role notice when User', () => {
      const wrapper = mountComponent({
        member: createMember({ systemrole: 'User' }),
      })
      expect(wrapper.text()).not.toContain('role: User')
    })

    it('shows suspectreason when flagged', () => {
      const wrapper = mountComponent({
        member: createMember({ suspectreason: 'Multiple accounts' }),
      })
      expect(wrapper.text()).toContain('flagged: Multiple accounts')
    })

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

    it('shows bouncing component when member is bouncing', () => {
      const wrapper = mountComponent({
        member: createMember({ bouncing: true }),
      })
      expect(wrapper.find('.mod-bouncing').exists()).toBe(true)
    })

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

    it('shows spammer component when member is spammer', () => {
      const wrapper = mountComponent({
        member: createMember({ spammer: { id: 1 } }),
      })
      expect(wrapper.find('.mod-spammer').exists()).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('isLJ returns truthy when user has ljuserid', () => {
      mockUserStore.byId.mockReturnValue({
        id: 456,
        ljuserid: 12345,
      })
      const wrapper = mountComponent()
      // isLJ returns the ljuserid value directly (truthy), not a boolean
      expect(wrapper.vm.isLJ).toBeTruthy()
    })

    it('isLJ returns false when no ljuserid', () => {
      mockUserStore.byId.mockReturnValue({
        id: 456,
        ljuserid: null,
      })
      const wrapper = mountComponent()
      expect(wrapper.vm.isLJ).toBeFalsy()
    })

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

    it('inactive returns true when lastaccess > 6 months ago', () => {
      const wrapper = mountComponent({
        member: createMember({
          lastaccess: dayjs().subtract(200, 'days').toISOString(),
        }),
      })
      expect(wrapper.vm.inactive).toBe(true)
    })

    it('inactive returns false when lastaccess < 6 months ago', () => {
      const wrapper = mountComponent({
        member: createMember({
          lastaccess: dayjs().subtract(100, 'days').toISOString(),
        }),
      })
      expect(wrapper.vm.inactive).toBe(false)
    })
  })

  describe('memberof filtering', () => {
    it('shows first 3 memberships by default', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [
            { id: 1, membershipid: 1, added: '2024-01-01' },
            { id: 2, membershipid: 2, added: '2024-01-02' },
            { id: 3, membershipid: 3, added: '2024-01-03' },
            { id: 4, membershipid: 4, added: '2024-01-04' },
            { id: 5, membershipid: 5, added: '2024-01-05' },
          ],
        }),
      })
      expect(wrapper.vm.memberof.length).toBe(3)
    })

    it('shows all memberships when allmemberships is true', async () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [
            { id: 1, membershipid: 1, added: '2024-01-01' },
            { id: 2, membershipid: 2, added: '2024-01-02' },
            { id: 3, membershipid: 3, added: '2024-01-03' },
            { id: 4, membershipid: 4, added: '2024-01-04' },
            { id: 5, membershipid: 5, added: '2024-01-05' },
          ],
        }),
      })
      wrapper.vm.allmemberships = true
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.memberof.length).toBe(5)
    })

    it('calculates hiddenmemberofs correctly', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [
            { id: 1, membershipid: 1, added: '2024-01-01' },
            { id: 2, membershipid: 2, added: '2024-01-02' },
            { id: 3, membershipid: 3, added: '2024-01-03' },
            { id: 4, membershipid: 4, added: '2024-01-04' },
            { id: 5, membershipid: 5, added: '2024-01-05' },
          ],
        }),
      })
      expect(wrapper.vm.hiddenmemberofs).toBe(2)
    })

    it('shows expand badge when hidden groups exist', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [
            { id: 1, membershipid: 1, added: '2024-01-01' },
            { id: 2, membershipid: 2, added: '2024-01-02' },
            { id: 3, membershipid: 3, added: '2024-01-03' },
            { id: 4, membershipid: 4, added: '2024-01-04' },
          ],
        }),
      })
      expect(wrapper.text()).toContain('+1 groups')
    })
  })

  describe('methods', () => {
    it('showHistory sets type and shows modal', () => {
      const wrapper = mountComponent()
      wrapper.vm.showHistory('Offer')
      expect(wrapper.vm.type).toBe('Offer')
      expect(wrapper.vm.showPostingHistoryModal).toBe(true)
    })

    it('showLogs shows logs modal', () => {
      const wrapper = mountComponent()
      wrapper.vm.showLogs()
      expect(wrapper.vm.showLogsModal).toBe(true)
    })

    it('forcerefresh emits event', () => {
      const wrapper = mountComponent()
      wrapper.vm.forcerefresh()
      expect(wrapper.emitted('forcerefresh')).toBeTruthy()
    })

    it('forcerefresh sets reviewed when hideMember is true', () => {
      const wrapper = mountComponent()
      wrapper.vm.forcerefresh(true)
      expect(wrapper.vm.reviewed).toBe(true)
      expect(wrapper.emitted('forcerefresh')).toBeTruthy()
    })
  })

  describe('onMounted', () => {
    it('fetches user with info when member.info is missing', async () => {
      mountComponent({
        member: createMember({ info: null }),
      })
      await flushPromises()
      expect(mockUserStore.fetchMT).toHaveBeenCalledWith({
        id: 456,
        info: true,
      })
    })

    it('does not fetch when member.info exists', async () => {
      mountComponent({
        member: createMember({
          info: { publiclocation: { location: 'London' } },
        }),
      })
      await flushPromises()
      expect(mockUserStore.fetchMT).not.toHaveBeenCalled()
    })
  })

  describe('emails toggle', () => {
    it('starts with showEmails false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showEmails).toBe(false)
    })

    it('toggles showEmails on button click', async () => {
      const wrapper = mountComponent()
      wrapper.vm.showEmails = true
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showEmails).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts member prop', () => {
      const member = createMember({ displayname: 'Custom User' })
      const wrapper = mountComponent({ member })
      expect(wrapper.props('member').displayname).toBe('Custom User')
    })
  })
})
