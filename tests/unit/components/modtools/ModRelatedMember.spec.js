import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import dayjs from 'dayjs'
import ModRelatedMember from '~/modtools/components/ModRelatedMember.vue'

// Mock stores
const mockMemberStore = {
  askMerge: vi.fn(),
  ignoreMerge: vi.fn(),
  get: vi.fn(),
}

const mockUserStore = {
  list: {},
}

vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/modtools/composables/usePreferredEmail', () => ({
  getPreferredEmail: (user) => {
    if (user?.email) return user.email
    if (user?.emails) {
      const nonOur = user.emails.filter((e) => !e.ourdomain)
      const preferred = nonOur.find((e) => e.preferred)
      return preferred ? preferred.email : nonOur[0]?.email || null
    }
    return null
  },
}))

describe('ModRelatedMember', () => {
  const now = dayjs()

  // Create a pair entry (what memberStore.get returns) and populate userStore
  function setupData(user1Overrides = {}, user2Overrides = {}) {
    const u1 = {
      id: 1,
      displayname: 'User One',
      email: 'user1@example.com',
      emails: [
        {
          id: 1,
          email: 'user1@example.com',
          preferred: true,
          ourdomain: false,
        },
      ],
      lastaccess: now.subtract(1, 'day').toISOString(),
      messagehistory: [{ id: 101, subject: 'Test post' }],
      memberships: [{ id: 10, namedisplay: 'Group 1' }],
      ...user1Overrides,
    }

    const u2 = {
      id: 2,
      displayname: 'User Two',
      email: 'user2@example.com',
      emails: [
        {
          id: 2,
          email: 'user2@example.com',
          preferred: true,
          ourdomain: false,
        },
      ],
      lastaccess: now.subtract(2, 'day').toISOString(),
      messagehistory: [],
      memberships: [{ id: 10, namedisplay: 'Group 1' }],
      ...user2Overrides,
    }

    // Pair entry in member store
    const pair = { id: 99, user1: u1.id, user2: u2.id }
    mockMemberStore.get.mockReturnValue(pair)

    // User data in user store
    mockUserStore.list = {
      [u1.id]: u1,
      [u2.id]: u2,
    }

    return { pair, u1, u2 }
  }

  function mountComponent() {
    return mount(ModRelatedMember, {
      props: {
        memberid: 99,
      },
      global: {
        stubs: {
          'b-card': {
            template:
              '<div class="card"><slot /><slot name="default" /><slot name="footer" /></div>',
            props: ['noBody'],
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-card-footer': {
            template: '<div class="card-footer"><slot /></div>',
          },
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col" :class="md"><slot /></div>',
            props: ['cols', 'md'],
          },
          'b-button': {
            template:
              '<button :data-variant="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          ModMember: {
            template:
              '<div class="mod-member" :data-id="membershipid">Member {{ membershipid }}</div>',
            props: ['membershipid'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMemberStore.askMerge.mockResolvedValue({})
    mockMemberStore.ignoreMerge.mockResolvedValue({})
    mockUserStore.list = {}
  })

  describe('rendering', () => {
    it('renders the card', () => {
      setupData()
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('renders ModMember components with user IDs from pair', () => {
      setupData()
      const wrapper = mountComponent()
      const members = wrapper.findAll('.mod-member')
      expect(members.length).toBeGreaterThanOrEqual(2)
    })

    it('shows Ask member button', () => {
      setupData()
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Ask member what they want')
    })

    it('shows Ignore button', () => {
      setupData()
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Ignore')
    })
  })

  describe('user ordering', () => {
    it('orders user1 as more recently active', () => {
      setupData(
        { lastaccess: now.subtract(1, 'day').toISOString() },
        { lastaccess: now.subtract(5, 'day').toISOString() }
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.user1.id).toBe(1)
      expect(wrapper.vm.user2.id).toBe(2)
    })

    it('swaps order when user2 is more recent', () => {
      setupData(
        { lastaccess: now.subtract(10, 'day').toISOString() },
        { lastaccess: now.subtract(1, 'day').toISOString() }
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.user1.id).toBe(2)
      expect(wrapper.vm.user2.id).toBe(1)
    })
  })

  describe('whichposted computed', () => {
    it('returns Both when both have posts', () => {
      setupData(
        { messagehistory: [{ id: 1 }] },
        { messagehistory: [{ id: 2 }] }
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.whichposted).toBe('Both')
    })

    it('returns First only when only first has posts', () => {
      setupData({ messagehistory: [{ id: 1 }] }, { messagehistory: [] })
      const wrapper = mountComponent()
      expect(wrapper.vm.whichposted).toBe('First only')
    })

    it('returns Second only when only second has posts', () => {
      setupData({ messagehistory: [] }, { messagehistory: [{ id: 2 }] })
      const wrapper = mountComponent()
      expect(wrapper.vm.whichposted).toBe('Second only')
    })

    it('returns Neither when no one has posts', () => {
      setupData({ messagehistory: [] }, { messagehistory: [] })
      const wrapper = mountComponent()
      expect(wrapper.vm.whichposted).toBe('Neither')
    })

    it('shows warning variant when Both posted', () => {
      setupData(
        { messagehistory: [{ id: 1 }] },
        { messagehistory: [{ id: 2 }] }
      )
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const postedButton = buttons.find((b) => b.text().includes('Posted'))
      expect(postedButton.attributes('data-variant')).toBe('warning')
    })
  })

  describe('whichjoined computed', () => {
    it('returns Both when both are members', () => {
      setupData({ memberships: [{ id: 10 }] }, { memberships: [{ id: 20 }] })
      const wrapper = mountComponent()
      expect(wrapper.vm.whichjoined).toBe('Both')
    })

    it('returns Neither when neither is a member', () => {
      setupData({ memberships: [] }, { memberships: [] })
      const wrapper = mountComponent()
      expect(wrapper.vm.whichjoined).toBe('Neither')
    })
  })

  describe('activeSameDay computed', () => {
    it('returns true when active on same day', () => {
      const today = dayjs().startOf('day')
      setupData(
        { lastaccess: today.add(10, 'hour').toISOString() },
        { lastaccess: today.add(14, 'hour').toISOString() }
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.activeSameDay).toBe(true)
    })

    it('returns false when active on different days', () => {
      setupData()
      const wrapper = mountComponent()
      expect(wrapper.vm.activeSameDay).toBe(false)
    })

    it('shows Active same day badge when true', () => {
      const today = dayjs().startOf('day')
      setupData(
        { lastaccess: today.add(10, 'hour').toISOString() },
        { lastaccess: today.add(14, 'hour').toISOString() }
      )
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Active same day')
    })
  })

  describe('groupsInCommon computed', () => {
    it('returns truthy when groups in common', () => {
      setupData({ memberships: [{ id: 10 }] }, { memberships: [{ id: 10 }] })
      const wrapper = mountComponent()
      expect(wrapper.vm.groupsInCommon).toBeTruthy()
    })

    it('returns falsy when no groups in common', () => {
      setupData({ memberships: [{ id: 10 }] }, { memberships: [{ id: 20 }] })
      const wrapper = mountComponent()
      expect(wrapper.vm.groupsInCommon).toBeFalsy()
    })

    it('shows Groups in common badge when true', () => {
      setupData({ memberships: [{ id: 10 }] }, { memberships: [{ id: 10 }] })
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Groups in common')
    })
  })

  describe('similarNameOrEmail computed', () => {
    it('returns true for identical emails', () => {
      setupData(
        {
          email: null,
          emails: [
            {
              id: 1,
              email: 'test@example.com',
              preferred: true,
              ourdomain: false,
            },
          ],
        },
        {
          email: null,
          emails: [
            {
              id: 2,
              email: 'test@example.com',
              preferred: true,
              ourdomain: false,
            },
          ],
        }
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.similarNameOrEmail).toBe(true)
    })

    it('returns true for identical display names', () => {
      setupData(
        { displayname: 'John Smith' },
        {
          displayname: 'John Smith',
          email: 'different@example.com',
          emails: [
            {
              id: 2,
              email: 'different@example.com',
              preferred: true,
              ourdomain: false,
            },
          ],
        }
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.similarNameOrEmail).toBe(true)
    })

    it('returns false for very different names/emails', () => {
      setupData(
        {
          displayname: 'Alice',
          emails: [
            {
              id: 1,
              email: 'xyz@example.com',
              preferred: true,
              ourdomain: false,
            },
          ],
        },
        {
          displayname: 'Bob',
          email: null,
          emails: [
            {
              id: 2,
              email: 'abc@gmail.com',
              preferred: true,
              ourdomain: false,
            },
          ],
        }
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.similarNameOrEmail).toBe(false)
    })

    it('shows Similar name/email badge when names match', () => {
      setupData(
        { displayname: 'John Smith' },
        {
          displayname: 'John Smith',
          email: 'different@example.com',
          emails: [],
        }
      )
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Similar name/email')
    })
  })

  describe('probablySame computed', () => {
    it('returns true when similar and groups in common', () => {
      setupData(
        { displayname: 'John Smith', memberships: [{ id: 10 }] },
        {
          displayname: 'John Smith',
          email: 'user2@example.com',
          emails: [],
          memberships: [{ id: 10 }],
        }
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.probablySame).toBeTruthy()
    })

    it('returns true when similar and active same day', () => {
      const today = dayjs().startOf('day')
      setupData(
        {
          displayname: 'John Smith',
          lastaccess: today.add(10, 'hour').toISOString(),
          memberships: [],
        },
        {
          displayname: 'John Smith',
          email: 'user2@example.com',
          emails: [],
          lastaccess: today.add(14, 'hour').toISOString(),
          memberships: [],
        }
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.probablySame).toBe(true)
    })

    it('returns false when similar but no groups/same day', () => {
      setupData(
        {
          displayname: 'John Smith',
          memberships: [],
          lastaccess: now.subtract(5, 'day').toISOString(),
        },
        {
          displayname: 'John Smith',
          email: 'user2@example.com',
          emails: [],
          memberships: [],
          lastaccess: now.subtract(10, 'day').toISOString(),
        }
      )
      const wrapper = mountComponent()
      expect(wrapper.vm.probablySame).toBe(false)
    })

    it('shows Probably the same badge when true', () => {
      setupData(
        { displayname: 'John Smith', memberships: [{ id: 10 }] },
        {
          displayname: 'John Smith',
          email: 'user2@example.com',
          emails: [],
          memberships: [{ id: 10 }],
        }
      )
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Probably the same')
    })
  })

  describe('ask method', () => {
    it('calls memberStore.askMerge with correct params', async () => {
      const { pair } = setupData()
      const wrapper = mountComponent()
      await wrapper.vm.ask()
      await flushPromises()

      expect(mockMemberStore.askMerge).toHaveBeenCalledWith(99, {
        user1: pair.user1,
        user2: pair.user2,
      })
    })

    it('emits processed after asking', async () => {
      setupData()
      const wrapper = mountComponent()
      await wrapper.vm.ask()
      await flushPromises()

      expect(wrapper.emitted('processed')).toBeTruthy()
    })

    it('calls ask on Ask button click', async () => {
      setupData()
      const wrapper = mountComponent()
      const askButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Ask member'))
      await askButton.trigger('click')
      await flushPromises()

      expect(mockMemberStore.askMerge).toHaveBeenCalled()
    })
  })

  describe('ignore method', () => {
    it('calls memberStore.ignoreMerge with correct params', async () => {
      const { pair } = setupData()
      const wrapper = mountComponent()
      await wrapper.vm.ignore()
      await flushPromises()

      expect(mockMemberStore.ignoreMerge).toHaveBeenCalledWith(99, {
        user1: pair.user1,
        user2: pair.user2,
      })
    })

    it('emits processed after ignoring', async () => {
      setupData()
      const wrapper = mountComponent()
      await wrapper.vm.ignore()
      await flushPromises()

      expect(wrapper.emitted('processed')).toBeTruthy()
    })

    it('calls ignore on Ignore button click', async () => {
      setupData()
      const wrapper = mountComponent()
      const ignoreButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Ignore')
      await ignoreButton.trigger('click')
      await flushPromises()

      expect(mockMemberStore.ignoreMerge).toHaveBeenCalled()
    })
  })

  describe('getEmail helper', () => {
    it('returns member.email when available', () => {
      setupData({
        email: 'direct@example.com',
        emails: [
          {
            id: 1,
            email: 'other@example.com',
            preferred: true,
            ourdomain: false,
          },
        ],
      })
      const wrapper = mountComponent()
      expect(wrapper.vm.user1.email).toBe('direct@example.com')
    })

    it('falls back to preferred email from emails array', () => {
      setupData({
        email: null,
        emails: [
          {
            id: 1,
            email: 'not-preferred@example.com',
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
      })
      const wrapper = mountComponent()
      expect(wrapper.vm.user1.emails[1].email).toBe('preferred@example.com')
    })

    it('skips ourdomain emails', () => {
      setupData({
        email: null,
        emails: [
          {
            id: 1,
            email: 'user@ilovefreegle.org',
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
      })
      const wrapper = mountComponent()
      expect(wrapper.vm.user1.emails[1].email).toBe('user@gmail.com')
    })
  })
})
