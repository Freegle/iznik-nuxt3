import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ProfileSection from '~/components/ProfileSection.vue'

// Mock useAuthStore
const mockAuthStore = {
  // Add store properties as needed
}
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))
// Mock useImageStore
const mockImageStore = {
  // Add store properties as needed
}
vi.mock('~/stores/image', () => ({
  useImageStore: () => mockImageStore,
}))

describe('ProfileSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(ProfileSection, {
      props: {
        // Add required props
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
    it('emits update event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('update')).toBeTruthy()
    })

    it('emits show-about-me-modal event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('show-about-me-modal')).toBeTruthy()
    })

    it('emits show-profile-modal event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('show-profile-modal')).toBeTruthy()
    })
  })
})
