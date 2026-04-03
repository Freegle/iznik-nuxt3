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
    const mod = await import('~/api/UserAPI.js')
    UserAPI = mod.default
  })

  function createApi() {
    return new UserAPI({
      public: { APIv2: 'https://api.test.com' },
    })
  }

  describe('fetchMT', () => {
    it('does not log to Sentry when user is not found (404)', async () => {
      // Mods frequently search for deleted or banned users — 404 is expected
      mockFetch.mockResolvedValue([404, { ret: 3, status: 'Not found' }])

      const api = createApi()

      await expect(api.fetchMT({ id: 5808978 })).rejects.toThrow()

      expect(mockCaptureMessage).not.toHaveBeenCalled()
    })

    it('does not log to Sentry for any fetchMT error (logError suppressed)', async () => {
      // fetchMT passes logError=false so errors are handled in the UI, not Sentry
      mockFetch.mockResolvedValue([500, { error: 'Server error' }])

      const api = createApi()

      try {
        await api.fetchMT({ id: 5808978 })
      } catch (e) {
        // expected
      }

      expect(mockCaptureMessage).not.toHaveBeenCalled()
    })
  })
})
