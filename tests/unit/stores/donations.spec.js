import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetch = vi.fn()
const mockAdd = vi.fn()
const mockStripeIntent = vi.fn()
const mockStripeSubscription = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    donations: {
      fetch: mockFetch,
      add: mockAdd,
      stripeIntent: mockStripeIntent,
      stripeSubscription: mockStripeSubscription,
    },
  }),
}))

describe('donation store', () => {
  let useDonationStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/donations')
    useDonationStore = mod.useDonationStore
  })

  describe('initial state', () => {
    it('starts with default target and zero raised', () => {
      const store = useDonationStore()
      expect(store.target).toBe(2000)
      expect(store.raised).toBe(0)
    })
  })

  describe('fetch', () => {
    it('fetches and stores donation totals', async () => {
      const store = useDonationStore()
      store.init({ public: {} })
      mockFetch.mockResolvedValue({ target: 3000, raised: 1500 })

      await store.fetch(10)
      expect(store.target).toBe(3000)
      expect(store.raised).toBe(1500)
      expect(mockFetch).toHaveBeenCalledWith(10)
    })
  })

  describe('add', () => {
    it('adds donation and returns id', async () => {
      const store = useDonationStore()
      store.init({ public: {} })
      mockAdd.mockResolvedValue({ id: 42 })

      const id = await store.add(1, 50, '2026-01-01')
      expect(id).toBe(42)
      expect(mockAdd).toHaveBeenCalledWith(1, 50, '2026-01-01')
    })

    it('returns undefined when add returns null', async () => {
      const store = useDonationStore()
      store.init({ public: {} })
      mockAdd.mockResolvedValue(null)

      const id = await store.add(1, 50, '2026-01-01')
      expect(id).toBeUndefined()
    })
  })

  describe('stripeIntent', () => {
    it('creates stripe payment intent', async () => {
      const store = useDonationStore()
      store.init({ public: {} })
      mockStripeIntent.mockResolvedValue({ clientSecret: 'pi_123' })

      const result = await store.stripeIntent({ amount: 1000 })
      expect(result).toEqual({ clientSecret: 'pi_123' })
    })
  })

  describe('stripeSubscription', () => {
    it('creates stripe subscription', async () => {
      const store = useDonationStore()
      store.init({ public: {} })
      mockStripeSubscription.mockResolvedValue({ subscriptionId: 'sub_123' })

      const result = await store.stripeSubscription(500)
      expect(result).toEqual({ subscriptionId: 'sub_123' })
      expect(mockStripeSubscription).toHaveBeenCalledWith(500)
    })
  })
})
