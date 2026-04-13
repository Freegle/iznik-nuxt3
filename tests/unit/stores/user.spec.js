import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetchByEmail = vi.fn()
const mockSearch = vi.fn()
const mockFetchMT = vi.fn()
const mockFetchMultiple = vi.fn()
const mockFetchPublicLocation = vi.fn()
const mockRate = vi.fn()
const mockEngaged = vi.fn()
const mockMuteOnChitChat = vi.fn()
const mockUnMuteOnChitChat = vi.fn()
const mockCommentDel = vi.fn()
const mockCommentSave = vi.fn()
const mockUserSave = vi.fn()
const mockAddEmail = vi.fn()
const mockUserAdd = vi.fn()
const mockPurge = vi.fn()
const mockRatingReviewed = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    user: {
      fetchByEmail: mockFetchByEmail,
      search: mockSearch,
      fetchMT: mockFetchMT,
      fetchMultiple: mockFetchMultiple,
      fetchPublicLocation: mockFetchPublicLocation,
      rate: mockRate,
      engaged: mockEngaged,
      muteOnChitChat: mockMuteOnChitChat,
      unMuteOnChitChat: mockUnMuteOnChitChat,
      save: mockUserSave,
      addEmail: mockAddEmail,
      add: mockUserAdd,
      purge: mockPurge,
      ratingReviewed: mockRatingReviewed,
    },
    comment: {
      del: mockCommentDel,
      save: mockCommentSave,
    },
  }),
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({ modtools: false }),
}))

