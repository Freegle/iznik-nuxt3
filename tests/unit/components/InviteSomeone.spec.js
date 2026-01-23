import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import InviteSomeone from '~/components/InviteSomeone.vue'

// Mock useMobileStore
const mockMobileStore = {
  // Add store properties as needed
}
vi.mock('~/stores/mobile', () => ({
  useMobileStore: () => mockMobileStore,
}))

describe('InviteSomeone', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(InviteSomeone, {
      props: {
        // headingLevel: undefined,
        // type: undefined,
        // required: undefined,
        // default: undefined,
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
    it('emits invited event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('invited')).toBeTruthy()
    })
  })
})
