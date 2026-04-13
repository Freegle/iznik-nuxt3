import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetch = vi.fn()
const mockFetchMessages = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    authority: {
      fetch: mockFetch,
      fetchMessages: mockFetchMessages,
    },
  }),
}))

describe('authority store', () => {
  let useAuthorityStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/authority')
    useAuthorityStore = mod.useAuthorityStore
  })

  describe('initial state', () => {
    it('starts with empty list', () => {
      const store = useAuthorityStore()
      expect(store.list).toEqual({})
    })
  })

  describe('fetch', () => {
    it('fetches authority by id and caches it', async () => {
      const store = useAuthorityStore()
      store.init({ public: {} })
      mockFetch.mockResolvedValue({ id: 1, name: 'Council A' })

      const result = await store.fetch(1)
      expect(result).toEqual({ id: 1, name: 'Council A' })
      expect(store.list[1]).toEqual({ id: 1, name: 'Council A' })
    })
  })

  describe('fetchMessages', () => {
    it('fetches messages for an authority', async () => {
      const store = useAuthorityStore()
      store.init({ public: {} })
      mockFetchMessages.mockResolvedValue([{ id: 10 }, { id: 11 }])

      const result = await store.fetchMessages(1)
      expect(result).toEqual([{ id: 10 }, { id: 11 }])
    })
  })

  describe('byId getter', () => {
    it('returns authority by id', () => {
      const store = useAuthorityStore()
      store.list[1] = { id: 1, name: 'Council A' }
      expect(store.byId(1)).toEqual({ id: 1, name: 'Council A' })
    })

    it('returns undefined for unknown id', () => {
      const store = useAuthorityStore()
      expect(store.byId(999)).toBeUndefined()
    })
  })
})
