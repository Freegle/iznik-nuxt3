import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MicrovolunteeringPage from '~/modtools/pages/members/microvolunteering/[[id]].vue'

// Mock dayjs
vi.mock('dayjs', () => {
  const mockDayjs = (date) => ({
    subtract: vi.fn().mockReturnThis(),
    format: vi.fn().mockReturnValue('2024-01-01'),
  })
  mockDayjs.extend = vi.fn()
  return { default: mockDayjs }
})

// Mock microvolunteering store
const mockMicroVolunteeringStore = {
  list: {},
  fetch: vi.fn().mockResolvedValue({}),
  clear: vi.fn(),
}

vi.mock('~/stores/microvolunteering', () => ({
  useMicroVolunteeringStore: () => mockMicroVolunteeringStore,
}))

describe('members/microvolunteering/[[id]].vue page', () => {
  function mountComponent() {
    return mount(MicrovolunteeringPage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'client-only': {
            template: '<div><slot /></div>',
          },
          ScrollToTop: {
            template: '<div class="scroll-to-top" />',
          },
          ModHelpMicrovolunteering: {
            template: '<div class="mod-help-microvolunteering" />',
          },
          ModGroupSelect: {
            template: '<div class="mod-group-select" />',
            props: ['modelValue', 'modonly', 'all', 'remember', 'disabled'],
          },
          ModMicrovolunteeringDetailsButton: {
            template: '<div class="mod-microvol-details" />',
            props: ['user', 'items'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          'b-img': {
            template: '<img />',
            props: ['src', 'alt', 'lazy'],
          },
          'b-table-simple': {
            template: '<table class="b-table-simple"><slot /></table>',
          },
          'b-thead': {
            template: '<thead><slot /></thead>',
          },
          'b-tbody': {
            template: '<tbody><slot /></tbody>',
          },
          'b-tr': {
            template: '<tr><slot /></tr>',
          },
          'b-th': {
            template: '<th><slot /></th>',
          },
          'b-td': {
            template: '<td><slot /></td>',
          },
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon', 'scale'],
          },
          GChart: {
            template: '<div class="gchart" />',
            props: ['type', 'data', 'options'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockMicroVolunteeringStore.list = {}
  })

  describe('rendering', () => {
    it('shows please choose community message when no groupid', async () => {
      const wrapper = mountComponent()
      wrapper.vm.groupid = 0
      wrapper.vm.busy = false
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Please choose a community')
    })

    it('shows loader when busy', async () => {
      const wrapper = mountComponent()
      wrapper.vm.busy = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('img').exists()).toBe(true)
    })
  })

  describe('initial state', () => {
    it('clears store and fetches on mount', async () => {
      mountComponent()
      await flushPromises()
      expect(mockMicroVolunteeringStore.clear).toHaveBeenCalled()
    })
  })

  describe('computed properties', () => {
    it('activityOptions returns chart configuration', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.activityOptions).toHaveProperty('interpolateNulls')
      expect(wrapper.vm.activityOptions).toHaveProperty('legend')
      expect(wrapper.vm.activityOptions).toHaveProperty('vAxis')
    })

    it('items returns sorted list from store', () => {
      mockMicroVolunteeringStore.list = {
        1: { id: 1, timestamp: '2024-01-15T10:00:00Z' },
        2: { id: 2, timestamp: '2024-01-20T10:00:00Z' },
      }
      const wrapper = mountComponent()
      const items = wrapper.vm.items
      // Items should be sorted by timestamp descending
      expect(items).toHaveLength(2)
      expect(items[0].id).toBe(2) // More recent first
    })

    it('userCounts counts items per user', () => {
      mockMicroVolunteeringStore.list = {
        1: { id: 1, timestamp: '2024-01-15T10:00:00Z', user: { id: 100 } },
        2: { id: 2, timestamp: '2024-01-20T10:00:00Z', user: { id: 100 } },
        3: { id: 3, timestamp: '2024-01-18T10:00:00Z', user: { id: 200 } },
      }
      const wrapper = mountComponent()
      const counts = wrapper.vm.userCounts
      expect(counts).toHaveLength(2)
      // User 100 should be first with count 2
      expect(counts[0].userid).toBe('100')
      expect(counts[0].count).toBe(2)
    })

    it('topUsers returns top 10 users', () => {
      mockMicroVolunteeringStore.list = {
        1: { id: 1, timestamp: '2024-01-15T10:00:00Z', user: { id: 100 } },
      }
      const wrapper = mountComponent()
      const topUsers = wrapper.vm.topUsers
      expect(topUsers.length).toBeLessThanOrEqual(10)
    })

    it('userActivity groups items by user', () => {
      mockMicroVolunteeringStore.list = {
        1: { id: 1, timestamp: '2024-01-15T10:00:00Z', user: { id: 100 } },
        2: { id: 2, timestamp: '2024-01-20T10:00:00Z', user: { id: 100 } },
      }
      const wrapper = mountComponent()
      const activity = wrapper.vm.userActivity
      expect(activity[100]).toHaveLength(2)
    })
  })

  describe('watchers', () => {
    it('clears store and fetches when groupid changes', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      vi.clearAllMocks()

      wrapper.vm.groupid = 123
      await wrapper.vm.$nextTick()

      expect(mockMicroVolunteeringStore.clear).toHaveBeenCalled()
    })
  })

  describe('methods', () => {
    describe('fetch', () => {
      it('fetches data when groupid is set', async () => {
        const wrapper = mountComponent()
        wrapper.vm.groupid = 123
        await wrapper.vm.fetch()

        expect(mockMicroVolunteeringStore.fetch).toHaveBeenCalledWith(
          expect.objectContaining({
            list: true,
            groupid: 123,
            limit: 10000,
          })
        )
      })

      it('does not fetch when groupid is 0', async () => {
        const wrapper = mountComponent()
        wrapper.vm.groupid = 0
        vi.clearAllMocks()
        await wrapper.vm.fetch()

        expect(mockMicroVolunteeringStore.fetch).not.toHaveBeenCalled()
      })
    })

    describe('activityData', () => {
      it('returns chart data array', () => {
        const wrapper = mountComponent()
        const data = [
          { timestamp: '2024-01-15T10:00:00Z' },
          { timestamp: '2024-01-15T11:00:00Z' },
        ]
        const result = wrapper.vm.activityData(data)
        expect(result[0]).toEqual(['Date', 'Count'])
        expect(result.length).toBeGreaterThan(1)
      })
    })

    describe('accuracy calculations', () => {
      it('accuracy returns right and wrong counts', () => {
        const wrapper = mountComponent()
        const data = [
          { score_positive: true, score_negative: false },
          { score_positive: true, score_negative: false },
          { score_positive: false, score_negative: true },
        ]
        const result = wrapper.vm.accuracy(data)
        expect(result).toEqual([2, 1])
      })

      it('accuracyPercentage returns percentage', () => {
        const wrapper = mountComponent()
        const data = [
          { score_positive: true, score_negative: false },
          { score_positive: true, score_negative: false },
          { score_positive: false, score_negative: true },
        ]
        const result = wrapper.vm.accuracyPercentage(data)
        expect(result).toBe(67) // 2/3 = 67%
      })

      it('accuracyTotal returns total scored items', () => {
        const wrapper = mountComponent()
        const data = [
          { score_positive: true, score_negative: false },
          { score_positive: true, score_negative: false },
          { score_positive: false, score_negative: true },
        ]
        const result = wrapper.vm.accuracyTotal(data)
        expect(result).toBe(3)
      })
    })
  })
})
