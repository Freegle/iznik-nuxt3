import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ShortLink from '~/components/ShortLink.vue'

// Mock useShortlinkStore
const mockShortlinkStore = {
  // Add store properties as needed
}
vi.mock('~/stores/shortlink', () => ({
  useShortlinkStore: () => mockShortlinkStore,
}))

describe('ShortLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(ShortLink, {
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

})