describe('user store', () => {
  let useUserStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/user')
    useUserStore = mod.useUserStore
  })

  describe('initial state', () => {
    it('starts with empty list and locationList', () => {
      const store = useUserStore()
      expect(store.list).toEqual({})
      expect(store.locationList).toEqual({})
    })
  })

  describe('init', () => {
    it('sets config and initialises tracking objects', () => {
      const store = useUserStore()
      store.init({ public: {} })
      expect(store.config).toEqual({ public: {} })
      expect(store.fetching).toEqual({})
      expect(store.fetchingLocation).toEqual({})
      expect(store.pendingFetches).toEqual([])
      expect(store.batchTimer).toBeNull()
    })
  })

  describe('clear', () => {
    it('resets list and fetching state', () => {
      const store = useUserStore()
      store.init({ public: {} })
      store.list[1] = { id: 1, displayname: 'Test' }
      store.locationList[1] = { lat: 0, lng: 0 }
      store.fetching[1] = Promise.resolve()

      store.clear()

      expect(store.list).toEqual({})
      expect(store.locationList).toEqual({})
      expect(store.fetching).toEqual({})
    })
  })

  describe('emailIsInUse', () => {
    it('returns true when email exists', async () => {
      const store = useUserStore()
      store.init({ public: {} })
      mockFetchByEmail.mockResolvedValue({ exists: true })

      const result = await store.emailIsInUse('test@test.com')
      expect(result).toBe(true)
      expect(mockFetchByEmail).toHaveBeenCalledWith('test@test.com', false)
    })

    it('returns undefined when API returns null', async () => {
      const store = useUserStore()
      store.init({ public: {} })
      mockFetchByEmail.mockResolvedValue(null)

      const result = await store.emailIsInUse('nobody@test.com')
      expect(result).toBeUndefined()
    })
  })

  describe('fetchMT', () => {
    let store

    beforeEach(() => {
      store = useUserStore()
      store.init({ public: {} })
    })

    it('fetches user and stores in list', async () => {
      mockFetchMT.mockResolvedValue({
        user: { id: 42, displayname: 'Alice' },
      })

      const result = await store.fetchMT({ id: 42 })
      expect(result).toEqual({ id: 42, displayname: 'Alice' })
      expect(store.list[42]).toEqual({ id: 42, displayname: 'Alice' })
    })

    it('returns cached user without fetching when not forced', async () => {
      store.list[42] = { id: 42, displayname: 'Cached' }

      const result = await store.fetchMT({ id: 42 })
      expect(result).toEqual({ id: 42, displayname: 'Cached' })
      expect(mockFetchMT).not.toHaveBeenCalled()
    })

    it('refetches when force=true', async () => {
      store.list[42] = { id: 42, displayname: 'Old' }
      mockFetchMT.mockResolvedValue({
        user: { id: 42, displayname: 'New' },
      })

      const result = await store.fetchMT({ id: 42 }, true)
      expect(result).toEqual({ id: 42, displayname: 'New' })
      expect(store.list[42].displayname).toBe('New')
    })

    it('returns early for NaN id', async () => {
      const result = await store.fetchMT({ id: 'abc' })
      expect(result).toBeUndefined()
      expect(mockFetchMT).not.toHaveBeenCalled()
    })

    it('deduplicates concurrent fetches for same id', async () => {
      let resolveFirst
      const firstPromise = new Promise((r) => {
        resolveFirst = r
      })
      mockFetchMT.mockReturnValueOnce(firstPromise)

      const fetch1 = store.fetchMT({ id: 42 }, true)
      const fetch2 = store.fetchMT({ id: 42 }, true)

      resolveFirst({ user: { id: 42, displayname: 'Deduped' } })
      await fetch1
      await fetch2

      // Only one API call should have been made
      expect(mockFetchMT).toHaveBeenCalledTimes(1)
    })

    it('handles users array response', async () => {
      mockFetchMT.mockResolvedValue({
        users: [
          { id: 1, displayname: 'A' },
          { id: 2, displayname: 'B' },
        ],
      })

      const result = await store.fetchMT({ id: 1 }, true)
      expect(result).toHaveLength(2)
      expect(store.list[1].displayname).toBe('A')
      expect(store.list[2].displayname).toBe('B')
    })
  })

  describe('fetchMultiple', () => {
    let store

    beforeEach(() => {
      store = useUserStore()
      store.init({ public: {} })
    })

    it('fetches multiple users and stores them', async () => {
      mockFetchMultiple.mockResolvedValue([
        { id: 1, displayname: 'A' },
        { id: 2, displayname: 'B' },
      ])

      await store.fetchMultiple([1, 2])
      expect(store.list[1].displayname).toBe('A')
      expect(store.list[2].displayname).toBe('B')
    })

    it('chunks requests into batches of 20', async () => {
      const ids = Array.from({ length: 25 }, (_, i) => i + 1)
      mockFetchMultiple
        .mockResolvedValueOnce(
          ids.slice(0, 20).map((id) => ({ id, displayname: `U${id}` }))
        )
        .mockResolvedValueOnce(
          ids.slice(20).map((id) => ({ id, displayname: `U${id}` }))
        )

      await store.fetchMultiple(ids)
      expect(mockFetchMultiple).toHaveBeenCalledTimes(2)
      expect(mockFetchMultiple.mock.calls[0][0]).toHaveLength(20)
      expect(mockFetchMultiple.mock.calls[1][0]).toHaveLength(5)
    })

    it('skips IDs that are currently being fetched', async () => {
      store.fetching[2] = Promise.resolve()
      mockFetchMultiple.mockResolvedValue([
        { id: 1, displayname: 'A' },
      ])

      await store.fetchMultiple([1, 2])
      expect(mockFetchMultiple).toHaveBeenCalledWith([1], false)
    })

    it('handles single user response', async () => {
      mockFetchMultiple.mockResolvedValue({ id: 1, displayname: 'Solo' })

      await store.fetchMultiple([1])
      expect(store.list[1].displayname).toBe('Solo')
    })

    it('does nothing for empty list', async () => {
      await store.fetchMultiple([])
      expect(mockFetchMultiple).not.toHaveBeenCalled()
    })
  })

  describe('fetchPublicLocation', () => {
    let store

    beforeEach(() => {
      store = useUserStore()
      store.init({ public: {} })
    })

    it('fetches and caches location', async () => {
      mockFetchPublicLocation.mockResolvedValue({
        lat: 51.5,
        lng: -0.1,
      })

      const result = await store.fetchPublicLocation(42)
      expect(result).toEqual({ lat: 51.5, lng: -0.1 })
      expect(store.locationList[42]).toEqual({ lat: 51.5, lng: -0.1 })
    })

    it('returns cached location without refetching', async () => {
      store.locationList[42] = { lat: 51.5, lng: -0.1 }

      const result = await store.fetchPublicLocation(42)
      expect(result).toEqual({ lat: 51.5, lng: -0.1 })
      expect(mockFetchPublicLocation).not.toHaveBeenCalled()
    })

    it('refetches when force=true', async () => {
      store.locationList[42] = { lat: 0, lng: 0 }
      mockFetchPublicLocation.mockResolvedValue({ lat: 51.5, lng: -0.1 })

      const result = await store.fetchPublicLocation(42, true)
      expect(result).toEqual({ lat: 51.5, lng: -0.1 })
    })
  })

  describe('simple API passthrough actions', () => {
    let store

    beforeEach(() => {
      store = useUserStore()
      store.init({ public: {} })
    })

    it('rate calls API and refetches user', async () => {
      mockRate.mockResolvedValue({})
      mockFetchMultiple.mockResolvedValue([
        { id: 1, displayname: 'Rated' },
      ])

      await store.rate(1, 'Up', 'helpful', 'Great trader')
      expect(mockRate).toHaveBeenCalledWith(1, 'Up', 'helpful', 'Great trader')
    })

    it('engaged calls API', async () => {
      mockEngaged.mockResolvedValue({})
      await store.engaged(123)
      expect(mockEngaged).toHaveBeenCalledWith(123)
    })

    it('muteOnChitChat calls API', async () => {
      mockMuteOnChitChat.mockResolvedValue({})
      await store.muteOnChitChat(42)
      expect(mockMuteOnChitChat).toHaveBeenCalledWith(42)
    })

    it('unMuteOnChitChat calls API', async () => {
      mockUnMuteOnChitChat.mockResolvedValue({})
      await store.unMuteOnChitChat(42)
      expect(mockUnMuteOnChitChat).toHaveBeenCalledWith(42)
    })

    it('deleteComment calls API', async () => {
      mockCommentDel.mockResolvedValue({})
      await store.deleteComment(99)
      expect(mockCommentDel).toHaveBeenCalledWith(99)
    })

    it('saveComment calls API', async () => {
      mockCommentSave.mockResolvedValue({})
      const comment = { id: 1, body: 'test' }
      await store.saveComment(comment)
      expect(mockCommentSave).toHaveBeenCalledWith(comment)
    })

    it('edit calls API and refetches user', async () => {
      mockUserSave.mockResolvedValue({})
      mockFetchMultiple.mockResolvedValue([
        { id: 1, displayname: 'Edited' },
      ])

      await store.edit({ id: 1, displayname: 'Edited' })
      expect(mockUserSave).toHaveBeenCalledWith({
        id: 1,
        displayname: 'Edited',
      })
    })

    it('addEmail calls API and refetches user', async () => {
      mockAddEmail.mockResolvedValue({})
      mockFetchMultiple.mockResolvedValue([
        { id: 1, displayname: 'Test' },
      ])

      await store.addEmail({ id: 1, email: 'new@test.com', primary: true })
      expect(mockAddEmail).toHaveBeenCalledWith(1, 'new@test.com', true)
    })

    it('add calls API and returns user id', async () => {
      mockUserAdd.mockResolvedValue({ id: 99 })
      const result = await store.add({ email: 'new@test.com' })
      expect(result).toBe(99)
    })

    it('purge calls API', async () => {
      mockPurge.mockResolvedValue({})
      await store.purge(42)
      expect(mockPurge).toHaveBeenCalledWith(42)
    })
  })

  describe('byId getter', () => {
    it('returns user from list', () => {
      const store = useUserStore()
      store.list[42] = { id: 42, displayname: 'Alice' }

      const user = store.byId(42)
      expect(user.displayname).toBe('Alice')
    })

    it('returns null for falsy id', () => {
      const store = useUserStore()
      expect(store.byId(null)).toBeNull()
      expect(store.byId(0)).toBeNull()
      expect(store.byId(undefined)).toBeNull()
    })

    it('returns undefined for unknown id', () => {
      const store = useUserStore()
      expect(store.byId(999)).toBeUndefined()
    })

    it('clears spammer flag when whitelisted', () => {
      const store = useUserStore()
      store.list[42] = {
        id: 42,
        displayname: 'Alice',
        spammer: { collection: 'Whitelisted' },
      }

      const user = store.byId(42)
      expect(user.spammer).toBe(false)
    })

    it('preserves spammer flag when not whitelisted', () => {
      const store = useUserStore()
      store.list[42] = {
        id: 42,
        displayname: 'Alice',
        spammer: { collection: 'PendingAdd' },
      }

      const user = store.byId(42)
      expect(user.spammer.collection).toBe('PendingAdd')
    })
  })

  describe('publicLocationById getter', () => {
    it('returns location from locationList', () => {
      const store = useUserStore()
      store.locationList[42] = { lat: 51.5, lng: -0.1 }

      const loc = store.publicLocationById(42)
      expect(loc).toEqual({ lat: 51.5, lng: -0.1 })
    })

    it('returns undefined for unknown id', () => {
      const store = useUserStore()
      expect(store.publicLocationById(999)).toBeUndefined()
    })
  })
})
