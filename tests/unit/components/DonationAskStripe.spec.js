import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DonationAskStripe from '~/components/DonationAskStripe.vue'
describe('DonationAskStripe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(DonationAskStripe, {
      props: {
        // groupid: undefined,
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
    it('emits score event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('score')).toBeTruthy()
    })

    it('emits success event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('success')).toBeTruthy()
    })

    it('emits cancel event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })
})
