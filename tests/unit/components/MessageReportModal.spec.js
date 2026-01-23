import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MessageReportModal from '~/components/MessageReportModal.vue'

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
// Mock useOurModal
const mockModal = { value: null }
const mockShow = vi.fn()
const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({ modal: mockModal, show: mockShow, hide: mockHide }),
}))

describe('MessageReportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(MessageReportModal, {
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
    it('mounts without error', () => {
      const wrapper = mountComponent()
      
      expect(wrapper.exists()).toBe(true)
    })
  })
  describe('events', () => {
    it('emits hidden event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('hidden')).toBeTruthy()
    })
  })
})
