import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import SupportPage from '~/modtools/pages/support/[[id]].vue'

// Mock stores
const mockChatStore = {
  list: [],
  clear: vi.fn(),
}

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

const mockMessageStore = {
  list: {},
  all: [],
  clear: vi.fn(),
  clearContext: vi.fn(),
  fetchMT: vi.fn().mockResolvedValue(null),
  searchMT: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

const mockSystemLogsStore = {
  clear: vi.fn(),
}

vi.mock('~/stores/systemlogs', () => ({
  useSystemLogsStore: () => mockSystemLogsStore,
}))

// Mock useMe composable
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    supportOrAdmin: ref(true),
  }),
}))

// Mock route params
const mockRouteParams = ref({ id: undefined })
const mockRouteQuery = ref({})

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: mockRouteParams.value,
    query: mockRouteQuery.value,
  }),
}))

describe('support/[[id]].vue page', () => {
  function mountComponent() {
    return mount(SupportPage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          ModSupportFindUser: {
            template: '<div class="mod-support-find-user" />',
            props: ['id'],
          },
          ModSupportFindGroup: {
            template: '<div class="mod-support-find-group" />',
            methods: { loadCommunities: vi.fn() },
          },
          ModSupportListGroups: {
            template: '<div class="mod-support-list-groups" />',
            methods: { fetchCommunities: vi.fn() },
          },
          ModSupportContactGroup: {
            template: '<div class="mod-support-contact-group" />',
          },
          ModSupportAddGroup: {
            template: '<div class="mod-support-add-group" />',
          },
          ModSupportCheckVolunteers: {
            template: '<div class="mod-support-check-volunteers" />',
          },
          ModFindMessage: {
            template: '<div class="mod-find-message" />',
            props: ['messageTerm'],
            emits: ['searched', 'changed'],
          },
          ModMessage: {
            template: '<div class="mod-message" />',
            props: ['message', 'noactions'],
          },
          ModSystemLogs: {
            template: '<div class="mod-system-logs" />',
          },
          ModSupportEmailStats: {
            template: '<div class="mod-support-email-stats" />',
          },
          ModSupportIncomingEmail: {
            template: '<div class="mod-support-incoming-email" />',
          },
          ModIncomingEmailCharts: {
            template: '<div class="mod-incoming-email-charts" />',
          },
          ModSupportAIAssistant: {
            template: '<div class="mod-support-ai-assistant" />',
          },
          ModSupportWorryWords: {
            template: '<div class="mod-support-worry-words" />',
            methods: { fetchWorryWords: vi.fn() },
          },
          ModSupportSpamKeywords: {
            template: '<div class="mod-support-spam-keywords" />',
            methods: { fetchSpamKeywords: vi.fn() },
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          ExternalLink: {
            template: '<a :href="href"><slot /></a>',
            props: ['href'],
          },
          'b-tabs': {
            template: '<div class="b-tabs"><slot /></div>',
            props: ['modelValue', 'contentClass', 'card'],
          },
          'b-tab': {
            template:
              '<div class="b-tab" @click="$emit(\'click\')"><slot /><slot name="title" /></div>',
            emits: ['click'],
          },
          'b-badge': {
            template: '<span class="b-badge"><slot /></span>',
            props: ['variant'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockRouteParams.value = { id: undefined }
    mockRouteQuery.value = {}
    mockMessageStore.all = []
  })

  describe('rendering', () => {
    it('renders the page when user has support access', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.b-tabs').exists()).toBe(true)
    })

    it('renders user tab component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-support-find-user').exists()).toBe(true)
    })
  })

  describe('initial state', () => {
    it('clears stores on created', async () => {
      mountComponent()
      await flushPromises()
      expect(mockMessageStore.clear).toHaveBeenCalled()
    })

    it('parses id from route params', () => {
      mockRouteParams.value = { id: '123' }
      const wrapper = mountComponent()
      expect(wrapper.vm.id).toBe(123)
    })
  })

  describe('computed properties', () => {
    it('messages returns all from message store', () => {
      mockMessageStore.all = [{ id: 1 }, { id: 2 }]
      const wrapper = mountComponent()
      expect(wrapper.vm.messages).toHaveLength(2)
    })
  })

  describe('methods', () => {
    it('changedMessageTerm updates messageTerm', () => {
      const wrapper = mountComponent()
      wrapper.vm.changedMessageTerm('  test term  ')
      expect(wrapper.vm.messageTerm).toBe('test term')
    })

    it('searchedMessage calls clearContext and clear', async () => {
      const wrapper = mountComponent()
      wrapper.vm.messageTerm = '12345'
      await wrapper.vm.searchedMessage()
      expect(mockMessageStore.clearContext).toHaveBeenCalled()
      expect(mockMessageStore.clear).toHaveBeenCalled()
    })

    it('searchedMessage calls searchById for numeric term', async () => {
      const wrapper = mountComponent()
      wrapper.vm.messageTerm = '12345'
      await wrapper.vm.searchedMessage()
      expect(mockMessageStore.fetchMT).toHaveBeenCalledWith({
        id: '12345',
        messagehistory: true,
      })
    })

    it('searchedMessage calls searchById for #id term', async () => {
      const wrapper = mountComponent()
      wrapper.vm.messageTerm = '#12345'
      await wrapper.vm.searchedMessage()
      expect(mockMessageStore.fetchMT).toHaveBeenCalledWith({
        id: '12345',
        messagehistory: true,
      })
    })

    it('searchedMessage calls searchBySubject for text term', async () => {
      const wrapper = mountComponent()
      wrapper.vm.messageTerm = 'test subject'
      await wrapper.vm.searchedMessage()
      expect(mockMessageStore.searchMT).toHaveBeenCalledWith({
        term: 'test subject',
        groupid: undefined,
      })
    })

    it('onSystemLogsTab sets showSystemLogs and clears store', () => {
      const wrapper = mountComponent()
      wrapper.vm.onSystemLogsTab()
      expect(wrapper.vm.showSystemLogs).toBe(true)
      expect(mockSystemLogsStore.clear).toHaveBeenCalled()
    })

    it('onEmailStatsTab sets showEmailStats', () => {
      const wrapper = mountComponent()
      wrapper.vm.onEmailStatsTab()
      expect(wrapper.vm.showEmailStats).toBe(true)
    })

    it('onAIAssistantTab sets showAIAssistant', () => {
      const wrapper = mountComponent()
      wrapper.vm.onAIAssistantTab()
      expect(wrapper.vm.showAIAssistant).toBe(true)
    })
  })

  describe('tab query parameter handling', () => {
    it('sets activeTab from query param', async () => {
      mockRouteQuery.value = { tab: 'community' }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(wrapper.vm.activeTab).toBe(1)
    })

    it('sets logsSubTab from query param', async () => {
      mockRouteQuery.value = { tab: 'logs', subtab: 'ai' } // 'ai' maps to index 1 in logsSubTabMap
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(wrapper.vm.activeTab).toBe(5) // Logs tab is now at index 5
      expect(wrapper.vm.logsSubTab).toBe(1) // 'ai' subtab is index 1
    })
  })
})
