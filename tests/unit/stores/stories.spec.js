import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockListv2 = vi.fn()
const mockFetchv2 = vi.fn()
const mockFetchStories = vi.fn()
const mockByGroupv2 = vi.fn()
const mockAdd = vi.fn()
const mockLove = vi.fn()
const mockUnlove = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    stories: {
      listv2: mockListv2,
      fetchv2: mockFetchv2,
      fetch: mockFetchStories,
      byGroupv2: mockByGroupv2,
      add: mockAdd,
      love: mockLove,
      unlove: mockUnlove,
    },
  }),
}))

describe('story store', () => {
  let useStoryStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/stories')
    useStoryStore = mod.useStoryStore
  })

  describe('initial state', () => {
    it('starts with empty list and recent', () => {
      const store = useStoryStore()
      expect(store.list).toEqual({})
      expect(store.recent).toEqual([])
    })
  })

  describe('init', () => {
    it('sets config and initialises fetching tracker', () => {
      const store = useStoryStore()
      store.init({ public: {} })
      expect(store.config).toEqual({ public: {} })
      expect(store.fetching).toEqual({})
    })
  })

  describe('fetch', () => {
    let store

    beforeEach(() => {
      store = useStoryStore()
      store.init({ public: {} })
    })

    it('fetches story and stores in list', async () => {
      mockFetchv2.mockResolvedValue({ id: 42, headline: 'Great trade' })

      const result = await store.fetch(42)
      expect(result).toEqual({ id: 42, headline: 'Great trade' })
      expect(store.list[42]).toEqual({ id: 42, headline: 'Great trade' })
    })

    it('returns cached story without refetching', async () => {
      store.list[42] = { id: 42, headline: 'Cached' }

      const result = await store.fetch(42)
      expect(result).toEqual({ id: 42, headline: 'Cached' })
      expect(mockFetchv2).not.toHaveBeenCalled()
    })

    it('refetches when force=true', async () => {
      store.list[42] = { id: 42, headline: 'Old' }
      mockFetchv2.mockResolvedValue({ id: 42, headline: 'New' })

      const result = await store.fetch(42, true)
      expect(result.headline).toBe('New')
    })

    it('deduplicates concurrent fetches', async () => {
      let resolveFirst
      const firstPromise = new Promise((r) => {
        resolveFirst = r
      })
      mockFetchv2.mockReturnValueOnce(firstPromise)

      const fetch1 = store.fetch(42, true)
      const fetch2 = store.fetch(42, true)

      resolveFirst({ id: 42, headline: 'Deduped' })
      await fetch1
      await fetch2

      expect(mockFetchv2).toHaveBeenCalledTimes(1)
    })
  })

  describe('fetchReviewing', () => {
    it('fetches reviewing IDs and fetches each story', async () => {
      const store = useStoryStore()
      store.init({ public: {} })
      mockListv2.mockResolvedValue([10, 20])
      mockFetchv2.mockImplementation((id) =>
        Promise.resolve({ id, headline: `Story ${id}` })
      )

      await store.fetchReviewing()

      expect(mockListv2).toHaveBeenCalledWith({
        reviewed: 0,
        dontzapfalsey: true,
      })
      expect(store.list[10]).toBeDefined()
      expect(store.list[20]).toBeDefined()
    })

    it('clears list before fetching', async () => {
      const store = useStoryStore()
      store.init({ public: {} })
      store.list[99] = { id: 99 }
      mockListv2.mockResolvedValue([])

      await store.fetchReviewing()

      expect(store.list[99]).toBeUndefined()
    })

    it('handles null response', async () => {
      const store = useStoryStore()
      store.init({ public: {} })
      mockListv2.mockResolvedValue(null)

      await store.fetchReviewing()

      expect(mockFetchv2).not.toHaveBeenCalled()
    })
  })

  describe('fetchNewsletterReviewing', () => {
    it('fetches newsletter reviewing IDs', async () => {
      const store = useStoryStore()
      store.init({ public: {} })
      mockListv2.mockResolvedValue([30])
      mockFetchv2.mockResolvedValue({ id: 30, headline: 'Newsletter' })

      await store.fetchNewsletterReviewing()

      expect(mockListv2).toHaveBeenCalledWith({
        newsletterreviewed: 0,
        dontzapfalsey: true,
      })
      expect(store.list[30]).toBeDefined()
    })

    it('clears list before fetching', async () => {
      const store = useStoryStore()
      store.init({ public: {} })
      store.list[99] = { id: 99 }
      mockListv2.mockResolvedValue([])

      await store.fetchNewsletterReviewing()

      expect(store.list[99]).toBeUndefined()
    })
  })

  describe('fetchRecent', () => {
    it('fetches recent stories with limit', async () => {
      const store = useStoryStore()
      store.init({ public: {} })
      mockListv2.mockResolvedValue([{ id: 1 }, { id: 2 }])

      await store.fetchRecent(5)
      expect(store.recent).toEqual([{ id: 1 }, { id: 2 }])
      expect(mockListv2).toHaveBeenCalledWith({ limit: 5 })
    })
  })

  describe('fetchByAuthority', () => {
    it('fetches IDs by authority then fetches each story', async () => {
      const store = useStoryStore()
      store.init({ public: {} })
      mockFetchStories.mockResolvedValue([10, 20])
      mockFetchv2.mockImplementation((id) =>
        Promise.resolve({ id, headline: `Story ${id}` })
      )

      const result = await store.fetchByAuthority(5, 10)

      expect(mockFetchStories).toHaveBeenCalledWith({
        authorityid: 5,
        limit: 10,
      })
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(10)
    })

    it('filters out missing stories', async () => {
      const store = useStoryStore()
      store.init({ public: {} })
      mockFetchStories.mockResolvedValue([10, 20])
      mockFetchv2
        .mockResolvedValueOnce({ id: 10, headline: 'Found' })
        .mockResolvedValueOnce(null)

      const result = await store.fetchByAuthority(5, 10)

      // ID 20 resolved to null, so list[20] = null, filtered out by Boolean
      expect(result).toHaveLength(1)
      expect(result[0].headline).toBe('Found')
    })

    it('handles null response', async () => {
      const store = useStoryStore()
      store.init({ public: {} })
      mockFetchStories.mockResolvedValue(null)

      const result = await store.fetchByAuthority(5, 10)

      expect(result).toEqual([])
    })
  })

  describe('fetchByGroup', () => {
    it('fetches stories by group and stores in recent', async () => {
      const store = useStoryStore()
      store.init({ public: {} })
      mockByGroupv2.mockResolvedValue([{ id: 1 }])

      await store.fetchByGroup(10, 5)
      expect(store.recent).toEqual([{ id: 1 }])
      expect(mockByGroupv2).toHaveBeenCalledWith(10, 5)
    })
  })

  describe('add', () => {
    it('calls API with story data', async () => {
      const store = useStoryStore()
      store.init({ public: {} })
      mockAdd.mockResolvedValue(99)

      const result = await store.add('Headline', 'Story body', 123, true)
      expect(result).toBe(99)
      expect(mockAdd).toHaveBeenCalledWith({
        headline: 'Headline',
        story: 'Story body',
        photo: 123,
        public: true,
      })
    })
  })

  describe('love', () => {
    it('calls API', async () => {
      const store = useStoryStore()
      store.init({ public: {} })
      mockLove.mockResolvedValue({})

      await store.love(42)
      expect(mockLove).toHaveBeenCalledWith(42)
    })
  })

  describe('unlove', () => {
    it('calls API', async () => {
      const store = useStoryStore()
      store.init({ public: {} })
      mockUnlove.mockResolvedValue({})

      await store.unlove(42)
      expect(mockUnlove).toHaveBeenCalledWith(42)
    })
  })

  describe('byId getter', () => {
    it('returns story from list', () => {
      const store = useStoryStore()
      store.list[42] = { id: 42, headline: 'Test' }

      expect(store.byId(42)).toEqual({ id: 42, headline: 'Test' })
    })

    it('returns undefined for unknown id', () => {
      const store = useStoryStore()
      expect(store.byId(999)).toBeUndefined()
    })
  })
})
