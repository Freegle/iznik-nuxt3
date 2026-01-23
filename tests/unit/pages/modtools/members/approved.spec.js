import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ApprovedPage from '~/modtools/pages/members/approved/[[id]]/[[term]].vue'

// Mock refs that will be shared between tests
const mockBusy = ref(false)
const mockContext = ref(null)
const mockGroup = ref(null)
const mockGroupid = ref(0)
const mockLimit = ref(10)
const mockShow = ref(0)
const mockCollection = ref(null)
const mockSearch = ref('')
const mockFilter = ref('')
const mockSort = ref(true)
const mockDistance = ref(10)
const mockMembers = ref([])
const mockVisibleMembers = ref([])
const mockBump = ref(0)
const mockNextAfterRemoved = ref(null)
const mockLoadMore = vi.fn()

vi.mock('~/composables/useModMembers', () => ({
  setupModMembers: () => ({
    busy: mockBusy,
    context: mockContext,
    group: mockGroup,
    groupid: mockGroupid,
    limit: mockLimit,
    show: mockShow,
    collection: mockCollection,
    search: mockSearch,
    filter: mockFilter,
    sort: mockSort,
    distance: mockDistance,
    members: mockMembers,
    visibleMembers: mockVisibleMembers,
    bump: mockBump,
    nextAfterRemoved: mockNextAfterRemoved,
    loadMore: mockLoadMore,
  }),
}))

// Mock stores
const mockMemberStore = {
  list: {},
  clear: vi.fn(),
}

vi.mock('@/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

const mockMiscStore = {
  get: vi.fn(),
  set: vi.fn(),
}

vi.mock('@/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

// Mock useMe composable
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myGroups: ref([{ id: 1, role: 'Moderator' }]),
  }),
}))

// Mock route params
const mockRouteParams = ref({ id: undefined, term: undefined })
const mockRouterPush = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: mockRouteParams.value,
  }),
  useRouter: () => ({
    push: mockRouterPush,
    currentRoute: { value: { path: '/members/approved/' } },
  }),
}))

// Make useRouter available globally (Nuxt auto-imports this)
globalThis.useRouter = () => ({
  push: mockRouterPush,
  currentRoute: { value: { path: '/members/approved/' } },
})

