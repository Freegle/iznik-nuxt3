import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModSupportSpamKeywords from '~/modtools/components/ModSupportSpamKeywords.vue'

// Mock the store
const mockFetchSpamKeywords = vi.fn()
const mockAddSpamKeyword = vi.fn()

vi.mock('~/stores/systemconfig', () => ({
  useSystemConfigStore: () => ({
    isLoading: false,
    hasError: false,
    getError: null,
    getSpamKeywords: [],
    fetchSpamKeywords: mockFetchSpamKeywords,
    addSpamKeyword: mockAddSpamKeyword,
  }),
}))

describe('ModSupportSpamKeywords', () => {
  function mountComponent() {
    return mount(ModSupportSpamKeywords, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          'b-spinner': {
            template: '<span class="spinner" />',
          },
          'b-form': {
            template:
              '<form @submit.prevent="$emit(\'submit\')"><slot /></form>',
          },
          'b-form-group': {
            template: '<div class="form-group"><slot /></div>',
            props: ['label', 'labelFor'],
          },
          'b-form-select': {
            template:
              '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
            props: ['modelValue', 'options'],
          },
          'b-input-group': {
            template:
              '<div class="input-group"><slot /><slot name="append" /></div>',
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" :placeholder="placeholder" :disabled="disabled" :state="state" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'placeholder', 'disabled', 'state'],
          },
          'b-button': {
            template:
              '<button :type="type" :variant="variant" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['type', 'variant', 'disabled'],
          },
          'b-form-invalid-feedback': {
            template: '<div class="invalid-feedback"><slot /></div>',
          },
          ModSpamKeywordBadge: {
            template:
              '<span class="spam-keyword-badge">{{ spamKeyword.word }}</span>',
            props: ['spamKeyword'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockFetchSpamKeywords.mockResolvedValue()
    mockAddSpamKeyword.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders warning notice message', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('Use with extreme care')
    })

    it('shows form when not loading', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('shows "No spam keywords configured" when list is empty', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('No spam keywords configured')
    })
  })

  describe('props and refs', () => {
    it('initializes with default values', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.newSpamKeyword).toBe('')
      expect(wrapper.vm.patternType).toBe('literal')
      expect(wrapper.vm.actionType).toBe('Review')
    })
  })

  describe('computed properties', () => {
    it('regexValidationState returns null for literal pattern', () => {
      const wrapper = mountComponent()
      wrapper.vm.patternType = 'literal'
      wrapper.vm.newSpamKeyword = 'test'
      expect(wrapper.vm.regexValidationState).toBeNull()
    })

    it('regexValidationState returns null for empty regex', () => {
      const wrapper = mountComponent()
      wrapper.vm.patternType = 'regex'
      wrapper.vm.newSpamKeyword = ''
      expect(wrapper.vm.regexValidationState).toBeNull()
    })

    it('regexValidationState returns true for valid regex', () => {
      const wrapper = mountComponent()
      wrapper.vm.patternType = 'regex'
      wrapper.vm.newSpamKeyword = '\\b(word1|word2)\\b'
      expect(wrapper.vm.regexValidationState).toBe(true)
    })

    it('regexValidationState returns false for invalid regex', () => {
      const wrapper = mountComponent()
      wrapper.vm.patternType = 'regex'
      wrapper.vm.newSpamKeyword = '[invalid'
      expect(wrapper.vm.regexValidationState).toBe(false)
      expect(wrapper.vm.regexError).toContain('Invalid regex')
    })
  })

  describe('methods', () => {
    it('fetchSpamKeywords calls store method', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.fetchSpamKeywords()
      expect(mockFetchSpamKeywords).toHaveBeenCalled()
    })

    it('addSpamKeyword does nothing when input is empty', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newSpamKeyword = ''
      await wrapper.vm.addSpamKeyword()
      expect(mockAddSpamKeyword).not.toHaveBeenCalled()
    })

    it('addSpamKeyword does nothing when input is whitespace only', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newSpamKeyword = '   '
      await wrapper.vm.addSpamKeyword()
      expect(mockAddSpamKeyword).not.toHaveBeenCalled()
    })

    it('addSpamKeyword calls store with literal type', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newSpamKeyword = 'test keyword'
      wrapper.vm.patternType = 'literal'
      wrapper.vm.actionType = 'Spam'
      await wrapper.vm.addSpamKeyword()
      expect(mockAddSpamKeyword).toHaveBeenCalledWith(
        'test keyword',
        'Literal',
        'Spam'
      )
    })

    it('addSpamKeyword calls store with regex type', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newSpamKeyword = '\\btest\\b'
      wrapper.vm.patternType = 'regex'
      wrapper.vm.actionType = 'Review'
      await wrapper.vm.addSpamKeyword()
      expect(mockAddSpamKeyword).toHaveBeenCalledWith(
        '\\btest\\b',
        'Regex',
        'Review'
      )
    })

    it('addSpamKeyword clears input after successful add', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newSpamKeyword = 'test keyword'
      wrapper.vm.patternType = 'literal'
      await wrapper.vm.addSpamKeyword()
      expect(wrapper.vm.newSpamKeyword).toBe('')
    })

    it('addSpamKeyword does not add invalid regex', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newSpamKeyword = '[invalid'
      wrapper.vm.patternType = 'regex'
      await wrapper.vm.addSpamKeyword()
      expect(mockAddSpamKeyword).not.toHaveBeenCalled()
    })
  })

  describe('pattern type options', () => {
    it('has correct pattern type options', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.patternTypeOptions).toEqual([
        { text: 'Literal (exact word/phrase)', value: 'literal' },
        { text: 'Regular Expression (advanced)', value: 'regex' },
      ])
    })
  })

  describe('action type options', () => {
    it('has correct action type options', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.actionTypeOptions).toEqual([
        { text: 'Review', value: 'Review' },
        { text: 'Spam', value: 'Spam' },
        { text: 'Whitelist', value: 'Whitelist' },
      ])
    })
  })

  describe('exposed methods', () => {
    it('exposes fetchSpamKeywords', () => {
      const wrapper = mountComponent()
      expect(typeof wrapper.vm.fetchSpamKeywords).toBe('function')
    })
  })

  describe('regex warning', () => {
    it('shows regex warning when patternType is regex', async () => {
      const wrapper = mountComponent()
      wrapper.vm.patternType = 'regex'
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Regular Expressions')
      expect(wrapper.text()).toContain('Require technical knowledge')
    })

    it('hides regex warning when patternType is literal', () => {
      const wrapper = mountComponent()
      wrapper.vm.patternType = 'literal'
      expect(wrapper.text()).not.toContain('Regular Expressions:')
    })
  })

  describe('filter options', () => {
    it('has correct spam keyword type filter options', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.spamKeywordTypeOptions).toEqual([
        { text: 'All Types', value: 'all' },
        { text: 'Literal', value: 'Literal' },
        { text: 'Regex', value: 'Regex' },
      ])
    })
  })

  describe('button disabled state', () => {
    it('add button is disabled when input is empty', () => {
      const wrapper = mountComponent()
      wrapper.vm.newSpamKeyword = ''
      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('add button is disabled for invalid regex', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newSpamKeyword = '[invalid'
      wrapper.vm.patternType = 'regex'
      await wrapper.vm.$nextTick()
      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })
})
