import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetchGroupsMT = vi.fn()
const mockFetchWork = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    group: {
      fetchGroupsMT: mockFetchGroupsMT,
      fetchWork: mockFetchWork,
    },
  }),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    groups: [],
    user: null,
  }),
}))

describe('modgroup store', () => {
  let useModGroupStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/modtools/stores/modgroup')
    useModGroupStore = mod.useModGroupStore
  })

  describe('fetchGroupsMTBatch', () => {
    it('chunks large ID lists to avoid URL length limits', async () => {
      const store = useModGroupStore()
      store.config = {}

      // Generate 60 group IDs — exceeds the 25-ID chunk size
      const ids = Array.from({ length: 60 }, (_, i) => i + 1)

      mockFetchGroupsMT.mockResolvedValue([])

      await store.fetchGroupsMTBatch(ids)

      // Should have made 3 calls: [1..25], [26..50], [51..60]
      expect(mockFetchGroupsMT).toHaveBeenCalledTimes(3)
      expect(mockFetchGroupsMT.mock.calls[0][0]).toHaveLength(25)
      expect(mockFetchGroupsMT.mock.calls[1][0]).toHaveLength(25)
      expect(mockFetchGroupsMT.mock.calls[2][0]).toHaveLength(10)
    })

    it('makes a single call when IDs fit within chunk size', async () => {
      const store = useModGroupStore()
      store.config = {}

      const ids = [1, 2, 3]
      mockFetchGroupsMT.mockResolvedValue([
        { id: 1, nameshort: 'G1' },
        { id: 2, nameshort: 'G2' },
        { id: 3, nameshort: 'G3' },
      ])

      await store.fetchGroupsMTBatch(ids)

      expect(mockFetchGroupsMT).toHaveBeenCalledTimes(1)
      expect(mockFetchGroupsMT).toHaveBeenCalledWith(
        [1, 2, 3],
        true,
        true,
        true,
        true
      )
      expect(store.list[1].nameshort).toBe('G1')
      expect(store.list[2].nameshort).toBe('G2')
    })

    it('does nothing for empty ID list', async () => {
      const store = useModGroupStore()
      store.config = {}

      await store.fetchGroupsMTBatch([])

      expect(mockFetchGroupsMT).not.toHaveBeenCalled()
    })
  })
})
