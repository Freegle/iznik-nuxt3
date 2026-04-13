import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetchv2 = vi.fn()
const mockFetchMessages = vi.fn()
const mockDel = vi.fn()
const mockAddIso = vi.fn()
const mockPatch = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    isochrone: {
      fetchv2: mockFetchv2,
      fetchMessages: mockFetchMessages,
      del: mockDel,
      add: mockAddIso,
      patch: mockPatch,
    },
  }),
}))

vi.mock('wicket', () => {
  class MockWkt {
    read() {}
    toObject() {
      return {
        getBounds: () => ({
          getSouthWest: () => ({ lat: 51.0, lng: -1.0 }),
          getNorthEast: () => ({ lat: 52.0, lng: 0.0 }),
        }),
      }
    }
  }
  return { default: { Wkt: MockWkt } }
})

describe('isochrone store', () => {
  let useIsochroneStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/isochrone')
    useIsochroneStore = mod.useIsochroneStore
  })

  describe('initial state', () => {
    it('starts with empty list and messageList', () => {
      const store = useIsochroneStore()
      expect(store.list).toEqual([])
      expect(store.messageList).toEqual([])
      expect(store.bounds).toBeNull()
      expect(store.fetchingMessages).toBeNull()
      expect(store.fetchingIsochrones).toBeNull()
    })
  })

  describe('init', () => {
    it('sets config', () => {
      const store = useIsochroneStore()
      store.init({ public: {} })
      expect(store.config).toEqual({ public: {} })
    })
  })

  describe('fetch', () => {
    let store

    beforeEach(() => {
      store = useIsochroneStore()
      store.init({ public: {} })
    })

    it('fetches isochrones and computes bounds', async () => {
      mockFetchv2.mockResolvedValue([
        { id: 1, polygon: 'POLYGON((...))', transport: 'Walk', minutes: 30 },
      ])

      const result = await store.fetch()
      expect(result).toHaveLength(1)
      expect(store.list).toHaveLength(1)
      expect(store.bounds).toBeDefined()
    })

    it('returns cached list without refetching', async () => {
      store.list = [{ id: 1, polygon: 'POLYGON((...))' }]

      const result = await store.fetch()
      expect(result).toHaveLength(1)
      expect(mockFetchv2).not.toHaveBeenCalled()
    })

    it('refetches when force=true', async () => {
      store.list = [{ id: 1, polygon: 'POLYGON((...))' }]
      mockFetchv2.mockResolvedValue([
        { id: 1, polygon: 'POLYGON((...))' },
        { id: 2, polygon: 'POLYGON((...))' },
      ])

      const result = await store.fetch(true)
      expect(result).toHaveLength(2)
    })

    it('retries when first fetch returns empty', async () => {
      mockFetchv2
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 1, polygon: 'POLYGON((...))' }])

      await store.fetch()
      expect(mockFetchv2).toHaveBeenCalledTimes(2)
    })

    it('deduplicates concurrent fetches', async () => {
      let resolveFirst
      const firstPromise = new Promise((r) => {
        resolveFirst = r
      })
      mockFetchv2.mockReturnValueOnce(firstPromise)

      const fetch1 = store.fetch(true)
      const fetch2 = store.fetch(true)

      resolveFirst([{ id: 1, polygon: 'POLYGON((...))' }])
      await fetch1
      await fetch2

      expect(mockFetchv2).toHaveBeenCalledTimes(1)
    })
  })

  describe('fetchMessages', () => {
    let store

    beforeEach(() => {
      store = useIsochroneStore()
      store.init({ public: {} })
    })

    it('fetches messages', async () => {
      mockFetchMessages.mockResolvedValue([
        { id: 1, subject: 'Offering sofa' },
      ])

      const result = await store.fetchMessages()
      expect(result).toHaveLength(1)
      expect(store.messageList).toHaveLength(1)
    })

    it('returns cached messages without refetching', async () => {
      store.messageList = [{ id: 1 }]

      const result = await store.fetchMessages()
      expect(result).toHaveLength(1)
      expect(mockFetchMessages).not.toHaveBeenCalled()
    })

    it('refetches when force=true', async () => {
      store.messageList = [{ id: 1 }]
      mockFetchMessages.mockResolvedValue([{ id: 1 }, { id: 2 }])

      const result = await store.fetchMessages(true)
      expect(result).toHaveLength(2)
    })

    it('deduplicates concurrent fetches', async () => {
      let resolveFirst
      const firstPromise = new Promise((r) => {
        resolveFirst = r
      })
      mockFetchMessages.mockReturnValueOnce(firstPromise)

      const fetch1 = store.fetchMessages(true)
      const fetch2 = store.fetchMessages(true)

      resolveFirst([{ id: 1 }])
      await fetch1
      await fetch2

      expect(mockFetchMessages).toHaveBeenCalledTimes(1)
    })
  })

  describe('delete', () => {
    it('calls API, refetches messages, and refetches isochrones', async () => {
      const store = useIsochroneStore()
      store.init({ public: {} })
      mockDel.mockResolvedValue({})
      mockFetchMessages.mockResolvedValue([])
      mockFetchv2.mockResolvedValue([{ id: 2, polygon: 'POLYGON((...))' }])

      await store.delete({ id: 1 })
      expect(mockDel).toHaveBeenCalledWith(1)
      expect(mockFetchMessages).toHaveBeenCalled()
      expect(mockFetchv2).toHaveBeenCalled()
    })
  })

  describe('add', () => {
    it('calls API, refetches, and returns new ID', async () => {
      const store = useIsochroneStore()
      store.init({ public: {} })
      mockAddIso.mockResolvedValue(99)
      mockFetchMessages.mockResolvedValue([])
      mockFetchv2.mockResolvedValue([{ id: 99, polygon: 'POLYGON((...))' }])

      const id = await store.add({ transport: 'Walk', minutes: 30 })
      expect(id).toBe(99)
      expect(mockAddIso).toHaveBeenCalledWith({
        transport: 'Walk',
        minutes: 30,
      })
    })
  })

  describe('edit', () => {
    it('calls patch API and refetches', async () => {
      const store = useIsochroneStore()
      store.init({ public: {} })
      mockPatch.mockResolvedValue({})
      mockFetchMessages.mockResolvedValue([])
      mockFetchv2.mockResolvedValue([{ id: 1, polygon: 'POLYGON((...))' }])

      await store.edit({ id: 1, transport: 'Cycle', minutes: 15 })
      expect(mockPatch).toHaveBeenCalledWith({
        id: 1,
        transport: 'Cycle',
        minutes: 15,
      })
    })
  })

  describe('markSeen', () => {
    it('marks specified messages as seen', () => {
      const store = useIsochroneStore()
      store.messageList = [
        { id: 1, unseen: true },
        { id: 2, unseen: true },
        { id: 3, unseen: true },
      ]

      store.markSeen([1, 3])

      expect(store.messageList[0].unseen).toBe(false)
      expect(store.messageList[1].unseen).toBe(true)
      expect(store.messageList[2].unseen).toBe(false)
    })

    it('does nothing when messageList is empty', () => {
      const store = useIsochroneStore()
      store.messageList = []

      store.markSeen([1])
      expect(store.messageList).toEqual([])
    })
  })

  describe('computeBounds', () => {
    it('computes bounds from polygon isochrones', () => {
      const store = useIsochroneStore()
      store.list = [{ id: 1, polygon: 'POLYGON((...))' }]

      store.computeBounds()

      expect(store.bounds).toEqual([
        [51.0, -1.0],
        [52.0, 0.0],
      ])
    })

    it('sets bounds to null when list is empty', () => {
      const store = useIsochroneStore()
      store.list = []

      store.computeBounds()

      expect(store.bounds).toBeNull()
    })
  })

  describe('get getter', () => {
    it('returns isochrone by id from list', () => {
      const store = useIsochroneStore()
      store.list = [
        { id: 1, transport: 'Walk' },
        { id: 2, transport: 'Cycle' },
      ]

      expect(store.get(2)).toEqual({ id: 2, transport: 'Cycle' })
    })

    it('returns undefined for unknown id', () => {
      const store = useIsochroneStore()
      store.list = [{ id: 1 }]

      expect(store.get(999)).toBeUndefined()
    })
  })
})
