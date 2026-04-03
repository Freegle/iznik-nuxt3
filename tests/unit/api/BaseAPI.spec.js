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

// Mock fetchRetry to return a function that uses our mock fetch
const mockFetch = vi.fn()
vi.mock('~/composables/useFetchRetry', () => ({
  fetchRetry: () => mockFetch,
}))

let BaseAPI

describe('BaseAPI', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    // Dynamic import after mocks are set up
    const mod = await import('~/api/BaseAPI.js')
    BaseAPI = mod.default
  })

  function createApi() {
    return new BaseAPI({
      public: { APIv2: 'https://api.test.com' },
    })
  }

  describe('401 handling', () => {
    it('clears auth state on 401', async () => {
      mockFetch.mockResolvedValue([401, {}])

      const api = createApi()

      // Race: 401 should return a never-resolving promise; use timeout to confirm
      await Promise.race([
        api.$requestv2('GET', '/test', {}),
        new Promise((resolve) => setTimeout(resolve, 50)),
      ])

      expect(mockSetAuth).toHaveBeenCalledWith(null, null)
      expect(mockSetUser).toHaveBeenCalledWith(null)
    })

    it('does not throw on 401 — returns a never-resolving promise', async () => {
      mockFetch.mockResolvedValue([401, {}])

      const api = createApi()

      const sentinel = 'timeout'
      const result = await Promise.race([
        api.$requestv2('POST', '/message', { data: {} }).then(
          () => 'resolved',
          () => 'rejected'
        ),
        new Promise((resolve) => setTimeout(() => resolve(sentinel), 50)),
      ])

      // Should time out, not resolve or reject
      expect(result).toBe(sentinel)
    })

    it('does not log 401 to Sentry', async () => {
      mockFetch.mockResolvedValue([401, {}])

      const api = createApi()

      await Promise.race([
        api.$requestv2('GET', '/test', {}),
        new Promise((resolve) => setTimeout(resolve, 50)),
      ])

      expect(mockCaptureMessage).not.toHaveBeenCalled()
    })

    it('logs non-401 errors to Sentry', async () => {
      mockFetch.mockResolvedValue([500, { error: 'Server error' }])

      const api = createApi()

      try {
        await api.$requestv2('GET', '/test', {})
      } catch (e) {
        // expected
      }

      expect(mockCaptureMessage).toHaveBeenCalled()
    })
  })

  describe('successful responses', () => {
    it('returns data on 200', async () => {
      mockFetch.mockResolvedValue([200, { ret: 0, items: [1, 2, 3] }])

      const api = createApi()
      const result = await api.$requestv2('GET', '/test', {})

      expect(result).toEqual({ ret: 0, items: [1, 2, 3] })
      expect(mockCaptureMessage).not.toHaveBeenCalled()
    })
  })
})
