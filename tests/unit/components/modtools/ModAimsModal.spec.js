import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ModAimsModal from '~/modtools/components/ModAimsModal.vue'

const mockHide = vi.fn()

// Mock the composable with proper Vue ref to avoid template ref warnings
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    show: vi.fn(),
    hide: mockHide,
  }),
}))

describe('ModAimsModal', () => {
  function mountComponent() {
    return mount(ModAimsModal, {
      global: {
        stubs: {
          'b-modal': {
            template: '<div class="modal"><slot /><slot name="footer" /></div>',
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          NoticeMessage: { template: '<div class="notice"><slot /></div>' },
          ExternalLink: { template: '<a><slot /></a>' },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the modal', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('displays Freegle Aims content', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Freegle nationally is committed to')
      expect(wrapper.text()).toContain(
        'Local volunteers agree to run their Community'
      )
    })

    it('has Close button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Close')
    })
  })

  describe('modal functionality', () => {
    it('exposes hide method from composable', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.hide).toBeDefined()
    })
  })
})
