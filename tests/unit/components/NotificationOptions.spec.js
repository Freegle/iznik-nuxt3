import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import NotificationOptions from '~/components/NotificationOptions.vue'

// Mock useNotificationStore
const mockNotificationStore = {
  // Add store properties as needed
}
vi.mock('~/stores/notification', () => ({
  useNotificationStore: () => mockNotificationStore,
}))

describe('NotificationOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(NotificationOptions, {
      props: {
        // distance: undefined,
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
    it('emits update:notificationsShown event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('update:notificationsShown')).toBeTruthy()
    })

    it('emits update:unreadNotificationCount event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('update:unreadNotificationCount')).toBeTruthy()
    })

    it('emits showAboutMe event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('showAboutMe')).toBeTruthy()
    })
  })
})
