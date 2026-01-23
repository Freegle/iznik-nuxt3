import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createMockAlertStore } from '../../mocks/stores'
import ModAlertHistoryDetailsModal from '~/modtools/components/ModAlertHistoryDetailsModal.vue'

const mockAlertStore = createMockAlertStore()
const mockHide = vi.fn()
const mockShow = vi.fn()

vi.mock('~/stores/alert', () => ({
  useAlertStore: () => mockAlertStore,
}))

// Mock with proper Vue ref to avoid template ref warnings
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    show: mockShow,
    hide: mockHide,
  }),
}))

describe('ModAlertHistoryDetailsModal', () => {
  const defaultProps = {
    id: 1,
  }

  function mountComponent(props = {}) {
    return mount(ModAlertHistoryDetailsModal, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="modal"><slot name="title" /><slot /><slot name="footer" /></div>',
          },
          'b-form-textarea': {
            template: '<textarea :value="modelValue" readonly />',
            props: ['modelValue'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAlertStore.get.mockReturnValue({
      id: 1,
      subject: 'Test Alert',
      text: 'Alert text content',
      html: '<p>Alert HTML content</p>',
    })
  })

  describe('rendering', () => {
    it('displays alert subject as title', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Alert')
    })

    it('displays text version label', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Text version')
    })
  })

  describe('computed properties', () => {
    it('gets alert from store using id prop', () => {
      mountComponent({ id: 123 })
      expect(mockAlertStore.get).toHaveBeenCalledWith(123)
    })
  })

  describe('modal functionality', () => {
    it('exposes show and hide from composable', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.show).toBeDefined()
      expect(wrapper.vm.hide).toBeDefined()
    })
  })
})
