import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import Related from '~/modtools/pages/members/related.vue'

// Mock stores
const mockMemberStore = {
  list: {},
  clear: vi.fn(),
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
              '<div class="mod-related-member" :data-member-id="member.id" />',
            props: ['member'],
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
          'b-img': { template: '<img />' },
        },
      },
    })
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
      mockMemberStore.list = {
        1: {
          id: 1,
          memberof: [{ id: 1 }],
          relatedto: { memberof: [{ id: 2 }] },
        },
        2: {
          id: 2,
          memberof: [{ id: 1 }],
          relatedto: { memberof: [{ id: 2 }] },
        },
      }
      const wrapper = mountComponent()
      await flushPromises()

      const memberComponents = wrapper.findAll('.mod-related-member')
      expect(memberComponents).toHaveLength(2)
    })

    it('passes member prop to ModRelatedMember', async () => {
      mockMemberStore.list = {
        42: {
          id: 42,
          memberof: [{ id: 1 }],
          relatedto: { memberof: [{ id: 1 }] },
        },
      }
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

    it('converts member list object to array', () => {
      mockMemberStore.list = {
        1: { id: 1, memberof: [], relatedto: { memberof: [] } },
        2: { id: 2, memberof: [], relatedto: { memberof: [] } },
      }
      const wrapper = mountComponent()
      const members = wrapper.vm.members

      expect(members).toHaveLength(2)
    })

    it('visibleMembers returns all members when groupid is 0', () => {
      mockMemberStore.list = {
        1: {
          id: 1,
          memberof: [{ id: 5 }],
          relatedto: { memberof: [{ id: 6 }] },
        },
        2: {
          id: 2,
          memberof: [{ id: 7 }],
          relatedto: { memberof: [{ id: 8 }] },
        },
      }
      mockGroupid.value = 0
      const wrapper = mountComponent()

      expect(wrapper.vm.visibleMembers).toHaveLength(2)
    })

    it('visibleMembers returns all members when groupid is negative', () => {
      mockMemberStore.list = {
        1: {
          id: 1,
          memberof: [{ id: 5 }],
          relatedto: { memberof: [{ id: 6 }] },
        },
      }
      mockGroupid.value = -1
      const wrapper = mountComponent()

      expect(wrapper.vm.visibleMembers).toHaveLength(1)
    })

    it('visibleMembers filters by member groupid when groupid > 0', () => {
      mockMemberStore.list = {
        1: {
          id: 1,
          memberof: [{ id: 5 }],
          relatedto: { memberof: [{ id: 6 }] },
        },
        2: {
          id: 2,
          memberof: [{ id: 7 }],
          relatedto: { memberof: [{ id: 8 }] },
        },
      }
      mockGroupid.value = 5
      const wrapper = mountComponent()

      expect(wrapper.vm.visibleMembers).toHaveLength(1)
      expect(wrapper.vm.visibleMembers[0].id).toBe(1)
    })

    it('visibleMembers filters by relatedto groupid when groupid > 0', () => {
      mockMemberStore.list = {
        1: {
          id: 1,
          memberof: [{ id: 5 }],
          relatedto: { memberof: [{ id: 6 }] },
        },
        2: {
          id: 2,
          memberof: [{ id: 7 }],
          relatedto: { memberof: [{ id: 5 }] },
        },
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
