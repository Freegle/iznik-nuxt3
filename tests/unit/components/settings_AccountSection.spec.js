import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountSection from '~/components/settings/AccountSection.vue'

const { mockMe, mockMyid } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockMe: ref({
      email: 'test@example.com',
      password: 'hashedpassword',
      bouncing: false,
      settings: {
        mylocation: null,
      },
      emails: [
        { id: 1, email: 'test@example.com', ourdomain: false },
        { id: 2, email: 'other@example.com', ourdomain: false },
        { id: 3, email: 'freegle@ilovefreegle.org', ourdomain: true },
      ],
    }),
    mockMyid: ref(123),
  }
})

const mockSaveEmail = vi.fn()
const mockSaveAndGet = vi.fn()
const mockUnbounce = vi.fn()

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    myid: mockMyid,
  }),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    saveEmail: mockSaveEmail,
    saveAndGet: mockSaveAndGet,
    unbounce: mockUnbounce,
  }),
}))

describe('AccountSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMe.value = {
      email: 'test@example.com',
      password: 'hashedpassword',
      bouncing: false,
      settings: {
        mylocation: null,
      },
      emails: [
        { id: 1, email: 'test@example.com', ourdomain: false },
        { id: 2, email: 'other@example.com', ourdomain: false },
        { id: 3, email: 'freegle@ilovefreegle.org', ourdomain: true },
      ],
    }
    mockMyid.value = 123
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
              '<input :value="modelValue" :type="type" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'type'],
          },
          'b-button': {
            template:
              '<button :to="to" :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'to'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" :disabled="disabled" @click="$emit(\'handle\', () => {})"><slot />{{ label }}</button>',
            props: ['variant', 'iconName', 'label', 'disabled', 'size'],
          },
          EmailOwn: {
            template: '<div class="email-own" :data-email="email.email" />',
            props: ['email'],
          },
          PostCode: {
            template: '<div class="postcode" />',
            emits: ['selected', 'cleared'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          PasswordEntry: {
            template: '<div class="password-entry" />',
            props: ['originalPassword', 'showSaveOption', 'placeholder'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders settings section container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.settings-section').exists()).toBe(true)
    })

    it('renders section header', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.section-header').exists()).toBe(true)
    })

    it('displays Account Settings title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h2').text()).toBe('Account Settings')
    })

    it('renders user icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="user"]').exists()).toBe(true)
    })

    it('renders lock icon for private badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.private-badge').exists()).toBe(true)
      expect(
        wrapper.find('.private-badge .v-icon[data-icon="lock"]').exists()
      ).toBe(true)
    })

    it('displays Private text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Private')
    })
  })

  describe('email section', () => {
    it('renders email address label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Email address')
    })

    it('renders email input', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    })

    it('initializes email from me.email', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.emailLocal).toBe('test@example.com')
    })

    it('renders Save button for email', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.spin-button')
      expect(buttons.some((b) => b.text().includes('Save'))).toBe(true)
    })
  })

  describe('other emails section', () => {
    it('renders other emails when present', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.other-emails').exists()).toBe(true)
    })

    it('displays Other emails label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Other emails')
    })

    it('renders EmailOwn component for each other email', () => {
      const wrapper = createWrapper()
      const emailComponents = wrapper.findAll('.email-own')
      expect(emailComponents.length).toBe(1) // Only other@example.com (not current, not ourdomain)
    })

    it('excludes ourdomain emails from other emails', () => {
      const wrapper = createWrapper()
      const emailComponents = wrapper.findAll('.email-own')
      const hasFreegleEmail = emailComponents.some(
        (c) => c.attributes('data-email') === 'freegle@ilovefreegle.org'
      )
      expect(hasFreegleEmail).toBe(false)
    })

    it('excludes current email from other emails', () => {
      const wrapper = createWrapper()
      const emailComponents = wrapper.findAll('.email-own')
      const hasCurrentEmail = emailComponents.some(
        (c) => c.attributes('data-email') === 'test@example.com'
      )
      expect(hasCurrentEmail).toBe(false)
    })

    it('does not render other emails section when no other emails', async () => {
      mockMe.value.emails = [
        { id: 1, email: 'test@example.com', ourdomain: false },
      ]
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.other-emails').exists()).toBe(false)
    })
  })

  describe('bouncing notice', () => {
    it('does not show bouncing notice by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.notice-message.danger').exists()).toBe(false)
    })

    it('shows bouncing notice when me.bouncing is true', async () => {
      mockMe.value.bouncing = true
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
    })

    it('displays bouncing message text', async () => {
      mockMe.value.bouncing = true
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain("Can't deliver to your email")
    })

    it('renders Try again button when bouncing', async () => {
      mockMe.value.bouncing = true
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Try again')
    })
  })

  describe('password section', () => {
    it('renders PasswordEntry component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.password-entry').exists()).toBe(true)
    })
  })

  describe('postcode section', () => {
    it('renders postcode label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Your postcode')
    })

    it('renders PostCode component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.postcode').exists()).toBe(true)
    })

    it('renders Save button for postcode', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.spin-button')
      expect(buttons.some((b) => b.text().includes('Save'))).toBe(true)
    })
  })

  describe('leave section', () => {
    it('renders unsubscribe button', () => {
      const wrapper = createWrapper()
      const button = wrapper.find('button[to="/unsubscribe"]')
      expect(button.exists()).toBe(true)
    })

    it('displays unsubscribe text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Unsubscribe or leave communities')
    })

    it('renders trash icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="trash-alt"]').exists()).toBe(true)
    })
  })

  describe('computed properties', () => {
    describe('otherEmails', () => {
      it('returns emails that are not current email and not ourdomain', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.otherEmails).toEqual([
          { id: 2, email: 'other@example.com', ourdomain: false },
        ])
      })

      it('returns empty array when no emails', () => {
        mockMe.value.emails = null
        const wrapper = createWrapper()
        expect(wrapper.vm.otherEmails).toEqual([])
      })

      it('returns empty array when all emails are ourdomain', () => {
        mockMe.value.emails = [
          { id: 1, email: 'test@example.com', ourdomain: false },
          { id: 2, email: 'freegle@ilovefreegle.org', ourdomain: true },
        ]
        const wrapper = createWrapper()
        expect(wrapper.vm.otherEmails).toEqual([])
      })
    })
  })

  describe('methods', () => {
    describe('selectPostcode', () => {
      it('sets pc value', () => {
        const wrapper = createWrapper()
        wrapper.vm.selectPostcode({ id: 1, name: 'AB1 2CD' })
        expect(wrapper.vm.pc).toEqual({ id: 1, name: 'AB1 2CD' })
      })
    })

    describe('clearPostcode', () => {
      it('clears pc value', () => {
        const wrapper = createWrapper()
        wrapper.vm.pc = { id: 1, name: 'AB1 2CD' }
        wrapper.vm.clearPostcode()
        expect(wrapper.vm.pc).toBeNull()
      })
    })

    describe('saveEmail', () => {
      it('calls authStore.saveEmail with email', async () => {
        mockSaveEmail.mockResolvedValue({ ret: 0 })
        const wrapper = createWrapper()
        wrapper.vm.emailLocal = 'new@example.com'

        const callback = vi.fn()
        await wrapper.vm.saveEmail(callback)

        expect(mockSaveEmail).toHaveBeenCalledWith({ email: 'new@example.com' })
      })

      it('emits show-email-confirm-modal when ret is 10', async () => {
        mockSaveEmail.mockResolvedValue({ ret: 10 })
        const wrapper = createWrapper()
        wrapper.vm.emailLocal = 'new@example.com'

        const callback = vi.fn()
        await wrapper.vm.saveEmail(callback)

        expect(wrapper.emitted('show-email-confirm-modal')).toBeTruthy()
      })

      it('does not emit show-email-confirm-modal when ret is not 10', async () => {
        mockSaveEmail.mockResolvedValue({ ret: 0 })
        const wrapper = createWrapper()
        wrapper.vm.emailLocal = 'new@example.com'

        const callback = vi.fn()
        await wrapper.vm.saveEmail(callback)

        expect(wrapper.emitted('show-email-confirm-modal')).toBeFalsy()
      })

      it('calls callback', async () => {
        mockSaveEmail.mockResolvedValue({ ret: 0 })
        const wrapper = createWrapper()
        wrapper.vm.emailLocal = 'new@example.com'

        const callback = vi.fn()
        await wrapper.vm.saveEmail(callback)

        expect(callback).toHaveBeenCalled()
      })

      it('emits update event', async () => {
        mockSaveEmail.mockResolvedValue({ ret: 0 })
        const wrapper = createWrapper()
        wrapper.vm.emailLocal = 'new@example.com'

        const callback = vi.fn()
        await wrapper.vm.saveEmail(callback)

        expect(wrapper.emitted('update')).toBeTruthy()
      })

      it('does not call saveEmail when emailLocal is empty', async () => {
        const wrapper = createWrapper()
        wrapper.vm.emailLocal = ''

        const callback = vi.fn()
        await wrapper.vm.saveEmail(callback)

        expect(mockSaveEmail).not.toHaveBeenCalled()
      })
    })

    describe('unbounce', () => {
      it('calls authStore.unbounce when bouncing', async () => {
        mockMe.value.bouncing = true
        const wrapper = createWrapper()
        wrapper.vm.emailLocal = 'test@example.com'

        const callback = vi.fn()
        await wrapper.vm.unbounce(callback)

        expect(mockUnbounce).toHaveBeenCalledWith(123)
      })

      it('does not call unbounce when not bouncing', async () => {
        mockMe.value.bouncing = false
        const wrapper = createWrapper()
        wrapper.vm.emailLocal = 'test@example.com'

        const callback = vi.fn()
        await wrapper.vm.unbounce(callback)

        expect(mockUnbounce).not.toHaveBeenCalled()
      })

      it('calls callback', async () => {
        mockMe.value.bouncing = true
        const wrapper = createWrapper()
        wrapper.vm.emailLocal = 'test@example.com'

        const callback = vi.fn()
        await wrapper.vm.unbounce(callback)

        expect(callback).toHaveBeenCalled()
      })

      it('emits update event', async () => {
        const wrapper = createWrapper()

        const callback = vi.fn()
        await wrapper.vm.unbounce(callback)

        expect(wrapper.emitted('update')).toBeTruthy()
      })
    })

    describe('savePostcode', () => {
      it('calls authStore.saveAndGet when pc is set', async () => {
        const wrapper = createWrapper()
        wrapper.vm.pc = { id: 1, name: 'AB1 2CD' }

        const callback = vi.fn()
        await wrapper.vm.savePostcode(callback)

        expect(mockSaveAndGet).toHaveBeenCalled()
      })

      it('does not call saveAndGet when pc is null', async () => {
        const wrapper = createWrapper()
        wrapper.vm.pc = null

        const callback = vi.fn()
        await wrapper.vm.savePostcode(callback)

        expect(mockSaveAndGet).not.toHaveBeenCalled()
      })

      it('does not call saveAndGet when location already matches', async () => {
        mockMe.value.settings.mylocation = { id: 1, name: 'AB1 2CD' }
        const wrapper = createWrapper()
        wrapper.vm.pc = { id: 1, name: 'AB1 2CD' }

        const callback = vi.fn()
        await wrapper.vm.savePostcode(callback)

        expect(mockSaveAndGet).not.toHaveBeenCalled()
      })

      it('calls callback', async () => {
        const wrapper = createWrapper()

        const callback = vi.fn()
        await wrapper.vm.savePostcode(callback)

        expect(callback).toHaveBeenCalled()
      })

      it('emits update event', async () => {
        const wrapper = createWrapper()

        const callback = vi.fn()
        await wrapper.vm.savePostcode(callback)

        expect(wrapper.emitted('update')).toBeTruthy()
      })
    })
  })

  describe('watch', () => {
    it('updates emailLocal when me changes', async () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.emailLocal).toBe('test@example.com')

      mockMe.value = { ...mockMe.value, email: 'updated@example.com' }
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.emailLocal).toBe('updated@example.com')
    })
  })

  describe('reactive state', () => {
    it('initializes pc as null', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.pc).toBeNull()
    })
  })
})
