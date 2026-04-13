import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockList = vi.fn()
const mockFetchEvent = vi.fn()
const mockListGroup = vi.fn()
const mockSetPhoto = vi.fn()
const mockAddGroup = vi.fn()
const mockRemoveGroup = vi.fn()
const mockDel = vi.fn()
const mockRemoveDate = vi.fn()
const mockAddDate = vi.fn()
const mockAdd = vi.fn()
const mockSave = vi.fn()
const mockRenew = vi.fn()
const mockExpire = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    communityevent: {
      list: mockList,
      fetch: mockFetchEvent,
      listGroup: mockListGroup,
      setPhoto: mockSetPhoto,
      addGroup: mockAddGroup,
      removeGroup: mockRemoveGroup,
      del: mockDel,
      removeDate: mockRemoveDate,
      addDate: mockAddDate,
      add: mockAdd,
      save: mockSave,
      renew: mockRenew,
      expire: mockExpire,
    },
  }),
}))

vi.mock('~/composables/useTimeFormat', () => ({
  addStrings: (item) => item,
  earliestDate: vi.fn(() => '2026-06-01'),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
  })),
}))

describe('communityevent store', () => {
  let useCommunityEventStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/communityevent')
    useCommunityEventStore = mod.useCommunityEventStore
  })

  describe('initial state', () => {
    it('starts with empty list, forUser, and forGroup', () => {
      const store = useCommunityEventStore()
      expect(store.list).toEqual({})
      expect(store.forUser).toEqual([])
      expect(store.forGroup).toEqual([])
    })
  })

  describe('init', () => {
    it('sets config and initialises fetching tracker', () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      expect(store.config).toEqual({ public: {} })
      expect(store.fetching).toEqual({})
    })
  })

  describe('clear', () => {
    it('resets list, forUser, and forGroup', () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      store.list[1] = { id: 1 }
      store.forUser = [{ id: 1 }]
      store.forGroup = [{ id: 2 }]

      store.clear()

      expect(store.list).toEqual({})
      expect(store.forUser).toEqual([])
      expect(store.forGroup).toEqual([])
    })
  })

  describe('fetch', () => {
    let store

    beforeEach(() => {
      store = useCommunityEventStore()
      store.init({ public: {} })
    })

    it('fetches item and stores in list', async () => {
      mockFetchEvent.mockResolvedValue({
        id: 42,
        title: 'Community Cleanup',
      })

      const result = await store.fetch(42)
      expect(result).toEqual({ id: 42, title: 'Community Cleanup' })
      expect(store.list[42]).toEqual({ id: 42, title: 'Community Cleanup' })
    })

    it('processes dates into split date/time format', async () => {
      mockFetchEvent.mockResolvedValue({
        id: 42,
        title: 'Event',
        dates: [
          {
            start: '2026-06-15T10:00:00Z',
            end: '2026-06-15T16:00:00Z',
          },
        ],
      })

      const result = await store.fetch(42)
      expect(result.dates[0].start).toBe('2026-06-15')
      expect(result.dates[0].starttime).toMatch(/\d{2}:\d{2}/)
      expect(result.dates[0].end).toBe('2026-06-15')
      expect(result.dates[0].endtime).toMatch(/\d{2}:\d{2}/)
      expect(result.earliestDate).toBe('2026-06-01')
    })

    it('returns cached item without refetching', async () => {
      store.list[42] = { id: 42, title: 'Cached' }

      const result = await store.fetch(42)
      expect(result).toEqual({ id: 42, title: 'Cached' })
      expect(mockFetchEvent).not.toHaveBeenCalled()
    })

    it('refetches when force=true', async () => {
      store.list[42] = { id: 42, title: 'Old' }
      mockFetchEvent.mockResolvedValue({ id: 42, title: 'New' })

      const result = await store.fetch(42, true)
      expect(result.title).toBe('New')
    })

    it('deduplicates concurrent fetches', async () => {
      let resolveFirst
      const firstPromise = new Promise((r) => {
        resolveFirst = r
      })
      mockFetchEvent.mockReturnValueOnce(firstPromise)

      const fetch1 = store.fetch(42, true)
      const fetch2 = store.fetch(42, true)

      resolveFirst({ id: 42, title: 'Deduped' })
      await fetch1
      await fetch2

      expect(mockFetchEvent).toHaveBeenCalledTimes(1)
    })

    it('handles fetch error gracefully', async () => {
      mockFetchEvent.mockRejectedValue(new Error('Network error'))

      const result = await store.fetch(42)
      expect(result).toBeUndefined()
    })
  })

  describe('fetchPending', () => {
    it('fetches list of pending IDs then fetches each', async () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      mockList.mockResolvedValue([10, 20])
      mockFetchEvent.mockImplementation((id) =>
        Promise.resolve({ id, title: `Event ${id}` })
      )

      await store.fetchPending()

      expect(mockList).toHaveBeenCalledWith({ pending: true })
      expect(store.list[10]).toBeDefined()
      expect(store.list[20]).toBeDefined()
    })

    it('handles null response from list', async () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      mockList.mockResolvedValue(null)

      await store.fetchPending()

      expect(mockFetchEvent).not.toHaveBeenCalled()
    })
  })

  describe('fetchList', () => {
    it('fetches user event list', async () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      mockList.mockResolvedValue([{ id: 1 }, { id: 2 }])

      await store.fetchList(99)
      expect(store.forUser).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('defaults to empty array on null response', async () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      mockList.mockResolvedValue(null)

      await store.fetchList(99)
      expect(store.forUser).toEqual([])
    })
  })

  describe('fetchGroup', () => {
    it('fetches group event list', async () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      mockListGroup.mockResolvedValue([{ id: 5 }])

      await store.fetchGroup(10)
      expect(store.forGroup).toEqual([{ id: 5 }])
    })
  })

  describe('setPhoto', () => {
    it('calls API and refetches', async () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      mockSetPhoto.mockResolvedValue({})
      mockFetchEvent.mockResolvedValue({ id: 42, photoid: 99 })

      await store.setPhoto(42, 99)
      expect(mockSetPhoto).toHaveBeenCalledWith(42, 99)
    })
  })

  describe('addGroup', () => {
    it('calls API and refetches', async () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      mockAddGroup.mockResolvedValue({})
      mockFetchEvent.mockResolvedValue({ id: 42 })

      await store.addGroup(42, 10)
      expect(mockAddGroup).toHaveBeenCalledWith(42, 10)
    })
  })

  describe('removeGroup', () => {
    it('calls API and refetches', async () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      mockRemoveGroup.mockResolvedValue({})
      mockFetchEvent.mockResolvedValue({ id: 42 })

      await store.removeGroup(42, 10)
      expect(mockRemoveGroup).toHaveBeenCalledWith(42, 10)
    })
  })

  describe('delete', () => {
    it('calls API and removes from list', async () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      store.list[42] = { id: 42 }
      mockDel.mockResolvedValue({})

      await store.delete(42)
      expect(mockDel).toHaveBeenCalledWith(42)
      expect(store.list[42]).toBeUndefined()
    })
  })

  describe('setDates', () => {
    let store

    beforeEach(() => {
      store = useCommunityEventStore()
      store.init({ public: {} })
      mockFetchEvent.mockResolvedValue({ id: 1 })
    })

    it('removes old dates and adds new dates as ISO strings', async () => {
      mockRemoveDate.mockResolvedValue({})
      mockAddDate.mockResolvedValue({})

      await store.setDates({
        id: 1,
        olddates: [{ id: 100 }],
        newdates: [
          {
            start: '2026-07-01',
            starttime: '10:00',
            end: '2026-07-01',
            endtime: '14:00',
          },
        ],
      })

      expect(mockRemoveDate).toHaveBeenCalledWith(1, 100)
      expect(mockAddDate).toHaveBeenCalledTimes(1)
      // Verify ISO string conversion
      const addCall = mockAddDate.mock.calls[0]
      expect(addCall[0]).toBe(1)
      expect(addCall[1]).toContain('2026-07-01')
      expect(addCall[2]).toContain('2026-07-01')
    })

    it('handles no old dates', async () => {
      mockAddDate.mockResolvedValue({})

      await store.setDates({
        id: 1,
        newdates: [
          {
            start: '2026-07-01',
            starttime: '10:00',
            end: '2026-07-01',
            endtime: '14:00',
          },
        ],
      })

      expect(mockRemoveDate).not.toHaveBeenCalled()
      expect(mockAddDate).toHaveBeenCalledTimes(1)
    })
  })

  describe('add', () => {
    it('calls API, fetches new item, and returns ID', async () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      mockAdd.mockResolvedValue(99)
      mockFetchEvent.mockResolvedValue({ id: 99, title: 'New Event' })

      const id = await store.add({ title: 'New Event' })
      expect(id).toBe(99)
      expect(store.list[99]).toBeDefined()
    })

    it('returns falsy ID without fetching on failure', async () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      mockAdd.mockResolvedValue(null)

      const id = await store.add({ title: 'Failed' })
      expect(id).toBeNull()
      expect(mockFetchEvent).not.toHaveBeenCalled()
    })
  })

  describe('save', () => {
    it('calls API and refetches', async () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      mockSave.mockResolvedValue({})
      mockFetchEvent.mockResolvedValue({ id: 42, title: 'Updated' })

      await store.save({ id: 42, title: 'Updated' })
      expect(mockSave).toHaveBeenCalledWith({ id: 42, title: 'Updated' })
    })
  })

  describe('renew', () => {
    it('calls API and refetches', async () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      mockRenew.mockResolvedValue({})
      mockFetchEvent.mockResolvedValue({ id: 42 })

      await store.renew(42)
      expect(mockRenew).toHaveBeenCalledWith(42)
    })
  })

  describe('expire', () => {
    it('calls API and refetches', async () => {
      const store = useCommunityEventStore()
      store.init({ public: {} })
      mockExpire.mockResolvedValue({})
      mockFetchEvent.mockResolvedValue({ id: 42 })

      await store.expire(42)
      expect(mockExpire).toHaveBeenCalledWith(42)
    })
  })

  describe('byId getter', () => {
    it('returns item from list', () => {
      const store = useCommunityEventStore()
      store.list[42] = { id: 42, title: 'Test' }

      expect(store.byId(42)).toEqual({ id: 42, title: 'Test' })
    })

    it('returns undefined for unknown id', () => {
      const store = useCommunityEventStore()
      expect(store.byId(999)).toBeUndefined()
    })
  })

  describe('count getter', () => {
    it('counts items newer than lastCommunityEvent', async () => {
      const { useAuthStore } = await import('~/stores/auth')
      useAuthStore.mockReturnValue({
        user: {
          settings: { lastCommunityEvent: 5 },
        },
      })

      const store = useCommunityEventStore()
      store.forUser = [{ id: 3 }, { id: 6 }, { id: 10 }]

      expect(store.count).toBe(2)
    })

    it('counts all items when no lastCommunityEvent setting', async () => {
      const { useAuthStore } = await import('~/stores/auth')
      useAuthStore.mockReturnValue({
        user: { settings: {} },
      })

      const store = useCommunityEventStore()
      store.forUser = [{ id: 1 }, { id: 2 }]

      expect(store.count).toBe(2)
    })

    it('returns 0 when user is null', async () => {
      const { useAuthStore } = await import('~/stores/auth')
      useAuthStore.mockReturnValue({ user: null })

      const store = useCommunityEventStore()
      store.forUser = [{ id: 1 }]

      expect(store.count).toBe(1)
    })
  })
})
