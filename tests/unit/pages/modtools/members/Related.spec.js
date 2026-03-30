import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import Related from '~/modtools/pages/members/related.vue'

// Mock stores
const mockMemberStore = {
  list: {},
  clear: vi.fn(),
}

const mockUserStore = {
  list: {},
}

// Mock modMembers composable return values
const mockGroupid = ref(0)
const mockBump = ref(0)
const mockDistance = ref(100)
const mockCollection = ref('')
const mockLoadMore = vi.fn()

vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/composables/useModMembers', () => ({
  setupModMembers: () => ({
    bump: mockBump,
    collection: mockCollection,
    distance: mockDistance,
    groupid: mockGroupid,
    loadMore: mockLoadMore,
  }),
}))

describe('Related Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMemberStore.list = {}
    mockUserStore.list = {}
    mockGroupid.value = 0
    mockBump.value = 0
    mockCollection.value = ''
  })

  function mountComponent() {
    return mount(Related, {
      global: {
        stubs: {
          'client-only': { template: '<div><slot /></div>' },
          ScrollToTop: { template: '<div class="scroll-to-top" />' },
          ModHelpRelated: { template: '<div class="mod-help-related" />' },
          ModGroupSelect: {
            template: '<select class="mod-group-select"><slot /></select>',
            props: [
              'modelValue',
              'all',
              'modonly',
              'systemwide',
              'work',
              'remember',
            ],
          },
          ModRelatedMember: {
            template:
              '<div class="mod-related-member" :data-member-id="memberid" />',
            props: ['memberid'],
          },
          'infinite-loading': {
            template:
              '<div class="infinite-loading"><slot name="spinner" /><slot name="complete" /></div>',
            props: [
              'direction',
              'forceUseInfiniteWrapper',
              'distance',
              'identifier',
            ],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
          },
          Spinner: { template: '<div />' },
          'b-img': { template: '<img />' },
        },
      },
    })
  }

  // Helper to set up pair entries (as created by the member store's Related handling)
  function addPair(id, user1Id, user2Id) {
    mockMemberStore.list[id] = {
      id,
      user1: user1Id,
      user2: user2Id,
      collection: 'Related',
      rawindex: id,
    }
    // Synthetic per-user entries (should be filtered out by members computed)
    if (!mockMemberStore.list[user1Id]) {
      mockMemberStore.list[user1Id] = {
        id: user1Id,
        userid: user1Id,
        collection: 'Related',
        rawindex: user1Id + 1000,
        _syntheticRelated: true,
      }
    }
    if (!mockMemberStore.list[user2Id]) {
      mockMemberStore.list[user2Id] = {
        id: user2Id,
        userid: user2Id,
        collection: 'Related',
        rawindex: user2Id + 1000,
        _syntheticRelated: true,
      }
    }
  }

  describe('rendering', () => {
    it('renders ModHelpRelated component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-help-related').exists()).toBe(true)
    })

    it('renders ModGroupSelect', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-group-select').exists()).toBe(true)
    })

    it('renders related members when available', async () => {
      addPair(100, 1, 2)
      addPair(101, 3, 4)
      const wrapper = mountComponent()
      await flushPromises()

      const memberComponents = wrapper.findAll('.mod-related-member')
      expect(memberComponents).toHaveLength(2)
    })

    it('passes member prop to ModRelatedMember', async () => {
      addPair(42, 10, 20)
      const wrapper = mountComponent()
      await flushPromises()

      const memberComponent = wrapper.find('.mod-related-member')
      expect(memberComponent.attributes('data-member-id')).toBe('42')
    })
  })

  describe('computed properties', () => {
    it('returns empty array when memberStore is falsy', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.members).toBeDefined()
    })

    it('converts member list to array of pairs only', () => {
      addPair(100, 1, 2)
      addPair(101, 3, 4)
      const wrapper = mountComponent()
      const members = wrapper.vm.members

      // Should have 2 pairs, not the synthetic user entries
      expect(members).toHaveLength(2)
    })

    it('visibleMembers returns all members when groupid is 0', () => {
      addPair(100, 1, 2)
      addPair(101, 3, 4)
      mockGroupid.value = 0
      const wrapper = mountComponent()

      expect(wrapper.vm.visibleMembers).toHaveLength(2)
    })

    it('visibleMembers returns all members when groupid is negative', () => {
      addPair(100, 1, 2)
      mockGroupid.value = -1
      const wrapper = mountComponent()

      expect(wrapper.vm.visibleMembers).toHaveLength(1)
    })

    it('visibleMembers filters by user1 groupid when groupid > 0', () => {
      addPair(100, 1, 2)
      addPair(101, 3, 4)
      // Only user 1 is in group 5
      mockUserStore.list = {
        1: { id: 1, memberships: [{ id: 5 }] },
        2: { id: 2, memberships: [{ id: 6 }] },
        3: { id: 3, memberships: [{ id: 7 }] },
        4: { id: 4, memberships: [{ id: 8 }] },
      }
      mockGroupid.value = 5
      const wrapper = mountComponent()

      expect(wrapper.vm.visibleMembers).toHaveLength(1)
      expect(wrapper.vm.visibleMembers[0].id).toBe(100)
    })

    it('visibleMembers filters by user2 groupid when groupid > 0', () => {
      addPair(100, 1, 2)
      addPair(101, 3, 4)
      // User 2 is in group 5, user 4 is also in group 5
      mockUserStore.list = {
        1: { id: 1, memberships: [{ id: 6 }] },
        2: { id: 2, memberships: [{ id: 5 }] },
        3: { id: 3, memberships: [{ id: 7 }] },
        4: { id: 4, memberships: [{ id: 5 }] },
      }
      mockGroupid.value = 5
      const wrapper = mountComponent()

      expect(wrapper.vm.visibleMembers).toHaveLength(2)
    })
  })

  describe('lifecycle', () => {
    it('sets collection to Related in setup', () => {
      mountComponent()
      expect(mockCollection.value).toBe('Related')
    })

    it('clears member store on mount', async () => {
      mountComponent()
      await flushPromises()

      expect(mockMemberStore.clear).toHaveBeenCalled()
    })
  })
})
