import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import EmailConfirmModal from '~/components/EmailConfirmModal.vue'

// Mock useOurModal
const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

describe('EmailConfirmModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper() {
    return mount(EmailConfirmModal, {
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal" :title="title"><slot /><slot name="footer" /></div>',
            props: ['title', 'scrollable', 'noStacking', 'size'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
            emits: ['click'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders a modal', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('has correct modal title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').attributes('title')).toBe(
        'Please check your mailbox'
      )
    })

    it('displays verification message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("We've sent you a verification mail")
    })

    it('reminds about spam folder', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('check your spam folder')
    })
  })

  describe('interactions', () => {
    it('calls hide when Close button clicked', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })
})
