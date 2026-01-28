import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SpinButton from '~/components/SpinButton.vue'

const mockOnline = vi.fn(() => true)

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    online: mockOnline(),
  }),
}))

vi.mock('~/composables/useClientLog', () => ({
  action: vi.fn(),
}))

const mockSentryCaptureException = vi.fn()
globalThis.useNuxtApp = vi.fn(() => ({
  $sentryCaptureException: mockSentryCaptureException,
}))

describe('SpinButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createWrapper(props = {}) {
    return mount(SpinButton, {
      props: {
        variant: 'primary',
        ...props,
      },
      global: {
        stubs: {
          'b-button': {
            template:
              '<button :class="$attrs.class" :disabled="disabled" :title="title" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'disabled', 'size', 'tabindex', 'title'],
          },
          'v-icon': {
            template:
              '<span class="v-icon" :data-icon="icon" :class="$attrs.class" />',
            props: ['icon'],
          },
          ConfirmModal: {
            template: '<div class="confirm-modal" v-if="true" />',
            emits: ['confirm', 'hidden'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders button element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('renders icon', () => {
      const wrapper = createWrapper({ iconName: 'check' })
      expect(wrapper.find('.v-icon').exists()).toBe(true)
    })

    it('renders label when provided', () => {
      const wrapper = createWrapper({ label: 'Submit' })
      expect(wrapper.text()).toContain('Submit')
    })

    it('renders slot content', () => {
      const wrapper = mount(SpinButton, {
        props: { variant: 'primary' },
        slots: { default: 'Click me' },
        global: {
          stubs: {
            'b-button': {
              template: '<button><slot /></button>',
              props: ['variant'],
            },
            'v-icon': { template: '<span />' },
          },
        },
      })
      expect(wrapper.text()).toContain('Click me')
    })
  })

  describe('icon states', () => {
    it('shows iconName when not loading', () => {
      const wrapper = createWrapper({ iconName: 'heart' })
      expect(wrapper.find('.v-icon').attributes('data-icon')).toBe('heart')
    })

    it('shows sync icon when loading', async () => {
      const wrapper = createWrapper({ iconName: 'heart' })
      await wrapper.find('button').trigger('click')

      expect(wrapper.find('.v-icon').attributes('data-icon')).toBe('sync')
    })

    it('shows doneIcon after loading finishes', async () => {
      const wrapper = createWrapper({
        iconName: 'heart',
        doneIcon: 'check',
        minimumSpinTime: 100,
      })

      // Start loading
      await wrapper.find('button').trigger('click')

      // Call the finish callback
      const emitted = wrapper.emitted('handle')
      const finishCallback = emitted[0][0]
      finishCallback()

      // Wait for minimumSpinTime
      await vi.advanceTimersByTimeAsync(200)

      expect(wrapper.find('.v-icon').attributes('data-icon')).toBe('check')
    })
  })

  describe('loading state', () => {
    it('starts not loading', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.loading).toBe(false)
    })

    it('sets loading to true on click', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('click')
      expect(wrapper.vm.loading).toBe(true)
    })

    it('ignores clicks while loading', async () => {
      const wrapper = createWrapper()

      await wrapper.find('button').trigger('click')
      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('handle').length).toBe(1)
    })
  })

  describe('events', () => {
    it('emits handle event on click', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('handle')).toBeTruthy()
    })

    it('passes finishSpinner callback in handle event', async () => {
      const wrapper = createWrapper()
      await wrapper.find('button').trigger('click')

      const emitted = wrapper.emitted('handle')
      expect(typeof emitted[0][0]).toBe('function')
    })

    it('passes handleParam in handle event', async () => {
      const wrapper = createWrapper({ handleParam: 'test-param' })
      await wrapper.find('button').trigger('click')

      const emitted = wrapper.emitted('handle')
      expect(emitted[0][1]).toBe('test-param')
    })
  })

  describe('confirm mode', () => {
    it('does not emit handle immediately when confirm is true', async () => {
      const wrapper = createWrapper({ confirm: true })
      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('handle')).toBeFalsy()
    })

    it('shows showConfirm when confirm is true and clicked', async () => {
      const wrapper = createWrapper({ confirm: true })
      await wrapper.find('button').trigger('click')

      expect(wrapper.vm.showConfirm).toBe(true)
    })
  })

  describe('props', () => {
    it('requires variant prop', () => {
      const wrapper = createWrapper({ variant: 'danger' })
      expect(wrapper.props('variant')).toBe('danger')
    })

    it('has iconName prop defaulting to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('iconName')).toBeNull()
    })

    it('has label prop defaulting to empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('label')).toBe('')
    })

    it('has timeout prop defaulting to 5000', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('timeout')).toBe(5000)
    })

    it('has disabled prop', () => {
      const wrapper = createWrapper({ disabled: true })
      expect(wrapper.props('disabled')).toBe(true)
    })

    it('has size prop defaulting to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('size')).toBeNull()
    })

    it('has doneIcon prop defaulting to check', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('doneIcon')).toBe('check')
    })

    it('has buttonTitle prop defaulting to empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('buttonTitle')).toBe('')
    })

    it('has flex prop defaulting to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('flex')).toBe(true)
    })

    it('has minimumSpinTime prop defaulting to 500', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('minimumSpinTime')).toBe(500)
    })

    it('has confirm prop', () => {
      const wrapper = createWrapper({ confirm: true })
      expect(wrapper.props('confirm')).toBe(true)
    })
  })

  describe('computed iconData', () => {
    it('returns correct icon when not loading', () => {
      const wrapper = createWrapper({ iconName: 'star' })
      expect(wrapper.vm.computedIconData).toEqual({
        class: 'fa-fw',
        name: 'star',
      })
    })

    it('returns spinner icon when loading', async () => {
      const wrapper = createWrapper({ iconName: 'star' })
      await wrapper.find('button').trigger('click')

      expect(wrapper.vm.computedIconData.name).toBe('sync')
      expect(wrapper.vm.computedIconData.class).toContain('fa-spin')
    })
  })

  describe('CSS classes', () => {
    it('applies flex classes by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').classes()).toContain('d-flex')
    })

    it('does not apply flex classes when flex is false', () => {
      const wrapper = createWrapper({ flex: false })
      expect(wrapper.find('button').classes()).not.toContain('d-flex')
    })

    it('applies no-border class when noBorder is true', () => {
      const wrapper = createWrapper({ noBorder: true })
      expect(wrapper.find('button').classes()).toContain('no-border')
    })

    it('applies flex-row-reverse when iconlast is true', () => {
      const wrapper = createWrapper({ iconlast: true })
      expect(wrapper.find('button').classes()).toContain('flex-row-reverse')
    })
  })

  describe('exposed methods', () => {
    it('exposes handle method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.handle).toBe('function')
    })
  })
})
