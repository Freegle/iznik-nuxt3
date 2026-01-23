import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import NewsReportModal from '~/components/NewsReportModal.vue'

// Mock useNewsfeedStore
const mockReport = vi.fn()
vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => ({
    report: mockReport,
  }),
}))

// Mock useOurModal
const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

describe('NewsReportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(NewsReportModal, {
      props: { id: 123, ...props },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal" :id="id" :title="title"><slot /><slot name="footer" /></div>',
            props: ['id', 'title', 'scrollable', 'size', 'noStacking'],
          },
          'b-form-textarea': {
            template:
              '<textarea class="b-form-textarea" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
            props: ['modelValue', 'rows', 'placeholder'],
            emits: ['update:modelValue'],
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

    it('has correct modal id', () => {
      const wrapper = createWrapper({ id: 456 })
      expect(wrapper.find('.b-modal').attributes('id')).toBe(
        'newsReportModal-456'
      )
    })

    it('has correct modal title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').attributes('title')).toBe('Report a post')
    })

    it('asks what user does not like', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("What don't you like about this?")
    })

    it('has textarea for reason', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-textarea').exists()).toBe(true)
    })

    it('has Submit Report button', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const submitButton = buttons.find((b) => b.text() === 'Submit Report')
      expect(submitButton).toBeDefined()
    })
  })

  describe('interactions', () => {
    it('calls hide when Close button clicked', async () => {
      const wrapper = createWrapper()
      const closeButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Close')
      await closeButton.trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })

    it('calls report when Submit Report clicked', async () => {
      const wrapper = createWrapper({ id: 789 })
      const submitButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Submit Report')
      await submitButton.trigger('click')
      expect(mockReport).toHaveBeenCalledWith(789, null)
    })

    it('calls hide after submitting report', async () => {
      const wrapper = createWrapper()
      const submitButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Submit Report')
      await submitButton.trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('props', () => {
    it('id prop is Number type', () => {
      const props = NewsReportModal.props
      expect(props.id.type).toBe(Number)
    })
  })
})
