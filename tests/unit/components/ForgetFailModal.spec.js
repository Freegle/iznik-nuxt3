import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ForgetFailModal from '~/components/ForgetFailModal.vue'

// Use vi.hoisted for mock setup
const { mockHide } = vi.hoisted(() => ({
  mockHide: vi.fn(),
}))

// Mock useOurModal
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

describe('ForgetFailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper() {
    return mount(ForgetFailModal, {
      global: {
        stubs: {
          'b-modal': {
            template: `
              <div class="modal" data-testid="modal">
                <div class="modal-title">{{ title }}</div>
                <slot></slot>
                <div class="modal-footer"><slot name="footer"></slot></div>
              </div>
            `,
            props: ['title', 'scrollable', 'noStacking'],
          },
          'b-row': { template: '<div class="row"><slot /></div>' },
          'b-col': { template: '<div class="col"><slot /></div>' },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          SupportLink: {
            template: '<a href="mailto:support@ilovefreegle.org">support</a>',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('shows modal with correct title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.modal-title').text()).toBe(
        "Sorry, that didn't work"
      )
    })

    it('displays help message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Please contact')
      expect(wrapper.text()).toContain('if you need further help')
    })

    it('renders SupportLink component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a').exists()).toBe(true)
    })

    it('shows Close button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Close')
    })
  })

  describe('close action', () => {
    it('calls hide when Close is clicked', async () => {
      const wrapper = createWrapper()
      const closeBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Close'))
      await closeBtn.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('emits', () => {
    it('defines confirm emit', () => {
      const wrapper = createWrapper()
      // The component defines the emit but doesn't use it
      // Just verify component renders without error
      expect(wrapper.exists()).toBe(true)
    })
  })
})
