import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockChallenge = vi.fn()
const mockResponse = vi.fn()
const mockFetch = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    microvolunteering: {
      challenge: mockChallenge,
      response: mockResponse,
      fetch: mockFetch,
    },
  }),
}))

describe('microvolunteering store', () => {
  let useMicroVolunteeringStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/microvolunteering')
    useMicroVolunteeringStore = mod.useMicroVolunteeringStore
  })

  describe('initial state', () => {
    it('starts with empty list', () => {
      const store = useMicroVolunteeringStore()
      expect(store.list).toEqual({})
    })
  })

  describe('challenge', () => {
    it('fetches challenge item and stores it', async () => {
      const store = useMicroVolunteeringStore()
      store.init({ public: {} })
      mockChallenge.mockResolvedValue({ id: 1, type: 'SearchTerm' })

      const result = await store.challenge(['SearchTerm'])
      expect(result).toEqual({ id: 1, type: 'SearchTerm' })
      expect(store.list[1]).toEqual({ id: 1, type: 'SearchTerm' })
    })

    it('handles null response', async () => {
      const store = useMicroVolunteeringStore()
      store.init({ public: {} })
      mockChallenge.mockResolvedValue(null)

      const result = await store.challenge(['SearchTerm'])
      expect(result).toBeNull()
      expect(Object.keys(store.list)).toHaveLength(0)
    })
  })

  describe('respond', () => {
    it('sends response', async () => {
      const store = useMicroVolunteeringStore()
      store.init({ public: {} })
      mockResponse.mockResolvedValue({})

      await store.respond({ id: 1, response: 'yes' })
      expect(mockResponse).toHaveBeenCalledWith({ id: 1, response: 'yes' })
    })
  })

  describe('fetch', () => {
    it('fetches and stores microvolunteerings', async () => {
      const store = useMicroVolunteeringStore()
      store.init({ public: {} })
      mockFetch.mockResolvedValue({
        context: { total: 2 },
        microvolunteerings: [
          { id: 1, type: 'A' },
          { id: 2, type: 'B' },
        ],
      })

      const context = await store.fetch({ limit: 10 })
      expect(context).toEqual({ total: 2 })
      expect(store.list[1]).toEqual({ id: 1, type: 'A' })
      expect(store.list[2]).toEqual({ id: 2, type: 'B' })
    })
  })

  describe('clearOne', () => {
    it('removes a single item', () => {
      const store = useMicroVolunteeringStore()
      store.list[1] = { id: 1 }
      store.list[2] = { id: 2 }

      store.clearOne(1)
      expect(store.list[1]).toBeUndefined()
      expect(store.list[2]).toBeDefined()
    })
  })

  describe('clear', () => {
    it('resets list to empty', () => {
      const store = useMicroVolunteeringStore()
      store.list[1] = { id: 1 }

      store.clear()
      expect(store.list).toEqual({})
    })
  })

  describe('byId getter', () => {
    it('returns item by id', () => {
      const store = useMicroVolunteeringStore()
      store.list[1] = { id: 1, type: 'SearchTerm' }
      expect(store.byId(1)).toEqual({ id: 1, type: 'SearchTerm' })
    })

    it('returns undefined for unknown id', () => {
      const store = useMicroVolunteeringStore()
      expect(store.byId(999)).toBeUndefined()
    })
  })
})
