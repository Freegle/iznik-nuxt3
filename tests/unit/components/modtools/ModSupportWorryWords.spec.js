import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModSupportWorryWords from '~/modtools/components/ModSupportWorryWords.vue'

// Mock the store
const mockFetchWorrywords = vi.fn()
const mockAddWorryword = vi.fn()

vi.mock('~/stores/systemconfig', () => ({
  useSystemConfigStore: () => ({
    isLoading: false,
    hasError: false,
    getError: null,
    getWorrywords: [],
    fetchWorrywords: mockFetchWorrywords,
    addWorryword: mockAddWorryword,
  }),
}))

describe('ModSupportWorryWords', () => {
  function mountComponent() {
    return mount(ModSupportWorryWords, {
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
          ModWorryWordBadge: {
            template:
              '<span class="worry-word-badge">{{ worryword.keyword }}</span>',
            props: ['worryword'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockFetchWorrywords.mockResolvedValue()
    mockAddWorryword.mockResolvedValue()
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

    it('shows "No worry words configured" when list is empty', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('No worry words configured')
    })
  })

  describe('props and refs', () => {
    it('initializes with default values', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.newWorryWord).toBe('')
      expect(wrapper.vm.patternType).toBe('literal')
      expect(wrapper.vm.worryWordType).toBe('Review')
    })
  })

  describe('computed properties', () => {
    it('regexValidationState returns null for literal pattern', () => {
      const wrapper = mountComponent()
      wrapper.vm.patternType = 'literal'
      wrapper.vm.newWorryWord = 'test'
      expect(wrapper.vm.regexValidationState).toBeNull()
    })

    it('regexValidationState returns null for empty regex', () => {
      const wrapper = mountComponent()
      wrapper.vm.patternType = 'regex'
      wrapper.vm.newWorryWord = ''
      expect(wrapper.vm.regexValidationState).toBeNull()
    })

    it('regexValidationState returns true for valid regex', () => {
      const wrapper = mountComponent()
      wrapper.vm.patternType = 'regex'
      wrapper.vm.newWorryWord = '\\b(word1|word2)\\b'
      expect(wrapper.vm.regexValidationState).toBe(true)
    })

    it('regexValidationState returns false for invalid regex', () => {
      const wrapper = mountComponent()
      wrapper.vm.patternType = 'regex'
      wrapper.vm.newWorryWord = '[invalid'
      expect(wrapper.vm.regexValidationState).toBe(false)
      expect(wrapper.vm.regexError).toContain('Invalid regex')
    })
  })

  describe('methods', () => {
    it('fetchWorryWords calls store method', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.fetchWorryWords()
      expect(mockFetchWorrywords).toHaveBeenCalled()
    })

    it('addWorryWord does nothing when input is empty', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newWorryWord = ''
      await wrapper.vm.addWorryWord()
      expect(mockAddWorryword).not.toHaveBeenCalled()
    })

    it('addWorryWord does nothing when input is whitespace only', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newWorryWord = '   '
      await wrapper.vm.addWorryWord()
      expect(mockAddWorryword).not.toHaveBeenCalled()
    })

    it('addWorryWord calls store with literal pattern', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newWorryWord = 'test keyword'
      wrapper.vm.patternType = 'literal'
      wrapper.vm.worryWordType = 'Review'
      await wrapper.vm.addWorryWord()
      expect(mockAddWorryword).toHaveBeenCalledWith('test keyword', 'Review')
    })

    it('addWorryWord calls store with regex pattern (prefixed)', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newWorryWord = '\\btest\\b'
      wrapper.vm.patternType = 'regex'
      wrapper.vm.worryWordType = 'Regulated'
      await wrapper.vm.addWorryWord()
      expect(mockAddWorryword).toHaveBeenCalledWith(
        'REGEX:\\btest\\b',
        'Regulated'
      )
    })

    it('addWorryWord clears input after successful add', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newWorryWord = 'test keyword'
      wrapper.vm.patternType = 'literal'
      await wrapper.vm.addWorryWord()
      expect(wrapper.vm.newWorryWord).toBe('')
    })

    it('addWorryWord does not add invalid regex', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newWorryWord = '[invalid'
      wrapper.vm.patternType = 'regex'
      await wrapper.vm.addWorryWord()
      expect(mockAddWorryword).not.toHaveBeenCalled()
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

  describe('worry word type options', () => {
    it('has correct worry word type options', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.worryWordTypeOptions).toEqual([
        { text: 'Review', value: 'Review' },
        { text: 'Regulated', value: 'Regulated' },
        { text: 'Reportable', value: 'Reportable' },
        { text: 'Medicine', value: 'Medicine' },
        { text: 'Allowed', value: 'Allowed' },
      ])
    })
  })

  describe('filter options', () => {
    it('has correct worry word type filter options', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.worrywordTypeOptions).toEqual([
        { text: 'All Types', value: 'all' },
        { text: 'Review', value: 'Review' },
        { text: 'Regulated', value: 'Regulated' },
        { text: 'Reportable', value: 'Reportable' },
        { text: 'Medicine', value: 'Medicine' },
        { text: 'Allowed', value: 'Allowed' },
      ])
    })
  })

  describe('exposed methods', () => {
    it('exposes fetchWorryWords', () => {
      const wrapper = mountComponent()
      expect(typeof wrapper.vm.fetchWorryWords).toBe('function')
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

  describe('button disabled state', () => {
    it('add button is disabled when input is empty', () => {
      const wrapper = mountComponent()
      wrapper.vm.newWorryWord = ''
      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('add button is disabled for invalid regex', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newWorryWord = '[invalid'
      wrapper.vm.patternType = 'regex'
      await wrapper.vm.$nextTick()
      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })
})
