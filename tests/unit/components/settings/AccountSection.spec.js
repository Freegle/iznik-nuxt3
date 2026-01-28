import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import AccountSection from '~/components/settings/AccountSection.vue'

// Mock data - accessed via mockMeRef.value
const mockMeData = {
  id: 1,
  email: 'test@example.com',
  bouncing: false,
  settings: {},
  emails: [
    { id: 1, email: 'test@example.com', ourdomain: false },
    { id: 2, email: 'other@example.com', ourdomain: false },
  ],
}

// Use real Vue refs for template auto-unwrapping
const mockMeRef = ref(mockMeData)
const mockMyidRef = ref(1)

const mockAuthStore = {
  saveAndGet: vi.fn().mockResolvedValue({}),
  saveEmail: vi.fn().mockResolvedValue({ ret: 0 }),
  unbounce: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMeRef,
    myid: mockMyidRef,
  }),
}))

describe('AccountSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the ref value to default state
    mockMeRef.value = {
      id: 1,
      email: 'test@example.com',
      bouncing: false,
      settings: {},
      emails: [
        { id: 1, email: 'test@example.com', ourdomain: false },
        { id: 2, email: 'other@example.com', ourdomain: false },
      ],
    }
  })

  function createWrapper() {
    return mount(AccountSection, {
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          'b-input-group': {
            template:
              '<div class="b-input-group"><slot /><slot name="append" /></div>',
          },
          'b-form-input': {
            template:
              '<input class="b-form-input" :type="type" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'type'],
            emits: ['update:modelValue'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'to'],
            emits: ['click'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" :disabled="disabled" @click="handleClick"><slot />{{ label }}</button>',
            props: ['variant', 'iconName', 'label', 'disabled', 'size'],
            emits: ['handle'],
            methods: {
              handleClick() {
                this.$emit('handle', () => {})
              },
            },
          },
          PostCode: {
            template: '<input class="post-code" />',
            emits: ['selected', 'cleared'],
          },
          PasswordEntry: {
            template: '<div class="password-entry" />',
            props: ['originalPassword', 'showSaveOption', 'placeholder'],
          },
          EmailOwn: {
            template: '<div class="email-own" :data-email="email.email" />',
            props: ['email'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders settings section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.settings-section').exists()).toBe(true)
    })

    it('shows section header with Account Settings title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Account Settings')
    })

    it('shows user icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="user"]').exists()).toBe(true)
    })

    it('shows private badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.private-badge').exists()).toBe(true)
      expect(wrapper.find('[data-icon="lock"]').exists()).toBe(true)
    })
  })

  describe('email section', () => {
    it('shows email label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Email address')
    })

    it('shows email input', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-input[type="email"]').exists()).toBe(true)
    })

    it('shows save button for email', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.spin-button')
      expect(buttons.some((b) => b.text().includes('Save'))).toBe(true)
    })
  })

  describe('other emails', () => {
    it('shows other emails section when user has other emails', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.other-emails').exists()).toBe(true)
    })

    it('shows email own components for other emails', () => {
      const wrapper = createWrapper()
      const emailComponents = wrapper.findAll('.email-own')
      expect(emailComponents.length).toBe(1) // Only other@example.com
    })

    it('shows envelope icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="envelope"]').exists()).toBe(true)
    })
  })

  describe('bouncing notice', () => {
    it('hides bouncing notice when not bouncing', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.notice-message.danger').exists()).toBe(false)
    })

    it('shows bouncing notice when bouncing', () => {
      mockMeRef.value.bouncing = true
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('deliver to your email')
    })
  })

  describe('password section', () => {
    it('shows password entry component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.password-entry').exists()).toBe(true)
    })
  })

  describe('postcode section', () => {
    it('shows postcode label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Your postcode')
    })

    it('shows postcode component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.post-code').exists()).toBe(true)
    })
  })

  describe('leave section', () => {
    it('shows unsubscribe button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Unsubscribe or leave communities')
    })

    it('shows trash icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="trash-alt"]').exists()).toBe(true)
    })
  })

  describe('save interactions', () => {
    it('calls saveEmail on email save', async () => {
      const wrapper = createWrapper()
      const saveButtons = wrapper.findAll('.spin-button')
      const emailSaveBtn = saveButtons[0]
      await emailSaveBtn.trigger('click')
      await flushPromises()
      expect(mockAuthStore.saveEmail).toHaveBeenCalled()
    })

    it('emits update after saving email', async () => {
      const wrapper = createWrapper()
      const saveButtons = wrapper.findAll('.spin-button')
      await saveButtons[0].trigger('click')
      await flushPromises()
      expect(wrapper.emitted('update')).toBeTruthy()
    })

    it('emits show-email-confirm-modal when ret is 10', async () => {
      mockAuthStore.saveEmail.mockResolvedValueOnce({ ret: 10 })
      const wrapper = createWrapper()
      const saveButtons = wrapper.findAll('.spin-button')
      await saveButtons[0].trigger('click')
      await flushPromises()
      expect(wrapper.emitted('show-email-confirm-modal')).toBeTruthy()
    })
  })
})
