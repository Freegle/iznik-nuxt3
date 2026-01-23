import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PostCode from '~/components/PostCode.vue'

// Mock useAuthStore
const mockAuthStore = {
  // Add store properties as needed
}
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))
// Mock useLocationStore
const mockLocationStore = {
  // Add store properties as needed
}
vi.mock('~/stores/location', () => ({
  useLocationStore: () => mockLocationStore,
}))
// Mock useComposeStore
const mockComposeStore = {
  // Add store properties as needed
}
vi.mock('~/stores/compose', () => ({
  useComposeStore: () => mockComposeStore,
}))

describe('PostCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(PostCode, {
      props: {
        // value: undefined,
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
    it('emits selected event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('selected')).toBeTruthy()
    })

    it('emits cleared event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('cleared')).toBeTruthy()
    })
  })
})
