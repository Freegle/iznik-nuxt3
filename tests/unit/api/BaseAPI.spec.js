import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIError } from '~/api/APIErrors'

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

const mockMiscStore = {
  modtools: false,
  online: true,
  api: mockApiCounter,
  waitForOnline: mockWaitForOnline,
}

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
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
    mockMiscStore.online = true

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
    it('throws APIError on 401 without logging to Sentry', async () => {
      mockFetch.mockResolvedValue([401, {}])

      const api = createApi()

      await expect(api.$requestv2('GET', '/test', {})).rejects.toThrow(APIError)

      expect(mockCaptureMessage).not.toHaveBeenCalled()
    })

    it('clears auth state on 401', async () => {
      mockFetch.mockResolvedValue([401, {}])

      const api = createApi()

      try {
        await api.$requestv2('GET', '/test', {})
      } catch (e) {
        // expected
      }

      expect(mockSetAuth).toHaveBeenCalledWith(null, null)
      expect(mockSetUser).toHaveBeenCalledWith(null)
    })

    it('includes status 401 in thrown APIError', async () => {
      mockFetch.mockResolvedValue([401, { message: 'Unauthorized' }])

      const api = createApi()

      try {
        await api.$requestv2('POST', '/message', { data: {} })
        expect.fail('Should have thrown')
      } catch (e) {
        expect(e).toBeInstanceOf(APIError)
        expect(e.response.status).toBe(401)
        expect(e.message).toContain('401')
      }
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

  describe('network errors (no HTTP response)', () => {
    it('logs network failure to Sentry when online (likely server issue)', async () => {
      mockMiscStore.online = true
      mockFetch.mockRejectedValue(new Error('Too many retries, give up'))

      const api = createApi()

      try {
        await api.$requestv2('POST', '/message', { data: {} })
      } catch (e) {
        // expected to throw
      }

      expect(mockCaptureMessage).toHaveBeenCalledWith(
        expect.stringContaining('API network failure POST /message'),
        expect.objectContaining({
          level: 'warning',
          tags: expect.objectContaining({ error_type: 'network' }),
        })
      )
    })

    it('does not log to Sentry when offline (user network problem)', async () => {
      mockMiscStore.online = false
      mockFetch.mockRejectedValue(new Error('Too many retries, give up'))

      const api = createApi()

      try {
        await api.$requestv2('POST', '/message', { data: {} })
      } catch (e) {
        // expected to throw
      }

      expect(mockCaptureMessage).not.toHaveBeenCalled()
    })

    it('does not log to Sentry when page is unloading', async () => {
      mockMiscStore.online = true
      mockFetch.mockRejectedValue(new Error('Unloading, no retry'))

      const api = createApi()

      try {
        await api.$requestv2('POST', '/message', { data: {} })
      } catch (e) {
        // expected to throw
      }

      expect(mockCaptureMessage).not.toHaveBeenCalled()
    })
  })
})
