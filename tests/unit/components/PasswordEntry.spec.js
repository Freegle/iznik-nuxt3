import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordEntry from '~/components/PasswordEntry.vue'

const mockSaveAndGet = vi.fn()

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    saveAndGet: mockSaveAndGet,
  }),
}))

describe('PasswordEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSaveAndGet.mockResolvedValue({})
  })

  function createWrapper(props = {}) {
    return mount(PasswordEntry, {
      props,
      global: {
        stubs: {
          'b-form-group': {
            template:
              '<div class="form-group"><label>{{ label }}</label><slot /></div>',
            props: ['label', 'labelFor'],
          },
          'b-input-group': {
            template:
              '<div class="input-group" :class="$attrs.class"><slot /></div>',
          },
          'b-form-input': {
            template:
              '<input :type="type" :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" class="form-input" />',
            props: ['modelValue', 'type', 'placeholder', 'id'],
            emits: ['update:modelValue'],
          },
          'b-button': {
            template:
              '<button :title="title" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'title', 'ariaLabel'],
            emits: ['click'],
          },
          'v-icon': {
            template: '<i :data-icon="icon"></i>',
            props: ['icon', 'flip'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" @click="$emit(\'handle\', () => {})"><slot /></button>',
            props: ['variant', 'ariaLabel', 'iconName', 'label'],
            emits: ['handle'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders password input', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('renders show/hide password button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('uses default placeholder', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('label').text()).toBe('Choose password')
    })

    it('uses custom placeholder', () => {
      const wrapper = createWrapper({ placeholder: 'Enter password' })
      expect(wrapper.find('label').text()).toBe('Enter password')
    })
  })

  describe('password visibility toggle', () => {
    it('starts with password hidden', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('input').attributes('type')).toBe('password')
    })

    it('shows password when toggle clicked', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('input').attributes('type')).toBe('text')
    })

    it('hides password when toggled twice', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('click')
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('input').attributes('type')).toBe('password')
    })

    it('shows eye icon with slash when password visible', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('click')
      expect(wrapper.findAll('[data-icon="slash"]').length).toBe(1)
    })
  })

  describe('error state', () => {
    it('adds border-danger class when errorBorder is true', () => {
      const wrapper = createWrapper({ errorBorder: true })
      expect(wrapper.find('.input-group').classes()).toContain('border-danger')
    })

    it('does not add border-danger when errorBorder is false', () => {
      const wrapper = createWrapper({ errorBorder: false })
      expect(wrapper.find('.input-group').classes()).not.toContain(
        'border-danger'
      )
    })
  })

  describe('v-model', () => {
    it('emits update:modelValue when password changes', async () => {
      const wrapper = createWrapper()
      await wrapper.find('input').setValue('newpassword')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('save option', () => {
    it('shows save button when showSaveOption is true', () => {
      const wrapper = createWrapper({ showSaveOption: true })
      expect(wrapper.find('.spin-button').exists()).toBe(true)
    })

    it('hides save button when showSaveOption is false', () => {
      const wrapper = createWrapper({ showSaveOption: false })
      expect(wrapper.find('.spin-button').exists()).toBe(false)
    })
  })

  describe('initial password', () => {
    it('uses originalPassword prop on mount', async () => {
      const wrapper = createWrapper({ originalPassword: 'initial123' })
      // Wait for mounted hook
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.password).toBe('initial123')
    })
  })
})
