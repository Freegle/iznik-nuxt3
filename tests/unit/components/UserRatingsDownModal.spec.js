import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UserRatingsDownModal from '~/components/UserRatingsDownModal.vue'

const { mockModal, mockHide } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockModal: ref(null),
    mockHide: vi.fn(),
  }
})

const mockUserRate = vi.fn()

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: mockHide,
  }),
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    rate: mockUserRate,
  }),
}))

describe('UserRatingsDownModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(UserRatingsDownModal, {
      props: {
        id: 123,
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal"><div class="modal-title">{{ title }}</div><slot /><slot name="footer" /></div>',
            props: ['scrollable', 'title', 'okTitle'],
            emits: ['ok'],
          },
          'b-form-group': {
            template:
              '<div class="b-form-group"><label>{{ label }}</label><slot v-bind="{ ariaDescribedby: \'desc\' }" /></div>',
            props: ['label'],
          },
          'b-form-radio': {
            template:
              '<label><input type="radio" :name="name" :value="value" :checked="modelValue === value" @change="$emit(\'update:modelValue\', value)" /><slot /></label>',
            props: ['modelValue', 'name', 'value', 'ariaDescribedby'],
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['id', 'modelValue', 'rows', 'placeholder'],
          },
          'b-alert': {
            template:
              '<div v-if="modelValue" class="b-alert" :class="variant"><slot /></div>',
            props: ['modelValue', 'variant'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders modal container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('displays correct title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Giving a Thumbs Down')
    })

    it('renders explanation text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('tell us why')
      expect(wrapper.text()).toContain('local volunteers')
    })

    it('renders form group for reason', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-group').exists()).toBe(true)
      expect(wrapper.text()).toContain('What went wrong?')
    })

    it('renders all reason radio options', () => {
      const wrapper = createWrapper()
      const radios = wrapper.findAll('input[type="radio"]')
      expect(radios.length).toBe(5)
    })

    it('renders No Show option', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('No Show')
    })

    it('renders Was late or early option', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Was late or early')
    })

    it('renders Stopped replying option', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Stopped replying')
    })

    it('renders Unpleasant behaviour option', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Unpleasant behaviour')
    })

    it('renders Something else option', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Something else')
    })

    it('renders textarea for details', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('textarea').exists()).toBe(true)
      expect(
        wrapper.find('textarea[placeholder*="Explain what happened"]').exists()
      ).toBe(true)
    })

    it('renders detail label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Please give a bit of detail')
    })
  })

  describe('reactive state', () => {
    it('initializes showError as false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showError).toBe(false)
    })

    it('initializes reason as null', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.reason).toBeNull()
    })

    it('initializes text as null', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.text).toBeNull()
    })
  })

  describe('error alert', () => {
    it('does not show alert by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-alert').exists()).toBe(false)
    })

    it('shows error alert when showError is true', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showError = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.b-alert').exists()).toBe(true)
    })

    it('shows error message text', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showError = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain(
        'Please select a reason and add some detail'
      )
    })

    it('has danger variant', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showError = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.b-alert.danger').exists()).toBe(true)
    })
  })

  describe('form input', () => {
    it('updates reason when radio selected', async () => {
      const wrapper = createWrapper()
      const radio = wrapper.find('input[value="NoShow"]')
      await radio.trigger('change')
      expect(wrapper.vm.reason).toBe('NoShow')
    })

    it('updates text when textarea changed', async () => {
      const wrapper = createWrapper()
      const textarea = wrapper.find('textarea')
      await textarea.setValue('They never showed up')
      expect(wrapper.vm.text).toBe('They never showed up')
    })
  })

  describe('doSomeoneDown method', () => {
    it('shows error when reason is missing', async () => {
      const wrapper = createWrapper()
      wrapper.vm.text = 'Some text'

      const mockEvent = { preventDefault: vi.fn() }
      await wrapper.vm.doSomeoneDown(mockEvent)

      expect(wrapper.vm.showError).toBe(true)
      expect(mockUserRate).not.toHaveBeenCalled()
    })

    it('shows error when text is missing', async () => {
      const wrapper = createWrapper()
      wrapper.vm.reason = 'NoShow'

      const mockEvent = { preventDefault: vi.fn() }
      await wrapper.vm.doSomeoneDown(mockEvent)

      expect(wrapper.vm.showError).toBe(true)
      expect(mockUserRate).not.toHaveBeenCalled()
    })

    it('shows error when both are missing', async () => {
      const wrapper = createWrapper()

      const mockEvent = { preventDefault: vi.fn() }
      await wrapper.vm.doSomeoneDown(mockEvent)

      expect(wrapper.vm.showError).toBe(true)
      expect(mockUserRate).not.toHaveBeenCalled()
    })

    it('calls rate with correct parameters when valid', async () => {
      const wrapper = createWrapper()
      wrapper.vm.reason = 'NoShow'
      wrapper.vm.text = 'Did not show up'

      const mockEvent = { preventDefault: vi.fn() }
      await wrapper.vm.doSomeoneDown(mockEvent)

      expect(mockUserRate).toHaveBeenCalledWith(
        123,
        'Down',
        'NoShow',
        'Did not show up'
      )
    })

    it('emits rated event when valid', async () => {
      const wrapper = createWrapper()
      wrapper.vm.reason = 'Ghosted'
      wrapper.vm.text = 'Stopped responding'

      const mockEvent = { preventDefault: vi.fn() }
      await wrapper.vm.doSomeoneDown(mockEvent)

      expect(wrapper.emitted('rated')).toBeTruthy()
      expect(wrapper.emitted('rated')[0]).toEqual(['Down'])
    })

    it('calls hide when valid', async () => {
      const wrapper = createWrapper()
      wrapper.vm.reason = 'Rude'
      wrapper.vm.text = 'Was very rude'

      const mockEvent = { preventDefault: vi.fn() }
      await wrapper.vm.doSomeoneDown(mockEvent)

      expect(mockHide).toHaveBeenCalled()
    })

    it('prevents default on event', async () => {
      const wrapper = createWrapper()
      const mockEvent = { preventDefault: vi.fn() }
      await wrapper.vm.doSomeoneDown(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('clears showError before validation', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showError = true
      wrapper.vm.reason = 'NoShow'
      wrapper.vm.text = 'Detail text'

      const mockEvent = { preventDefault: vi.fn() }
      await wrapper.vm.doSomeoneDown(mockEvent)

      expect(wrapper.vm.showError).toBe(false)
    })
  })

  describe('rate method', () => {
    it('calls userStore.rate with correct args', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.rate('Down', 'NoShow', 'Test text')
      expect(mockUserRate).toHaveBeenCalledWith(
        123,
        'Down',
        'NoShow',
        'Test text'
      )
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 456 })
      expect(wrapper.props('id')).toBe(456)
    })
  })

  describe('radio values', () => {
    it('has NoShow value option', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('input[value="NoShow"]').exists()).toBe(true)
    })

    it('has Punctuality value option', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('input[value="Punctuality"]').exists()).toBe(true)
    })

    it('has Ghosted value option', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('input[value="Ghosted"]').exists()).toBe(true)
    })

    it('has Rude value option', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('input[value="Rude"]').exists()).toBe(true)
    })

    it('has Other value option', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('input[value="Other"]').exists()).toBe(true)
    })
  })
})
