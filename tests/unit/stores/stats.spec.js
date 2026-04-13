import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockDashboardFetch = vi.fn()
const mockFetchHeatmap = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    dashboard: {
      fetch: mockDashboardFetch,
      fetchHeatmap: mockFetchHeatmap,
    },
  }),
}))

describe('stats store', () => {
  let useStatsStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/stats')
    useStatsStore = mod.useStatsStore
  })

  describe('initial state', () => {
    it('starts with empty heatmap', () => {
      const store = useStatsStore()
      expect(store.heatmap).toEqual({})
    })
  })

  describe('fetch', () => {
    it('spreads fetched stats onto store', async () => {
      const store = useStatsStore()
      store.init({ public: {} })
      mockDashboardFetch.mockResolvedValue({
        ApprovedMessageCount: 100,
        Weight: 5000,
      })

      await store.fetch({ groupid: 1 })
      expect(store.ApprovedMessageCount).toBe(100)
      expect(store.Weight).toBe(5000)
    })
  })

  describe('fetchHeatmap', () => {
    it('fetches and stores heatmap data', async () => {
      const store = useStatsStore()
      store.init({ public: {} })
      const heatmapData = { points: [{ lat: 51.5, lng: -0.1, count: 10 }] }
      mockFetchHeatmap.mockResolvedValue(heatmapData)

      const result = await store.fetchHeatmap()
      expect(result).toEqual(heatmapData)
      expect(store.heatmap).toEqual(heatmapData)
    })
  })

  describe('clear', () => {
    it('resets store to initial state', async () => {
      const store = useStatsStore()
      store.init({ public: {} })
      store.heatmap = { points: [1, 2, 3] }

      store.clear()
      expect(store.heatmap).toEqual({})
    })
  })
})
