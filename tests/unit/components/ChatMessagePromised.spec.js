import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ChatMessagePromised from '~/components/ChatMessagePromised.vue'

// Mock useTrystStore
const mockTrystStore = {
  // Add store properties as needed
}
vi.mock('~/stores/tryst', () => ({
  useTrystStore: () => mockTrystStore,
}))
// Mock useChatStore
const mockChatStore = {
  // Add store properties as needed
}
vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))
// Mock useMessageStore
const mockMessageStore = {
  // Add store properties as needed
}
vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

describe('ChatMessagePromised', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(ChatMessagePromised, {
      props: {
        // chatid: undefined,
        // type: undefined,
        // required: undefined,
        ...props,
      },
      global: {
        stubs: {
          'b-button': true,
          'b-modal': true,
          'b-row': { template: '<div><slot /></div>' },
          'b-col': { template: '<div><slot /></div>' },
          'v-icon': true,
          'nuxt-link': { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts without error', () => {
      const wrapper = mountComponent()
      
      expect(wrapper.exists()).toBe(true)
    })
  })

})
