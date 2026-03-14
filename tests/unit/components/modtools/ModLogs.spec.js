import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModLogs from '~/modtools/components/ModLogs.vue'

// Mock logs store
const mockLogsStore = {
  list: [],
  params: { type: null, search: '' },
  fetch: vi.fn(),
}

vi.mock('~/stores/logs', () => ({
  useLogsStore: () => mockLogsStore,
}))

describe('ModLogs', () => {
  const sampleLogs = [
    {
      id: 1,
      type: 'Message',
      subtype: 'Approved',
      timestamp: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      type: 'User',
      subtype: 'Login',
      timestamp: '2024-01-15T11:00:00Z',
    },
    {
      id: 3,
      type: 'Group',
      subtype: 'Joined',
      timestamp: '2024-01-15T12:00:00Z',
    },
  ]

  function createWrapper(props = {}) {
    return mount(ModLogs, {
      props: {
        groupid: null,
        ...props,
      },
      global: {
        stubs: {
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols', 'lg'],
          },
          'b-img': {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'lazy'],
          },
          ModLog: {
            template:
              '<div class="mod-log" :data-id="log.id">{{ log.type }}/{{ log.subtype }}</div>',
            props: ['log'],
          },
          InfiniteLoading: {
            template:
              '<div class="infinite-loading"><slot name="spinner" /></div>',
            props: ['distance'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockLogsStore.list = []
    mockLogsStore.params = { type: null, search: '' }
  })

  describe('rendering', () => {
    it('renders header row with Date/Time, User, Action columns', () => {
      const wrapper = createWrapper()
      const text = wrapper.text()
      expect(text).toContain('Date')
      expect(text).toContain('Time')
      expect(text).toContain('User')
      expect(text).toContain('Action')
    })

    it('renders ModLog for each log entry', () => {
      mockLogsStore.list = sampleLogs
      const wrapper = createWrapper()
      expect(wrapper.findAll('.mod-log')).toHaveLength(3)
    })

    it('renders InfiniteLoading component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.infinite-loading').exists()).toBe(true)
    })

    it('shows loader gif in spinner slot', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.spinner-border').exists()).toBe(true)
    })
  })

  describe('logs computed', () => {
    it('returns logs from store', () => {
      mockLogsStore.list = sampleLogs
      const wrapper = createWrapper()
      expect(wrapper.vm.logs).toEqual(sampleLogs)
    })

    it('returns empty array when store has no logs', () => {
      mockLogsStore.list = []
      const wrapper = createWrapper()
      expect(wrapper.vm.logs).toEqual([])
    })
  })

  describe('loadMore method', () => {
    it('emits busy event when loading starts', async () => {
      const wrapper = createWrapper()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      mockLogsStore.list = []
      await wrapper.vm.loadMore(mockState)

      expect(wrapper.emitted('busy')).toBeTruthy()
    })

    it('emits idle event when loading completes', async () => {
      const wrapper = createWrapper()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      mockLogsStore.list = []
      await wrapper.vm.loadMore(mockState)

      expect(wrapper.emitted('idle')).toBeTruthy()
    })

    it('calls store.fetch with correct params', async () => {
      mockLogsStore.params = { type: 'User', search: 'test' }
      const wrapper = createWrapper({ groupid: 42 })
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      mockLogsStore.list = []
      await wrapper.vm.loadMore(mockState)

      expect(mockLogsStore.fetch).toHaveBeenCalledWith({
        limit: 50,
        groupid: 42,
        logtype: 'User',
        search: 'test',
      })
    })

    it('calls state.loaded when more logs are available', async () => {
      const wrapper = createWrapper()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      mockLogsStore.list = []
      mockLogsStore.fetch.mockImplementation(() => {
        mockLogsStore.list = sampleLogs
      })

      await wrapper.vm.loadMore(mockState)

      expect(mockState.loaded).toHaveBeenCalled()
    })

    it('calls state.complete when no more logs', async () => {
      mockLogsStore.list = sampleLogs
      const wrapper = createWrapper()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      mockLogsStore.fetch.mockImplementation(() => {
        // list stays the same, simulating no new logs
      })

      // Set show to be equal to list length so we trigger fetch
      wrapper.vm.show = 3

      await wrapper.vm.loadMore(mockState)

      expect(mockState.complete).toHaveBeenCalled()
    })

    it('calls state.complete on fetch error', async () => {
      const wrapper = createWrapper()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      mockLogsStore.list = []
      mockLogsStore.fetch.mockRejectedValue(new Error('Network error'))
      wrapper.vm.show = 0

      await wrapper.vm.loadMore(mockState)

      expect(mockState.complete).toHaveBeenCalled()
    })

    it('increments show counter when logs already in list', async () => {
      mockLogsStore.list = sampleLogs
      const wrapper = createWrapper()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      // show starts at 0, list has 3 items
      expect(wrapper.vm.show).toBe(0)

      await wrapper.vm.loadMore(mockState)

      expect(wrapper.vm.show).toBe(1)
      expect(mockState.loaded).toHaveBeenCalled()
      // Should NOT have called fetch since show < list.length
      expect(mockLogsStore.fetch).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles empty logs list', () => {
      mockLogsStore.list = []
      const wrapper = createWrapper()
      expect(wrapper.findAll('.mod-log')).toHaveLength(0)
    })

    it('handles null search param', async () => {
      mockLogsStore.params = { type: null, search: null }
      const wrapper = createWrapper()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      wrapper.vm.show = 0
      mockLogsStore.list = []
      await wrapper.vm.loadMore(mockState)

      expect(mockLogsStore.fetch).toHaveBeenCalledWith({
        limit: 50,
        groupid: null,
        logtype: null,
        search: null,
      })
    })
  })
})
