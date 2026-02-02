import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ResultModal from '~/components/ResultModal.vue'

// Mock useOurModal
const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

describe('ResultModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(ResultModal, {
      props: { title: 'Test Title', ...props },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal" :title="title"><slot /><slot name="footer" /></div>',
            props: ['title', 'scrollable'],
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

    it('sets modal title from prop', () => {
      const wrapper = createWrapper({ title: 'Success!' })
      expect(wrapper.find('.b-modal').attributes('title')).toBe('Success!')
    })

    it('displays message when provided', () => {
      const wrapper = createWrapper({ message: 'Operation completed' })
      expect(wrapper.text()).toContain('Operation completed')
    })
  })

  describe('interactions', () => {
    it('calls hide when Close button clicked', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('props', () => {
    it('title prop is String type', () => {
      const props = ResultModal.props
      expect(props.title.type).toBe(String)
    })

    it('message prop defaults to empty string', () => {
      const props = ResultModal.props
      expect(props.message.default).toBe('')
    })
  })

  describe('slots', () => {
    it('supports custom content via slot', () => {
      const wrapper = mount(ResultModal, {
        props: { title: 'Custom' },
        slots: {
          default: '<p class="custom-content">Custom message</p>',
        },
        global: {
          stubs: {
            'b-modal': {
              template:
                '<div class="b-modal"><slot /><slot name="footer" /></div>',
              props: ['title', 'scrollable'],
            },
            'b-button': {
              template: '<button><slot /></button>',
              props: ['variant'],
            },
          },
        },
      })
      expect(wrapper.find('.custom-content').exists()).toBe(true)
    })
  })
})
