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

let SessionAPI

describe('SessionAPI', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('~/api/SessionAPI.js')
    SessionAPI = mod.default
  })

  function createApi() {
    return new SessionAPI({
      public: { APIv2: 'https://api.test.com' },
    })
  }

  describe('lostPassword', () => {
    it('does not log to Sentry when email is unknown (404)', async () => {
      mockFetch.mockResolvedValue([
        404,
        { ret: 2, status: "We don't know that email address." },
      ])

      const api = createApi()

      await expect(api.lostPassword('unknown@example.com')).rejects.toThrow()

      expect(mockCaptureMessage).not.toHaveBeenCalled()
    })

    it('does log to Sentry for unexpected server errors (500)', async () => {
      mockFetch.mockResolvedValue([500, { error: 'Server error' }])

      const api = createApi()

      try {
        await api.lostPassword('someone@example.com')
      } catch (e) {
        // expected
      }

      expect(mockCaptureMessage).toHaveBeenCalled()
    })
  })
})
