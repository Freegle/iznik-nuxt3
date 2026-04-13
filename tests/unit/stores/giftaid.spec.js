import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockGet = vi.fn()
const mockSave = vi.fn()
const mockRemove = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    giftaid: {
      get: mockGet,
      save: mockSave,
      remove: mockRemove,
    },
  }),
}))

describe('giftaid store', () => {
  let useGiftAidStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/giftaid')
    useGiftAidStore = mod.useGiftAidStore
  })

  describe('initial state', () => {
    it('starts with empty giftaid object', () => {
      const store = useGiftAidStore()
      expect(store.giftaid).toEqual({})
    })
  })

  describe('fetch', () => {
    it('fetches and stores giftaid data', async () => {
      const store = useGiftAidStore()
      store.init({ public: {} })
      mockGet.mockResolvedValue({ name: 'Alice', postcode: 'SW1A 1AA' })

      const result = await store.fetch()
      expect(result).toEqual({ name: 'Alice', postcode: 'SW1A 1AA' })
      expect(store.giftaid).toEqual({ name: 'Alice', postcode: 'SW1A 1AA' })
    })

    it('defaults to empty object when API returns null', async () => {
      const store = useGiftAidStore()
      store.init({ public: {} })
      mockGet.mockResolvedValue(null)

      const result = await store.fetch()
      expect(result).toEqual({})
      expect(store.giftaid).toEqual({})
    })
  })

  describe('save', () => {
    it('saves current giftaid state', async () => {
      const store = useGiftAidStore()
      store.init({ public: {} })
      store.giftaid = { name: 'Bob' }

      await store.save()
      expect(mockSave).toHaveBeenCalledWith({ name: 'Bob' })
    })
  })

  describe('remove', () => {
    it('calls API remove', async () => {
      const store = useGiftAidStore()
      store.init({ public: {} })

      await store.remove()
      expect(mockRemove).toHaveBeenCalled()
    })
  })
})
