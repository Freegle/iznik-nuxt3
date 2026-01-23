import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import NudgeWarningModal from '~/components/NudgeWarningModal.vue'

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

describe('NudgeWarningModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper() {
    return mount(NudgeWarningModal, {
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
            props: ['id', 'title', 'scrollable', 'noStacking'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
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

    it('shows modal with correct title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.modal-title').text()).toBe('Nudging')
    })

    it('displays bell icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.bell').exists()).toBe(true)
    })

    it('shows explanation text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Nudging is a gentle way')
    })

    it('shows reminder about offline users', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('not everyone is online all the time')
    })

    it('shows Cancel button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Cancel')
    })

    it('shows Nudge them button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Nudge them')
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
    it('emits confirm event when Nudge them is clicked', async () => {
      const wrapper = createWrapper()
      const confirmBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Nudge them'))
      await confirmBtn.trigger('click')

      expect(wrapper.emitted('confirm')).toBeTruthy()
    })

    it('calls hide after confirm', async () => {
      const wrapper = createWrapper()
      const confirmBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Nudge them'))
      await confirmBtn.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })
  })
})
