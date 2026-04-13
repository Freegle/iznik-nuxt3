import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockPost = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    image: {
      post: mockPost,
    },
  }),
}))

describe('image store', () => {
  let useImageStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/image')
    useImageStore = mod.useImageStore
  })

  it('posts image data', async () => {
    const store = useImageStore()
    store.init({ public: {} })
    mockPost.mockResolvedValue({ id: 1 })

    const result = await store.post({ file: 'data' })
    expect(result).toEqual({ id: 1 })
    expect(mockPost).toHaveBeenCalledWith({ file: 'data' })
  })

  it('rates image recognition', async () => {
    const store = useImageStore()
    store.init({ public: {} })
    mockPost.mockResolvedValue({})

    await store.rateRecognise(42, 'good')
    expect(mockPost).toHaveBeenCalledWith({ id: 42, raterecognise: 'good' })
  })
})
