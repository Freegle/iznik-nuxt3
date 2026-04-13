import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('~/composables/useTrace', () => ({
  getSessionId: vi.fn(() => 'session-abc'),
}))

describe('loggingContext store', () => {
  let useLoggingContextStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/loggingContext')
    useLoggingContextStore = mod.useLoggingContextStore
  })

  describe('initial state', () => {
    it('starts with null values and empty modal stack', () => {
      const store = useLoggingContextStore()
      expect(store.pageId).toBeNull()
      expect(store.pageUrl).toBeNull()
      expect(store.pageTitle).toBeNull()
      expect(store.modalStack).toEqual([])
      expect(store.site).toBeNull()
    })
  })

  describe('init', () => {
    it('sets site from runtime config', () => {
      const store = useLoggingContextStore()
      store.init({ public: { SITE: 'MT' } })
      expect(store.site).toBe('MT')
    })

    it('defaults site to FD when not specified', () => {
      const store = useLoggingContextStore()
      store.init({ public: {} })
      expect(store.site).toBe('FD')
    })
  })

  describe('startPage', () => {
    it('sets page id and url from route', () => {
      const store = useLoggingContextStore()
      store.startPage({ path: '/chats/42' })

      expect(store.pageId).toMatch(/^page_/)
      expect(store.pageUrl).toBe('/chats/42')
      expect(store.modalStack).toEqual([])
    })

    it('clears modal stack on new page', () => {
      const store = useLoggingContextStore()
      store.modalStack = [{ id: 'modal_1', name: 'test' }]

      store.startPage({ path: '/home' })
      expect(store.modalStack).toEqual([])
    })
  })

  describe('pushModal / popModal', () => {
    it('pushes modal with generated id', () => {
      const store = useLoggingContextStore()
      const id = store.pushModal('ChatModal')

      expect(id).toMatch(/^modal_/)
      expect(store.modalStack).toHaveLength(1)
      expect(store.modalStack[0].name).toBe('ChatModal')
    })

    it('pops most recent modal', () => {
      const store = useLoggingContextStore()
      const id1 = store.pushModal('First')
      store.pushModal('Second')

      const popped = store.popModal()
      expect(store.modalStack).toHaveLength(1)
      expect(store.modalStack[0].id).toBe(id1)
      expect(popped).toMatch(/^modal_/)
    })

    it('returns undefined when popping empty stack', () => {
      const store = useLoggingContextStore()
      const result = store.popModal()
      expect(result).toBeUndefined()
    })
  })

  describe('getHeaders', () => {
    it('returns headers with session and page info', () => {
      const store = useLoggingContextStore()
      store.init({ public: { SITE: 'MT' } })
      store.startPage({ path: '/home' })

      const headers = store.getHeaders()
      expect(headers['X-Freegle-Session']).toBe('session-abc')
      expect(headers['X-Freegle-Page']).toMatch(/^page_/)
      expect(headers['X-Freegle-Modal']).toBe('')
      expect(headers['X-Freegle-Site']).toBe('MT')
    })

    it('includes comma-separated modal ids', () => {
      const store = useLoggingContextStore()
      const id1 = store.pushModal('First')
      const id2 = store.pushModal('Second')

      const headers = store.getHeaders()
      expect(headers['X-Freegle-Modal']).toBe(`${id1},${id2}`)
    })
  })

  describe('getContext', () => {
    it('returns full context object', () => {
      const store = useLoggingContextStore()
      store.init({ public: { SITE: 'FD' } })
      store.startPage({ path: '/browse' })
      store.pushModal('TestModal')

      const ctx = store.getContext()
      expect(ctx.session_id).toBe('session-abc')
      expect(ctx.page_id).toMatch(/^page_/)
      expect(ctx.page_url).toBe('/browse')
      expect(ctx.site).toBe('FD')
      expect(ctx.modal_stack).toHaveLength(1)
      expect(ctx.modal_names).toEqual(['TestModal'])
    })
  })
})
