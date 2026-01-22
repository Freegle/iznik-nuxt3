import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModWorryWordBadge from '~/modtools/components/ModWorryWordBadge.vue'

// Mock the store
const mockDeleteWorryword = vi.fn()

vi.mock('~/stores/systemconfig', () => ({
  useSystemConfigStore: () => ({
    isLoading: false,
    deleteWorryword: mockDeleteWorryword,
  }),
}))

describe('ModWorryWordBadge', () => {
  const defaultProps = {
    worryword: {
      id: 123,
      keyword: 'worry_word',
      type: 'Review',
    },
  }

  function mountComponent(props = {}) {
    return mount(ModWorryWordBadge, {
      props: { ...defaultProps, ...props },
      global: {
        plugins: [createPinia()],
        stubs: {
          'b-badge': {
            template: '<span class="badge" :class="variant"><slot /></span>',
            props: ['variant'],
          },
          'b-button': {
            template:
              '<button @click="$emit(\'click\')" :disabled="disabled"><slot /></button>',
            props: ['size', 'variant', 'disabled'],
          },
          'v-icon': {
            template: '<span class="icon" />',
            props: ['icon'],
          },
          ConfirmModal: {
            template: '<div class="confirm-modal" />',
            props: ['title', 'message'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockDeleteWorryword.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders badge with keyword', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('worry_word')
    })

    it('shows REGEX prefix for regex pattern', () => {
      const wrapper = mountComponent({
        worryword: { ...defaultProps.worryword, keyword: 'REGEX:pattern' },
      })
      expect(wrapper.text()).toContain('REGEX:')
    })

    it('does not show REGEX prefix for non-regex', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('REGEX:')
    })

    it('shows type prefix when type is not Review', () => {
      const wrapper = mountComponent({
        worryword: { ...defaultProps.worryword, type: 'Regulated' },
      })
      expect(wrapper.text()).toContain('REGULATED:')
    })

    it('does not show type prefix when type is Review', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('REVIEW:')
    })

    it('renders delete button', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('button').exists()).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('isRegexPattern returns true for REGEX: prefix', () => {
      const wrapper = mountComponent({
        worryword: { ...defaultProps.worryword, keyword: 'REGEX:pattern' },
      })
      expect(wrapper.vm.isRegexPattern).toBe(true)
    })

    it('isRegexPattern returns false for non-regex', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.isRegexPattern).toBe(false)
    })

    it('displayText strips REGEX: prefix', () => {
      const wrapper = mountComponent({
        worryword: { ...defaultProps.worryword, keyword: 'REGEX:mypattern' },
      })
      expect(wrapper.vm.displayText).toBe('mypattern')
    })

    it('displayText returns keyword when not regex', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.displayText).toBe('worry_word')
    })

    it('worrywordVariant returns secondary for Review', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.worrywordVariant).toBe('secondary')
    })

    it('worrywordVariant returns warning for Regulated', () => {
      const wrapper = mountComponent({
        worryword: { ...defaultProps.worryword, type: 'Regulated' },
      })
      expect(wrapper.vm.worrywordVariant).toBe('warning')
    })

    it('worrywordVariant returns danger for Regulated regex', () => {
      const wrapper = mountComponent({
        worryword: {
          ...defaultProps.worryword,
          type: 'Regulated',
          keyword: 'REGEX:pattern',
        },
      })
      expect(wrapper.vm.worrywordVariant).toBe('danger')
    })

    it('worrywordVariant returns danger for Reportable', () => {
      const wrapper = mountComponent({
        worryword: { ...defaultProps.worryword, type: 'Reportable' },
      })
      expect(wrapper.vm.worrywordVariant).toBe('danger')
    })

    it('worrywordVariant returns info for Medicine', () => {
      const wrapper = mountComponent({
        worryword: { ...defaultProps.worryword, type: 'Medicine' },
      })
      expect(wrapper.vm.worrywordVariant).toBe('info')
    })

    it('worrywordVariant returns success for Allowed', () => {
      const wrapper = mountComponent({
        worryword: { ...defaultProps.worryword, type: 'Allowed' },
      })
      expect(wrapper.vm.worrywordVariant).toBe('success')
    })

    it('worrywordVariant returns info for Review regex', () => {
      const wrapper = mountComponent({
        worryword: { ...defaultProps.worryword, keyword: 'REGEX:pattern' },
      })
      expect(wrapper.vm.worrywordVariant).toBe('info')
    })
  })

  describe('methods', () => {
    it('confirmDelete sets showDeleteConfirm to true', () => {
      const wrapper = mountComponent()
      wrapper.vm.confirmDelete()
      expect(wrapper.vm.showDeleteConfirm).toBe(true)
    })

    it('confirmDelete sets deleteConfirmMessage', () => {
      const wrapper = mountComponent()
      wrapper.vm.confirmDelete()
      expect(wrapper.vm.deleteConfirmMessage).toContain('worry_word')
    })

    it('handleDelete calls store deleteWorryword', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.handleDelete()
      expect(mockDeleteWorryword).toHaveBeenCalledWith(123)
    })

    it('handleDelete resets showDeleteConfirm', async () => {
      const wrapper = mountComponent()
      wrapper.vm.showDeleteConfirm = true
      await wrapper.vm.handleDelete()
      expect(wrapper.vm.showDeleteConfirm).toBe(false)
    })
  })

  describe('props', () => {
    it('accepts worryword prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('worryword').keyword).toBe('worry_word')
    })
  })
})
