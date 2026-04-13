import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetchOnev2 = vi.fn()
const mockFetchv2 = vi.fn()
const mockLog = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    job: {
      fetchOnev2: mockFetchOnev2,
      fetchv2: mockFetchv2,
      log: mockLog,
    },
  }),
}))

describe('job store', () => {
  let useJobStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/job')
    useJobStore = mod.useJobStore
  })

  describe('initial state', () => {
    it('starts with empty list and not blocked', () => {
      const store = useJobStore()
      expect(store.list).toEqual([])
      expect(store.blocked).toBe(false)
    })
  })

  describe('fetchOne', () => {
    it('fetches a single job by id', async () => {
      const store = useJobStore()
      store.init({ public: {} })
      mockFetchOnev2.mockResolvedValue({ id: 42, title: 'Dev' })

      const result = await store.fetchOne(42)
      expect(result).toEqual({ id: 42, title: 'Dev' })
      expect(mockFetchOnev2).toHaveBeenCalledWith(42, false)
    })

    it('sets blocked on error', async () => {
      const store = useJobStore()
      store.init({ public: {} })
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockFetchOnev2.mockRejectedValue(new Error('Ad blocked'))

      const result = await store.fetchOne(42)
      expect(result).toBeNull()
      expect(store.blocked).toBe(true)
      logSpy.mockRestore()
    })
  })

  describe('fetch', () => {
    it('fetches jobs list', async () => {
      const store = useJobStore()
      store.init({ public: {} })
      mockFetchv2.mockResolvedValue([{ id: 1 }, { id: 2 }])

      const result = await store.fetch(51.5, -0.1)
      expect(result).toHaveLength(2)
      expect(store.list).toHaveLength(2)
    })

    it('returns cached list without refetching', async () => {
      const store = useJobStore()
      store.init({ public: {} })
      store.list = [{ id: 1 }]

      const result = await store.fetch(51.5, -0.1)
      expect(result).toHaveLength(1)
      expect(mockFetchv2).not.toHaveBeenCalled()
    })

    it('refetches when force=true', async () => {
      const store = useJobStore()
      store.init({ public: {} })
      store.list = [{ id: 1 }]
      mockFetchv2.mockResolvedValue([{ id: 1 }, { id: 2 }])

      const result = await store.fetch(51.5, -0.1, null, true)
      expect(result).toHaveLength(2)
    })

    it('deduplicates concurrent fetches', async () => {
      const store = useJobStore()
      store.init({ public: {} })

      let resolveFirst
      mockFetchv2.mockReturnValueOnce(
        new Promise((r) => {
          resolveFirst = r
        })
      )

      const f1 = store.fetch(51.5, -0.1, null, true)
      const f2 = store.fetch(51.5, -0.1, null, true)

      resolveFirst([{ id: 1 }])
      await f1
      await f2

      expect(mockFetchv2).toHaveBeenCalledTimes(1)
    })

    it('sets blocked on error', async () => {
      const store = useJobStore()
      store.init({ public: {} })
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockFetchv2.mockRejectedValue(new Error('Ad blocked'))

      await store.fetch(51.5, -0.1)
      expect(store.blocked).toBe(true)
      logSpy.mockRestore()
    })

    it('passes category parameter', async () => {
      const store = useJobStore()
      store.init({ public: {} })
      mockFetchv2.mockResolvedValue([])

      await store.fetch(51.5, -0.1, 'tech')
      expect(mockFetchv2).toHaveBeenCalledWith(51.5, -0.1, 'tech')
    })
  })

  describe('log', () => {
    it('calls API log', () => {
      const store = useJobStore()
      store.init({ public: {} })
      store.log({ action: 'click', jobid: 1 })
      expect(mockLog).toHaveBeenCalledWith({ action: 'click', jobid: 1 })
    })
  })

  describe('byId getter', () => {
    it('finds job by id', () => {
      const store = useJobStore()
      store.list = [{ id: 1 }, { id: 2, title: 'Dev' }]
      expect(store.byId(2)).toEqual({ id: 2, title: 'Dev' })
    })

    it('returns undefined for unknown id', () => {
      const store = useJobStore()
      store.list = [{ id: 1 }]
      expect(store.byId(999)).toBeUndefined()
    })
  })
})
