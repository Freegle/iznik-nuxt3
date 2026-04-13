import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetchv2 = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    config: {
      fetchv2: mockFetchv2,
    },
  }),
}))

describe('config store', () => {
  let useConfigStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/config')
    useConfigStore = mod.useConfigStore
  })

  describe('initial state', () => {
    it('starts with empty list', () => {
      const store = useConfigStore()
      expect(store.list).toEqual({})
    })
  })

  describe('fetch', () => {
    it('fetches config value and caches it', async () => {
      const store = useConfigStore()
      store.init({ public: {} })
      mockFetchv2.mockResolvedValue([{ value: 'test_value' }])

      const result = await store.fetch('my_key')
      expect(result).toEqual([{ value: 'test_value' }])
      expect(store.list.my_key).toBeDefined()
      expect(store.list.my_key.values).toEqual([{ value: 'test_value' }])
    })

    it('returns cached value without refetching', async () => {
      const store = useConfigStore()
      store.init({ public: {} })
      store.list.my_key = {
        values: [{ value: 'cached' }],
        addedToCache: Math.round(Date.now() / 1000),
      }

      const result = await store.fetch('my_key')
      expect(result).toEqual([{ value: 'cached' }])
      expect(mockFetchv2).not.toHaveBeenCalled()
    })

    it('refetches when force=true', async () => {
      const store = useConfigStore()
      store.init({ public: {} })
      store.list.my_key = {
        values: [{ value: 'old' }],
        addedToCache: Math.round(Date.now() / 1000),
      }
      mockFetchv2.mockResolvedValue([{ value: 'new' }])

      const result = await store.fetch('my_key', true)
      expect(result).toEqual([{ value: 'new' }])
    })

    it('refetches when cache is expired (>600s)', async () => {
      const store = useConfigStore()
      store.init({ public: {} })
      store.list.my_key = {
        values: [{ value: 'old' }],
        addedToCache: Math.round(Date.now() / 1000) - 700,
      }
      mockFetchv2.mockResolvedValue([{ value: 'refreshed' }])

      const result = await store.fetch('my_key')
      expect(result).toEqual([{ value: 'refreshed' }])
    })

    it('deduplicates concurrent fetches for same key', async () => {
      const store = useConfigStore()
      store.init({ public: {} })

      let resolveFirst
      mockFetchv2.mockReturnValueOnce(
        new Promise((r) => {
          resolveFirst = r
        })
      )

      const f1 = store.fetch('my_key', true)
      const f2 = store.fetch('my_key', true)

      resolveFirst([{ value: 'result' }])
      await f1
      await f2

      expect(mockFetchv2).toHaveBeenCalledTimes(1)
    })
  })

  describe('byKey getter', () => {
    it('returns config values by key', () => {
      const store = useConfigStore()
      store.list.my_key = {
        values: [{ value: 'test' }],
        addedToCache: 123,
      }
      expect(store.byKey('my_key')).toEqual([{ value: 'test' }])
    })
  })
})
