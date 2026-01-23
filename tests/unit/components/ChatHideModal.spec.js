import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ChatHideModal from '~/components/ChatHideModal.vue'

// Mock useOurModal
const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

describe('ChatHideModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(ChatHideModal, {
      props,
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
    it('shows generic title when no user', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.modal-title').text()).toBe('Hide chat')
    })

    it('shows user-specific title when user provided', () => {
      const wrapper = createWrapper({ user: { displayname: 'John Doe' } })
      expect(wrapper.find('.modal-title').text()).toBe(
        'Hide chat with John Doe'
      )
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

  describe('message content', () => {
    it('shows single chat message when id is provided', () => {
      const wrapper = createWrapper({ id: 1 })
      expect(wrapper.text()).toContain("won't show in your list until")
      expect(wrapper.text()).toContain('new messages from them')
    })

    it('shows multiple chats message when id is not provided', () => {
      const wrapper = createWrapper({ id: null })
      expect(wrapper.text()).toContain('all these chats will be removed')
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
