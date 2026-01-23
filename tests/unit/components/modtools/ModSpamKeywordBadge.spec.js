import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModSpamKeywordBadge from '~/modtools/components/ModSpamKeywordBadge.vue'

// Mock the store
const mockDeleteSpamKeyword = vi.fn()

vi.mock('~/stores/systemconfig', () => ({
  useSystemConfigStore: () => ({
    isLoading: false,
    deleteSpamKeyword: mockDeleteSpamKeyword,
  }),
}))

describe('ModSpamKeywordBadge', () => {
  const defaultProps = {
    spamKeyword: {
      id: 123,
      word: 'spam_word',
      type: 'Exact',
      action: 'Spam',
    },
  }

  function mountComponent(props = {}) {
    return mount(ModSpamKeywordBadge, {
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
    mockDeleteSpamKeyword.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders badge with keyword', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('spam_word')
    })

    it('shows REGEX prefix for regex type', () => {
      const wrapper = mountComponent({
        spamKeyword: { ...defaultProps.spamKeyword, type: 'Regex' },
      })
      expect(wrapper.text()).toContain('REGEX:')
    })

    it('does not show REGEX prefix for exact type', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('REGEX:')
    })

    it('renders delete button', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('does not show confirm modal initially', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showDeleteConfirm).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('displayText returns keyword word', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.displayText).toBe('spam_word')
    })

    it('spamKeywordVariant returns warning for Review action', () => {
      const wrapper = mountComponent({
        spamKeyword: { ...defaultProps.spamKeyword, action: 'Review' },
      })
      expect(wrapper.vm.spamKeywordVariant).toBe('warning')
    })

    it('spamKeywordVariant returns danger for Spam action', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.spamKeywordVariant).toBe('danger')
    })

    it('spamKeywordVariant returns success for Whitelist action', () => {
      const wrapper = mountComponent({
        spamKeyword: { ...defaultProps.spamKeyword, action: 'Whitelist' },
      })
      expect(wrapper.vm.spamKeywordVariant).toBe('success')
    })

    it('spamKeywordVariant returns secondary for unknown action', () => {
      const wrapper = mountComponent({
        spamKeyword: { ...defaultProps.spamKeyword, action: 'Unknown' },
      })
      expect(wrapper.vm.spamKeywordVariant).toBe('secondary')
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
      expect(wrapper.vm.deleteConfirmMessage).toContain('spam_word')
    })

    it('handleDelete calls store deleteSpamKeyword', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.handleDelete()
      expect(mockDeleteSpamKeyword).toHaveBeenCalledWith(123)
    })

    it('handleDelete resets showDeleteConfirm', async () => {
      const wrapper = mountComponent()
      wrapper.vm.showDeleteConfirm = true
      await wrapper.vm.handleDelete()
      expect(wrapper.vm.showDeleteConfirm).toBe(false)
    })

    it('clicking delete button triggers confirmDelete', async () => {
      const wrapper = mountComponent()
      await wrapper.find('button').trigger('click')
      expect(wrapper.vm.showDeleteConfirm).toBe(true)
    })
  })
})
