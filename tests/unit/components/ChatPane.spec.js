import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ChatPane from '~/components/ChatPane.vue'

// Mock useUserStore
const mockUserStore = {
  // Add store properties as needed
}
vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))
// Mock useChatStore
const mockChatStore = {
  // Add store properties as needed
}
vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))
// Mock useMiscStore
const mockMiscStore = {
  // Add store properties as needed
}
vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))
// Mock useAuthStore
const mockAuthStore = {
  // Add store properties as needed
}
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))
// Mock userStore
const mockrStore = {
  // Add store properties as needed
}
vi.mock('~/stores/r', () => ({
  userStore: () => mockrStore,
}))

describe('ChatPane', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(ChatPane, {
      props: {
        // id: undefined,
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
    it('mounts without error', async () => {
      const wrapper = await mountComponent()
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })
  })

})
