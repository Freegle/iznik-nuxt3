import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref, computed } from 'vue'
import PendingPage from '~/modtools/pages/messages/pending.vue'

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
const mockGetMessages = vi.fn()

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
    getMessages: mockGetMessages,
  }),
}))

// Mock stores
const mockAuthStore = {
  user: {
    settings: {
      lastaimsshow: null,
    },
  },
  saveAndGet: vi.fn(),
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

const mockMessageStore = {
  list: {},
  context: null,
  fetchMessagesMT: vi.fn(),
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

const mockModGroupStore = {
  list: {},
  received: true,
  fetchIfNeedBeMT: vi.fn(),
  get: vi.fn(),
}

vi.mock('@/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

// Mock useMe composable
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: ref({ id: 1, displayname: 'Test User' }),
    myGroups: ref([{ id: 1, name: 'TestGroup', role: 'Owner' }]),
  }),
}))

// Mock useRoute
vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: {},
  }),
}))

describe('PendingPage', () => {
  function mountComponent() {
    return mount(PendingPage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'client-only': {
            template: '<div><slot /></div>',
          },
          ScrollToTop: {
            template: '<div class="scroll-to-top" />',
          },
          ModCakeModal: {
            template: '<div class="mod-cake-modal" />',
            emits: ['hidden'],
          },
          ModAimsModal: {
            template: '<div class="mod-aims-modal" />',
            emits: ['hidden'],
          },
          ModGroupSelect: {
            template: '<div class="mod-group-select" />',
            props: [
              'modelValue',
              'all',
              'modonly',
              'work',
              'remember',
              'urlOverride',
            ],
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
          },
          ModAffiliationConfirmModal: {
            template: '<div class="mod-affiliation-modal" />',
            props: ['groupid'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'b-img': {
            template: '<img />',
            props: ['src', 'alt', 'lazy'],
          },
          'infinite-loading': {
            template:
              '<div class="infinite-loading"><slot name="spinner" /></div>',
            props: ['direction', 'forceUseInfiniteWrapper', 'identifier'],
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
    mockModGroupStore.received = true
    mockModGroupStore.list = {}
    mockMiscStore.get.mockReturnValue(null)
    mockAuthStore.user = { settings: { lastaimsshow: null } }
  })

  describe('rendering', () => {
    it('shows empty message when no messages, not busy, and groups received', async () => {
      mockMessages.value = []
      mockBusy.value = false
      mockModGroupStore.received = true
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('no messages at the moment')
    })

    it('shows loading message when groups not yet received', async () => {
      mockModGroupStore.received = false
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Please wait')
    })

    it('renders ModMessages when groups received', async () => {
      mockModGroupStore.received = true
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.mod-messages').exists()).toBe(true)
    })
  })

  describe('setup', () => {
    it('sets summarykey to modtoolsMessagesPendingSummary', () => {
      mountComponent()
      expect(mockSummarykey.value).toBe('modtoolsMessagesPendingSummary')
    })

    it('sets collection to Pending', () => {
      mountComponent()
      expect(mockCollection.value).toBe('Pending')
    })

    it('sets workType to pending and pendingother', () => {
      mountComponent()
      expect(mockWorkType.value).toEqual(['pending', 'pendingother'])
    })
  })

  describe('computed properties', () => {
    it('groups returns array from modGroupStore', async () => {
      mockModGroupStore.list = {
        1: { id: 1, nameshort: 'Group1' },
        2: { id: 2, nameshort: 'Group2' },
      }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.groups).toHaveLength(2)
    })

    it('groupsreceived returns modGroupStore.received', () => {
      mockModGroupStore.received = true
      const wrapper = mountComponent()
      expect(wrapper.vm.groupsreceived).toBe(true)
    })
  })

  describe('methods', () => {
    it('loadAll sets limit to 1000 and fetches messages', async () => {
      const wrapper = mountComponent()
      // Mock the scrollIntoView method on the end ref
      const mockScrollIntoView = vi.fn()
      Object.defineProperty(wrapper.vm.$refs, 'end', {
        value: { scrollIntoView: mockScrollIntoView },
        writable: true,
      })

      await wrapper.vm.loadAll()

      expect(mockLimit.value).toBe(1000)
      expect(mockGetMessages).toHaveBeenCalled()
    })

    it('loadMore increments show when more messages exist', async () => {
      mockMessages.value = [{ id: 1 }, { id: 2 }]
      mockShow.value = 1
      const wrapper = mountComponent()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      await wrapper.vm.loadMore(mockState)

      expect(mockShow.value).toBe(2)
      expect(mockState.loaded).toHaveBeenCalled()
    })

    it('loadMore completes when no user', async () => {
      const wrapper = mountComponent()
      // Access through useMe mock - set me to null
      wrapper.vm.me = null
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      await wrapper.vm.loadMore(mockState)

      expect(mockState.complete).toHaveBeenCalled()
    })

    it('loadMore fetches more messages when show equals messages length', async () => {
      mockMessages.value = [{ id: 1 }]
      mockShow.value = 1
      mockMessageStore.list = { 1: { id: 1 } }
      const wrapper = mountComponent()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      await wrapper.vm.loadMore(mockState)

      expect(mockMessageStore.fetchMessagesMT).toHaveBeenCalled()
    })
  })

  describe('modal visibility', () => {
    it('shows cake modal when not previously asked', async () => {
      mockMiscStore.get.mockImplementation((key) => {
        if (key === 'cakeasked') return null
        return null
      })
      const wrapper = mountComponent()
      await flushPromises()
      // Access the ref value (showCakeModal is now a ref in script setup)
      const showCake = wrapper.vm.showCakeModal
      expect(
        showCake === true || showCake?.value === true || showCake
      ).toBeTruthy()
    })

    it('does not show cake modal when previously asked', async () => {
      mockMiscStore.get.mockImplementation((key) => {
        if (key === 'cakeasked') return true
        return null
      })
      const wrapper = mountComponent()
      await flushPromises()
      // Access the ref value
      const showCake = wrapper.vm.showCakeModal
      expect(
        showCake === false || showCake?.value === false || !showCake
      ).toBeTruthy()
    })
  })
})
