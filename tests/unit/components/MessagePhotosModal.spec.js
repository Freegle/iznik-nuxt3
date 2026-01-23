import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MessagePhotosModal from '~/components/MessagePhotosModal.vue'

// Mock useMessageStore
const mockMessageStore = {
  // Add store properties as needed
}
vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

describe('MessagePhotosModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(MessagePhotosModal, {
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
    it('emits hidden event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('hidden')).toBeTruthy()
    })
  })
})
