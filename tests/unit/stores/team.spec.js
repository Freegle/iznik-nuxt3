import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetch = vi.fn()
const mockAdd = vi.fn()
const mockRemove = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    team: {
      fetch: mockFetch,
      add: mockAdd,
      remove: mockRemove,
    },
  }),
}))

describe('team store', () => {
  let useTeamStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/team')
    useTeamStore = mod.useTeamStore
  })

  describe('initial state', () => {
    it('starts with empty all and list', () => {
      const store = useTeamStore()
      expect(store.all).toEqual([])
      expect(store.list).toEqual({})
    })
  })

  describe('fetch', () => {
    it('fetches all teams when no team specified', async () => {
      const store = useTeamStore()
      store.init({ public: {} })
      mockFetch.mockResolvedValue([{ name: 'dev' }, { name: 'support' }])

      await store.fetch()
      expect(store.all).toHaveLength(2)
      expect(mockFetch).toHaveBeenCalledWith()
    })

    it('fetches specific team by name', async () => {
      const store = useTeamStore()
      store.init({ public: {} })
      mockFetch.mockResolvedValue([{ id: 1, name: 'Alice' }])

      const result = await store.fetch('dev')
      expect(result).toEqual([{ id: 1, name: 'Alice' }])
      expect(store.list.dev).toBeDefined()
      expect(mockFetch).toHaveBeenCalledWith({ name: 'dev' })
    })

    it('returns cached team without refetching', async () => {
      const store = useTeamStore()
      store.init({ public: {} })
      store.list.dev = [{ id: 1 }]

      const result = await store.fetch('dev')
      expect(result).toEqual([{ id: 1 }])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('deduplicates concurrent fetches for same team', async () => {
      const store = useTeamStore()
      store.init({ public: {} })

      let resolveFirst
      mockFetch.mockReturnValueOnce(
        new Promise((r) => {
          resolveFirst = r
        })
      )

      const f1 = store.fetch('dev')
      const f2 = store.fetch('dev')

      resolveFirst([{ id: 1 }])
      await f1
      await f2

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('add', () => {
    it('calls API add', async () => {
      const store = useTeamStore()
      store.init({ public: {} })
      mockAdd.mockResolvedValue({})

      await store.add({ team: 'dev', userid: 42 })
      expect(mockAdd).toHaveBeenCalledWith({ team: 'dev', userid: 42 })
    })
  })

  describe('remove', () => {
    it('calls API remove', async () => {
      const store = useTeamStore()
      store.init({ public: {} })
      mockRemove.mockResolvedValue({})

      await store.remove({ team: 'dev', userid: 42 })
      expect(mockRemove).toHaveBeenCalledWith({ team: 'dev', userid: 42 })
    })
  })

  describe('getTeam getter', () => {
    it('returns team from list', () => {
      const store = useTeamStore()
      store.list.dev = [{ id: 1, name: 'Alice' }]
      expect(store.getTeam('dev')).toEqual([{ id: 1, name: 'Alice' }])
    })

    it('returns undefined for unknown team', () => {
      const store = useTeamStore()
      expect(store.getTeam('unknown')).toBeUndefined()
    })
  })
})
