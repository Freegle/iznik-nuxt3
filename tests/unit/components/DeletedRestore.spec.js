import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DeletedRestore from '~/components/DeletedRestore.vue'

// Mock useAuthStore
const mockAuthStore = {
  // Add store properties as needed
}
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

describe('DeletedRestore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(DeletedRestore, {
      props: {
        // bottom: undefined,
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
    it('mounts without error', () => {
      const wrapper = mountComponent()
      
      expect(wrapper.exists()).toBe(true)
    })
  })

})
