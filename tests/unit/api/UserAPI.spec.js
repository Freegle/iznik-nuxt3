import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSetAuth = vi.fn()
const mockSetUser = vi.fn()
const mockApiCounter = vi.fn()
const mockWaitForOnline = vi.fn().mockResolvedValue()
const mockCaptureMessage = vi.fn()

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    auth: { jwt: 'test-jwt', persistent: 'test-persistent' },
    user: { id: 123 },
    setAuth: mockSetAuth,
    setUser: mockSetUser,
  }),
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    modtools: false,
    api: mockApiCounter,
    waitForOnline: mockWaitForOnline,
  }),
}))

vi.mock('~/stores/loggingContext', () => ({
  useLoggingContextStore: () => ({
    getHeaders: () => ({}),
  }),
}))

vi.mock('~/composables/useTrace', () => ({
  getTraceHeaders: () => ({}),
}))

vi.mock('@sentry/vue', () => ({
  captureMessage: mockCaptureMessage,
}))

const mockFetch = vi.fn()
vi.mock('~/composables/useFetchRetry', () => ({
  fetchRetry: () => mockFetch,
}))

let UserAPI

describe('UserAPI', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    const mod = await import('~/api/UserAPI.js')
    UserAPI = mod.default
  })

  function createApi() {
    return new UserAPI({
      public: { APIv2: 'https://api.test.com' },
    })
  }

  describe('fetchMT', () => {
    it('throws TypeError immediately for invalid (non-numeric) user ID without calling API', async () => {
      // Invalid IDs are a client bug — fail fast rather than sending garbage to the API.
      const api = createApi()

      await expect(api.fetchMT({ id: undefined })).rejects.toThrow(TypeError)
      await expect(api.fetchMT({ id: 'notanumber' })).rejects.toThrow(TypeError)

      // API must not have been called at all
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('does not log to Sentry when a valid user ID returns 404 (deleted/banned user)', async () => {
      // Mods frequently look up deleted or banned users — 404 is expected.
      // Go returns { error: 404, message: '...' } from the global Fiber error handler.
      mockFetch.mockResolvedValue([
        404,
        { error: 404, message: 'User not found' },
      ])

      const api = createApi()

      try {
        await api.fetchMT({ id: 5808978 })
      } catch (e) {
        // expected to throw
      }

      expect(mockCaptureMessage).not.toHaveBeenCalled()
    })

    it('does log to Sentry for unexpected server errors (500)', async () => {
      // 500s are real problems and should surface in Sentry.
      mockFetch.mockResolvedValue([
        500,
        { error: 500, message: 'Internal Server Error' },
      ])

      const api = createApi()

      try {
        await api.fetchMT({ id: 5808978 })
      } catch (e) {
        // expected to throw
      }

      expect(mockCaptureMessage).toHaveBeenCalled()
    })
  })
})
