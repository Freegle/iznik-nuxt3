import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetch = vi.fn()
const mockAdd = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    shortlinks: {
      fetch: mockFetch,
      add: mockAdd,
    },
  }),
}))

describe('shortlink store', () => {
  let useShortlinkStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/shortlinks')
    useShortlinkStore = mod.useShortlinkStore
  })

  describe('initial state', () => {
    it('starts with empty list', () => {
      const store = useShortlinkStore()
      expect(store.list).toEqual({})
    })
  })

  describe('fetch', () => {
    it('fetches shortlinks for a group and stores them', async () => {
      const store = useShortlinkStore()
      store.init({ public: {} })
      mockFetch.mockResolvedValue({
        shortlinks: [
          { id: 1, name: 'link1' },
          { id: 2, name: 'link2' },
        ],
      })

      await store.fetch(null, 10)
      expect(store.list[1].name).toBe('link1')
      expect(store.list[2].name).toBe('link2')
    })

    it('clears list when groupid is provided', async () => {
      const store = useShortlinkStore()
      store.init({ public: {} })
      store.list[99] = { id: 99, name: 'old' }
      mockFetch.mockResolvedValue({ shortlinks: [] })

      await store.fetch(null, 10)
      expect(store.list[99]).toBeUndefined()
    })

    it('fetches single shortlink by id', async () => {
      const store = useShortlinkStore()
      store.init({ public: {} })
      mockFetch.mockResolvedValue({
        shortlink: { id: 5, name: 'single' },
      })

      await store.fetch(5)
      expect(store.list[5].name).toBe('single')
    })
  })

  describe('add', () => {
    it('adds shortlink and fetches it', async () => {
      const store = useShortlinkStore()
      store.init({ public: {} })
      mockAdd.mockResolvedValue(42)
      mockFetch.mockResolvedValue({
        shortlink: { id: 42, name: 'newlink' },
      })

      const id = await store.add(10, 'newlink')
      expect(id).toBe(42)
      expect(store.list[42].name).toBe('newlink')
    })

    it('returns null when add fails', async () => {
      const store = useShortlinkStore()
      store.init({ public: {} })
      mockAdd.mockResolvedValue(null)

      const id = await store.add(10, 'test')
      expect(id).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('clear', () => {
    it('resets list to empty object', () => {
      const store = useShortlinkStore()
      store.list[1] = { id: 1 }
      store.clear()
      expect(store.list).toEqual({})
    })
  })

  describe('byId getter', () => {
    it('returns shortlink by id', () => {
      const store = useShortlinkStore()
      store.list[42] = { id: 42, name: 'test' }
      expect(store.byId(42)).toEqual({ id: 42, name: 'test' })
    })

    it('returns undefined for unknown id', () => {
      const store = useShortlinkStore()
      expect(store.byId(999)).toBeUndefined()
    })
  })
})
