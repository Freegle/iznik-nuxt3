import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetch = vi.fn()
const mockAdd = vi.fn()
const mockEdit = vi.fn()
const mockDel = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    tryst: {
      fetch: mockFetch,
      add: mockAdd,
      edit: mockEdit,
      delete: mockDel,
    },
  }),
}))

describe('tryst store', () => {
  let useTrystStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/tryst')
    useTrystStore = mod.useTrystStore
  })

  describe('initial state', () => {
    it('starts with empty list', () => {
      const store = useTrystStore()
      expect(store.list).toEqual([])
      expect(store.fetching).toBeNull()
    })
  })

  describe('fetch', () => {
    it('fetches and stores trysts', async () => {
      const store = useTrystStore()
      store.init({ public: {} })
      mockFetch.mockResolvedValue({
        trysts: [{ id: 1, user1: 10, user2: 20 }],
      })

      await store.fetch()
      expect(store.list).toHaveLength(1)
      expect(store.list[0].id).toBe(1)
    })

    it('deduplicates concurrent fetches', async () => {
      const store = useTrystStore()
      store.init({ public: {} })

      let resolveFirst
      const firstPromise = new Promise((r) => {
        resolveFirst = r
      })
      mockFetch.mockReturnValueOnce(firstPromise)

      const fetch1 = store.fetch()
      const fetch2 = store.fetch()

      resolveFirst({ trysts: [{ id: 1 }] })
      await fetch1
      await fetch2

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('add', () => {
    it('adds tryst and refetches', async () => {
      const store = useTrystStore()
      store.init({ public: {} })
      mockAdd.mockResolvedValue(99)
      mockFetch.mockResolvedValue({ trysts: [{ id: 99 }] })

      const id = await store.add(10, 20, '2026-05-01')
      expect(id).toBe(99)
      expect(mockAdd).toHaveBeenCalledWith({
        user1: 10,
        user2: 20,
        arrangedfor: '2026-05-01',
      })
      expect(mockFetch).toHaveBeenCalled()
    })

    it('does not refetch when add returns falsy', async () => {
      const store = useTrystStore()
      store.init({ public: {} })
      mockAdd.mockResolvedValue(null)

      await store.add(10, 20, '2026-05-01')
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('edit', () => {
    it('edits tryst and refetches', async () => {
      const store = useTrystStore()
      store.init({ public: {} })
      mockEdit.mockResolvedValue({})
      mockFetch.mockResolvedValue({ trysts: [] })

      await store.edit(1, '2026-06-01')
      expect(mockEdit).toHaveBeenCalledWith({
        id: 1,
        arrangedfor: '2026-06-01',
      })
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('deletes tryst and refetches', async () => {
      const store = useTrystStore()
      store.init({ public: {} })
      mockDel.mockResolvedValue({})
      mockFetch.mockResolvedValue({ trysts: [] })

      await store.delete(1)
      expect(mockDel).toHaveBeenCalledWith({ id: 1 })
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('get getter', () => {
    it('finds tryst by id', () => {
      const store = useTrystStore()
      store.list = [
        { id: 1, user1: 10, user2: 20 },
        { id: 2, user1: 30, user2: 40 },
      ]
      expect(store.get(2)).toEqual({ id: 2, user1: 30, user2: 40 })
    })

    it('returns undefined for unknown id', () => {
      const store = useTrystStore()
      store.list = [{ id: 1 }]
      expect(store.get(999)).toBeUndefined()
    })
  })

  describe('getByUser getter', () => {
    it('finds tryst where user is user1', () => {
      const store = useTrystStore()
      store.list = [{ id: 1, user1: 10, user2: 20 }]
      expect(store.getByUser(10)).toEqual({ id: 1, user1: 10, user2: 20 })
    })

    it('finds tryst where user is user2', () => {
      const store = useTrystStore()
      store.list = [{ id: 1, user1: 10, user2: 20 }]
      expect(store.getByUser(20)).toEqual({ id: 1, user1: 10, user2: 20 })
    })

    it('matches with string/number coercion', () => {
      const store = useTrystStore()
      store.list = [{ id: 1, user1: '10', user2: '20' }]
      expect(store.getByUser(10)).toBeDefined()
    })

    it('returns undefined when no match', () => {
      const store = useTrystStore()
      store.list = [{ id: 1, user1: 10, user2: 20 }]
      expect(store.getByUser(99)).toBeUndefined()
    })
  })
})
