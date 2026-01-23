import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StoryShareModal from '~/components/StoryShareModal.vue'

// Mock useStoryStore
const mockStoryStore = {
  // Add store properties as needed
}
vi.mock('~/stores/story', () => ({
  useStoryStore: () => mockStoryStore,
}))
// Mock useMobileStore
const mockMobileStore = {
  // Add store properties as needed
}
vi.mock('~/stores/mobile', () => ({
  useMobileStore: () => mockMobileStore,
}))
// Mock useOurModal
const mockModal = { value: null }
const mockShow = vi.fn()
const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({ modal: mockModal, show: mockShow, hide: mockHide }),
}))

describe('StoryShareModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(StoryShareModal, {
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
