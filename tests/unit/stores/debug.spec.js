import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('debug store', () => {
  let useDebugStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/debug')
    useDebugStore = mod.useDebugStore
  })

  describe('initial state', () => {
    it('starts with empty logs and enabled', () => {
      const store = useDebugStore()
      expect(store.logs).toEqual([])
      expect(store.enabled).toBe(true)
    })
  })

  describe('log', () => {
    it('adds log entry with timestamp and level', () => {
      const store = useDebugStore()
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      store.log('INFO', 'hello')
      expect(store.logs).toHaveLength(1)
      expect(store.logs[0].level).toBe('INFO')
      expect(store.logs[0].message).toBe('hello')
      expect(store.logs[0].timestamp).toBeDefined()
      consoleSpy.mockRestore()
    })

    it('stringifies object arguments', () => {
      const store = useDebugStore()
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      store.log('INFO', { key: 'value' })
      expect(store.logs[0].message).toContain('"key"')
      expect(store.logs[0].message).toContain('"value"')
      consoleSpy.mockRestore()
    })

    it('handles circular objects gracefully', () => {
      const store = useDebugStore()
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const circular = {}
      circular.self = circular

      store.log('INFO', circular)
      expect(store.logs).toHaveLength(1)
      consoleSpy.mockRestore()
    })

    it('joins multiple arguments with space', () => {
      const store = useDebugStore()
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      store.log('INFO', 'hello', 'world')
      expect(store.logs[0].message).toBe('hello world')
      consoleSpy.mockRestore()
    })

    it('caps logs at MAX_LOGS (500)', () => {
      const store = useDebugStore()
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      for (let i = 0; i < 510; i++) {
        store.log('INFO', `msg ${i}`)
      }
      expect(store.logs).toHaveLength(500)
      expect(store.logs[0].message).toBe('msg 10')
      consoleSpy.mockRestore()
    })

    it('does nothing when disabled', () => {
      const store = useDebugStore()
      store.enabled = false

      store.log('INFO', 'hello')
      expect(store.logs).toHaveLength(0)
    })

    it('uses console.error for error level', () => {
      const store = useDebugStore()
      const errorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      store.log('error', 'oops')
      expect(errorSpy).toHaveBeenCalled()
      errorSpy.mockRestore()
    })

    it('uses console.warn for warn level', () => {
      const store = useDebugStore()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      store.log('warn', 'careful')
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })
  })

  describe('convenience methods', () => {
    it('info logs at INFO level', () => {
      const store = useDebugStore()
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      store.info('test')
      expect(store.logs[0].level).toBe('INFO')
      consoleSpy.mockRestore()
    })

    it('warn logs at WARN level', () => {
      const store = useDebugStore()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      store.warn('test')
      expect(store.logs[0].level).toBe('WARN')
      warnSpy.mockRestore()
    })

    it('error logs at ERROR level', () => {
      const store = useDebugStore()
      const errorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      store.error('test')
      expect(store.logs[0].level).toBe('ERROR')
      errorSpy.mockRestore()
    })

    it('debug logs at DEBUG level', () => {
      const store = useDebugStore()
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      store.debug('test')
      expect(store.logs[0].level).toBe('DEBUG')
      consoleSpy.mockRestore()
    })
  })

  describe('getLogsAsText getter', () => {
    it('formats logs as text', () => {
      const store = useDebugStore()
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      store.info('first')
      store.info('second')

      const text = store.getLogsAsText
      expect(text).toContain('[INFO] first')
      expect(text).toContain('[INFO] second')
      expect(text.split('\n')).toHaveLength(2)
      consoleSpy.mockRestore()
    })
  })

  describe('clear', () => {
    it('removes all logs', () => {
      const store = useDebugStore()
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      store.info('test')
      expect(store.logs).toHaveLength(1)

      store.clear()
      expect(store.logs).toEqual([])
      consoleSpy.mockRestore()
    })
  })
})
