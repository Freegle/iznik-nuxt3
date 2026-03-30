import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useMessageStore } from '~/stores/message'
import { useAuthStore } from '~/stores/auth'

const mockFetchByUser = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    message: {
      fetchByUser: mockFetchByUser,
    },
  }),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => ({}),
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({}),
}))

vi.mock('~/stores/isochrone', () => ({
  useIsochroneStore: () => ({}),
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({}),
}))

describe('message store - fetchActivePostCount', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('sets counter to 0 when user is not logged in', async () => {
    useAuthStore.mockReturnValue({ user: null })

    const store = useMessageStore()
    store.activePostsCounter = 5

    await store.fetchActivePostCount()

    expect(store.activePostsCounter).toBe(0)
    expect(mockFetchByUser).not.toHaveBeenCalled()
  })

  it('counts active messages when user is logged in', async () => {
    useAuthStore.mockReturnValue({ user: { id: 42 } })
    mockFetchByUser.mockResolvedValue([
      { id: 1, subject: 'Sofa' },
      { id: 2, subject: 'Chair' },
    ])

    const store = useMessageStore()
    await store.fetchActivePostCount()

    expect(mockFetchByUser).toHaveBeenCalledWith(42, true)
    expect(store.activePostsCounter).toBe(2)
  })

  it('sets counter to 0 when API returns non-array', async () => {
    useAuthStore.mockReturnValue({ user: { id: 42 } })
    mockFetchByUser.mockResolvedValue(null)

    const store = useMessageStore()
    await store.fetchActivePostCount()

    expect(store.activePostsCounter).toBe(0)
  })
})
