import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetch = vi.fn()
const mockDel = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    usersearch: {
      fetch: mockFetch,
      del: mockDel,
    },
  }),
}))

describe('search store', () => {
  let useSearchStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/search')
    useSearchStore = mod.useSearchStore
  })

  describe('initial state', () => {
    it('starts with empty list and no fetching', () => {
      const store = useSearchStore()
      expect(store.list).toEqual([])
      expect(store.fetching).toBeNull()
    })
  })

  describe('fetch', () => {
    it('fetches searches for a user', async () => {
      const store = useSearchStore()
      store.init({ public: {} })
      mockFetch.mockResolvedValue([{ id: 1, term: 'books' }])

      await store.fetch(42)
      expect(store.list).toEqual([{ id: 1, term: 'books' }])
      expect(mockFetch).toHaveBeenCalledWith(42)
    })

    it('deduplicates concurrent fetches', async () => {
      const store = useSearchStore()
      store.init({ public: {} })

      let resolveFirst
      mockFetch.mockReturnValueOnce(
        new Promise((r) => {
          resolveFirst = r
        })
      )

      const f1 = store.fetch(42)
      const f2 = store.fetch(42)

      resolveFirst([{ id: 1 }])
      await f1
      await f2

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('delete', () => {
    it('deletes search and refetches', async () => {
      const store = useSearchStore()
      store.init({ public: {} })
      mockDel.mockResolvedValue({})
      mockFetch.mockResolvedValue([])

      await store.delete(1, 42)
      expect(mockDel).toHaveBeenCalledWith(1)
      expect(mockFetch).toHaveBeenCalledWith(42)
    })
  })

  describe('get getter', () => {
    it('finds search by id', () => {
      const store = useSearchStore()
      store.list = [
        { id: 1, term: 'books' },
        { id: 2, term: 'chairs' },
      ]
      expect(store.get(2)).toEqual({ id: 2, term: 'chairs' })
    })

    it('returns undefined for unknown id', () => {
      const store = useSearchStore()
      store.list = [{ id: 1 }]
      expect(store.get(999)).toBeUndefined()
    })
  })
})
