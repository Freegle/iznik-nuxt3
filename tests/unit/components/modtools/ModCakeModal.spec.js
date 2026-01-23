import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ModCakeModal from '~/modtools/components/ModCakeModal.vue'

// Mock hide function that tests can spy on
const mockHide = vi.fn()

// Override the global useOurModal mock with our custom spy
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null), // Use proper Vue ref to avoid template ref warnings
    show: vi.fn(),
    hide: mockHide,
  }),
}))

describe('ModCakeModal', () => {
  function mountComponent() {
    return mount(ModCakeModal, {
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="modal"><slot name="title" /><slot /><slot name="footer" /></div>',
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          ModCake: {
            template: '<div class="mod-cake">ModCake component</div>',
          },
          'nuxt-link': {
            template: '<a><slot /></a>',
            props: ['to'],
          },
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

    it('includes ModCake component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-cake').exists()).toBe(true)
    })

    it('has Close button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Close')
    })

    it('displays settings link text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('You can change your mind later')
    })
  })

  describe('modal functionality', () => {
    it('exposes modal and hide from composable', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.modal).toBeDefined()
      expect(wrapper.vm.hide).toBeDefined()
    })

    it('calls hide when Close button clicked', async () => {
      const wrapper = mountComponent()
      await wrapper.find('button').trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })
})
