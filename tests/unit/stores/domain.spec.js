import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetch = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    domain: {
      fetch: mockFetch,
    },
  }),
}))

describe('domain store', () => {
  let useDomainStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/domain')
    useDomainStore = mod.useDomainStore
  })

  it('fetches domain with params', async () => {
    const store = useDomainStore()
    store.init({ public: {} })
    mockFetch.mockResolvedValue({ domain: 'example.com' })

    const result = await store.fetch({ id: 1 })
    expect(result).toEqual({ domain: 'example.com' })
    expect(mockFetch).toHaveBeenCalledWith({ id: 1 })
  })
})
