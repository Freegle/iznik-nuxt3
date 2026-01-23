import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModSystemLogs from '~/modtools/components/ModSystemLogs.vue'

// Mock useRuntimeConfig
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    APIv2: '/apiv2',
  },
}))

// Mock the system logs store
const mockSystemLogsStore = {
  logsAsTree: [],
  loading: false,
  error: null,
  hasMore: true,
  summaries: [],
  lastTimestamp: null,
  email: null,
  ipAddress: null,
  timeRange: '24h',
  entityIds: { userIds: [], groupIds: [] },
  init: vi.fn(),
  clear: vi.fn(),
  fetchSummaries: vi.fn(),
  setUserFilter: vi.fn(),
  setGroupFilter: vi.fn(),
  setMsgFilter: vi.fn(),
  setTraceFilter: vi.fn(),
  setSessionFilter: vi.fn(),
  setIpFilter: vi.fn(),
}

// Mock with all possible import paths
vi.mock('~/modtools/stores/systemlogs', () => ({
  useSystemLogsStore: () => mockSystemLogsStore,
}))

vi.mock('../stores/systemlogs', () => ({
  useSystemLogsStore: () => mockSystemLogsStore,
}))

// Mock the user store
const mockUserStore = {
  list: {},
  fetch: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

// Mock the group store
const mockGroupStore = {
  list: {},
  fetch: vi.fn(),
}

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

describe('ModSystemLogs', () => {
  async function mountComponent(props = {}) {
    const wrapper = mount(ModSystemLogs, {
      props: {
        userid: null,
        groupid: null,
        msgid: null,
        ...props,
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          ModSystemLogSearch: {
            template:
              '<div class="log-search" @search="$emit(\'search\')" @expand-all="$emit(\'expand-all\')" />',
            props: ['userid', 'groupid', 'msgid'],
          },
          ModSystemLogTreeNode: {
            template: '<div class="tree-node" />',
            props: ['node', 'hideUserColumn'],
            methods: { expand: vi.fn() },
          },
          'b-alert': {
            template: '<div class="alert" :class="variant"><slot /></div>',
            props: ['variant', 'show', 'dismissible'],
          },
          'b-spinner': {
            template: '<span class="spinner" />',
          },
          'v-icon': {
            template: '<span class="icon" :class="icon" />',
            props: ['icon', 'scale'],
          },
          'infinite-loading': {
            template:
              '<div class="infinite-loading"><slot name="spinner" /><slot name="complete" /></div>',
          },
        },
      },
    })
    await flushPromises()
    return wrapper
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockSystemLogsStore.logsAsTree = []
    mockSystemLogsStore.loading = false
    mockSystemLogsStore.error = null
    mockSystemLogsStore.hasMore = true
    mockSystemLogsStore.summaries = []
    mockSystemLogsStore.entityIds = { userIds: [], groupIds: [] }
    mockSystemLogsStore.email = null
    mockSystemLogsStore.ipAddress = null
    mockSystemLogsStore.timeRange = '24h'
    mockSystemLogsStore.fetchSummaries.mockResolvedValue()
    mockUserStore.fetch.mockResolvedValue()
    mockGroupStore.fetch.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders system logs container', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.find('.system-logs').exists()).toBe(true)
    })

    it('renders search component', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.find('.log-search').exists()).toBe(true)
    })

    it('shows loading state when loading with no logs', async () => {
      mockSystemLogsStore.loading = true
      mockSystemLogsStore.logsAsTree = []
      const wrapper = await mountComponent()
      expect(wrapper.find('.spinner').exists()).toBe(true)
      expect(wrapper.text()).toContain('Loading logs...')
    })

    it('shows empty state when not loading and no logs', async () => {
      mockSystemLogsStore.loading = false
      mockSystemLogsStore.logsAsTree = []
      const wrapper = await mountComponent()
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.text()).toContain('No logs found')
    })

    it('shows log list when logs exist', async () => {
      mockSystemLogsStore.logsAsTree = [{ trace_id: 'trace-1', log: { id: 1 } }]
      const wrapper = await mountComponent()
      expect(wrapper.find('.log-list').exists()).toBe(true)
    })

    it('renders tree nodes for each log', async () => {
      mockSystemLogsStore.logsAsTree = [
        { trace_id: 'trace-1', log: { id: 1 } },
        { trace_id: 'trace-2', log: { id: 2 } },
      ]
      const wrapper = await mountComponent()
      expect(wrapper.findAll('.tree-node')).toHaveLength(2)
    })

    it('shows error alert when error exists', async () => {
      mockSystemLogsStore.error = 'Failed to load logs'
      const wrapper = await mountComponent()
      expect(wrapper.find('.alert').exists()).toBe(true)
      expect(wrapper.text()).toContain('Failed to load logs')
    })

    it('renders column headers', async () => {
      mockSystemLogsStore.logsAsTree = [{ trace_id: 'trace-1', log: { id: 1 } }]
      const wrapper = await mountComponent()
      expect(wrapper.text()).toContain('Time')
      expect(wrapper.text()).toContain('Source')
      expect(wrapper.text()).toContain('Action')
    })

    it('shows User column when not filtering by user', async () => {
      mockSystemLogsStore.logsAsTree = [{ trace_id: 'trace-1', log: { id: 1 } }]
      const wrapper = await mountComponent({ userid: null })
      expect(wrapper.find('.log-col-user').exists()).toBe(true)
    })

    it('hides User column when filtering by user', async () => {
      mockSystemLogsStore.logsAsTree = [{ trace_id: 'trace-1', log: { id: 1 } }]
      const wrapper = await mountComponent({ userid: 123 })
      expect(wrapper.find('.log-col-user').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('accepts userid prop', async () => {
      const wrapper = await mountComponent({ userid: 123 })
      expect(wrapper.props('userid')).toBe(123)
    })

    it('accepts groupid prop', async () => {
      const wrapper = await mountComponent({ groupid: 456 })
      expect(wrapper.props('groupid')).toBe(456)
    })

    it('accepts msgid prop', async () => {
      const wrapper = await mountComponent({ msgid: 789 })
      expect(wrapper.props('msgid')).toBe(789)
    })
  })

  describe('computed properties', () => {
    it('logsAsTree reflects store state', async () => {
      const logs = [{ trace_id: 'trace-1' }]
      mockSystemLogsStore.logsAsTree = logs
      const wrapper = await mountComponent()
      expect(wrapper.vm.logsAsTree).toEqual(logs)
    })

    it('loading reflects store state', async () => {
      mockSystemLogsStore.loading = true
      const wrapper = await mountComponent()
      expect(wrapper.vm.loading).toBe(true)
    })

    it('error reflects store state', async () => {
      mockSystemLogsStore.error = 'Error message'
      const wrapper = await mountComponent()
      expect(wrapper.vm.error).toBe('Error message')
    })

    it('hasMore reflects store state', async () => {
      mockSystemLogsStore.hasMore = false
      const wrapper = await mountComponent()
      expect(wrapper.vm.hasMore).toBe(false)
    })

    it('isFilteringByUser returns true when userid is set', async () => {
      const wrapper = await mountComponent({ userid: 123 })
      wrapper.vm.localUserid = 123
      expect(wrapper.vm.isFilteringByUser).toBe(true)
    })

    it('isFilteringByUser returns false when userid is null', async () => {
      const wrapper = await mountComponent({ userid: null })
      expect(wrapper.vm.isFilteringByUser).toBe(false)
    })

    it('hasLogs returns true when logs exist', async () => {
      mockSystemLogsStore.logsAsTree = [{ trace_id: 'trace-1' }]
      const wrapper = await mountComponent()
      expect(wrapper.vm.hasLogs).toBe(true)
    })

    it('hasLogs returns false when no logs', async () => {
      mockSystemLogsStore.logsAsTree = []
      const wrapper = await mountComponent()
      expect(wrapper.vm.hasLogs).toBe(false)
    })
  })

  describe('emptyStateHint', () => {
    it('shows user filter in hint', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.localUserid = 123
      expect(wrapper.vm.emptyStateHint).toContain('user #123')
    })

    it('shows group filter in hint', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.localGroupid = 456
      expect(wrapper.vm.emptyStateHint).toContain('group #456')
    })

    it('shows message filter in hint', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.localMsgid = 789
      expect(wrapper.vm.emptyStateHint).toContain('message #789')
    })

    it('shows email filter in hint', async () => {
      mockSystemLogsStore.email = 'test@example.com'
      const wrapper = await mountComponent()
      expect(wrapper.vm.emptyStateHint).toContain('email')
    })

    it('shows IP filter in hint', async () => {
      mockSystemLogsStore.ipAddress = '192.168.1.1'
      const wrapper = await mountComponent()
      expect(wrapper.vm.emptyStateHint).toContain('IP')
    })

    it('shows time range in hint', async () => {
      mockSystemLogsStore.timeRange = '7d'
      const wrapper = await mountComponent()
      expect(wrapper.vm.emptyStateHint).toContain('7 days')
    })

    it('shows generic hint when no filters', async () => {
      mockSystemLogsStore.timeRange = '24h'
      const wrapper = await mountComponent()
      expect(wrapper.vm.emptyStateHint).toContain('No activity recorded')
    })
  })

  describe('methods', () => {
    it('fetchLogs clears store and fetches summaries', async () => {
      const wrapper = await mountComponent()
      vi.clearAllMocks()
      await wrapper.vm.fetchLogs()
      expect(mockSystemLogsStore.clear).toHaveBeenCalled()
      expect(mockSystemLogsStore.fetchSummaries).toHaveBeenCalled()
    })

    it('clearError sets store error to null', async () => {
      mockSystemLogsStore.error = 'Some error'
      const wrapper = await mountComponent()
      wrapper.vm.clearError()
      expect(mockSystemLogsStore.error).toBeNull()
    })

    it('updateUserid updates local and store filter', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.updateUserid(123)
      expect(wrapper.vm.localUserid).toBe(123)
      expect(mockSystemLogsStore.setUserFilter).toHaveBeenCalledWith(123)
      expect(wrapper.emitted('update:userid')[0]).toEqual([123])
    })

    it('updateGroupid updates local and store filter', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.updateGroupid(456)
      expect(wrapper.vm.localGroupid).toBe(456)
      expect(mockSystemLogsStore.setGroupFilter).toHaveBeenCalledWith(456)
      expect(wrapper.emitted('update:groupid')[0]).toEqual([456])
    })

    it('updateMsgid updates local and store filter', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.updateMsgid(789)
      expect(wrapper.vm.localMsgid).toBe(789)
      expect(mockSystemLogsStore.setMsgFilter).toHaveBeenCalledWith(789)
      expect(wrapper.emitted('update:msgid')[0]).toEqual([789])
    })

    it('clearUserFilter clears filter and fetches', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.localUserid = 123
      await wrapper.vm.clearUserFilter()
      expect(wrapper.vm.localUserid).toBeNull()
      expect(mockSystemLogsStore.setUserFilter).toHaveBeenCalledWith(null)
      expect(wrapper.emitted('update:userid')[0]).toEqual([null])
    })

    it('clearGroupFilter clears filter and fetches', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.localGroupid = 456
      await wrapper.vm.clearGroupFilter()
      expect(wrapper.vm.localGroupid).toBeNull()
      expect(mockSystemLogsStore.setGroupFilter).toHaveBeenCalledWith(null)
      expect(wrapper.emitted('update:groupid')[0]).toEqual([null])
    })

    it('clearMsgFilter clears filter and fetches', async () => {
      const wrapper = await mountComponent()
      wrapper.vm.localMsgid = 789
      await wrapper.vm.clearMsgFilter()
      expect(wrapper.vm.localMsgid).toBeNull()
      expect(mockSystemLogsStore.setMsgFilter).toHaveBeenCalledWith(null)
      expect(wrapper.emitted('update:msgid')[0]).toEqual([null])
    })

    it('filterByTrace sets trace filter and fetches', async () => {
      const wrapper = await mountComponent()
      await wrapper.vm.filterByTrace('trace-123')
      expect(mockSystemLogsStore.setTraceFilter).toHaveBeenCalledWith(
        'trace-123'
      )
    })

    it('filterBySession sets session filter and fetches', async () => {
      const wrapper = await mountComponent()
      await wrapper.vm.filterBySession('session-456')
      expect(mockSystemLogsStore.setSessionFilter).toHaveBeenCalledWith(
        'session-456'
      )
    })

    it('filterByIp sets IP filter and fetches', async () => {
      const wrapper = await mountComponent()
      await wrapper.vm.filterByIp('192.168.1.1')
      expect(mockSystemLogsStore.setIpFilter).toHaveBeenCalledWith(
        '192.168.1.1'
      )
    })
  })

  describe('entity batch fetching', () => {
    it('batchFetchEntities fetches missing users', async () => {
      // Set up entity IDs before mounting (so they're available during fetchLogs)
      mockSystemLogsStore.entityIds = {
        userIds: [1, 2, 3],
        groupIds: [],
      }
      mockUserStore.list = { 1: { id: 1 } }

      const wrapper = await mountComponent()
      // Clear mocks from mount, then call again to test
      vi.clearAllMocks()
      mockUserStore.list = { 1: { id: 1 } }
      await wrapper.vm.batchFetchEntities()

      expect(mockUserStore.fetch).toHaveBeenCalledWith(2)
      expect(mockUserStore.fetch).toHaveBeenCalledWith(3)
      expect(mockUserStore.fetch).not.toHaveBeenCalledWith(1)
    })

    it('batchFetchEntities fetches missing groups', async () => {
      mockSystemLogsStore.entityIds = {
        userIds: [],
        groupIds: [10, 20],
      }
      mockGroupStore.list = { 10: { id: 10 } }

      const wrapper = await mountComponent()
      // Clear mocks from mount, then call again to test
      vi.clearAllMocks()
      mockGroupStore.list = { 10: { id: 10 } }
      await wrapper.vm.batchFetchEntities()

      expect(mockGroupStore.fetch).toHaveBeenCalledWith(20)
      expect(mockGroupStore.fetch).not.toHaveBeenCalledWith(10)
    })
  })

  describe('infinite loading', () => {
    it('loadMore fetches more summaries when hasMore', async () => {
      mockSystemLogsStore.hasMore = true
      mockSystemLogsStore.loading = false
      mockSystemLogsStore.summaries = [{ id: 1 }]
      mockSystemLogsStore.lastTimestamp = '2024-01-15T10:00:00Z'

      const $state = {
        complete: vi.fn(),
        loaded: vi.fn(),
      }

      // Need to mock the store to return more summaries
      mockSystemLogsStore.fetchSummaries.mockImplementation(() => {
        mockSystemLogsStore.summaries.push({ id: 2 })
        return Promise.resolve()
      })

      const wrapper = await mountComponent()
      vi.clearAllMocks()
      mockSystemLogsStore.summaries = [{ id: 1 }]
      mockSystemLogsStore.lastTimestamp = '2024-01-15T10:00:00Z'
      mockSystemLogsStore.fetchSummaries.mockImplementation(() => {
        mockSystemLogsStore.summaries.push({ id: 2 })
        return Promise.resolve()
      })
      await wrapper.vm.loadMore($state)

      expect(mockSystemLogsStore.fetchSummaries).toHaveBeenCalledWith({
        append: true,
        end: '2024-01-15T10:00:00Z',
      })
      expect($state.loaded).toHaveBeenCalled()
    })

    it('loadMore completes when no more logs', async () => {
      mockSystemLogsStore.hasMore = false

      const $state = {
        complete: vi.fn(),
        loaded: vi.fn(),
      }

      const wrapper = await mountComponent()
      await wrapper.vm.loadMore($state)

      expect($state.complete).toHaveBeenCalled()
      expect($state.loaded).not.toHaveBeenCalled()
    })

    it('loadMore completes when loading', async () => {
      mockSystemLogsStore.hasMore = true
      mockSystemLogsStore.loading = true

      const $state = {
        complete: vi.fn(),
        loaded: vi.fn(),
      }

      const wrapper = await mountComponent()
      mockSystemLogsStore.loading = true
      await wrapper.vm.loadMore($state)

      expect($state.complete).toHaveBeenCalled()
    })

    it('loadMore completes when no new summaries', async () => {
      mockSystemLogsStore.hasMore = true
      mockSystemLogsStore.loading = false
      mockSystemLogsStore.summaries = [{ id: 1 }]

      const $state = {
        complete: vi.fn(),
        loaded: vi.fn(),
      }

      const wrapper = await mountComponent()
      mockSystemLogsStore.loading = false
      await wrapper.vm.loadMore($state)

      expect($state.complete).toHaveBeenCalled()
    })
  })

  describe('watch effects', () => {
    it('watches userid prop and syncs to local', async () => {
      const wrapper = await mountComponent({ userid: null })
      expect(wrapper.vm.localUserid).toBeNull()

      await wrapper.setProps({ userid: 123 })
      expect(wrapper.vm.localUserid).toBe(123)
    })

    it('watches groupid prop and syncs to local', async () => {
      const wrapper = await mountComponent({ groupid: null })
      expect(wrapper.vm.localGroupid).toBeNull()

      await wrapper.setProps({ groupid: 456 })
      expect(wrapper.vm.localGroupid).toBe(456)
    })

    it('watches msgid prop and syncs to local', async () => {
      const wrapper = await mountComponent({ msgid: null })
      expect(wrapper.vm.localMsgid).toBeNull()

      await wrapper.setProps({ msgid: 789 })
      expect(wrapper.vm.localMsgid).toBe(789)
    })
  })

  describe('mounted behavior', () => {
    it('initializes store on mount', async () => {
      await mountComponent()
      expect(mockSystemLogsStore.init).toHaveBeenCalled()
    })
  })
})
