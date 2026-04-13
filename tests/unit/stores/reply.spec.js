import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('reply store', () => {
  let useReplyStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/reply')
    useReplyStore = mod.useReplyStore
  })

  describe('initial state', () => {
    it('starts with null/false defaults', () => {
      const store = useReplyStore()
      expect(store.replyMsgId).toBeNull()
      expect(store.replyMessage).toBeNull()
      expect(store.replyingAt).toBeNull()
      expect(store.machineState).toBeNull()
      expect(store.isNewUser).toBe(false)
    })
  })

  describe('clearReply', () => {
    it('resets all reply state', () => {
      const store = useReplyStore()
      store.replyMsgId = 42
      store.replyMessage = 'Hello'
      store.replyingAt = Date.now()
      store.machineState = 'composing'
      store.isNewUser = true

      store.clearReply()

      expect(store.replyMsgId).toBeNull()
      expect(store.replyMessage).toBeNull()
      expect(store.replyingAt).toBeNull()
      expect(store.machineState).toBeNull()
      expect(store.isNewUser).toBe(false)
    })
  })

  describe('saveMachineState', () => {
    it('saves state and isNewUser', () => {
      const store = useReplyStore()
      store.saveMachineState('waitingForEmail', true)
      expect(store.machineState).toBe('waitingForEmail')
      expect(store.isNewUser).toBe(true)
    })

    it('defaults isNewUser to false', () => {
      const store = useReplyStore()
      store.saveMachineState('composing')
      expect(store.machineState).toBe('composing')
      expect(store.isNewUser).toBe(false)
    })
  })
})
