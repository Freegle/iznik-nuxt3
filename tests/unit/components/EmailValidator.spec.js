import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import EmailValidator from '~/components/EmailValidator.vue'

const mockDomainFetch = vi.fn()

vi.mock('~/stores/domain', () => ({
  useDomainStore: () => ({
    fetch: mockDomainFetch,
  }),
}))

vi.mock('~/composables/useId', () => ({
  uid: vi.fn(() => 'login-123'),
}))

vi.mock('~/constants', () => ({
  EMAIL_REGEX: '^[^@]+@[^@]+\\.[^@]+$',
}))

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      USER_DOMAIN: 'users.ilovefreegle.org',
    },
  }),
}))

// Mock global fetch for DNS validation
global.fetch = vi.fn()

describe('EmailValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDomainFetch.mockResolvedValue({ ret: 0, suggestions: [] })
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ Status: 0 }),
    })
  })

  function createWrapper(props = {}) {
    return mount(EmailValidator, {
      props: {
        ...props,
      },
      global: {
        stubs: {
          'b-form-group': {
            template:
              '<div class="b-form-group" :data-label="label"><slot /></div>',
            props: ['label', 'labelFor', 'labelClass', 'state'],
          },
          VeeForm: {
            template: '<form class="vee-form"><slot /></form>',
          },
          Field: {
            template:
              '<input class="field-input" :id="id" :type="type" :value="modelValue" :placeholder="placeholder" :class="$attrs.class" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: [
              'id',
              'modelValue',
              'rules',
              'type',
              'name',
              'center',
              'autocomplete',
              'placeholder',
            ],
            emits: ['update:modelValue'],
          },
          ErrorMessage: {
            template: '<span class="error-message" />',
            props: ['name'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders form group container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-group').exists()).toBe(true)
    })

    it('renders email input field', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.field-input').exists()).toBe(true)
      expect(wrapper.find('.field-input').attributes('type')).toBe('email')
    })

    it('shows default label', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-group').attributes('data-label')).toBe(
        "What's your email address?"
      )
    })

    it('shows custom label when provided', () => {
      const wrapper = createWrapper({ label: 'Your email' })
      expect(wrapper.find('.b-form-group').attributes('data-label')).toBe(
        'Your email'
      )
    })
  })

  describe('placeholder text', () => {
    it('shows required placeholder when required is true', () => {
      const wrapper = createWrapper({ required: true })
      expect(wrapper.find('.field-input').attributes('placeholder')).toBe(
        'Email address '
      )
    })

    it('shows optional placeholder when required is false', () => {
      const wrapper = createWrapper({ required: false })
      expect(wrapper.find('.field-input').attributes('placeholder')).toBe(
        'Email address (Optional)'
      )
    })
  })

  describe('size prop', () => {
    it('applies lg size class by default', () => {
      const wrapper = createWrapper()
      const input = wrapper.find('.field-input')
      expect(input.classes()).toContain('input-lg')
    })

    it('applies custom size class', () => {
      const wrapper = createWrapper({ size: 'sm' })
      const input = wrapper.find('.field-input')
      expect(input.classes()).toContain('input-sm')
    })
  })

  describe('input class prop', () => {
    it('applies custom input class', () => {
      const wrapper = createWrapper({ inputClass: 'my-custom-class' })
      const input = wrapper.find('.field-input')
      expect(input.classes()).toContain('my-custom-class')
    })
  })

  describe('Apple ID detection', () => {
    it('shows Apple ID message for privaterelay email', () => {
      const wrapper = createWrapper({
        email: 'test@privaterelay.appleid.com',
      })
      expect(wrapper.text()).toContain('you use your Apple ID to log in')
    })

    it('hides Apple ID message for regular email', () => {
      const wrapper = createWrapper({
        email: 'test@example.com',
      })
      expect(wrapper.text()).not.toContain('Apple ID')
    })
  })

  describe('domain suggestions', () => {
    it('shows suggested domain when available', async () => {
      mockDomainFetch.mockResolvedValue({
        ret: 0,
        suggestions: ['gmail.com'],
      })

      const wrapper = createWrapper({ email: 'test@gmal.com' })
      await flushPromises()

      expect(wrapper.text()).toContain('Did you mean')
      expect(wrapper.text()).toContain('gmail.com')
    })

    it('hides suggestions when none returned', async () => {
      mockDomainFetch.mockResolvedValue({
        ret: 0,
        suggestions: [],
      })

      const wrapper = createWrapper({ email: 'test@gmail.com' })
      await flushPromises()

      expect(wrapper.text()).not.toContain('Did you mean')
    })
  })

  describe('email validation', () => {
    it('emits update:valid true for empty value when not required', async () => {
      const wrapper = createWrapper({ required: false })

      await wrapper.vm.validateEmail('')
      await flushPromises()

      expect(wrapper.emitted('update:valid')).toBeTruthy()
      expect(wrapper.emitted('update:valid')[0]).toEqual([true])
    })

    it('emits update:valid false for empty value when required', async () => {
      const wrapper = createWrapper({ required: true })

      const result = await wrapper.vm.validateEmail('')
      await flushPromises()

      expect(wrapper.emitted('update:valid')).toBeTruthy()
      expect(wrapper.emitted('update:valid')[0]).toEqual([false])
      expect(result).toBe('Please enter an email address.')
    })

    it('returns error for invalid email format', async () => {
      const wrapper = createWrapper()

      const result = await wrapper.vm.validateEmail('invalid-email')
      await flushPromises()

      expect(result).toBe('Please enter a valid email address.')
    })
  })

  describe('email updates', () => {
    it('emits update:email when email changes', async () => {
      const wrapper = createWrapper({ email: '' })

      wrapper.vm.currentEmail = 'new@example.com'
      await flushPromises()

      expect(wrapper.emitted('update:email')).toBeTruthy()
    })

    it('syncs internal email with prop changes', async () => {
      const wrapper = createWrapper({ email: 'old@example.com' })

      expect(wrapper.vm.currentEmail).toBe('old@example.com')

      await wrapper.setProps({ email: 'new@example.com' })

      expect(wrapper.vm.currentEmail).toBe('new@example.com')
    })
  })

  describe('unique ID', () => {
    it('generates unique ID for input', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.uniqueId).toBe('login-123')
    })
  })

  describe('props', () => {
    it('has optional email prop', () => {
      const wrapper = createWrapper({ email: 'test@example.com' })
      expect(wrapper.props('email')).toBe('test@example.com')
    })

    it('has required prop defaulting to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('required')).toBe(true)
    })

    it('has center prop defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('center')).toBe(false)
    })

    it('has size prop defaulting to lg', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('size')).toBe('lg')
    })

    it('has id prop with default empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('id')).toBe('')
    })
  })

  describe('expose', () => {
    it('exposes focus method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.focus).toBe('function')
    })
  })
})
