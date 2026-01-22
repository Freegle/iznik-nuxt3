import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref, computed } from 'vue'
import EditsPage from '~/modtools/pages/messages/edits.vue'

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
const mockVisibleMessages = computed(() => [])
const mockWork = computed(() => 0)
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
    getMessages: mockGetMessages,
  }),
}))

// Mock stores
const mockMiscStore = {
  get: vi.fn(),
  set: vi.fn(),
}

vi.mock('@/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

const mockModGroupStore = {
  fetchIfNeedBeMT: vi.fn(),
  get: vi.fn(),
}

vi.mock('@/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

describe('EditsPage', () => {
  function mountComponent() {
    return mount(EditsPage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'client-only': {
            template: '<div><slot /></div>',
          },
          ScrollToTop: {
            template: '<div class="scroll-to-top" />',
          },
          ModGroupSelect: {
            template: '<div class="mod-group-select" />',
            props: ['modelValue', 'all', 'modonly', 'work', 'remember'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          ModMessages: {
            template: '<div class="mod-messages" />',
            props: ['editreview'],
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
    mockModGroupStore.get.mockReturnValue({ id: 1, nameshort: 'TestGroup' })
  })

  describe('rendering', () => {
    it('renders the page with required components', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.scroll-to-top').exists()).toBe(true)
      expect(wrapper.find('.mod-group-select').exists()).toBe(true)
      expect(wrapper.find('.mod-messages').exists()).toBe(true)
    })

    it('shows empty message when no messages and not busy', async () => {
      mockMessages.value = []
      mockBusy.value = false
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('no messages at the moment')
    })

    it('hides empty message when busy', async () => {
      mockMessages.value = []
      mockBusy.value = true
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })

    it('hides empty message when messages exist', async () => {
      mockMessages.value = [{ id: 1 }]
      mockBusy.value = false
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })
  })

  describe('setup', () => {
    it('sets collection to Edit', () => {
      mountComponent()
      expect(mockCollection.value).toBe('Edit')
    })

    it('sets workType to editreview', () => {
      mountComponent()
      expect(mockWorkType.value).toBe('editreview')
    })
  })

  describe('watcher behavior', () => {
    it('handles groupid change by fetching group and messages', async () => {
      mountComponent()

      // Trigger groupid change
      mockGroupid.value = 123
      await flushPromises()

      expect(mockModGroupStore.fetchIfNeedBeMT).toHaveBeenCalledWith(123)
      expect(mockModGroupStore.get).toHaveBeenCalledWith(123)
      expect(mockGetMessages).toHaveBeenCalled()
    })

    it('resets context when groupid changes', async () => {
      mountComponent()
      mockContext.value = 'some-context'

      // Trigger groupid change
      mockGroupid.value = 456
      await flushPromises()

      expect(mockContext.value).toBe(null)
    })

    it('sets show to messages length after fetching', async () => {
      mountComponent()
      mockMessages.value = [{ id: 1 }, { id: 2 }, { id: 3 }]

      // Trigger groupid change
      mockGroupid.value = 789
      await flushPromises()

      expect(mockShow.value).toBe(3)
    })
  })
})
