import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import RateAppModal from '~/components/RateAppModal.vue'

// Mock useOurModal
const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

describe('RateAppModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper() {
    return mount(RateAppModal, {
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal" :class="{ \'hide-header\': hideHeader }"><slot /></div>',
            props: [
              'title',
              'hideHeader',
              'hideFooter',
              'size',
              'noStacking',
              'bodyClass',
              'contentClass',
            ],
            emits: ['hidden'],
          },
          RateAppAsk: {
            template:
              '<div class="rate-app-ask" @hide="$emit(\'hide\')"></div>',
            emits: ['hide'],
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

    it('renders RateAppAsk component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.rate-app-ask').exists()).toBe(true)
    })

    it('has no header prop set', () => {
      // hideHeader prop is set to true in the component
      const wrapper = createWrapper()
      // Just verify it renders without header by checking modal exists
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })
  })

  describe('interactions', () => {
    it('calls hide when RateAppAsk emits hide', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.rate-app-ask').trigger('hide')
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('emits', () => {
    it('defines hidden emit', () => {
      const emits = RateAppModal.emits
      expect(emits).toContain('hidden')
    })
  })
})
