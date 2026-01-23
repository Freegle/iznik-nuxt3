import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import NudgeTooSoonWarningModal from '~/components/NudgeTooSoonWarningModal.vue'

// Mock useOurModal
const mockModal = { value: null }
const mockShow = vi.fn()
const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({ modal: mockModal, show: mockShow, hide: mockHide }),
}))

describe('NudgeTooSoonWarningModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(NudgeTooSoonWarningModal, {
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
})