describe('members/approved/[[id]]/[[term]].vue page', () => {
  function mountComponent() {
    return mount(ApprovedPage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'client-only': {
            template: '<div><slot /></div>',
          },
          ScrollToTop: {
            template: '<div class="scroll-to-top" />',
            props: ['prepend'],
          },
          ModGroupSelect: {
            template: '<div class="mod-group-select" />',
            props: ['modelValue', 'modonly', 'remember'],
          },
          ModMemberTypeSelect: {
            template: '<div class="mod-member-type-select" />',
            props: ['modelValue'],
          },
          ModMemberSearchbox: {
            template: '<div class="mod-member-searchbox" />',
            props: ['search'],
            emits: ['search'],
          },
          ModAddMemberModal: {
            template: '<div class="mod-add-member-modal" />',
            props: ['groupid'],
            emits: ['hidden'],
            methods: { show: vi.fn() },
          },
          ModBanMemberModal: {
            template: '<div class="mod-ban-member-modal" />',
            props: ['groupid'],
            emits: ['hidden'],
            methods: { show: vi.fn() },
          },
          ModMergeButton: {
            template: '<div class="mod-merge-button" />',
          },
          ModMemberExportButton: {
            template: '<div class="mod-member-export-button" />',
            props: ['groupid'],
          },
          ModMembers: {
            template: '<div class="mod-members" />',
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'b-img': {
            template: '<img />',
            props: ['src', 'alt', 'lazy'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
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
            emits: ['infinite'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockBusy.value = false
    mockContext.value = null
    mockGroup.value = null
    mockGroupid.value = 0
    mockShow.value = 0
    mockCollection.value = null
    mockSearch.value = ''
    mockFilter.value = ''
    mockSort.value = true
    mockMembers.value = []
    mockVisibleMembers.value = []
    mockBump.value = 0
    mockRouteParams.value = { id: undefined, term: undefined }
    mockRouterPush.mockClear()
    mockMemberStore.list = {}
  })

  describe('rendering', () => {
    it('shows member controls when groupid is set', async () => {
      mockRouteParams.value = { id: '123', term: undefined }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.mod-member-type-select').exists()).toBe(true)
    })

    it('shows please select message when no group and no term', async () => {
      mockGroupid.value = 0
      mockRouteParams.value = { id: undefined, term: undefined }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Please select a community')
    })
  })

  describe('setup', () => {
    it('sets collection to Approved', () => {
      mountComponent()
      expect(mockCollection.value).toBe('Approved')
    })
  })

  describe('computed properties', () => {
    it('id returns parsed route param when present', () => {
      mockRouteParams.value = { id: '123', term: undefined }
      const wrapper = mountComponent()
      expect(wrapper.vm.id).toBe(123)
    })

    it('id returns 0 when no route param', () => {
      mockRouteParams.value = { id: undefined, term: undefined }
      const wrapper = mountComponent()
      expect(wrapper.vm.id).toBe(0)
    })

    it('term returns route param when present', () => {
      mockRouteParams.value = { id: '123', term: 'test-search' }
      const wrapper = mountComponent()
      expect(wrapper.vm.term).toBe('test-search')
    })

    it('groupName returns group namedisplay when group exists', async () => {
      mockGroup.value = { namedisplay: 'Test Group' }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.groupName).toBe('Test Group')
    })
  })

  describe('watchers', () => {
    it('clears and bumps when filter changes', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      const initialBump = mockBump.value
      vi.clearAllMocks()

      mockFilter.value = 'Active'
      await wrapper.vm.$nextTick()

      expect(mockContext.value).toBe(null)
      expect(mockMemberStore.clear).toHaveBeenCalled()
      // Bump should have increased (don't check exact value as other tests may affect it)
      expect(mockBump.value).toBeGreaterThan(initialBump)
    })

    it('navigates when chosengroupid changes to 0', async () => {
      mockRouteParams.value = { id: '123', term: undefined }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      mockRouterPush.mockClear()

      wrapper.vm.chosengroupid = 0
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(mockRouterPush).toHaveBeenCalledWith('/members/approved/')
    })
  })

  describe('mounted lifecycle', () => {
    it('sets groupid and chosengroupid from route param', async () => {
      mockRouteParams.value = { id: '789', term: undefined }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(mockGroupid.value).toBe(789)
      expect(wrapper.vm.chosengroupid).toBe(789)
    })

    it('sets search from route param term', async () => {
      mockRouteParams.value = { id: '789', term: 'test-search' }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(mockSearch.value).toBe('test-search')
    })

    it('clears member store on mount', async () => {
      mockRouteParams.value = { id: '789', term: undefined }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(mockMemberStore.clear).toHaveBeenCalled()
    })

    it('disables sort when term is present', async () => {
      mockRouteParams.value = { id: '789', term: 'test-search' }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(mockSort.value).toBe(false)
    })
  })

  describe('methods', () => {
    it('addMember shows add modal', () => {
      const wrapper = mountComponent()
      wrapper.vm.addMember()
      expect(wrapper.vm.showAddMember).toBe(true)
    })

    it('banMember shows ban modal', () => {
      const wrapper = mountComponent()
      wrapper.vm.banMember()
      expect(wrapper.vm.showBanMember).toBe(true)
    })

    it('startsearch updates search and clears context', async () => {
      mockRouteParams.value = { id: '123', term: undefined }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      wrapper.vm.startsearch('test search')

      expect(mockSearch.value).toBe('test search')
      expect(mockContext.value).toBe(null)
      expect(mockMemberStore.clear).toHaveBeenCalled()
    })

    it('startsearch navigates with search term', async () => {
      mockRouteParams.value = { id: '123', term: undefined }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      mockRouterPush.mockClear()

      wrapper.vm.startsearch('test')

      expect(mockRouterPush).toHaveBeenCalledWith('/members/approved/123/test')
    })
  })

  describe('data properties', () => {
    it('initializes chosengroupid to 0', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.chosengroupid).toBe(0)
    })

    it('initializes showAddMember to false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showAddMember).toBe(false)
    })

    it('initializes showBanMember to false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showBanMember).toBe(false)
    })
  })
})
