import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import ModMemberActions from '~/modtools/components/ModMemberActions.vue'

// Mock stores
const mockGroupStore = {
  get: vi.fn(),
  fetch: vi.fn(),
}

const mockUserStore = {
  fetch: vi.fn(),
  fetchMT: vi.fn(),
  byId: vi.fn(),
}

const mockMemberStore = {
  remove: vi.fn(),
  ban: vi.fn(),
}

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

// Mock useMe composable
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: { value: { id: 999, displayname: 'Mod User' } },
    supportOrAdmin: { value: true },
  }),
}))

vi.mock('~/modtools/composables/useModMe', () => ({
  useModMe: () => ({
    checkWork: vi.fn(),
  }),
}))

// Mock useNuxtApp
const mockApi = {
  comment: {
    add: vi.fn(),
  },
}

// Make useNuxtApp available globally (it's auto-imported by Nuxt)
globalThis.useNuxtApp = () => ({ $api: mockApi })

// Mock child components with deep dependencies
vi.mock('~/modtools/components/ModCommentAddModal', () => ({
  default: defineComponent({
    name: 'ModCommentAddModal',
    props: ['user', 'groupid', 'groupname'],
    emits: ['added', 'hidden'],
    setup() {
      return () => h('div', { class: 'comment-add-modal' })
    },
  }),
}))

vi.mock('~/modtools/components/ModBanMemberConfirmModal', () => ({
  default: defineComponent({
    name: 'ModBanMemberConfirmModal',
    props: ['userid', 'groupid'],
    emits: ['confirm'],
    setup() {
      return () => h('div', { class: 'ban-confirm-modal' })
    },
  }),
}))

vi.mock('~/modtools/components/ModSpammerReport', () => ({
  default: defineComponent({
    name: 'ModSpammerReport',
    props: ['user', 'safelist'],
    setup() {
      return () => h('div', { class: 'spam-report-modal' })
    },
  }),
}))

