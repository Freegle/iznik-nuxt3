import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useMessageStore } from '~/stores/message'
import { useAuthStore } from '~/stores/auth'

const mockFetchByUser = vi.fn()
const mockFetchMessages = vi.fn()
const mockFetchMT = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    message: {
      fetchByUser: mockFetchByUser,
      fetchMessages: mockFetchMessages,
      fetchMT: mockFetchMT,
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

describe('message store - fetchMessagesMT', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('suppresses Sentry for 404 race conditions but not for unexpected errors', async () => {
    mockFetchMessages.mockResolvedValue({ messages: [123] })
    mockFetchMT.mockResolvedValue({ id: 123, subject: 'Test message' })

    const store = useMessageStore()
    await store.fetchMessagesMT({ collection: 'Pending' })

    expect(mockFetchMT).toHaveBeenCalledOnce()
    const logErrorFn = mockFetchMT.mock.calls[0][1]
    expect(typeof logErrorFn).toBe('function')
    // 404 race condition: suppress Sentry
    expect(logErrorFn({ error: 404 })).toBe(false)
    // Unexpected 500: still log to Sentry
    expect(logErrorFn({ error: 500 })).toBe(true)
    // No data (network error): still log to Sentry
    expect(logErrorFn(null)).toBe(true)
  })

  it('skips 404 messages and still loads other messages in the batch', async () => {
    mockFetchMessages.mockResolvedValue({ messages: [123, 456] })
    mockFetchMT
      .mockRejectedValueOnce(new Error('404 Not Found'))
      .mockResolvedValueOnce({ id: 456, subject: 'Good message' })

    const store = useMessageStore()
    await store.fetchMessagesMT({ collection: 'Pending' })

    expect(store.list[456]).toBeDefined()
    expect(store.list[123]).toBeUndefined()
  })
})
