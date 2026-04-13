import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockList = vi.fn()
const mockFetchVol = vi.fn()
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
    volunteering: {
      list: mockList,
      fetch: mockFetchVol,
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

describe('volunteering store', () => {
  let useVolunteeringStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/volunteering')
    useVolunteeringStore = mod.useVolunteeringStore
  })

  describe('initial state', () => {
    it('starts with empty list, forUser, and forGroup', () => {
      const store = useVolunteeringStore()
      expect(store.list).toEqual({})
      expect(store.forUser).toEqual([])
      expect(store.forGroup).toEqual([])
    })
  })

  describe('init', () => {
    it('sets config and initialises fetching tracker', () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      expect(store.config).toEqual({ public: {} })
      expect(store.fetching).toEqual({})
    })
  })

  describe('clear', () => {
    it('resets list, forUser, and forGroup', () => {
      const store = useVolunteeringStore()
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
      store = useVolunteeringStore()
      store.init({ public: {} })
    })

    it('fetches item and stores in list', async () => {
      mockFetchVol.mockResolvedValue({
        id: 42,
        title: 'Help needed',
      })

      const result = await store.fetch(42)
      expect(result).toEqual({ id: 42, title: 'Help needed' })
      expect(store.list[42]).toEqual({ id: 42, title: 'Help needed' })
    })

    it('processes dates into split date/time format', async () => {
      mockFetchVol.mockResolvedValue({
        id: 42,
        title: 'Event',
        dates: [
          {
            start: '2026-06-15T10:00:00Z',
            end: '2026-06-15T14:00:00Z',
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
      expect(mockFetchVol).not.toHaveBeenCalled()
    })

    it('refetches when force=true', async () => {
      store.list[42] = { id: 42, title: 'Old' }
      mockFetchVol.mockResolvedValue({ id: 42, title: 'New' })

      const result = await store.fetch(42, true)
      expect(result.title).toBe('New')
    })

    it('deduplicates concurrent fetches', async () => {
      let resolveFirst
      const firstPromise = new Promise((r) => {
        resolveFirst = r
      })
      mockFetchVol.mockReturnValueOnce(firstPromise)

      const fetch1 = store.fetch(42, true)
      const fetch2 = store.fetch(42, true)

      resolveFirst({ id: 42, title: 'Deduped' })
      await fetch1
      await fetch2

      expect(mockFetchVol).toHaveBeenCalledTimes(1)
    })

    it('handles fetch error gracefully', async () => {
      mockFetchVol.mockRejectedValue(new Error('Network error'))

      const result = await store.fetch(42)
      expect(result).toBeUndefined()
    })
  })

  describe('fetchPending', () => {
    it('fetches list of pending IDs then fetches each', async () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      mockList.mockResolvedValue([10, 20])
      mockFetchVol.mockImplementation((id) =>
        Promise.resolve({ id, title: `Item ${id}` })
      )

      await store.fetchPending()

      expect(mockList).toHaveBeenCalledWith({ pending: true })
      expect(store.list[10]).toBeDefined()
      expect(store.list[20]).toBeDefined()
    })

    it('handles null response from list', async () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      mockList.mockResolvedValue(null)

      await store.fetchPending()

      expect(mockFetchVol).not.toHaveBeenCalled()
    })
  })

  describe('fetchList', () => {
    it('fetches user volunteering list', async () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      mockList.mockResolvedValue([{ id: 1 }, { id: 2 }])

      await store.fetchList(99)
      expect(store.forUser).toEqual([{ id: 1 }, { id: 2 }])
      expect(mockList).toHaveBeenCalledWith(99)
    })

    it('defaults to empty array on null response', async () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      mockList.mockResolvedValue(null)

      await store.fetchList(99)
      expect(store.forUser).toEqual([])
    })
  })

  describe('fetchGroup', () => {
    it('fetches group volunteering list', async () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      mockListGroup.mockResolvedValue([{ id: 5 }])

      await store.fetchGroup(10)
      expect(store.forGroup).toEqual([{ id: 5 }])
      expect(mockListGroup).toHaveBeenCalledWith(10)
    })
  })

  describe('setPhoto', () => {
    it('calls API and refetches', async () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      mockSetPhoto.mockResolvedValue({})
      mockFetchVol.mockResolvedValue({ id: 42, photoid: 99 })

      await store.setPhoto(42, 99)
      expect(mockSetPhoto).toHaveBeenCalledWith(42, 99)
      expect(mockFetchVol).toHaveBeenCalledWith(42, false)
    })
  })

  describe('addGroup', () => {
    it('calls API and refetches', async () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      mockAddGroup.mockResolvedValue({})
      mockFetchVol.mockResolvedValue({ id: 42 })

      await store.addGroup(42, 10)
      expect(mockAddGroup).toHaveBeenCalledWith(42, 10)
    })
  })

  describe('removeGroup', () => {
    it('calls API and refetches', async () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      mockRemoveGroup.mockResolvedValue({})
      mockFetchVol.mockResolvedValue({ id: 42 })

      await store.removeGroup(42, 10)
      expect(mockRemoveGroup).toHaveBeenCalledWith(42, 10)
    })
  })

  describe('delete', () => {
    it('calls API and removes from list', async () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      store.list[42] = { id: 42 }
      mockDel.mockResolvedValue({})

      await store.delete(42)
      expect(mockDel).toHaveBeenCalledWith(42)
      expect(store.list[42]).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('removes from list without API call', () => {
      const store = useVolunteeringStore()
      store.list[42] = { id: 42 }

      store.remove(42)
      expect(store.list[42]).toBeUndefined()
      expect(mockDel).not.toHaveBeenCalled()
    })
  })

  describe('setDates', () => {
    let store

    beforeEach(() => {
      store = useVolunteeringStore()
      store.init({ public: {} })
      mockFetchVol.mockResolvedValue({ id: 1 })
    })

    it('removes old dates and adds new dates', async () => {
      mockRemoveDate.mockResolvedValue({})
      mockAddDate.mockResolvedValue({})

      await store.setDates({
        id: 1,
        olddates: [{ id: 100 }, { id: 101 }],
        newdates: [
          { start: '2026-07-01T10:00', end: '2026-07-01T14:00' },
        ],
      })

      expect(mockRemoveDate).toHaveBeenCalledTimes(2)
      expect(mockRemoveDate).toHaveBeenCalledWith(1, 100)
      expect(mockRemoveDate).toHaveBeenCalledWith(1, 101)
      expect(mockAddDate).toHaveBeenCalledWith(
        1,
        '2026-07-01T10:00',
        '2026-07-01T14:00'
      )
    })

    it('handles no old dates', async () => {
      mockAddDate.mockResolvedValue({})

      await store.setDates({
        id: 1,
        newdates: [{ start: '2026-07-01T10:00', end: '2026-07-01T14:00' }],
      })

      expect(mockRemoveDate).not.toHaveBeenCalled()
      expect(mockAddDate).toHaveBeenCalledTimes(1)
    })

    it('handles no new dates', async () => {
      mockRemoveDate.mockResolvedValue({})

      await store.setDates({
        id: 1,
        olddates: [{ id: 100 }],
      })

      expect(mockRemoveDate).toHaveBeenCalledTimes(1)
      expect(mockAddDate).not.toHaveBeenCalled()
    })
  })

  describe('add', () => {
    it('calls API, fetches new item, and returns ID', async () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      mockAdd.mockResolvedValue(99)
      mockFetchVol.mockResolvedValue({ id: 99, title: 'New' })

      const id = await store.add({ title: 'New' })
      expect(id).toBe(99)
      expect(mockAdd).toHaveBeenCalledWith({ title: 'New' })
      expect(store.list[99]).toBeDefined()
    })

    it('returns falsy ID without fetching on failure', async () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      mockAdd.mockResolvedValue(null)

      const id = await store.add({ title: 'Failed' })
      expect(id).toBeNull()
      expect(mockFetchVol).not.toHaveBeenCalled()
    })
  })

  describe('save', () => {
    it('calls API and refetches', async () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      mockSave.mockResolvedValue({})
      mockFetchVol.mockResolvedValue({ id: 42, title: 'Updated' })

      await store.save({ id: 42, title: 'Updated' })
      expect(mockSave).toHaveBeenCalledWith({ id: 42, title: 'Updated' })
    })
  })

  describe('renew', () => {
    it('calls API and refetches', async () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      mockRenew.mockResolvedValue({})
      mockFetchVol.mockResolvedValue({ id: 42 })

      await store.renew(42)
      expect(mockRenew).toHaveBeenCalledWith(42)
    })
  })

  describe('expire', () => {
    it('calls API and refetches', async () => {
      const store = useVolunteeringStore()
      store.init({ public: {} })
      mockExpire.mockResolvedValue({})
      mockFetchVol.mockResolvedValue({ id: 42 })

      await store.expire(42)
      expect(mockExpire).toHaveBeenCalledWith(42)
    })
  })

  describe('byId getter', () => {
    it('returns item from list', () => {
      const store = useVolunteeringStore()
      store.list[42] = { id: 42, title: 'Test' }

      expect(store.byId(42)).toEqual({ id: 42, title: 'Test' })
    })

    it('returns undefined for unknown id', () => {
      const store = useVolunteeringStore()
      expect(store.byId(999)).toBeUndefined()
    })
  })

  describe('count getter', () => {
    it('counts items newer than lastVolunteerOpportunity', async () => {
      const { useAuthStore } = await import('~/stores/auth')
      useAuthStore.mockReturnValue({
        user: {
          settings: { lastVolunteerOpportunity: 5 },
        },
      })

      const store = useVolunteeringStore()
      store.forUser = [{ id: 3 }, { id: 6 }, { id: 10 }]

      expect(store.count).toBe(2)
    })

    it('counts all items when no lastVolunteerOpportunity setting', async () => {
      const { useAuthStore } = await import('~/stores/auth')
      useAuthStore.mockReturnValue({
        user: { settings: {} },
      })

      const store = useVolunteeringStore()
      store.forUser = [{ id: 1 }, { id: 2 }]

      expect(store.count).toBe(2)
    })

    it('returns 0 when user is null', async () => {
      const { useAuthStore } = await import('~/stores/auth')
      useAuthStore.mockReturnValue({ user: null })

      const store = useVolunteeringStore()
      store.forUser = [{ id: 1 }]

      expect(store.count).toBe(1)
    })
  })
})
