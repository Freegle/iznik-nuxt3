import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('misc store', () => {
  let useMiscStore

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/misc')
    useMiscStore = mod.useMiscStore
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('starts with correct defaults', () => {
      const store = useMiscStore()
      expect(store.time).toBeNull()
      expect(store.breakpoint).toBeNull()
      expect(store.isLandscape).toBe(false)
      expect(store.fullscreenModalOpen).toBe(false)
      expect(store.vals).toEqual({})
      expect(store.somethingWentWrong).toBe(false)
      expect(store.errorDetails).toBeNull()
      expect(store.needToReload).toBe(false)
      expect(store.visible).toBe(true)
      expect(store.apiCount).toBe(0)
      expect(store.online).toBe(true)
      expect(store.modtools).toBe(false)
      expect(store.marketingConsent).toBe(true)
      expect(store.source).toBeNull()
    })
  })

  describe('init', () => {
    it('sets config', () => {
      const store = useMiscStore()
      store.init({ public: { APIv2: 'http://test' } })
      expect(store.config).toEqual({ public: { APIv2: 'http://test' } })
    })
  })

  describe('set/get key-value', () => {
    it('stores and retrieves values by key', () => {
      const store = useMiscStore()
      store.set({ key: 'foo', value: 'bar' })
      expect(store.get('foo')).toBe('bar')
    })

    it('overwrites existing key', () => {
      const store = useMiscStore()
      store.set({ key: 'foo', value: 'bar' })
      store.set({ key: 'foo', value: 'baz' })
      expect(store.get('foo')).toBe('baz')
    })

    it('returns undefined for missing key', () => {
      const store = useMiscStore()
      expect(store.get('nonexistent')).toBeUndefined()
    })
  })

  describe('simple setters', () => {
    it('setTime sets current date', () => {
      const store = useMiscStore()
      store.setTime()
      expect(store.time).toBeInstanceOf(Date)
    })

    it('setBreakpoint sets breakpoint', () => {
      const store = useMiscStore()
      store.setBreakpoint('md')
      expect(store.breakpoint).toBe('md')
    })

    it('setLandscape sets isLandscape', () => {
      const store = useMiscStore()
      store.setLandscape(true)
      expect(store.isLandscape).toBe(true)
    })

    it('setFullscreenModalOpen sets flag', () => {
      const store = useMiscStore()
      store.setFullscreenModalOpen(true)
      expect(store.fullscreenModalOpen).toBe(true)
    })

    it('setSource sets source', () => {
      const store = useMiscStore()
      store.setSource('google')
      expect(store.source).toBe('google')
    })

    it('setMarketingConsent sets value', () => {
      const store = useMiscStore()
      store.setMarketingConsent(false)
      expect(store.marketingConsent).toBe(false)
    })
  })

  describe('setErrorDetails / clearError', () => {
    it('sets error state from Error object', () => {
      const store = useMiscStore()
      const err = new Error('Something broke')
      err.cause = 'network'

      store.setErrorDetails(err)

      expect(store.somethingWentWrong).toBe(true)
      expect(store.errorDetails.message).toBe('Something broke')
      expect(store.errorDetails.name).toBe('Error')
      expect(store.errorDetails.cause).toBe('network')
      expect(store.errorDetails.stack).toBeTruthy()
      expect(store.errorDetails.timestamp).toBeTruthy()
    })

    it('handles null/undefined error gracefully', () => {
      const store = useMiscStore()
      store.setErrorDetails(null)

      expect(store.somethingWentWrong).toBe(true)
      expect(store.errorDetails.message).toBe('Unknown error')
      expect(store.errorDetails.stack).toBeNull()
      expect(store.errorDetails.name).toBe('Error')
      expect(store.errorDetails.cause).toBeNull()
    })

    it('clearError resets error state', () => {
      const store = useMiscStore()
      store.setErrorDetails(new Error('test'))
      store.clearError()

      expect(store.somethingWentWrong).toBe(false)
      expect(store.errorDetails).toBeNull()
    })
  })

  describe('api counter', () => {
    it('increments api count', () => {
      const store = useMiscStore()
      store.api(1)
      store.api(1)
      expect(store.apiCount).toBe(2)
    })

    it('decrements api count', () => {
      const store = useMiscStore()
      store.api(1)
      store.api(1)
      store.api(-1)
      expect(store.apiCount).toBe(1)
    })

    it('clamps negative count to zero and logs error', () => {
      const store = useMiscStore()
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const traceSpy = vi.spyOn(console, 'trace').mockImplementation(() => {})

      store.api(-1)

      expect(store.apiCount).toBe(0)
      expect(errorSpy).toHaveBeenCalledWith('API count went negative')
      expect(traceSpy).toHaveBeenCalled()
    })
  })

  describe('fetchWithTimeout', () => {
    it('returns response when fetch succeeds within timeout', async () => {
      const store = useMiscStore()
      store.init({ public: { APIv2: 'http://test' } })

      const mockResponse = { status: 200 }
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse))

      const result = await store.fetchWithTimeout('http://test/online', null, 5000)
      expect(result).toBe(mockResponse)
    })

    it('throws timeout error when fetch exceeds timeout', async () => {
      vi.useFakeTimers()
      const store = useMiscStore()
      store.init({ public: { APIv2: 'http://test' } })

      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(
          (url, options) =>
            new Promise((resolve, reject) => {
              options.signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'))
              })
            })
        )
      )

      const promise = store.fetchWithTimeout('http://test/online', null, 5000)
      vi.advanceTimersByTime(5000)

      await expect(promise).rejects.toThrow('timeout')
      logSpy.mockRestore()
    })

    it('rethrows non-timeout fetch errors', async () => {
      const store = useMiscStore()
      store.init({ public: { APIv2: 'http://test' } })

      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network error'))
      )

      await expect(
        store.fetchWithTimeout('http://test/online', null, 5000)
      ).rejects.toThrow('Network error')
    })
  })

  describe('checkOnline', () => {
    it('sets online=true when API returns 200', async () => {
      vi.useFakeTimers()
      const store = useMiscStore()
      store.init({ public: { APIv2: 'http://test' } })
      store.online = false

      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          status: 200,
          json: () => Promise.resolve({ online: true }),
        })
      )

      await store.checkOnline()

      expect(store.online).toBe(true)
      expect(logSpy).toHaveBeenCalledWith('Back online')
      logSpy.mockRestore()
    })

    it('sets online=false when API returns non-200', async () => {
      vi.useFakeTimers()
      const store = useMiscStore()
      store.init({ public: { APIv2: 'http://test' } })
      store.online = true

      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ status: 500 })
      )

      await store.checkOnline()

      expect(store.online).toBe(false)
      logSpy.mockRestore()
    })

    it('sets online=false on fetch error', async () => {
      vi.useFakeTimers()
      const store = useMiscStore()
      store.init({ public: { APIv2: 'http://test' } })
      store.online = true

      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network error'))
      )

      await store.checkOnline()

      expect(store.online).toBe(false)
      expect(logSpy).toHaveBeenCalledWith('Gone offline', expect.any(Error))
      logSpy.mockRestore()
    })

    it('skips check when not visible', async () => {
      vi.useFakeTimers()
      const store = useMiscStore()
      store.init({ public: { APIv2: 'http://test' } })
      store.visible = false

      const mockFetch = vi.fn()
      vi.stubGlobal('fetch', mockFetch)

      await store.checkOnline()

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('schedules next check via setTimeout', async () => {
      vi.useFakeTimers()
      const store = useMiscStore()
      store.init({ public: { APIv2: 'http://test' } })
      store.visible = false

      vi.stubGlobal('fetch', vi.fn())

      await store.checkOnline()

      expect(store.onlineTimer).toBeTruthy()
    })
  })

  describe('startOnlineCheck', () => {
    it('starts online check when no timer exists', async () => {
      vi.useFakeTimers()
      const store = useMiscStore()
      store.init({ public: { APIv2: 'http://test' } })
      store.visible = false

      vi.stubGlobal('fetch', vi.fn())

      store.startOnlineCheck()

      expect(store.onlineTimer).toBeTruthy()
    })

    it('does not restart if timer already exists', () => {
      vi.useFakeTimers()
      const store = useMiscStore()
      store.init({ public: { APIv2: 'http://test' } })
      store.onlineTimer = 12345

      vi.stubGlobal('fetch', vi.fn())

      store.startOnlineCheck()

      // Timer should remain unchanged
      expect(store.onlineTimer).toBe(12345)
    })
  })

  describe('waitForOnline', () => {
    it('returns immediately when already online', () => {
      const store = useMiscStore()
      store.online = true

      const result = store.waitForOnline()
      expect(result).toBeUndefined()
    })

    it('resolves when online becomes true', async () => {
      vi.useFakeTimers()
      const store = useMiscStore()
      store.online = false

      const promise = store.waitForOnline()

      // First tick — still offline
      vi.advanceTimersByTime(1000)

      // Go online
      store.online = true
      vi.advanceTimersByTime(1000)

      await promise
    })
  })

  describe('fetchLatestMessage', () => {
    it('returns data from API', async () => {
      const store = useMiscStore()
      store.init({ public: { APIv2: 'http://test' } })

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          json: () => Promise.resolve({ ret: 0, time: '2026-04-13' }),
        })
      )

      const result = await store.fetchLatestMessage()
      expect(result).toEqual({ ret: 0, time: '2026-04-13' })
    })

    it('returns error object on failure', async () => {
      const store = useMiscStore()
      store.init({ public: { APIv2: 'http://test' } })

      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network error'))
      )

      const result = await store.fetchLatestMessage()
      expect(result).toEqual({ ret: 1, status: 'Error' })
      logSpy.mockRestore()
    })
  })
})
