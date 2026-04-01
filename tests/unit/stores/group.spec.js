import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetch = vi.fn()
const mockFetchBatch = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    group: {
      fetch: mockFetch,
      fetchBatch: mockFetchBatch,
    },
  }),
}))

describe('group store', () => {
  let useGroupStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/group')
    useGroupStore = mod.useGroupStore
  })

  describe('fetchBatch', () => {
    it('fetches multiple groups in one call and stores them', async () => {
      const store = useGroupStore()
      store.config = {}

      mockFetchBatch.mockResolvedValue([
        { id: 1, nameshort: 'Group1', settings: {} },
        { id: 2, nameshort: 'Group2', settings: {} },
        { id: 3, nameshort: 'Group3', settings: {} },
      ])

      await store.fetchBatch([1, 2, 3])

      expect(mockFetchBatch).toHaveBeenCalledWith([1, 2, 3])
      expect(store.list[1].nameshort).toBe('Group1')
      expect(store.list[2].nameshort).toBe('Group2')
      expect(store.list[3].nameshort).toBe('Group3')
    })

    it('skips groups already in the store with settings', async () => {
      const store = useGroupStore()
      store.config = {}
      store.list[1] = { id: 1, nameshort: 'Existing', settings: { foo: 1 } }

      mockFetchBatch.mockResolvedValue([
        { id: 2, nameshort: 'Group2', settings: {} },
      ])

      await store.fetchBatch([1, 2])

      // Should only fetch id 2, not id 1
      expect(mockFetchBatch).toHaveBeenCalledWith([2])
      expect(store.list[1].nameshort).toBe('Existing')
      expect(store.list[2].nameshort).toBe('Group2')
    })

    it('does nothing if all groups are cached', async () => {
      const store = useGroupStore()
      store.config = {}
      store.list[1] = { id: 1, settings: {} }
      store.list[2] = { id: 2, settings: {} }

      await store.fetchBatch([1, 2])

      expect(mockFetchBatch).not.toHaveBeenCalled()
    })

    it('handles empty response', async () => {
      const store = useGroupStore()
      store.config = {}

      mockFetchBatch.mockResolvedValue([])

      await store.fetchBatch([999])

      expect(mockFetchBatch).toHaveBeenCalledWith([999])
      expect(store.list[999]).toBeUndefined()
    })
  })
})
