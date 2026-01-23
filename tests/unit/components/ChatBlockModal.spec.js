import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ChatBlockModal from '~/components/ChatBlockModal.vue'

// Mock useOurModal
const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

describe('ChatBlockModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(ChatBlockModal, {
      props: {
        id: 1,
        user: { displayname: 'Test User' },
        ...props,
      },
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
            props: ['title', 'scrollable', 'noStacking', 'modalClass'],
          },
          'b-row': { template: '<div class="row"><slot /></div>' },
          'b-col': { template: '<div class="col"><slot /></div>' },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders modal with correct title', () => {
      const wrapper = createWrapper({ user: { displayname: 'John Doe' } })
      expect(wrapper.find('.modal-title').text()).toContain('Block John Doe')
    })

    it('displays warning message about blocking', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("won't ever get any more chat messages")
    })

    it('asks for confirmation', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Are you sure?')
    })

    it('shows Cancel button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Cancel')
    })

    it('shows Confirm button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Confirm')
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 42 })
      expect(wrapper.props('id')).toBe(42)
    })

    it('requires user prop with displayname', () => {
      const wrapper = createWrapper({
        user: { displayname: 'Jane Smith', id: 123 },
      })
      expect(wrapper.props('user').displayname).toBe('Jane Smith')
    })
  })

  describe('cancel action', () => {
    it('calls hide when Cancel is clicked', async () => {
      const wrapper = createWrapper()
      const cancelBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Cancel'))
      await cancelBtn.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('confirm action', () => {
    it('emits confirm event when Confirm is clicked', async () => {
      const wrapper = createWrapper()
      const confirmBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Confirm'))
      await confirmBtn.trigger('click')

      expect(wrapper.emitted('confirm')).toBeTruthy()
    })

    it('calls hide after confirm', async () => {
      const wrapper = createWrapper()
      const confirmBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Confirm'))
      await confirmBtn.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })
  })
})
