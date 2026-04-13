import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockAdd = vi.fn()
const mockSave = vi.fn()
const mockFetchNb = vi.fn()
const mockFetchList = vi.fn()
const mockAction = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    noticeboard: {
      add: mockAdd,
      save: mockSave,
      fetch: mockFetchNb,
      fetchList: mockFetchList,
      action: mockAction,
    },
  }),
}))

const mockUserFetch = vi.fn()
vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    fetch: mockUserFetch,
    list: {
      10: { id: 10, displayname: 'Alice' },
      20: { id: 20, displayname: 'Bob' },
    },
  }),
}))

describe('noticeboard store', () => {
  let useNoticeboardStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/noticeboard')
    useNoticeboardStore = mod.useNoticeboardStore
  })

  describe('initial state', () => {
    it('starts with empty list and members', () => {
      const store = useNoticeboardStore()
      expect(store.list).toEqual({})
      expect(store.members).toEqual([])
    })
  })

  describe('init', () => {
    it('sets config', () => {
      const store = useNoticeboardStore()
      store.init({ public: {} })
      expect(store.config).toEqual({ public: {} })
    })
  })

  describe('add', () => {
    it('calls API with lat, lng, active', async () => {
      const store = useNoticeboardStore()
      store.init({ public: {} })
      mockAdd.mockResolvedValue(99)

      const result = await store.add(51.5, -0.1, true)
      expect(result).toBe(99)
      expect(mockAdd).toHaveBeenCalledWith({
        lat: 51.5,
        lng: -0.1,
        active: true,
      })
    })
  })

  describe('edit', () => {
    it('calls API with all parameters', async () => {
      const store = useNoticeboardStore()
      store.init({ public: {} })
      mockSave.mockResolvedValue({})

      await store.edit(42, 'Test Board', 'Description', true, 123)
      expect(mockSave).toHaveBeenCalledWith({
        id: 42,
        name: 'Test Board',
        description: 'Description',
        active: true,
        photoid: 123,
      })
    })
  })

  describe('fetch', () => {
    it('fetches noticeboard and stores in list', async () => {
      const store = useNoticeboardStore()
      store.init({ public: {} })
      mockFetchNb.mockResolvedValue({
        id: 42,
        name: 'Test Board',
        addedby: 10,
      })
      mockUserFetch.mockResolvedValue({})

      const result = await store.fetch(42)
      expect(result[42].name).toBe('Test Board')
      expect(store.list[42]).toBeDefined()
    })

    it('fetches users for addedby and check userids', async () => {
      const store = useNoticeboardStore()
      store.init({ public: {} })
      mockFetchNb.mockResolvedValue({
        id: 42,
        name: 'Board',
        addedby: 10,
        checks: [{ userid: 20, date: '2026-01-01' }],
      })
      mockUserFetch.mockResolvedValue({})

      await store.fetch(42)

      expect(mockUserFetch).toHaveBeenCalledWith(10)
      expect(mockUserFetch).toHaveBeenCalledWith(20)
      expect(store.list[42].addedbyuser.displayname).toBe('Alice')
      expect(store.list[42].checks[0].user.displayname).toBe('Bob')
    })

    it('skips user fetch when no addedby or checks', async () => {
      const store = useNoticeboardStore()
      store.init({ public: {} })
      mockFetchNb.mockResolvedValue({ id: 42, name: 'Board' })

      await store.fetch(42)

      expect(mockUserFetch).not.toHaveBeenCalled()
    })
  })

  describe('fetchList', () => {
    it('fetches list and stores all noticeboards', async () => {
      const store = useNoticeboardStore()
      store.init({ public: {} })
      mockFetchList.mockResolvedValue({
        noticeboards: [
          { id: 1, name: 'Board 1' },
          { id: 2, name: 'Board 2' },
        ],
      })

      const result = await store.fetchList({ swlat: 51, swlng: -1 })
      expect(result[1].name).toBe('Board 1')
      expect(result[2].name).toBe('Board 2')
    })

    it('handles empty noticeboards response', async () => {
      const store = useNoticeboardStore()
      store.init({ public: {} })
      mockFetchList.mockResolvedValue({ noticeboards: null })

      const result = await store.fetchList({})
      expect(Object.keys(result)).toHaveLength(0)
    })
  })

  describe('fetchAuthority', () => {
    it('delegates to fetchList with authorityid', async () => {
      const store = useNoticeboardStore()
      store.init({ public: {} })
      mockFetchList.mockResolvedValue({
        noticeboards: [{ id: 5, name: 'Auth Board' }],
      })

      await store.fetchAuthority(99)
      expect(mockFetchList).toHaveBeenCalledWith({ authorityid: 99 })
    })
  })

  describe('refresh', () => {
    it('calls action API and refetches', async () => {
      const store = useNoticeboardStore()
      store.init({ public: {} })
      mockAction.mockResolvedValue({})
      mockFetchNb.mockResolvedValue({ id: 42, name: 'Board' })

      await store.refresh(42)
      expect(mockAction).toHaveBeenCalledWith({
        action: 'Refreshed',
        id: 42,
      })
    })
  })

  describe('decline', () => {
    it('calls action API and refetches', async () => {
      const store = useNoticeboardStore()
      store.init({ public: {} })
      mockAction.mockResolvedValue({})
      mockFetchNb.mockResolvedValue({ id: 42, name: 'Board' })

      await store.decline(42)
      expect(mockAction).toHaveBeenCalledWith({
        action: 'Declined',
        id: 42,
      })
    })
  })

  describe('inactive', () => {
    it('calls action API and refetches', async () => {
      const store = useNoticeboardStore()
      store.init({ public: {} })
      mockAction.mockResolvedValue({})
      mockFetchNb.mockResolvedValue({ id: 42, name: 'Board' })

      await store.inactive(42)
      expect(mockAction).toHaveBeenCalledWith({
        action: 'Inactive',
        id: 42,
      })
    })
  })

  describe('saveComments', () => {
    it('calls action API with comments and refetches', async () => {
      const store = useNoticeboardStore()
      store.init({ public: {} })
      mockAction.mockResolvedValue({})
      mockFetchNb.mockResolvedValue({ id: 42, name: 'Board' })

      await store.saveComments(42, 'Good condition')
      expect(mockAction).toHaveBeenCalledWith({
        action: 'Comments',
        id: 42,
        comments: 'Good condition',
      })
    })
  })

  describe('clear', () => {
    it('resets all state', () => {
      const store = useNoticeboardStore()
      store.init({ public: {} })
      store.list[1] = { id: 1 }
      store.members = [{ id: 1 }]

      store.clear()

      expect(store.list).toEqual({})
      expect(store.members).toEqual([])
    })
  })

  describe('byId getter', () => {
    it('returns noticeboard from list', () => {
      const store = useNoticeboardStore()
      store.list[42] = { id: 42, name: 'Test' }

      expect(store.byId(42)).toEqual({ id: 42, name: 'Test' })
    })

    it('returns undefined for unknown id', () => {
      const store = useNoticeboardStore()
      expect(store.byId(999)).toBeUndefined()
    })
  })
})
