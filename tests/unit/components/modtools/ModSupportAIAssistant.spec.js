import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ModSupportAIAssistant from '~/modtools/components/ModSupportAIAssistant.vue'

// Mock the marked library
vi.mock('marked', () => ({
  marked: vi.fn((text) => `<p>${text}</p>`),
}))

// Mock the user store
const mockUserStore = {
  list: {},
  clear: vi.fn(),
  fetchMT: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ModSupportAIAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset mock store state
    mockUserStore.list = {}
    mockUserStore.clear.mockClear()
    mockUserStore.fetchMT.mockClear()

    // Default fetch mock - sanitizer available
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(ModSupportAIAssistant, {
      props: { ...props },
      global: {
        stubs: {
          'b-modal': {
            template: '<div class="modal" v-if="modelValue"><slot /></div>',
            props: ['modelValue', 'title'],
          },
          'b-form': {
            template:
              '<form @submit.prevent="$emit(\'submit\')"><slot /></form>',
            emits: ['submit'],
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" :placeholder="placeholder" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup.enter="$emit(\'keyup\', $event)" />',
            props: ['modelValue', 'placeholder', 'disabled'],
            emits: ['update:modelValue', 'keyup'],
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'rows', 'placeholder', 'disabled'],
            emits: ['update:modelValue'],
          },
          'b-form-checkbox': {
            template:
              '<label class="checkbox"><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" /><slot /></label>',
            props: ['modelValue', 'switch', 'size'],
            emits: ['update:modelValue'],
          },
          'b-input-group': {
            template: '<div class="input-group"><slot /></div>',
          },
          'b-form-group': {
            template: '<div class="form-group"><slot /></div>',
          },
          'b-button': {
            template:
              '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size', 'disabled', 'type'],
            emits: ['click'],
          },
          'b-spinner': {
            template: '<span class="spinner" />',
            props: ['small'],
          },
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
          },
          'v-icon': {
            template: '<span class="icon" />',
            props: ['icon', 'class', 'scale'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders the main container', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.log-analysis-container').exists()).toBe(true)
    })

    it('renders the header with AI Support Helper title', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.log-analysis-header').exists()).toBe(true)
      expect(wrapper.text()).toContain('AI Support Helper')
    })

    it('shows Step 1 user selection by default', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Step 1: Select a user to investigate')
    })

    it('shows service unavailable message when sanitizer is not available', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Service unavailable')
    })

    it('shows Privacy Review checkbox', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Privacy Review')
    })

    it('shows Debug checkbox', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Debug')
    })

    it('shows Privacy button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Privacy')
    })
  })

  describe('user search', () => {
    it('has a search input field', () => {
      const wrapper = mountComponent()
      // Check if there's an input in the step 1 section
      const inputs = wrapper.findAll('input')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('has a Search button', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const searchButton = buttons.find((b) => b.text().includes('Search'))
      expect(searchButton).toBeTruthy()
    })

    it('has a Skip button', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const skipButton = buttons.find((b) => b.text().includes('Skip'))
      expect(skipButton).toBeTruthy()
    })

    it('calls searchUsers when search button is clicked', async () => {
      const wrapper = mountComponent()

      // Set search term
      wrapper.vm.userSearch = 'test@example.com'
      await nextTick()

      // Mock the fetchMT to return users
      mockUserStore.list = {
        1: { id: 1, email: 'test@example.com', displayname: 'Test User' },
      }

      // Find and click search button
      const buttons = wrapper.findAll('button')
      const searchButton = buttons.find((b) => b.text().includes('Search'))
      await searchButton.trigger('click')
      await flushPromises()

      expect(mockUserStore.clear).toHaveBeenCalled()
      expect(mockUserStore.fetchMT).toHaveBeenCalledWith({
        search: 'test@example.com',
        emailhistory: true,
      })
    })

    it('does not search when search term is empty', async () => {
      const wrapper = mountComponent()

      wrapper.vm.userSearch = ''
      await wrapper.vm.searchUsers()

      expect(mockUserStore.fetchMT).not.toHaveBeenCalled()
    })

    it('displays search results', async () => {
      const wrapper = mountComponent()

      wrapper.vm.searchResults = [
        {
          id: 1,
          email: 'user1@example.com',
          displayname: 'User One',
          lastaccess: '2024-01-01',
        },
        {
          id: 2,
          email: 'user2@example.com',
          displayname: 'User Two',
          lastaccess: '2024-01-02',
        },
      ]
      await nextTick()

      expect(wrapper.text()).toContain('User One')
      expect(wrapper.text()).toContain('user1@example.com')
    })

    it('shows no results message when no users found', async () => {
      const wrapper = mountComponent()

      wrapper.vm.noResults = true
      wrapper.vm.userSearch = 'nonexistent'
      await nextTick()

      expect(wrapper.text()).toContain('No users found matching')
    })

    it('auto-selects user when only one result', async () => {
      const wrapper = mountComponent()

      wrapper.vm.userSearch = 'test'
      mockUserStore.list = {
        1: { id: 1, email: 'test@example.com', displayname: 'Test User' },
      }

      await wrapper.vm.searchUsers()
      await flushPromises()

      // Should auto-select the single result
      expect(wrapper.vm.selectedUser).toEqual(
        expect.objectContaining({ id: 1 })
      )
    })
  })

  describe('user selection', () => {
    it('selects a user when clicked', async () => {
      const wrapper = mountComponent()

      const testUser = {
        id: 1,
        email: 'test@example.com',
        displayname: 'Test User',
      }
      wrapper.vm.selectUser(testUser)
      await nextTick()

      expect(wrapper.vm.selectedUser).toEqual(testUser)
    })

    it('clears search results after selecting user', async () => {
      const wrapper = mountComponent()

      wrapper.vm.searchResults = [{ id: 1 }]
      wrapper.vm.userSearch = 'test'

      wrapper.vm.selectUser({ id: 1 })
      await nextTick()

      expect(wrapper.vm.searchResults).toEqual([])
      expect(wrapper.vm.userSearch).toBe('')
    })

    it('shows selected user banner after selection', async () => {
      const wrapper = mountComponent()

      wrapper.vm.selectedUser = {
        id: 1,
        email: 'test@example.com',
        displayname: 'Test User',
      }
      await nextTick()

      expect(wrapper.find('.selected-user-banner').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test User')
      expect(wrapper.text()).toContain('test@example.com')
    })

    it('shows General Query when skipping user selection', async () => {
      const wrapper = mountComponent()

      wrapper.vm.skipUserSelection()
      await nextTick()

      expect(wrapper.vm.skippedUserSelection).toBe(true)
      expect(wrapper.text()).toContain('General Query')
    })
  })

  describe('query input', () => {
    it('shows query textarea after user is selected', async () => {
      const wrapper = mountComponent()

      wrapper.vm.selectedUser = { id: 1, email: 'test@example.com' }
      await nextTick()

      expect(wrapper.text()).toContain('What would you like to investigate?')
    })

    it('shows query textarea after skipping user selection', async () => {
      const wrapper = mountComponent()

      wrapper.vm.skippedUserSelection = true
      await nextTick()

      expect(wrapper.text()).toContain('What would you like to investigate?')
    })

    it('disables Analyze button when query is empty', async () => {
      const wrapper = mountComponent()

      wrapper.vm.selectedUser = { id: 1 }
      wrapper.vm.query = ''
      await nextTick()

      const buttons = wrapper.findAll('button')
      const analyzeButton = buttons.find((b) => b.text().includes('Analyze'))
      expect(analyzeButton.attributes('disabled')).toBeDefined()
    })

    it('enables Analyze button when query has content', async () => {
      const wrapper = mountComponent()

      wrapper.vm.selectedUser = { id: 1 }
      wrapper.vm.query = 'Why is this user having problems?'
      wrapper.vm.isProcessing = false
      await nextTick()

      const buttons = wrapper.findAll('button')
      const analyzeButton = buttons.find((b) => b.text().includes('Analyze'))
      expect(analyzeButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('newChat method', () => {
    it('resets all state when starting new chat', async () => {
      const wrapper = mountComponent()

      // Set up some state
      wrapper.vm.selectedUser = { id: 1 }
      wrapper.vm.messages = [{ role: 'user', content: 'test' }]
      wrapper.vm.query = 'test query'
      wrapper.vm.localMapping = { token: 'value' }

      wrapper.vm.newChat()
      await nextTick()

      expect(wrapper.vm.selectedUser).toBeNull()
      expect(wrapper.vm.skippedUserSelection).toBe(false)
      expect(wrapper.vm.messages).toEqual([])
      expect(wrapper.vm.query).toBe('')
      expect(wrapper.vm.localMapping).toEqual({})
    })
  })

  describe('messages display', () => {
    it('shows chat interface when messages exist', async () => {
      const wrapper = mountComponent()

      wrapper.vm.selectedUser = { id: 1 }
      wrapper.vm.messages = [
        { role: 'user', content: 'Hello', rawContent: 'Hello' },
        { role: 'assistant', content: 'Hi there', rawContent: 'Hi there' },
      ]
      await nextTick()

      expect(wrapper.find('.log-analysis-messages').exists()).toBe(true)
    })

    it('displays user messages with correct styling', async () => {
      const wrapper = mountComponent()

      wrapper.vm.selectedUser = { id: 1 }
      wrapper.vm.messages = [
        { role: 'user', content: 'Hello', rawContent: 'Hello' },
      ]
      await nextTick()

      expect(wrapper.find('.message-user').exists()).toBe(true)
    })

    it('displays assistant messages with correct styling', async () => {
      const wrapper = mountComponent()

      wrapper.vm.selectedUser = { id: 1 }
      wrapper.vm.messages = [
        { role: 'assistant', content: 'Hi there', rawContent: 'Hi there' },
      ]
      await nextTick()

      expect(wrapper.find('.message-assistant').exists()).toBe(true)
    })

    it('shows processing indicator when processing', async () => {
      const wrapper = mountComponent()

      wrapper.vm.selectedUser = { id: 1 }
      wrapper.vm.messages = [{ role: 'user', content: 'test' }]
      wrapper.vm.isProcessing = true
      wrapper.vm.processingStatus = 'Analyzing...'
      await nextTick()

      expect(wrapper.text()).toContain('Analyzing...')
      expect(wrapper.find('.spinner').exists()).toBe(true)
    })

    it('shows cancel button when processing', async () => {
      const wrapper = mountComponent()

      wrapper.vm.selectedUser = { id: 1 }
      wrapper.vm.messages = [{ role: 'user', content: 'test' }]
      wrapper.vm.isProcessing = true
      await nextTick()

      const buttons = wrapper.findAll('button')
      const cancelButton = buttons.find((b) => b.text().includes('Cancel'))
      expect(cancelButton).toBeTruthy()
    })

    it('shows message cost when available', async () => {
      const wrapper = mountComponent()

      wrapper.vm.selectedUser = { id: 1 }
      wrapper.vm.messages = [
        {
          role: 'assistant',
          content: 'Response',
          rawContent: 'Response',
          costUsd: 0.0025,
        },
      ]
      await nextTick()

      expect(wrapper.text()).toContain('Cost: $0.0025')
    })
  })

  describe('computed properties', () => {
    it('calculates totalCost correctly', async () => {
      const wrapper = mountComponent()

      wrapper.vm.messages = [
        { role: 'assistant', content: 'test1', costUsd: 0.001 },
        { role: 'user', content: 'test2' },
        { role: 'assistant', content: 'test3', costUsd: 0.002 },
      ]
      await nextTick()

      expect(wrapper.vm.totalCost).toBeCloseTo(0.003, 4)
    })

    it('returns 0 for totalCost when no messages with cost', async () => {
      const wrapper = mountComponent()

      wrapper.vm.messages = [
        { role: 'user', content: 'test' },
        { role: 'assistant', content: 'reply' },
      ]
      await nextTick()

      expect(wrapper.vm.totalCost).toBe(0)
    })
  })

  describe('utility methods', () => {
    it('formatDate formats date correctly', () => {
      const wrapper = mountComponent()
      const result = wrapper.vm.formatDate('2024-01-15T10:30:00Z')
      expect(result).toContain('2024')
    })

    it('formatDate returns empty string for falsy input', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.formatDate(null)).toBe('')
      expect(wrapper.vm.formatDate('')).toBe('')
    })

    it('deTokenize replaces tokens with real values', () => {
      const wrapper = mountComponent()
      wrapper.vm.localMapping = {
        'user_abc123@gmail.com': 'real@example.com',
        ip_xyz789: '192.168.1.1',
      }

      const result = wrapper.vm.deTokenize(
        'Email is user_abc123@gmail.com from ip_xyz789'
      )
      expect(result).toBe('Email is real@example.com from 192.168.1.1')
    })

    it('deTokenize returns original text if no mapping', () => {
      const wrapper = mountComponent()
      wrapper.vm.localMapping = {}

      const result = wrapper.vm.deTokenize('Some text')
      expect(result).toBe('Some text')
    })

    it('cancelQuery stops processing', async () => {
      const wrapper = mountComponent()
      wrapper.vm.isProcessing = true

      wrapper.vm.cancelQuery()
      await nextTick()

      expect(wrapper.vm.isProcessing).toBe(false)
    })

    it('formatStreamLabels formats stream object correctly', () => {
      const wrapper = mountComponent()
      const stream = { app: 'myapp', level: 'info' }
      const result = wrapper.vm.formatStreamLabels(stream)
      expect(result).toContain('app="myapp"')
      expect(result).toContain('level="info"')
    })

    it('formatStreamLabels returns empty string for null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.formatStreamLabels(null)).toBe('')
    })

    it('formatLogTimestamp converts nanoseconds to time', () => {
      const wrapper = mountComponent()
      // Timestamp in nanoseconds
      const ts = '1704067200000000000' // 2024-01-01 00:00:00 UTC in ns
      const result = wrapper.vm.formatLogTimestamp(ts)
      expect(result).toBeTruthy()
    })

    it('formatLogTimestamp returns empty for null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.formatLogTimestamp(null)).toBe('')
    })
  })

  describe('debug mode', () => {
    it('shows debug panel when debugMode is true and has entries', async () => {
      const wrapper = mountComponent()

      wrapper.vm.selectedUser = { id: 1 }
      wrapper.vm.messages = [{ role: 'user', content: 'test' }]
      wrapper.vm.debugMode = true
      wrapper.vm.debugLog = [
        { type: 'request', label: 'Test', data: {}, timestamp: '10:00:00' },
      ]
      await nextTick()

      expect(wrapper.find('.debug-panel').exists()).toBe(true)
      expect(wrapper.text()).toContain('Debug: Data Flow')
    })

    it('hides debug panel when debugMode is false', async () => {
      const wrapper = mountComponent()

      wrapper.vm.selectedUser = { id: 1 }
      wrapper.vm.messages = [{ role: 'user', content: 'test' }]
      wrapper.vm.debugMode = false
      wrapper.vm.debugLog = [{ type: 'request', label: 'Test', data: {} }]
      await nextTick()

      expect(wrapper.find('.debug-panel').exists()).toBe(false)
    })

    it('addDebugEntry adds entry when debug mode is on', () => {
      const wrapper = mountComponent()

      wrapper.vm.debugMode = true
      wrapper.vm.addDebugEntry('request', 'Test Label', { foo: 'bar' })

      expect(wrapper.vm.debugLog.length).toBe(1)
      expect(wrapper.vm.debugLog[0].label).toBe('Test Label')
      expect(wrapper.vm.debugLog[0].type).toBe('request')
    })

    it('addDebugEntry does not add when debug mode is off', () => {
      const wrapper = mountComponent()

      wrapper.vm.debugMode = false
      wrapper.vm.addDebugEntry('request', 'Test Label', { foo: 'bar' })

      expect(wrapper.vm.debugLog.length).toBe(0)
    })
  })

  describe('privacy review mode', () => {
    it('starts with privacy review mode enabled by default', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.privacyReviewMode).toBe(true)
    })

    it('cancelPrivacyReview clears pending review', async () => {
      const wrapper = mountComponent()

      wrapper.vm.pendingPrivacyReview = { originalQuery: 'test' }
      wrapper.vm.showPrivacyReview = true
      wrapper.vm.query = 'test'

      wrapper.vm.cancelPrivacyReview()
      await nextTick()

      expect(wrapper.vm.pendingPrivacyReview).toBeNull()
      expect(wrapper.vm.showPrivacyReview).toBe(false)
      expect(wrapper.vm.query).toBe('')
    })
  })

  describe('PII warning', () => {
    it('confirmPiiQuery clears pending query and modal', async () => {
      const wrapper = mountComponent()

      wrapper.vm.pendingQuery = 'test query'
      wrapper.vm.showPiiWarning = true

      // Mock executeQuery to prevent actual execution
      wrapper.vm.executeQuery = vi.fn()

      wrapper.vm.confirmPiiQuery()
      await nextTick()

      expect(wrapper.vm.pendingQuery).toBeNull()
      expect(wrapper.vm.showPiiWarning).toBe(false)
    })

    it('cancelPiiQuery clears state without executing', async () => {
      const wrapper = mountComponent()

      wrapper.vm.pendingQuery = 'test query'
      wrapper.vm.showPiiWarning = true

      wrapper.vm.cancelPiiQuery()
      await nextTick()

      expect(wrapper.vm.pendingQuery).toBeNull()
      expect(wrapper.vm.showPiiWarning).toBe(false)
    })
  })

  describe('MCP polling', () => {
    it('startMcpPolling sets interval', () => {
      const wrapper = mountComponent()

      expect(wrapper.vm.mcpPollInterval).toBeNull()
      wrapper.vm.startMcpPolling()

      expect(wrapper.vm.mcpPollInterval).not.toBeNull()

      // Clean up
      wrapper.vm.stopMcpPolling()
    })

    it('stopMcpPolling clears interval', () => {
      const wrapper = mountComponent()

      wrapper.vm.startMcpPolling()
      expect(wrapper.vm.mcpPollInterval).not.toBeNull()

      wrapper.vm.stopMcpPolling()
      expect(wrapper.vm.mcpPollInterval).toBeNull()
    })

    it('startMcpPolling does nothing if already polling', () => {
      const wrapper = mountComponent()

      wrapper.vm.startMcpPolling()
      const firstInterval = wrapper.vm.mcpPollInterval

      wrapper.vm.startMcpPolling()
      expect(wrapper.vm.mcpPollInterval).toBe(firstInterval)

      wrapper.vm.stopMcpPolling()
    })
  })

  describe('MCP query approval', () => {
    it('approveMcpQuery clears pending state', async () => {
      const wrapper = mountComponent()

      wrapper.vm.pendingMcpQuery = { id: 'test-123', query: 'test' }
      wrapper.vm.showMcpQueryApproval = true

      mockFetch.mockResolvedValueOnce({ ok: true })

      await wrapper.vm.approveMcpQuery()

      expect(wrapper.vm.pendingMcpQuery).toBeNull()
      expect(wrapper.vm.showMcpQueryApproval).toBe(false)
    })

    it('rejectMcpQuery clears pending state', async () => {
      const wrapper = mountComponent()

      wrapper.vm.pendingMcpQuery = { id: 'test-123', query: 'test' }
      wrapper.vm.showMcpQueryApproval = true

      mockFetch.mockResolvedValueOnce({ ok: true })

      await wrapper.vm.rejectMcpQuery()

      expect(wrapper.vm.pendingMcpQuery).toBeNull()
      expect(wrapper.vm.showMcpQueryApproval).toBe(false)
    })
  })

  describe('MCP results approval', () => {
    it('approveMcpResults clears pending state', async () => {
      const wrapper = mountComponent()

      wrapper.vm.pendingMcpResults = { id: 'test-123', resultCount: 5 }
      wrapper.vm.showMcpResultsApproval = true

      mockFetch.mockResolvedValueOnce({ ok: true })

      await wrapper.vm.approveMcpResults()

      expect(wrapper.vm.pendingMcpResults).toBeNull()
      expect(wrapper.vm.showMcpResultsApproval).toBe(false)
    })

    it('rejectMcpResults clears pending state', async () => {
      const wrapper = mountComponent()

      wrapper.vm.pendingMcpResults = { id: 'test-123', resultCount: 5 }
      wrapper.vm.showMcpResultsApproval = true

      mockFetch.mockResolvedValueOnce({ ok: true })

      await wrapper.vm.rejectMcpResults()

      expect(wrapper.vm.pendingMcpResults).toBeNull()
      expect(wrapper.vm.showMcpResultsApproval).toBe(false)
    })
  })

  describe('DB query approval', () => {
    it('approveDbQuery clears pending state', async () => {
      const wrapper = mountComponent()

      wrapper.vm.pendingDbQuery = { id: 'test-123', query: 'SELECT *' }
      wrapper.vm.showDbQueryApproval = true

      mockFetch.mockResolvedValueOnce({ ok: true })

      await wrapper.vm.approveDbQuery()

      expect(wrapper.vm.pendingDbQuery).toBeNull()
      expect(wrapper.vm.showDbQueryApproval).toBe(false)
    })

    it('rejectDbQuery clears pending state', async () => {
      const wrapper = mountComponent()

      wrapper.vm.pendingDbQuery = { id: 'test-123', query: 'SELECT *' }
      wrapper.vm.showDbQueryApproval = true

      mockFetch.mockResolvedValueOnce({ ok: true })

      await wrapper.vm.rejectDbQuery()

      expect(wrapper.vm.pendingDbQuery).toBeNull()
      expect(wrapper.vm.showDbQueryApproval).toBe(false)
    })
  })

  describe('DB results approval', () => {
    it('approveDbResults clears pending state', async () => {
      const wrapper = mountComponent()

      wrapper.vm.pendingDbResults = { id: 'test-123', rowCount: 10 }
      wrapper.vm.showDbResultsApproval = true

      mockFetch.mockResolvedValueOnce({ ok: true })

      await wrapper.vm.approveDbResults()

      expect(wrapper.vm.pendingDbResults).toBeNull()
      expect(wrapper.vm.showDbResultsApproval).toBe(false)
    })

    it('rejectDbResults clears pending state', async () => {
      const wrapper = mountComponent()

      wrapper.vm.pendingDbResults = { id: 'test-123', rowCount: 10 }
      wrapper.vm.showDbResultsApproval = true

      mockFetch.mockResolvedValueOnce({ ok: true })

      await wrapper.vm.rejectDbResults()

      expect(wrapper.vm.pendingDbResults).toBeNull()
      expect(wrapper.vm.showDbResultsApproval).toBe(false)
    })
  })

  describe('scrollToBottom', () => {
    it('scrolls messages container to bottom', async () => {
      const wrapper = mountComponent()

      // Create a mock element
      const mockContainer = {
        scrollTop: 0,
        scrollHeight: 500,
      }
      wrapper.vm.messagesContainer = mockContainer

      wrapper.vm.scrollToBottom()
      await nextTick()

      expect(mockContainer.scrollTop).toBe(500)
    })
  })

  describe('session cost display', () => {
    it('shows session cost when totalCost > 0', async () => {
      const wrapper = mountComponent()

      wrapper.vm.messages = [
        { role: 'assistant', content: 'test', costUsd: 0.005 },
      ]
      await nextTick()

      expect(wrapper.text()).toContain('Session: $')
    })
  })

  describe('follow-up input', () => {
    it('shows follow-up input area when in chat mode', async () => {
      const wrapper = mountComponent()

      wrapper.vm.selectedUser = { id: 1 }
      wrapper.vm.messages = [
        { role: 'user', content: 'test', rawContent: 'test' },
        { role: 'assistant', content: 'response', rawContent: 'response' },
      ]
      await nextTick()

      expect(wrapper.find('.chat-input-area').exists()).toBe(true)
    })

    it('has placeholder for follow-up question', async () => {
      const wrapper = mountComponent()

      wrapper.vm.selectedUser = { id: 1 }
      wrapper.vm.messages = [{ role: 'user', content: 'test' }]
      await nextTick()

      const input = wrapper.find('.chat-input-area input')
      expect(input.exists()).toBe(true)
      expect(input.attributes('placeholder')).toContain('follow-up')
    })
  })
})
