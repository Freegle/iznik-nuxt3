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
const mockStoreContext = ref(null)

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    clearContext: mockClearContext,
    clear: mockClear,
    fetchMessagesMT: mockFetchMessagesMT,
    get all() {
      return mockAll.value
    },
    getByGroup: mockGetByGroup,
    get context() {
      return mockStoreContext.value
    },
    set context(v) {
      mockStoreContext.value = v
    },
    list: {},
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

    await expect(getMessages()).resolves.toBeUndefined()
  })

  it('syncs pagination context after getMessages so loadMore continues', async () => {
    const paginationCtx = { Date: 1700000000, ID: 42 }
    mockFetchMessagesMT.mockImplementation(() => {
      mockStoreContext.value = paginationCtx
      return Promise.resolve([1, 2, 3])
    })
    mockAll.value = [{ id: 1 }, { id: 2 }, { id: 3 }]

    const { setupModMessages } = await import(
      '~/modtools/composables/useModMessages'
    )
    const { getMessages, collection, context } = setupModMessages()
    collection.value = 'Approved'
    await getMessages()

    // context ref should be synced from the store so loadMore() can paginate.
    expect(context.value).toEqual(paginationCtx)
  })

  it('resets show count to 0 on 401 so UI does not show stale message count', async () => {
    mockFetchMessagesMT.mockResolvedValue([1, 2, 3])
    mockAll.value = [{ id: 1 }, { id: 2 }, { id: 3 }]

    const { setupModMessages } = await import(
      '~/modtools/composables/useModMessages'
    )
    const { getMessages, collection, show } = setupModMessages()
    collection.value = 'Pending'
    await getMessages()
    expect(show.value).toBe(3)

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
