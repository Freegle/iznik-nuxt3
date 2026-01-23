import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ChatFooter from '~/components/ChatFooter.vue'

// Mock useMiscStore
const mockMiscStore = {
  // Add store properties as needed
}
vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))
// Mock useMessageStore
const mockMessageStore = {
  // Add store properties as needed
}
vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))
// Mock useAuthStore
const mockAuthStore = {
  // Add store properties as needed
}
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))
// Mock useAddressStore
const mockAddressStore = {
  // Add store properties as needed
}
vi.mock('~/stores/address', () => ({
  useAddressStore: () => mockAddressStore,
}))

describe('ChatFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(ChatFooter, {
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
  describe('events', () => {
    it('emits typing event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('typing')).toBeTruthy()
    })

    it('emits scrollbottom event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('scrollbottom')).toBeTruthy()
    })
  })
})
