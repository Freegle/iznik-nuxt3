import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref, computed } from 'vue'
import ApprovedPage from '~/modtools/pages/messages/approved/[[id]]/[[term]].vue'

// Mock refs that will be shared between tests
const mockBusy = ref(false)
const mockContext = ref(null)
const mockGroup = ref(null)
const mockGroupid = ref(0)
const mockLimit = ref(10)
const mockWorkType = ref(null)
const mockShow = ref(0)
const mockCollection = ref(null)
const mockMessageTerm = ref(null)
const mockMemberTerm = ref(null)
const mockDistance = ref(10)
const mockSummarykey = ref(false)
const mockSummary = computed(() => false)
const mockMessages = ref([])
const mockVisibleMessages = ref([])
const mockWork = computed(() => 0)
const mockNextAfterRemoved = ref(null)

vi.mock('~/composables/useModMessages', () => ({
  setupModMessages: () => ({
    busy: mockBusy,
    context: mockContext,
    group: mockGroup,
    groupid: mockGroupid,
    limit: mockLimit,
    workType: mockWorkType,
    show: mockShow,
    collection: mockCollection,
    messageTerm: mockMessageTerm,
    memberTerm: mockMemberTerm,
    distance: mockDistance,
    summarykey: mockSummarykey,
    summary: mockSummary,
    messages: mockMessages,
    visibleMessages: mockVisibleMessages,
    work: mockWork,
    nextAfterRemoved: mockNextAfterRemoved,
  }),
}))

// Mock stores
const mockMessageStore = {
  list: {},
  context: null,
  fetchMessagesMT: vi.fn().mockResolvedValue({}),
  clearContext: vi.fn(),
  clear: vi.fn(),
}

vi.mock('@/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
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
    me: ref({ id: 1, displayname: 'Test User' }),
  }),
}))

// Mock route params
const mockRouteParams = ref({ id: undefined, term: undefined })

const mockRouterPush = vi.fn()

// Mock useRoute and useRouter - note useRouter is called from within methods
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: mockRouteParams.value,
  }),
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

