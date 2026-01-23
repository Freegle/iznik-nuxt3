import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MyMessage from '~/components/MyMessage.vue'

// Mock useComposeStore
const mockComposeStore = {
  // Add store properties as needed
}
vi.mock('~/stores/compose', () => ({
  useComposeStore: () => mockComposeStore,
}))
// Mock useMessageStore
const mockMessageStore = {
  // Add store properties as needed
}
vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))
// Mock useChatStore
const mockChatStore = {
  // Add store properties as needed
}
vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))
// Mock useUserStore
const mockUserStore = {
  // Add store properties as needed
}
vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))
// Mock useTrystStore
const mockTrystStore = {
  // Add store properties as needed
}
vi.mock('~/stores/tryst', () => ({
  useTrystStore: () => mockTrystStore,
}))
// Mock useLocationStore
const mockLocationStore = {
  // Add store properties as needed
}
vi.mock('~/stores/location', () => ({
  useLocationStore: () => mockLocationStore,
}))
// Mock useGroupStore
const mockGroupStore = {
  // Add store properties as needed
}
vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))
// Mock userStore
const mockrStore = {
  // Add store properties as needed
}
vi.mock('~/stores/r', () => ({
  userStore: () => mockrStore,
}))

describe('MyMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(MyMessage, {
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