describe('ModMemberActions', () => {
  const defaultProps = {
    userid: 456,
  }

  function mountComponent(props = {}) {
    return mount(ModMemberActions, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-button': {
            template:
              '<button :data-variant="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
          },
          ConfirmModal: {
            template: '<div class="confirm-modal" :title="title" />',
            props: ['title'],
            methods: { show: vi.fn() },
          },
          ModBanMemberConfirmModal: {
            template: '<div class="ban-confirm-modal" />',
            props: ['userid', 'groupid'],
            methods: { show: vi.fn() },
          },
          ModCommentAddModal: {
            template: '<div class="comment-add-modal" />',
            props: ['user', 'groupid', 'groupname'],
          },
          ModSpammerReport: {
            template: '<div class="spam-report-modal" />',
            props: ['user', 'safelist'],
            methods: { show: vi.fn() },
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGroupStore.get.mockReturnValue({ id: 789, nameshort: 'Test Group' })
    mockGroupStore.fetch.mockResolvedValue()
    mockUserStore.fetch.mockResolvedValue()
    mockUserStore.fetchMT.mockResolvedValue()
    mockUserStore.byId.mockReturnValue({
      id: 456,
      displayname: 'Test User',
    })
    mockMemberStore.remove.mockResolvedValue()
    mockMemberStore.ban.mockResolvedValue()
    mockApi.comment.add.mockResolvedValue()
  })

  describe('rendering', () => {
    it('shows Remove button when groupid is set and not banned', () => {
      const wrapper = mountComponent({ groupid: 789, banned: false })
      expect(wrapper.text()).toContain('Remove')
    })

    it('hides Remove button when banned', () => {
      const wrapper = mountComponent({ groupid: 789, banned: true })
      expect(wrapper.text()).not.toContain('Remove')
    })

    it('hides Remove button when no groupid', () => {
      const wrapper = mountComponent({ groupid: null, banned: false })
      expect(wrapper.text()).not.toContain('Remove')
    })

    it('shows Ban button when groupid is set and not banned', () => {
      const wrapper = mountComponent({ groupid: 789, banned: false })
      expect(wrapper.text()).toContain('Ban')
    })

    it('hides Ban button when banned', () => {
      const wrapper = mountComponent({ groupid: 789, banned: true })
      expect(wrapper.text()).not.toContain('Ban')
    })

    it('shows Report Spammer button when not spam', () => {
      const wrapper = mountComponent({ spam: null })
      expect(wrapper.text()).toContain('Report Spammer')
    })

    it('hides Report Spammer button when spam', () => {
      const wrapper = mountComponent({ spam: { id: 1 } })
      expect(wrapper.text()).not.toContain('Report Spammer')
    })

    it('shows Safelist button when supportOrAdmin', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Safelist')
    })

    it('shows Add note button when groupid is set', () => {
      const wrapper = mountComponent({ groupid: 789 })
      expect(wrapper.text()).toContain('Add note')
    })

    it('hides Add note button when no groupid', () => {
      const wrapper = mountComponent({ groupid: null })
      expect(wrapper.text()).not.toContain('Add note')
    })
  })

  describe('computed properties', () => {
    it('displayname returns user displayname when user exists', async () => {
      const wrapper = mountComponent()
      wrapper.vm.user = { displayname: 'John Doe' }
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.displayname).toBe('John Doe')
    })

    it('displayname returns null when user is null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.displayname).toBeNull()
    })

    it('group returns group from store', () => {
      const wrapper = mountComponent({ groupid: 789 })
      expect(wrapper.vm.group).toEqual({ id: 789, nameshort: 'Test Group' })
    })

    it('groupname returns group nameshort', () => {
      const wrapper = mountComponent({ groupid: 789 })
      expect(wrapper.vm.groupname).toBe('Test Group')
    })

    it('groupname returns null when no group', () => {
      mockGroupStore.get.mockReturnValue(null)
      const wrapper = mountComponent({ groupid: 789 })
      expect(wrapper.vm.groupname).toBeNull()
    })

    it('reportUser returns formatted user object', () => {
      const wrapper = mountComponent()
      wrapper.vm.user = { id: 456, displayname: 'Test User' }
      expect(wrapper.vm.reportUser).toEqual({
        userid: 456,
        id: 456,
        displayname: 'Test User',
      })
    })
  })

  describe('fetchUser method', () => {
    it('fetches user from store', async () => {
      const wrapper = mountComponent({ userid: 456 })
      await wrapper.vm.fetchUser()
      expect(mockUserStore.fetch).toHaveBeenCalledWith(456, true)
      expect(mockUserStore.byId).toHaveBeenCalledWith(456)
    })
  })

  describe('remove action', () => {
    it('fetches user if not already loaded', async () => {
      const wrapper = mountComponent({ userid: 456 })
      await wrapper.vm.remove()
      expect(mockUserStore.fetch).toHaveBeenCalledWith(456, true)
    })

    it('sets removeConfirm to true', async () => {
      const wrapper = mountComponent({ userid: 456 })
      await wrapper.vm.remove()
      expect(wrapper.vm.removeConfirm).toBe(true)
    })

    it('does not fetch user if already loaded', async () => {
      const wrapper = mountComponent({ userid: 456 })
      wrapper.vm.user = { id: 456, displayname: 'Test User' }
      await wrapper.vm.remove()
      expect(mockUserStore.fetch).not.toHaveBeenCalled()
    })
  })

  describe('removeConfirmed method', () => {
    it('calls memberStore.remove with correct params', () => {
      const wrapper = mountComponent({ userid: 456, groupid: 789 })
      wrapper.vm.removeConfirmed()
      expect(mockMemberStore.remove).toHaveBeenCalledWith(456, 789)
    })
  })

  describe('ban action', () => {
    it('fetches user if not already loaded', async () => {
      const wrapper = mountComponent({ userid: 456, groupid: 789 })
      await wrapper.vm.ban()
      expect(mockUserStore.fetch).toHaveBeenCalledWith(456, true)
    })

    it('fetches group if not already loaded', async () => {
      mockGroupStore.get.mockReturnValue(null)
      const wrapper = mountComponent({ userid: 456, groupid: 789 })
      wrapper.vm.user = { id: 456, displayname: 'Test User' }
      await wrapper.vm.ban()
      expect(mockGroupStore.fetch).toHaveBeenCalledWith(789)
    })

    it('sets banConfirm to true', async () => {
      const wrapper = mountComponent({ userid: 456, groupid: 789 })
      await wrapper.vm.ban()
      expect(wrapper.vm.banConfirm).toBe(true)
    })
  })

  describe('banConfirmed method', () => {
    it('calls memberStore.ban and adds comment', async () => {
      const wrapper = mountComponent({ userid: 456, groupid: 789 })
      await wrapper.vm.banConfirmed('Bad behavior')
      expect(mockMemberStore.ban).toHaveBeenCalledWith(456, 789)
      expect(mockApi.comment.add).toHaveBeenCalledWith({
        userid: 456,
        groupid: 789,
        user1: expect.stringContaining('Banned on Test Group'),
        flag: true,
      })
    })

    it('includes reason in comment', async () => {
      const wrapper = mountComponent({ userid: 456, groupid: 789 })
      await wrapper.vm.banConfirmed('Spamming')
      expect(mockApi.comment.add).toHaveBeenCalledWith(
        expect.objectContaining({
          user1: expect.stringContaining('reason: Spamming'),
        })
      )
    })
  })

  describe('addAComment method', () => {
    it('fetches user if not already loaded', async () => {
      const wrapper = mountComponent({ userid: 456 })
      await wrapper.vm.addAComment()
      expect(mockUserStore.fetch).toHaveBeenCalledWith(456, true)
    })

    it('sets showAddCommentModal to true', async () => {
      const wrapper = mountComponent({ userid: 456 })
      await wrapper.vm.addAComment()
      expect(wrapper.vm.showAddCommentModal).toBe(true)
    })
  })

  describe('commentadded method', () => {
    it('fetches user with MT and emits event', async () => {
      const wrapper = mountComponent({ userid: 456 })
      await wrapper.vm.commentadded()
      expect(mockUserStore.fetchMT).toHaveBeenCalledWith({
        id: 456,
        emailhistory: true,
      })
      expect(wrapper.emitted('commentadded')).toBeTruthy()
    })
  })

  describe('spamReport method', () => {
    it('fetches user if not already loaded', async () => {
      const wrapper = mountComponent({ userid: 456 })
      await wrapper.vm.spamReport()
      expect(mockUserStore.fetch).toHaveBeenCalledWith(456, true)
    })

    it('sets safelist to false', async () => {
      const wrapper = mountComponent({ userid: 456 })
      await wrapper.vm.spamReport()
      expect(wrapper.vm.safelist).toBe(false)
    })

    it('sets showSpamModal to true', async () => {
      const wrapper = mountComponent({ userid: 456 })
      await wrapper.vm.spamReport()
      expect(wrapper.vm.showSpamModal).toBe(true)
    })
  })

  describe('spamSafelist method', () => {
    it('fetches user if not already loaded', async () => {
      const wrapper = mountComponent({ userid: 456 })
      await wrapper.vm.spamSafelist()
      expect(mockUserStore.fetch).toHaveBeenCalledWith(456, true)
    })

    it('sets safelist to true', async () => {
      const wrapper = mountComponent({ userid: 456 })
      await wrapper.vm.spamSafelist()
      expect(wrapper.vm.safelist).toBe(true)
    })

    it('sets showSpamModal to true', async () => {
      const wrapper = mountComponent({ userid: 456 })
      await wrapper.vm.spamSafelist()
      expect(wrapper.vm.showSpamModal).toBe(true)
    })
  })
})
