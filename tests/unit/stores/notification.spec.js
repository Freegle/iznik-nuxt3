import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockCount = vi.fn()
const mockList = vi.fn()
const mockSeen = vi.fn()
const mockAllSeen = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    notification: {
      count: mockCount,
      list: mockList,
      seen: mockSeen,
      allSeen: mockAllSeen,
    },
  }),
}))

// Re-export APIError for instanceof checks
class MockAPIError extends Error {
  constructor(message, response) {
    super(message)
    this.name = 'APIError'
    this.response = response
  }
}

vi.mock('~/api/APIErrors', () => ({
  APIError: MockAPIError,
}))

describe('notification store', () => {
  let useNotificationStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/notification')
    useNotificationStore = mod.useNotificationStore
  })

  describe('initial state', () => {
    it('starts with empty list and zero count', () => {
      const store = useNotificationStore()
      expect(store.list).toEqual([])
      expect(store.listById).toEqual({})
      expect(store.count).toBe(0)
    })
  })

  describe('fetchCount', () => {
    it('fetches and stores count', async () => {
      const store = useNotificationStore()
      store.init({ public: {} })
      mockCount.mockResolvedValue({ count: 5 })

      const result = await store.fetchCount()
      expect(result).toBe(5)
      expect(store.count).toBe(5)
    })

    it('swallows 401 errors', async () => {
      const store = useNotificationStore()
      store.init({ public: {} })
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockCount.mockRejectedValue(
        new MockAPIError('Unauthorized', { status: 401 })
      )

      // Should not throw
      await store.fetchCount()
      logSpy.mockRestore()
    })

    it('rethrows non-401 API errors', async () => {
      const store = useNotificationStore()
      store.init({ public: {} })
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockCount.mockRejectedValue(
        new MockAPIError('Server error', { status: 500 })
      )

      await expect(store.fetchCount()).rejects.toThrow('Server error')
      logSpy.mockRestore()
    })

    it('swallows non-APIError exceptions', async () => {
      const store = useNotificationStore()
      store.init({ public: {} })
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockCount.mockRejectedValue(new Error('Network error'))

      // Should not throw (not an APIError)
      await store.fetchCount()
      logSpy.mockRestore()
    })
  })

  describe('fetchList', () => {
    it('fetches list and populates listById', async () => {
      const store = useNotificationStore()
      store.init({ public: {} })
      mockList.mockResolvedValue([
        { id: 1, title: 'Notif 1' },
        { id: 2, title: 'Notif 2' },
      ])

      const result = await store.fetchList()
      expect(result).toHaveLength(2)
      expect(store.listById[1].title).toBe('Notif 1')
      expect(store.listById[2].title).toBe('Notif 2')
    })

    it('does not overwrite existing listById entries', async () => {
      const store = useNotificationStore()
      store.init({ public: {} })
      store.listById[1] = { id: 1, title: 'Original' }
      mockList.mockResolvedValue([{ id: 1, title: 'Updated' }])

      await store.fetchList()
      expect(store.listById[1].title).toBe('Original')
    })

    it('swallows 401 errors', async () => {
      const store = useNotificationStore()
      store.init({ public: {} })
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockList.mockRejectedValue(
        new MockAPIError('Unauthorized', { status: 401 })
      )

      await store.fetchList()
      logSpy.mockRestore()
    })
  })

  describe('seen', () => {
    it('marks notification seen and refetches count', async () => {
      const store = useNotificationStore()
      store.init({ public: {} })
      mockSeen.mockResolvedValue({})
      mockCount.mockResolvedValue({ count: 3 })

      await store.seen(42)
      expect(mockSeen).toHaveBeenCalledWith(42)
      expect(mockCount).toHaveBeenCalled()
    })
  })

  describe('allSeen', () => {
    it('marks all seen and refetches count', async () => {
      const store = useNotificationStore()
      store.init({ public: {} })
      mockAllSeen.mockResolvedValue({})
      mockCount.mockResolvedValue({ count: 0 })

      await store.allSeen(42)
      expect(mockAllSeen).toHaveBeenCalledWith(42)
      expect(store.count).toBe(0)
    })
  })

  describe('byId getter', () => {
    it('returns notification by id', () => {
      const store = useNotificationStore()
      store.listById[42] = { id: 42, title: 'Test' }
      expect(store.byId(42)).toEqual({ id: 42, title: 'Test' })
    })

    it('returns undefined for unknown id', () => {
      const store = useNotificationStore()
      expect(store.byId(999)).toBeUndefined()
    })
  })
})
