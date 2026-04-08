import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'

// Minimal mock for APIError (same shape as the real class)
class APIError extends Error {
  constructor(opts, msg) {
    super(msg)
    this.response = opts.response
  }
}

// Mocks used by the composable
const mockClearContext = vi.fn()
const mockClear = vi.fn()
const mockFetchMessagesMT = vi.fn()
const mockAll = ref([])
const mockGetByGroup = vi.fn(() => [])

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    clearContext: mockClearContext,
    clear: mockClear,
    fetchMessagesMT: mockFetchMessagesMT,
    get all() {
      return mockAll.value
    },
    getByGroup: mockGetByGroup,
  }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ work: null }),
}))

const mockMiscGet = vi.fn(() => undefined)
vi.mock('@/stores/misc', () => ({
  useMiscStore: () => ({
    get: mockMiscGet,
    deferGetMessages: false,
  }),
}))

describe('useModMessages getMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockFetchMessagesMT.mockResolvedValue([1, 2, 3])
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('resolves without throwing when fetchMessagesMT returns data', async () => {
    const { setupModMessages } = await import(
      '~/modtools/composables/useModMessages'
    )
    const { getMessages, collection } = setupModMessages()
    collection.value = 'Pending'

    await expect(getMessages()).resolves.not.toThrow()
  })

  it('handles a 401 APIError from fetchMessagesMT without throwing', async () => {
    // Arrange: simulate session expiry — fetchMessagesMT throws a 401 APIError
    mockFetchMessagesMT.mockRejectedValue(
      new APIError(
        { response: { status: 401 } },
        'API Error GET /modtools/messages -> status: 401'
      )
    )

    const { setupModMessages } = await import(
      '~/modtools/composables/useModMessages'
    )
    const { getMessages, collection } = setupModMessages()
    collection.value = 'Pending'

    // getMessages() must NOT throw — it should silently absorb the 401
    await expect(getMessages()).resolves.toBeUndefined()
  })

  it('resets show count to 0 on 401 so UI does not show stale message count', async () => {
    // First call succeeds — show is set to the number of messages
    mockFetchMessagesMT.mockResolvedValue([1, 2, 3])
    mockAll.value = [{ id: 1 }, { id: 2 }, { id: 3 }]

    const { setupModMessages } = await import(
      '~/modtools/composables/useModMessages'
    )
    const { getMessages, collection, show } = setupModMessages()
    collection.value = 'Pending'
    await getMessages()
    expect(show.value).toBe(3)

    // Second call gets 401 — show must reset to 0
    mockFetchMessagesMT.mockRejectedValue(
      new APIError(
        { response: { status: 401 } },
        'API Error GET /modtools/messages -> status: 401'
      )
    )
    await getMessages()
    expect(show.value).toBe(0)
  })
})