// Mock #imports for Nuxt auto-imports
vi.mock('#imports', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

// Make useRouter available globally (Nuxt auto-imports this)
globalThis.useRouter = () => ({
  push: mockRouterPush,
  replace: mockRouterPush,
  currentRoute: { value: { path: '/' } },
})

describe('messages/approved/[[id]]/[[term]].vue page', () => {
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
            props: ['modelValue', 'all', 'modonly', 'remember', 'urlOverride'],
          },
          ModFindMessagesFromMember: {
            template: '<div class="mod-find-messages-from-member" />',
            emits: ['searched'],
          },
          ModFindMessage: {
            template: '<div class="mod-find-message" />',
            props: ['groupid', 'messageTerm'],
            emits: ['searched', 'changed'],
          },
          ModtoolsViewControl: {
            template: '<div class="modtools-view-control" />',
            props: ['misckey'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          ModMessages: {
            template: '<div class="mod-messages" />',
            props: ['group'],
          },
          'b-img': {
            template: '<img />',
            props: ['src', 'alt', 'lazy'],
          },
          'infinite-loading': {
            template:
              '<div class="infinite-loading"><slot name="spinner" /></div>',
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
    // Reset mock ref values
    mockBusy.value = false
    mockContext.value = null
    mockGroup.value = null
    mockGroupid.value = 0
    mockShow.value = 0
    mockCollection.value = null
    mockWorkType.value = null
    mockMessages.value = []
    mockVisibleMessages.value = []
    mockLimit.value = 10
    mockDistance.value = 10
    mockMessageTerm.value = null
    mockMemberTerm.value = null
    mockMessageStore.list = {}
    mockMessageStore.context = null
    mockRouteParams.value = { id: undefined, term: undefined }
    mockRouterPush.mockClear()
  })

  describe('rendering', () => {
    it('shows empty message when no messages and not busy', async () => {
      mockMessages.value = []
      mockBusy.value = false
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      // The component gates "Nothing found" behind a `loaded` ref that
      // becomes true only after loadMore() completes.  Before that it
      // shows "Please wait...".
      wrapper.vm.loaded = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Nothing found')
    })

    it('renders ModMessages component', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.mod-messages').exists()).toBe(true)
    })

    it('shows ModFindMessage when groupid is set', async () => {
      // Set the route param so mounted() sets groupid
      mockRouteParams.value = { id: '123', term: undefined }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      // The component sets groupid from route.params.id in mounted()
      expect(wrapper.find('.mod-find-message').exists()).toBe(true)
    })

    it('shows message about selecting community when no groupid', async () => {
      mockGroupid.value = 0
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Select a community to search messages')
    })
  })

  describe('setup', () => {
    it('sets summarykey to modtoolsMessagesApprovedSummary', () => {
      mountComponent()
      expect(mockSummarykey.value).toBe('modtoolsMessagesApprovedSummary')
    })

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

    it('groupName returns group namedisplay when group exists', async () => {
      mockGroup.value = { namedisplay: 'Test Group' }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.groupName).toBe('Test Group')
    })

    it('groupName returns null when no group', () => {
      mockGroup.value = null
      const wrapper = mountComponent()
      expect(wrapper.vm.groupName).toBe(null)
    })
  })

  describe('watchers', () => {
    it('navigates to /messages/approved/ when chosengroupid changes to 0', async () => {
      // Start with a non-zero id so the watcher sees a change
      mockRouteParams.value = { id: '123', term: undefined }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      mockRouterPush.mockClear()
      // Now change to 0 - should trigger navigation
      wrapper.vm.chosengroupid = 0
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(mockRouterPush).toHaveBeenCalledWith('/messages/approved/')
    })

    it('navigates to /messages/approved/{id} when chosengroupid changes to a value', async () => {
      mockRouteParams.value = { id: '1', term: undefined }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      mockRouterPush.mockClear()
      wrapper.vm.chosengroupid = 456
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(mockRouterPush).toHaveBeenCalledWith('/messages/approved/456')
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

    it('sets messageTerm from route param', async () => {
      mockRouteParams.value = { id: '789', term: 'test-search' }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(mockMessageTerm.value).toBe('test-search')
    })

    it('clears messages and bumps when messageTerm is set', async () => {
      mockRouteParams.value = { id: '789', term: 'test-search' }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(mockMessageStore.clear).toHaveBeenCalled()
      expect(wrapper.vm.bump).toBeGreaterThan(0)
    })

    it('sets urlOverride when id is explicitly set in route', async () => {
      mockRouteParams.value = { id: '123', term: undefined }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.urlOverride).toBe(true)
    })
  })

  describe('methods', () => {
    it('changedMessageTerm updates messageTerm with trimmed value', () => {
      const wrapper = mountComponent()
      wrapper.vm.changedMessageTerm('  test term  ')
      expect(mockMessageTerm.value).toBe('test term')
    })

    it('searchedMessage navigates with term', async () => {
      // Set route param so mounted() sets groupid
      mockRouteParams.value = { id: '123', term: undefined }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      await wrapper.vm.searchedMessage('search term')
      expect(mockRouterPush).toHaveBeenCalledWith(
        '/messages/approved/123/search term'
      )
    })

    it('searchedMessage navigates without term when empty', async () => {
      // Set route param so mounted() sets groupid
      mockRouteParams.value = { id: '123', term: undefined }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      await wrapper.vm.searchedMessage('')
      expect(mockRouterPush).toHaveBeenCalledWith('/messages/approved/123')
    })

    it('searchedMessage navigates to base when no groupid and empty term', async () => {
      mockGroupid.value = 0
      const wrapper = mountComponent()
      await wrapper.vm.searchedMessage('')
      expect(mockRouterPush).toHaveBeenCalledWith('/messages/approved/')
    })

    it('searchedMember clears messages and bumps', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.searchedMember('test@test.com')
      expect(mockShow.value).toBe(0)
      expect(mockMessageTerm.value).toBe(null)
      expect(mockMemberTerm.value).toBe('test@test.com')
      expect(mockMessageStore.clear).toHaveBeenCalled()
      expect(wrapper.vm.bump).toBeGreaterThan(0)
    })

    describe('loadMore', () => {
      it('completes when no user', async () => {
        const wrapper = mountComponent()
        wrapper.vm.me = null
        const mockState = { loaded: vi.fn(), complete: vi.fn() }
        await wrapper.vm.loadMore(mockState)
        expect(mockState.complete).toHaveBeenCalled()
      })

      it('increments show when more messages to display', async () => {
        mockMessages.value = [{ id: 1 }, { id: 2 }]
        mockShow.value = 0
        const wrapper = mountComponent()
        const mockState = { loaded: vi.fn(), complete: vi.fn() }
        await wrapper.vm.loadMore(mockState)
        expect(mockShow.value).toBe(1)
        expect(mockState.loaded).toHaveBeenCalled()
      })

      it('fetches more messages when show equals messages length', async () => {
        mockMessages.value = [{ id: 1 }]
        mockShow.value = 1
        mockMessageStore.list = { 1: { id: 1 } }
        const wrapper = mountComponent()
        const mockState = { loaded: vi.fn(), complete: vi.fn() }
        await wrapper.vm.loadMore(mockState)
        expect(mockMessageStore.fetchMessagesMT).toHaveBeenCalled()
      })

      it('uses messageTerm params when searching by message', async () => {
        // Set route params so mounted() sets the values we need
        mockRouteParams.value = { id: '123', term: 'test search' }
        mockMessages.value = []
        mockShow.value = 0
        const wrapper = mountComponent()
        await wrapper.vm.$nextTick()
        mockMessageStore.fetchMessagesMT.mockClear()
        const mockState = { loaded: vi.fn(), complete: vi.fn() }
        await wrapper.vm.loadMore(mockState)
        expect(mockMessageStore.fetchMessagesMT).toHaveBeenCalledWith(
          expect.objectContaining({
            subaction: 'searchall',
            search: 'test search',
            exactonly: true,
            groupid: 123,
          })
        )
      })

      it('uses memberTerm params when searching by member', async () => {
        const wrapper = mountComponent()
        await wrapper.vm.$nextTick()
        // Set member term after mount (searchedMember sets this)
        mockMemberTerm.value = 'test@test.com'
        mockMessageTerm.value = null
        mockMessages.value = []
        mockShow.value = 0
        mockMessageStore.fetchMessagesMT.mockClear()
        const mockState = { loaded: vi.fn(), complete: vi.fn() }
        await wrapper.vm.loadMore(mockState)
        expect(mockMessageStore.fetchMessagesMT).toHaveBeenCalledWith(
          expect.objectContaining({
            subaction: 'searchmemb',
            search: 'test@test.com',
          })
        )
      })

      it('completes when no more messages returned', async () => {
        mockMessages.value = []
        mockShow.value = 0
        mockMessageStore.list = {}
        const wrapper = mountComponent()
        const mockState = { loaded: vi.fn(), complete: vi.fn() }
        await wrapper.vm.loadMore(mockState)
        expect(mockState.complete).toHaveBeenCalled()
      })
    })
  })

  describe('data properties', () => {
    it('initializes chosengroupid to 0', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.chosengroupid).toBe(0)
    })

    it('initializes bump to 0', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.bump).toBe(0)
    })

    it('initializes urlOverride to false', () => {
      mockRouteParams.value = { id: undefined, term: undefined }
      const wrapper = mountComponent()
      expect(wrapper.vm.urlOverride).toBe(false)
    })
  })
})
