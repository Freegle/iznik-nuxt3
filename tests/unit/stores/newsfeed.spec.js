import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockCount = vi.fn()
const mockFetchNews = vi.fn()
const mockSeen = vi.fn()
const mockLove = vi.fn()
const mockUnlove = vi.fn()
const mockSend = vi.fn()
const mockEdit = vi.fn()
const mockDel = vi.fn()
const mockUnfollow = vi.fn()
const mockUnhide = vi.fn()
const mockHide = vi.fn()
const mockConvertToStory = vi.fn()
const mockReferto = vi.fn()
const mockReport = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    news: {
      count: mockCount,
      fetch: mockFetchNews,
      seen: mockSeen,
      love: mockLove,
      unlove: mockUnlove,
      send: mockSend,
      edit: mockEdit,
      del: mockDel,
      unfollow: mockUnfollow,
      unhide: mockUnhide,
      hide: mockHide,
      convertToStory: mockConvertToStory,
      referto: mockReferto,
      report: mockReport,
    },
  }),
}))

describe('newsfeed store', () => {
  let useNewsfeedStore

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    setActivePinia(createPinia())
    const mod = await import('~/stores/newsfeed')
    useNewsfeedStore = mod.useNewsfeedStore
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('starts with empty feed, list, and zero counts', () => {
      const store = useNewsfeedStore()
      expect(store.feed).toEqual([])
      expect(store.list).toEqual({})
      expect(store.maxSeen).toBe(0)
      expect(store.count).toBe(0)
      expect(store.lastDistance).toBe(0)
      expect(store.seenBeforeVisit).toBeNull()
      expect(store.delayedSeenMode).toBe(false)
      expect(store.delayedSeenTimer).toBeNull()
    })
  })

  describe('init', () => {
    it('sets config and initialises fetching tracker', () => {
      const store = useNewsfeedStore()
      store.init({ public: {} })
      expect(store.config).toEqual({ public: {} })
      expect(store.fetching).toEqual({})
      expect(store.maxSeen).toBe(0)
    })
  })

  describe('reset', () => {
    it('resets state but preserves config', () => {
      const store = useNewsfeedStore()
      store.init({ public: {} })
      store.list[1] = { id: 1 }
      store.maxSeen = 50
      store.count = 10

      store.reset()

      expect(store.list).toEqual({})
      expect(store.maxSeen).toBe(0)
      expect(store.count).toBe(0)
      expect(store.feed).toEqual([])
      expect(store.config).toEqual({ public: {} })
    })
  })

  describe('fetchCount', () => {
    let store

    beforeEach(() => {
      store = useNewsfeedStore()
      store.init({ public: {} })
    })

    it('fetches count and stores result', async () => {
      mockCount.mockResolvedValue({ count: 5 })

      const result = await store.fetchCount('nearby')
      expect(result).toBe(5)
      expect(store.count).toBe(5)
      expect(store.lastDistance).toBe('nearby')
      expect(mockCount).toHaveBeenCalledWith('nearby', true)
    })

    it('defaults distance to anywhere when falsy', async () => {
      mockCount.mockResolvedValue({ count: 3 })

      await store.fetchCount(0)
      expect(mockCount).toHaveBeenCalledWith('anywhere', true)
    })

    it('returns 0 when API returns null', async () => {
      mockCount.mockResolvedValue(null)

      const result = await store.fetchCount('nearby')
      expect(result).toBe(0)
      expect(store.count).toBe(0)
    })

    it('passes log parameter', async () => {
      mockCount.mockResolvedValue({ count: 1 })

      await store.fetchCount('nearby', false)
      expect(mockCount).toHaveBeenCalledWith('nearby', false)
    })
  })

  describe('addItems', () => {
    let store

    beforeEach(() => {
      store = useNewsfeedStore()
      store.init({ public: {} })
      mockSeen.mockResolvedValue({})
      mockCount.mockResolvedValue({ count: 0 })
    })

    it('adds items to list and updates maxSeen', () => {
      store.addItems([
        { id: 10, message: 'Hello' },
        { id: 20, message: 'World' },
      ])

      expect(store.list[10]).toBeDefined()
      expect(store.list[20]).toBeDefined()
      expect(store.maxSeen).toBe(20)
    })

    it('calls seen API when maxSeen increases', () => {
      store.addItems([{ id: 10 }])

      expect(mockSeen).toHaveBeenCalledWith(10)
    })

    it('does not call seen API when in delayed seen mode', () => {
      store.delayedSeenMode = true
      store.addItems([{ id: 10 }])

      expect(mockSeen).not.toHaveBeenCalled()
    })

    it('does not call seen API when maxSeen does not increase', () => {
      store.maxSeen = 50
      store.addItems([{ id: 10 }])

      expect(mockSeen).not.toHaveBeenCalled()
    })

    it('recursively adds nested reply objects', () => {
      store.addItems([
        {
          id: 1,
          message: 'Thread',
          replies: [
            { id: 2, message: 'Reply 1' },
            { id: 3, message: 'Reply 2' },
          ],
        },
      ])

      expect(store.list[1]).toBeDefined()
      expect(store.list[2]).toBeDefined()
      expect(store.list[3]).toBeDefined()
      expect(store.maxSeen).toBe(3)
    })

    it('converts reply objects to IDs after adding', () => {
      const items = [
        {
          id: 1,
          replies: [
            { id: 2, message: 'Reply' },
            { id: 3, message: 'Reply 2' },
          ],
        },
      ]

      store.addItems(items)

      expect(items[0].replies).toEqual([2, 3])
    })

    it('leaves reply IDs as-is when already numeric', () => {
      const items = [{ id: 1, replies: [2, 3] }]

      store.addItems(items)

      expect(items[0].replies).toEqual([2, 3])
    })

    it('initialises empty replies array when no replies', () => {
      const items = [{ id: 1 }]

      store.addItems(items)

      expect(items[0].replies).toEqual([])
    })
  })

  describe('snapshotSeenBeforeVisit', () => {
    it('captures current maxSeen and enables delayed mode', () => {
      const store = useNewsfeedStore()
      store.init({ public: {} })
      store.maxSeen = 42

      store.snapshotSeenBeforeVisit()

      expect(store.seenBeforeVisit).toBe(42)
      expect(store.delayedSeenMode).toBe(true)
    })
  })

  describe('startDelayedSeen', () => {
    it('sets a timer that calls markAllSeen after delay', () => {
      const store = useNewsfeedStore()
      store.init({ public: {} })
      store.maxSeen = 10
      mockSeen.mockResolvedValue({})
      mockCount.mockResolvedValue({ count: 0 })

      store.startDelayedSeen(5000)
      expect(store.delayedSeenTimer).not.toBeNull()

      vi.advanceTimersByTime(5000)

      expect(mockSeen).toHaveBeenCalledWith(10)
      expect(store.delayedSeenMode).toBe(false)
    })

    it('clears previous timer before setting new one', () => {
      const store = useNewsfeedStore()
      store.init({ public: {} })
      store.maxSeen = 10
      mockSeen.mockResolvedValue({})
      mockCount.mockResolvedValue({ count: 0 })

      store.startDelayedSeen(5000)
      const firstTimer = store.delayedSeenTimer

      store.startDelayedSeen(10000)
      expect(store.delayedSeenTimer).not.toBe(firstTimer)

      // First timer shouldn't fire
      vi.advanceTimersByTime(5000)
      expect(mockSeen).not.toHaveBeenCalled()

      // Second timer fires at 10s
      vi.advanceTimersByTime(5000)
      expect(mockSeen).toHaveBeenCalledWith(10)
    })

    it('defaults to 30s delay', () => {
      const store = useNewsfeedStore()
      store.init({ public: {} })
      store.maxSeen = 10
      mockSeen.mockResolvedValue({})
      mockCount.mockResolvedValue({ count: 0 })

      store.startDelayedSeen()

      vi.advanceTimersByTime(29999)
      expect(mockSeen).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(mockSeen).toHaveBeenCalledWith(10)
    })
  })

  describe('markAllSeen', () => {
    let store

    beforeEach(() => {
      store = useNewsfeedStore()
      store.init({ public: {} })
      mockSeen.mockResolvedValue({})
      mockCount.mockResolvedValue({ count: 0 })
    })

    it('marks all items as seen and disables delayed mode', () => {
      store.maxSeen = 50
      store.delayedSeenMode = true

      store.markAllSeen()

      expect(mockSeen).toHaveBeenCalledWith(50)
      expect(store.delayedSeenMode).toBe(false)
    })

    it('clears the delayed timer', () => {
      store.delayedSeenTimer = setTimeout(() => {}, 10000)
      store.maxSeen = 50

      store.markAllSeen()

      expect(store.delayedSeenTimer).toBeNull()
    })

    it('does nothing when maxSeen is 0', () => {
      store.maxSeen = 0
      store.markAllSeen()

      expect(mockSeen).not.toHaveBeenCalled()
    })
  })

  describe('cancelDelayedSeen', () => {
    it('clears timer and resets delayed mode', () => {
      const store = useNewsfeedStore()
      store.init({ public: {} })
      store.delayedSeenTimer = setTimeout(() => {}, 10000)
      store.delayedSeenMode = true
      store.seenBeforeVisit = 42

      store.cancelDelayedSeen()

      expect(store.delayedSeenTimer).toBeNull()
      expect(store.delayedSeenMode).toBe(false)
      expect(store.seenBeforeVisit).toBeNull()
    })
  })

  describe('fetchFeed', () => {
    let store

    beforeEach(() => {
      store = useNewsfeedStore()
      store.init({ public: {} })
    })

    it('fetches feed and stores result', async () => {
      const feedData = [{ id: 1 }, { id: 2 }]
      mockFetchNews.mockResolvedValue(feedData)

      const result = await store.fetchFeed('nearby')
      expect(result).toEqual(feedData)
      expect(store.feed).toEqual(feedData)
      expect(store.lastDistance).toBe('nearby')
      expect(mockFetchNews).toHaveBeenCalledWith(null, 'nearby')
    })

    it('defaults distance to anywhere when falsy', async () => {
      mockFetchNews.mockResolvedValue([])

      await store.fetchFeed(0)
      expect(mockFetchNews).toHaveBeenCalledWith(null, 'anywhere')
    })
  })

  describe('fetch', () => {
    let store

    beforeEach(() => {
      store = useNewsfeedStore()
      store.init({ public: {} })
      mockSeen.mockResolvedValue({})
      mockCount.mockResolvedValue({ count: 0 })
    })

    it('fetches item and adds to list', async () => {
      mockFetchNews.mockResolvedValue({ id: 42, message: 'Test' })

      const result = await store.fetch(42)
      expect(result).toEqual({ id: 42, message: 'Test', replies: [] })
      expect(store.list[42]).toBeDefined()
    })

    it('returns cached item without force', async () => {
      store.list[42] = { id: 42, message: 'Cached' }
      mockFetchNews.mockResolvedValue({ id: 42, message: 'Fresh' })

      const result = await store.fetch(42)
      expect(result.message).toBe('Cached')

      // But kicks off a background refresh
      expect(mockFetchNews).toHaveBeenCalled()
    })

    it('refetches when force=true', async () => {
      store.list[42] = { id: 42, message: 'Old' }
      mockFetchNews.mockResolvedValue({ id: 42, message: 'New' })

      const result = await store.fetch(42, true)
      expect(result.message).toBe('New')
    })

    it('deduplicates concurrent fetches for same id', async () => {
      let resolveFirst
      const firstPromise = new Promise((r) => {
        resolveFirst = r
      })
      mockFetchNews.mockReturnValueOnce(firstPromise)

      const fetch1 = store.fetch(42, true)
      const fetch2 = store.fetch(42, true)

      resolveFirst({ id: 42, message: 'Deduped' })
      await fetch1
      await fetch2

      expect(mockFetchNews).toHaveBeenCalledTimes(1)
    })

    it('passes lovelist parameter to API', async () => {
      mockFetchNews.mockResolvedValue({ id: 42, message: 'Test' })

      await store.fetch(42, true, true)
      expect(mockFetchNews).toHaveBeenCalledWith(42, null, true, false)
    })

    it('handles null API response gracefully', async () => {
      mockFetchNews.mockResolvedValue(null)

      const result = await store.fetch(42)
      expect(result).toBeUndefined()
    })

    it('handles fetch error gracefully', async () => {
      mockFetchNews.mockRejectedValue(new Error('Network error'))

      const result = await store.fetch(42)
      expect(result).toBeUndefined()
    })
  })

  describe('love', () => {
    it('calls API and refetches threadhead', async () => {
      const store = useNewsfeedStore()
      store.init({ public: {} })
      mockLove.mockResolvedValue({})
      mockFetchNews.mockResolvedValue({ id: 1, message: 'Thread' })
      mockSeen.mockResolvedValue({})
      mockCount.mockResolvedValue({ count: 0 })

      await store.love(5, 1)
      expect(mockLove).toHaveBeenCalledWith(5)
      expect(mockFetchNews).toHaveBeenCalledWith(1, null, undefined, false)
    })
  })

  describe('unlove', () => {
    it('calls API and refetches threadhead', async () => {
      const store = useNewsfeedStore()
      store.init({ public: {} })
      mockUnlove.mockResolvedValue({})
      mockFetchNews.mockResolvedValue({ id: 1, message: 'Thread' })
      mockSeen.mockResolvedValue({})
      mockCount.mockResolvedValue({ count: 0 })

      await store.unlove(5, 1)
      expect(mockUnlove).toHaveBeenCalledWith(5)
    })
  })

  describe('send', () => {
    let store

    beforeEach(() => {
      store = useNewsfeedStore()
      store.init({ public: {} })
      mockSeen.mockResolvedValue({})
      mockCount.mockResolvedValue({ count: 0 })
    })

    it('sends new thread and fetches feed', async () => {
      mockSend.mockResolvedValue(99)
      mockFetchNews.mockResolvedValue([])

      const id = await store.send('Hello world', null, null, null)
      expect(id).toBe(99)
      expect(mockSend).toHaveBeenCalledWith({
        message: 'Hello world',
        replyto: null,
        threadhead: null,
        imageid: null,
      })
      // Should fetch feed for new thread
      expect(mockFetchNews).toHaveBeenCalledWith(null, 'anywhere')
    })

    it('sends reply and fetches threadhead', async () => {
      mockSend.mockResolvedValue(100)
      mockFetchNews.mockResolvedValue({ id: 1, message: 'Thread' })

      const id = await store.send('Reply', 5, 1, null)
      expect(id).toBe(100)
      // Should fetch threadhead, not feed
      expect(mockFetchNews).toHaveBeenCalledWith(1, null, undefined, false)
    })

    it('trims message whitespace', async () => {
      mockSend.mockResolvedValue(101)
      mockFetchNews.mockResolvedValue([])

      await store.send('  Hello  \n', null, null, null)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Hello' })
      )
    })

    it('handles null message', async () => {
      mockSend.mockResolvedValue(102)
      mockFetchNews.mockResolvedValue([])

      await store.send(null, null, null, null)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ message: null })
      )
    })

    it('passes imageid', async () => {
      mockSend.mockResolvedValue(103)
      mockFetchNews.mockResolvedValue([])

      await store.send('With image', null, null, 456)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ imageid: 456 })
      )
    })
  })

  describe('edit', () => {
    it('calls API and refetches threadhead', async () => {
      const store = useNewsfeedStore()
      store.init({ public: {} })
      mockEdit.mockResolvedValue({})
      mockFetchNews.mockResolvedValue({ id: 1 })
      mockSeen.mockResolvedValue({})
      mockCount.mockResolvedValue({ count: 0 })

      await store.edit(5, 'Updated message', 1)
      expect(mockEdit).toHaveBeenCalledWith(5, 'Updated message')
    })
  })

  describe('delete', () => {
    let store

    beforeEach(() => {
      store = useNewsfeedStore()
      store.init({ public: {} })
      mockDel.mockResolvedValue({})
      mockSeen.mockResolvedValue({})
      mockCount.mockResolvedValue({ count: 0 })
    })

    it('deletes reply and refetches threadhead', async () => {
      mockFetchNews.mockResolvedValue({ id: 1, message: 'Thread' })

      await store.delete(5, 1)
      expect(mockDel).toHaveBeenCalledWith(5)
      expect(mockFetchNews).toHaveBeenCalled()
    })

    it('deletes thread and removes from list and feed', async () => {
      store.list[1] = { id: 1, message: 'Thread' }
      store.feed = [{ id: 1 }, { id: 2 }]

      await store.delete(1, 1)
      expect(mockDel).toHaveBeenCalledWith(1)
      expect(store.list[1]).toBeUndefined()
      expect(store.feed).toEqual([{ id: 2 }])
      // Should NOT refetch - just removes locally
      expect(mockFetchNews).not.toHaveBeenCalled()
    })
  })

  describe('simple API passthrough actions', () => {
    let store

    beforeEach(() => {
      store = useNewsfeedStore()
      store.init({ public: {} })
      mockSeen.mockResolvedValue({})
      mockCount.mockResolvedValue({ count: 0 })
    })

    it('unfollow calls API', async () => {
      mockUnfollow.mockResolvedValue({})
      await store.unfollow(42)
      expect(mockUnfollow).toHaveBeenCalledWith(42)
    })

    it('unhide calls API and refetches', async () => {
      mockUnhide.mockResolvedValue({})
      mockFetchNews.mockResolvedValue({ id: 42 })

      await store.unhide(42)
      expect(mockUnhide).toHaveBeenCalledWith(42)
    })

    it('hide calls API and refetches', async () => {
      mockHide.mockResolvedValue({})
      mockFetchNews.mockResolvedValue({ id: 42 })

      await store.hide(42)
      expect(mockHide).toHaveBeenCalledWith(42)
    })

    it('convertToStory calls API', async () => {
      mockConvertToStory.mockResolvedValue({})
      await store.convertToStory(42)
      expect(mockConvertToStory).toHaveBeenCalledWith(42)
    })

    it('referTo calls API and refetches', async () => {
      mockReferto.mockResolvedValue({})
      mockFetchNews.mockResolvedValue({ id: 42 })

      await store.referTo(42, 'spam')
      expect(mockReferto).toHaveBeenCalledWith(42, 'spam')
    })

    it('report calls API', async () => {
      mockReport.mockResolvedValue({})
      await store.report(42, 'inappropriate')
      expect(mockReport).toHaveBeenCalledWith(42, 'inappropriate')
    })
  })

  describe('byId getter', () => {
    it('returns item from list', () => {
      const store = useNewsfeedStore()
      store.list[42] = { id: 42, message: 'Test' }

      expect(store.byId(42)).toEqual({ id: 42, message: 'Test' })
    })

    it('returns undefined for unknown id', () => {
      const store = useNewsfeedStore()
      expect(store.byId(999)).toBeUndefined()
    })
  })

  describe('tagusers getter', () => {
    it('returns deduplicated sorted list of users', () => {
      const store = useNewsfeedStore()
      store.list[1] = { id: 1, userid: 10, displayname: 'Zara' }
      store.list[2] = { id: 2, userid: 20, displayname: 'Alice' }
      store.list[3] = { id: 3, userid: 10, displayname: 'Zara' }

      const users = store.tagusers
      expect(users).toHaveLength(2)
      expect(users[0].displayname).toBe('Alice')
      expect(users[1].displayname).toBe('Zara')
    })

    it('includes users from replies that are objects', () => {
      const store = useNewsfeedStore()
      store.list[1] = {
        id: 1,
        userid: 10,
        displayname: 'Alice',
        replies: [{ userid: 20, displayname: 'Bob' }],
      }

      const users = store.tagusers
      expect(users).toHaveLength(2)
      expect(users[0].displayname).toBe('Alice')
      expect(users[1].displayname).toBe('Bob')
    })

    it('skips items without userid or displayname', () => {
      const store = useNewsfeedStore()
      store.list[1] = { id: 1, userid: 10 }
      store.list[2] = { id: 2, displayname: 'Alice' }
      store.list[3] = { id: 3, userid: 30, displayname: 'Charlie' }

      const users = store.tagusers
      expect(users).toHaveLength(1)
      expect(users[0].displayname).toBe('Charlie')
    })

    it('returns empty array when no items', () => {
      const store = useNewsfeedStore()
      expect(store.tagusers).toEqual([])
    })

    it('skips reply IDs (non-object replies)', () => {
      const store = useNewsfeedStore()
      store.list[1] = {
        id: 1,
        userid: 10,
        displayname: 'Alice',
        replies: [2, 3],
      }

      const users = store.tagusers
      expect(users).toHaveLength(1)
      expect(users[0].displayname).toBe('Alice')
    })
  })
})
