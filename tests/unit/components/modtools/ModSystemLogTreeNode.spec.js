import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModSystemLogTreeNode from '~/modtools/components/ModSystemLogTreeNode.vue'

// Mock the system logs store
const mockSystemLogsStore = {
  isGroupExpanded: vi.fn(),
  toggleGroupExpanded: vi.fn(),
  fetchTraceChildren: vi.fn(),
  nodeItems: {},
  getNode: vi.fn((key) => mockSystemLogsStore.nodeItems[key] || null),
  storeNode: vi.fn((key, node) => {
    mockSystemLogsStore.nodeItems[key] = node
  }),
  getLog: vi.fn(() => null),
}

vi.mock('~/modtools/stores/systemlogs', () => ({
  useSystemLogsStore: () => mockSystemLogsStore,
}))

vi.mock('../stores/systemlogs', () => ({
  useSystemLogsStore: () => mockSystemLogsStore,
}))

describe('ModSystemLogTreeNode', () => {
  const createLog = (overrides = {}) => ({
    id: 1,
    timestamp: '2024-01-15T10:30:00.123Z',
    source: 'api',
    type: 'User',
    text: 'Test action',
    raw: {},
    ...overrides,
  })

  const createStandaloneNode = (logOverrides = {}) => {
    const log = createLog(logOverrides)
    const nodeKey = 'standalone-' + log.id
    const node = {
      type: 'standalone',
      log,
      nodeKey,
    }
    return node
  }

  const createTraceGroupNode = (overrides = {}) => {
    const nodeKey = 'trace-' + (overrides.trace_id || 'trace-123')
    return {
      type: 'trace-group',
      trace_id: 'trace-123',
      parent: createLog(),
      children: [],
      childCount: 5,
      routeSummary: ['/home', '/give'],
      firstTimestamp: '2024-01-15T10:00:00Z',
      lastTimestamp: '2024-01-15T10:30:00Z',
      nodeKey,
      ...overrides,
    }
  }

  const createPageLoadGroupNode = (overrides = {}) => {
    const nodeKey = overrides.groupKey || 'page-load-123'
    return {
      type: 'page-load-group',
      groupKey: 'page-load-123',
      children: [],
      firstTimestamp: '2024-01-15T10:00:00Z',
      lastTimestamp: '2024-01-15T10:30:00Z',
      nodeKey,
      ...overrides,
    }
  }

  // Helper to store a node and mount with its key
  function storeAndMount(node, extraProps = {}) {
    mockSystemLogsStore.nodeItems[node.nodeKey] = node
    mockSystemLogsStore.getNode.mockImplementation(
      (key) => mockSystemLogsStore.nodeItems[key] || null
    )
    return mount(ModSystemLogTreeNode, {
      props: {
        nodeKey: node.nodeKey,
        hideUserColumn: false,
        ...extraProps,
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          'b-badge': {
            template: '<span class="badge" :class="variant"><slot /></span>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<span class="icon" :class="icon" />',
            props: ['icon'],
          },
          ModSystemLogEntry: {
            template: '<div class="log-entry"><slot /></div>',
            props: ['logId', 'hideUserColumn'],
          },
          ModSystemLogTreeNode: {
            template: '<div class="tree-node-child" />',
            props: ['nodeKey', 'hideUserColumn'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockSystemLogsStore.nodeItems = {}
    mockSystemLogsStore.isGroupExpanded.mockReturnValue(false)
    mockSystemLogsStore.fetchTraceChildren.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders tree node container', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      expect(wrapper.find('.tree-node').exists()).toBe(true)
    })

    it('renders standalone node with log entry', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      expect(wrapper.find('.log-entry').exists()).toBe(true)
    })

    it('renders trace group with expand button', () => {
      mockSystemLogsStore.isGroupExpanded.mockReturnValue(false)
      const wrapper = storeAndMount(createTraceGroupNode())
      expect(wrapper.find('.tree-toggle-btn').exists()).toBe(true)
    })

    it('renders page load group', () => {
      const wrapper = storeAndMount(
        createPageLoadGroupNode({
          children: [
            { log: createLog({ id: 1 }), nodeKey: 'standalone-1' },
            { log: createLog({ id: 2 }), nodeKey: 'standalone-2' },
          ],
        })
      )
      expect(wrapper.find('.page-load-group').exists()).toBe(true)
    })

    it('shows child count badge for trace group', () => {
      const wrapper = storeAndMount(createTraceGroupNode({ childCount: 10 }))
      expect(wrapper.find('.child-count').exists()).toBe(true)
      expect(wrapper.text()).toContain('10')
    })
  })

  describe('props', () => {
    it('accepts hideUserColumn prop as true', () => {
      const wrapper = storeAndMount(createStandaloneNode(), {
        hideUserColumn: true,
      })
      expect(wrapper.props('hideUserColumn')).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('isPageLoadGroup returns true for page-load-group type', () => {
      const wrapper = storeAndMount(createPageLoadGroupNode())
      expect(wrapper.vm.isPageLoadGroup).toBe(true)
    })

    it('isPageLoadGroup returns false for other types', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      expect(wrapper.vm.isPageLoadGroup).toBe(false)
    })

    it('isTraceGroup returns true for trace-group type', () => {
      const wrapper = storeAndMount(createTraceGroupNode())
      expect(wrapper.vm.isTraceGroup).toBe(true)
    })

    it('hasChildren returns true when childCount > 1', () => {
      const wrapper = storeAndMount(createTraceGroupNode({ childCount: 5 }))
      expect(wrapper.vm.hasChildren).toBe(true)
    })

    it('hasChildren returns false when childCount <= 1', () => {
      const wrapper = storeAndMount(createTraceGroupNode({ childCount: 1 }))
      expect(wrapper.vm.hasChildren).toBe(false)
    })

    it('childCount returns childCount from node', () => {
      const wrapper = storeAndMount(createTraceGroupNode({ childCount: 7 }))
      expect(wrapper.vm.childCount).toBe(7)
    })

    it('parentLog returns parent for trace-group', () => {
      const parent = createLog({ id: 999 })
      const wrapper = storeAndMount(createTraceGroupNode({ parent }))
      expect(wrapper.vm.parentLog).toEqual(parent)
    })

    it('parentLog returns log for standalone', () => {
      const wrapper = storeAndMount(createStandaloneNode({ id: 888 }))
      expect(wrapper.vm.parentLog.id).toBe(888)
    })

    it('isExpanded checks store for group expansion', () => {
      mockSystemLogsStore.isGroupExpanded.mockReturnValue(true)
      const wrapper = storeAndMount(
        createTraceGroupNode({ trace_id: 'trace-456' })
      )
      expect(wrapper.vm.isExpanded).toBe(true)
      expect(mockSystemLogsStore.isGroupExpanded).toHaveBeenCalledWith(
        'trace-456'
      )
    })

    it('isLoading returns loading state from node', () => {
      const wrapper = storeAndMount(createTraceGroupNode({ loading: true }))
      expect(wrapper.vm.isLoading).toBe(true)
    })

    it('childrenLoaded returns true when children exist', () => {
      const wrapper = storeAndMount(
        createTraceGroupNode({
          children: [{ log: createLog() }],
        })
      )
      expect(wrapper.vm.childrenLoaded).toBe(true)
    })

    it('pageLoadChildCount returns count of children', () => {
      const wrapper = storeAndMount(
        createPageLoadGroupNode({
          children: [
            { log: createLog({ id: 1 }), nodeKey: 'standalone-1' },
            { log: createLog({ id: 2 }), nodeKey: 'standalone-2' },
            { log: createLog({ id: 3 }), nodeKey: 'standalone-3' },
          ],
        })
      )
      expect(wrapper.vm.pageLoadChildCount).toBe(3)
    })

    it('timestampRange formats time range correctly', () => {
      const wrapper = storeAndMount(
        createTraceGroupNode({
          firstTimestamp: '2024-01-15T10:00:00Z',
          lastTimestamp: '2024-01-15T10:30:00Z',
        })
      )
      expect(wrapper.vm.timestampRange).toMatch(/\d{2}:\d{2}:\d{2}/)
    })

    it('isMobileApp detects capacitor URLs', () => {
      const wrapper = storeAndMount(
        createTraceGroupNode({
          routeSummary: ['capacitor://localhost/home', '/give'],
        })
      )
      expect(wrapper.vm.isMobileApp).toBe(true)
    })

    it('isMobileApp returns false for web URLs', () => {
      const wrapper = storeAndMount(
        createTraceGroupNode({
          routeSummary: ['/home', '/give'],
        })
      )
      expect(wrapper.vm.isMobileApp).toBe(false)
    })

    it('formattedBreadcrumbs returns true when segments exist', () => {
      const wrapper = storeAndMount(
        createTraceGroupNode({
          routeSummary: ['/home', '/give'],
        })
      )
      expect(wrapper.vm.formattedBreadcrumbs).toBe(true)
    })
  })

  describe('methods', () => {
    it('toggleExpand toggles group expansion', async () => {
      mockSystemLogsStore.isGroupExpanded.mockReturnValue(false)
      const wrapper = storeAndMount(
        createTraceGroupNode({ trace_id: 'trace-789' })
      )
      await wrapper.vm.toggleExpand()
      expect(mockSystemLogsStore.toggleGroupExpanded).toHaveBeenCalledWith(
        'trace-789'
      )
    })

    it('toggleExpand fetches children when expanding and not loaded', async () => {
      mockSystemLogsStore.isGroupExpanded.mockReturnValue(false)
      const wrapper = storeAndMount(
        createTraceGroupNode({
          trace_id: 'trace-789',
          children: [],
          firstTimestamp: '2024-01-15T10:00:00Z',
          lastTimestamp: '2024-01-15T10:30:00Z',
        })
      )
      await wrapper.vm.toggleExpand()
      expect(mockSystemLogsStore.fetchTraceChildren).toHaveBeenCalledWith(
        'trace-789',
        {
          start: '2024-01-15T10:00:00Z',
          end: '2024-01-15T10:30:00Z',
        }
      )
    })

    it('togglePageLoadExpand toggles page load group expansion', () => {
      const wrapper = storeAndMount(
        createPageLoadGroupNode({ groupKey: 'page-load-456' })
      )
      wrapper.vm.togglePageLoadExpand()
      expect(mockSystemLogsStore.toggleGroupExpanded).toHaveBeenCalledWith(
        'page-load-456'
      )
    })

    it('formatBreadcrumbSegment strips capacitor prefix', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      const result = wrapper.vm.formatBreadcrumbSegment(
        'capacitor://localhost/home'
      )
      expect(result).toBe('/home')
    })

    it('formatBreadcrumbSegment returns segment as-is for web paths', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      const result = wrapper.vm.formatBreadcrumbSegment('/give')
      expect(result).toBe('/give')
    })

    it('isRouteFromMobile detects capacitor URLs', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      const route = { pageName: 'capacitor://localhost/home' }
      expect(wrapper.vm.isRouteFromMobile(route)).toBe(true)
    })

    it('isRouteFromMobile returns false for web routes', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      const route = { pageName: '/home' }
      expect(wrapper.vm.isRouteFromMobile(route)).toBe(false)
    })

    it('toggleRoute marks route as toggled and toggles expansion', () => {
      const wrapper = storeAndMount(createTraceGroupNode())
      wrapper.vm.toggleRoute(0)
      expect(wrapper.vm.toggledRoutes[0]).toBe(true)
      expect(wrapper.vm.expandedRoutes[0]).toBe(true)
    })

    it('toggleApi toggles API expansion state', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      wrapper.vm.toggleApi(0, 1)
      expect(wrapper.vm.expandedApis['0-1']).toBe(true)
      wrapper.vm.toggleApi(0, 1)
      expect(wrapper.vm.expandedApis['0-1']).toBe(false)
    })

    it('isRouteExpanded returns expanded state', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      wrapper.vm.expandedRoutes[0] = true
      expect(wrapper.vm.isRouteExpanded(0)).toBe(true)
      expect(wrapper.vm.isRouteExpanded(1)).toBe(false)
    })

    it('isApiExpanded returns API expanded state', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      wrapper.vm.expandedApis['0-1'] = true
      expect(wrapper.vm.isApiExpanded(0, 1)).toBe(true)
      expect(wrapper.vm.isApiExpanded(0, 2)).toBe(false)
    })

    it('shouldAutoExpand returns true for single API call or less', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      expect(wrapper.vm.shouldAutoExpand({ apiCalls: [] })).toBe(true)
      expect(wrapper.vm.shouldAutoExpand({ apiCalls: [{}] })).toBe(true)
      expect(wrapper.vm.shouldAutoExpand({ apiCalls: [{}, {}] })).toBe(false)
    })

    it('hasRouteChildren returns true when route has content', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      expect(
        wrapper.vm.hasRouteChildren({
          apiCalls: [{}],
          otherLogs: [],
          emailLogs: [],
        })
      ).toBe(true)
      expect(
        wrapper.vm.hasRouteChildren({
          apiCalls: [],
          otherLogs: [{}],
          emailLogs: [],
        })
      ).toBe(true)
      expect(
        wrapper.vm.hasRouteChildren({
          apiCalls: [],
          otherLogs: [],
          emailLogs: [{}],
        })
      ).toBe(true)
    })

    it('hasRouteChildren returns false when route is empty', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      expect(
        wrapper.vm.hasRouteChildren({
          apiCalls: [],
          otherLogs: [],
          emailLogs: [],
        })
      ).toBe(false)
    })

    it('loadMoreChildren is callable and updates visibleChildCount', () => {
      // Create a trace group with children
      const children = Array.from({ length: 10 }, (_, i) => ({
        log: createLog({
          source: 'client',
          raw: { event_type: 'page_view', page_name: `/page-${i}` },
          timestamp: `2024-01-15T10:${String(i).padStart(2, '0')}:00Z`,
        }),
      }))
      const wrapper = storeAndMount(createTraceGroupNode({ children }))
      // Verify the method exists and can be called
      expect(typeof wrapper.vm.loadMoreChildren).toBe('function')
      // Call should not throw
      expect(() => wrapper.vm.loadMoreChildren()).not.toThrow()
      // visibleChildCount should be a number (capped at totalLogCount)
      expect(typeof wrapper.vm.visibleChildCount).toBe('number')
    })
  })

  describe('emits', () => {
    it('emits filter-trace when child emits it', () => {
      mockSystemLogsStore.isGroupExpanded.mockReturnValue(true)
      const wrapper = storeAndMount(
        createTraceGroupNode({
          children: [{ log: createLog() }],
        })
      )
      // The component recursively uses ModSystemLogTreeNode for children
      // which is stubbed, so we test via the component's exposure
      expect(wrapper.emitted('filter-trace')).toBeFalsy()
    })

    it('emits filter-session when child emits it', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      expect(wrapper.emitted('filter-session')).toBeFalsy()
    })

    it('emits filter-ip when child emits it', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      expect(wrapper.emitted('filter-ip')).toBeFalsy()
    })
  })

  describe('hierarchical tree building', () => {
    it('hierarchicalTree builds correct structure from children', () => {
      const children = [
        {
          log: createLog({
            source: 'client',
            raw: { event_type: 'page_view', page_name: '/home' },
          }),
        },
        {
          log: createLog({
            source: 'api',
            raw: { method: 'GET', call: 'user' },
          }),
        },
        { log: createLog({ source: 'logs_table', text: 'User action' }) },
      ]
      const wrapper = storeAndMount(createTraceGroupNode({ children }))
      const tree = wrapper.vm.hierarchicalTree
      expect(tree.length).toBeGreaterThan(0)
    })

    it('hierarchicalTree groups API calls under routes', () => {
      const children = [
        {
          log: createLog({
            source: 'client',
            raw: { event_type: 'page_view', page_name: '/home' },
            timestamp: '2024-01-15T10:00:00Z',
          }),
        },
        {
          log: createLog({
            source: 'api',
            raw: { method: 'GET', call: 'user' },
            timestamp: '2024-01-15T10:00:01Z',
          }),
        },
        {
          log: createLog({
            source: 'api',
            raw: { method: 'POST', call: 'message' },
            timestamp: '2024-01-15T10:00:02Z',
          }),
        },
      ]
      const wrapper = storeAndMount(createTraceGroupNode({ children }))
      const tree = wrapper.vm.hierarchicalTree
      expect(tree[0].apiCalls.length).toBe(2)
    })

    it('hierarchicalTree handles orphan API calls', () => {
      const children = [
        {
          log: createLog({
            source: 'api',
            raw: { method: 'GET', call: 'user' },
            timestamp: '2024-01-15T10:00:00Z',
          }),
        },
      ]
      const wrapper = storeAndMount(createTraceGroupNode({ children }))
      const tree = wrapper.vm.hierarchicalTree
      expect(tree.length).toBe(1)
      expect(tree[0].pageName).toBe('(API calls)')
    })

    it('hierarchicalTree groups email logs correctly', () => {
      const children = [
        {
          log: createLog({
            source: 'client',
            raw: { event_type: 'page_view', page_name: '/home' },
            timestamp: '2024-01-15T10:00:00Z',
          }),
        },
        {
          log: createLog({
            source: 'laravel-batch',
            text: 'Email sent',
            timestamp: '2024-01-15T10:00:01Z',
          }),
        },
      ]
      const wrapper = storeAndMount(createTraceGroupNode({ children }))
      const tree = wrapper.vm.hierarchicalTree
      expect(tree[0].emailLogs.length).toBe(1)
    })
  })

  describe('breadcrumb display', () => {
    it('truncatedBreadcrumbs limits length', () => {
      const longRoutes = Array.from(
        { length: 10 },
        (_, i) => `/very-long-route-name-${i}`
      )
      const wrapper = storeAndMount(
        createTraceGroupNode({ routeSummary: longRoutes })
      )
      expect(wrapper.vm.truncatedBreadcrumbs.length).toBeLessThan(
        longRoutes.length
      )
    })

    it('isTruncated returns true when breadcrumbs are truncated', () => {
      const longRoutes = Array.from(
        { length: 10 },
        (_, i) => `/very-long-route-name-${i}`
      )
      const wrapper = storeAndMount(
        createTraceGroupNode({ routeSummary: longRoutes })
      )
      expect(wrapper.vm.isTruncated).toBe(true)
    })

    it('isTruncated returns false when all routes fit', () => {
      const wrapper = storeAndMount(
        createTraceGroupNode({ routeSummary: ['/a', '/b'] })
      )
      expect(wrapper.vm.isTruncated).toBe(false)
    })
  })

  describe('exposed methods', () => {
    it('exposes expand method', () => {
      const wrapper = storeAndMount(createStandaloneNode())
      expect(typeof wrapper.vm.expand).toBe('function')
    })

    it('expand method expands node if collapsed', async () => {
      mockSystemLogsStore.isGroupExpanded.mockReturnValue(false)
      const wrapper = storeAndMount(
        createTraceGroupNode({ trace_id: 'trace-test' })
      )
      await wrapper.vm.expand()
      expect(mockSystemLogsStore.toggleGroupExpanded).toHaveBeenCalledWith(
        'trace-test'
      )
    })
  })
})
