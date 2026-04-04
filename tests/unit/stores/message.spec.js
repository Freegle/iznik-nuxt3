import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useMessageStore } from '~/stores/message'
import { useAuthStore } from '~/stores/auth'

const mockFetchByUser = vi.fn()
const mockSave = vi.fn()
const mockFetch = vi.fn()
const mockFetchMessages = vi.fn()
const mockFetchMT = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    message: {
      fetchByUser: mockFetchByUser,
      save: mockSave,
      fetch: mockFetch,
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

const mockMiscStore = { modtools: false }
vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

describe('message store - patch()', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockMiscStore.modtools = false
  })

  it('syncs updated message into byUserList after patching', async () => {
    useAuthStore.mockReturnValue({ user: { id: 99 } })

    const store = useMessageStore()

    // Pre-populate byUserList with an expired message
    store.byUserList[99] = [
      { id: 1001, subject: 'Sofa', hasoutcome: true },
      { id: 1002, subject: 'Chair', hasoutcome: false },
    ]

    // PATCH returns success; subsequent fetch returns hasoutcome=false (server cleared it)
    mockSave.mockResolvedValue({ id: 1001 })
    mockFetch.mockResolvedValue({
      id: 1001,
      subject: 'Sofa',
      hasoutcome: false,
    })

    // Simulate what fetch() does: it puts the fetched message into this.list
    store.list[1001] = { id: 1001, subject: 'Sofa', hasoutcome: false }

    // Spy on the store's fetch method to avoid real API calls
    const fetchSpy = vi.spyOn(store, 'fetch').mockImplementation((id) => {
      store.list[id] = { id, subject: 'Sofa', hasoutcome: false }
    })

    await store.patch({ id: 1001, deadline: '2026-05-01' })

    // The fixed patch() must sync the updated state into byUserList
    expect(store.byUserList[99][0].hasoutcome).toBe(false)
    // Other entries should be unaffected
    expect(store.byUserList[99][1].hasoutcome).toBe(false)

    fetchSpy.mockRestore()
  })

  it('does not touch byUserList when message is not present', async () => {
    useAuthStore.mockReturnValue({ user: { id: 99 } })

    const store = useMessageStore()
    store.byUserList[99] = [{ id: 2001, subject: 'Other', hasoutcome: false }]
    store.list[1001] = { id: 1001, subject: 'Sofa', hasoutcome: false }

    const fetchSpy = vi.spyOn(store, 'fetch').mockImplementation((id) => {
      store.list[id] = { id, subject: 'Sofa', hasoutcome: false }
    })

    mockSave.mockResolvedValue({ id: 1001 })

    await store.patch({ id: 1001, deadline: '2026-05-01' })

    // Unrelated entries unchanged
    expect(store.byUserList[99][0].hasoutcome).toBe(false)
    expect(store.byUserList[99].length).toBe(1)

    fetchSpy.mockRestore()
  })
})

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
