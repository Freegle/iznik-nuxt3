import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import OurMessage from '~/components/OurMessage.vue'

// Mock useMessageStore
const mockMessageStore = {
  // Add store properties as needed
}
vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))
// Mock useGroupStore
const mockGroupStore = {
  // Add store properties as needed
}
vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))
// Mock useAuthStore
const mockAuthStore = {
  // Add store properties as needed
}
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))
// Mock useMiscStore
const mockMiscStore = {
  // Add store properties as needed
}
vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

describe('OurMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(OurMessage, {
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
    it('emits notFound event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('notFound')).toBeTruthy()
    })

    it('emits view event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('view')).toBeTruthy()
    })

    it('emits visible event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('visible')).toBeTruthy()
    })
  })
})
