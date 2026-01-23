import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import NudgeTooSoonWarningModal from '~/components/NudgeTooSoonWarningModal.vue'

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

describe('NudgeTooSoonWarningModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper() {
    return mount(NudgeTooSoonWarningModal, {
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
      expect(wrapper.find('.modal-title').text()).toBe('Too Soon to Nudge')
    })

    it('displays clock icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.clock').exists()).toBe(true)
    })

    it('shows 24 hours message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('wait 24 hours')
    })

    it('shows reminder about offline users', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('not everyone is online all the time')
    })

    it('shows Got it button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Got it')
    })
  })

  describe('dismiss action', () => {
    it('calls hide when Got it is clicked', async () => {
      const wrapper = createWrapper()
      const gotItBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Got it'))
      await gotItBtn.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })
  })
})
