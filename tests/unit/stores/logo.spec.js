import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetch = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    logo: {
      fetch: mockFetch,
    },
  }),
}))

describe('logo store', () => {
  let useLogoStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/logo')
    useLogoStore = mod.useLogoStore
  })

  it('fetches logo with params', async () => {
    const store = useLogoStore()
    store.init({ public: {} })
    mockFetch.mockResolvedValue({ url: 'https://example.com/logo.png' })

    const result = await store.fetch({ groupid: 5 })
    expect(result).toEqual({ url: 'https://example.com/logo.png' })
    expect(mockFetch).toHaveBeenCalledWith({ groupid: 5 })
  })
})
