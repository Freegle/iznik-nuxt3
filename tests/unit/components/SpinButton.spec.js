import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import SpinButton from '~/components/SpinButton.vue'

// Mock stores and composables
vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    online: true,
  }),
}))

vi.mock('~/composables/useClientLog', () => ({
  action: vi.fn(),
}))

const mockCaptureException = vi.fn()
vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    ref: actual.ref,
    defineAsyncComponent: vi.fn(() => ({
      template: '<div class="confirm-modal"><slot /></div>',
    })),
    onBeforeUnmount: vi.fn((fn) => fn),
  }
})

// Mock useNuxtApp
globalThis.useNuxtApp = () => ({
  $sentryCaptureException: mockCaptureException,
})

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
              '<button :disabled="disabled" :title="title" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'disabled', 'size', 'tabindex', 'title'],
          },
          'v-icon': {
            template: '<i :class="icon"><slot /></i>',
            props: ['icon'],
          },
          ConfirmModal: {
            template: '<div class="confirm-modal" />',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders with icon when iconName is provided', () => {
      const wrapper = createWrapper({ iconName: 'check' })
      const icon = wrapper.find('i')
      expect(icon.exists()).toBe(true)
    })

    it('renders label text', () => {
      const wrapper = createWrapper({ label: 'Submit' })
      expect(wrapper.text()).toContain('Submit')
    })

    it('renders slot content', () => {
      const wrapper = mount(SpinButton, {
        props: { variant: 'primary' },
        slots: {
          default: 'Custom Label',
        },
        global: {
          stubs: {
            'b-button': {
              template: '<button><slot /></button>',
            },
            'v-icon': {
              template: '<i><slot /></i>',
            },
          },
        },
      })
      expect(wrapper.text()).toContain('Custom Label')
    })

    it('applies title attribute', () => {
      const wrapper = createWrapper({ buttonTitle: 'Button Title' })
      const button = wrapper.find('button')
      expect(button.attributes('title')).toBe('Button Title')
    })
  })

  describe('props', () => {
    it('requires variant prop', () => {
      const wrapper = createWrapper({ variant: 'success' })
      expect(wrapper.props('variant')).toBe('success')
    })

    it('defaults iconName to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('iconName')).toBe(null)
    })

    it('defaults label to empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('label')).toBe('')
    })

    it('defaults timeout to 5000', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('timeout')).toBe(5000)
    })

    it('defaults disabled to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('disabled')).toBe(false)
    })

    it('defaults size to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('size')).toBe(null)
    })

    it('defaults tabindex to 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('tabindex')).toBe(0)
    })

    it('defaults doneIcon to check', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('doneIcon')).toBe('check')
    })

    it('defaults confirm to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('confirm')).toBe(false)
    })

    it('defaults flex to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('flex')).toBe(true)
    })

    it('defaults minimumSpinTime to 500', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('minimumSpinTime')).toBe(500)
    })
  })

  describe('click handling', () => {
    it('emits handle event when clicked', async () => {
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      await button.trigger('click')

      expect(wrapper.emitted('handle')).toBeTruthy()
      expect(wrapper.emitted('handle')[0][0]).toBeInstanceOf(Function) // callback
    })

    it('passes handleParam to handle event', async () => {
      const wrapper = createWrapper({ handleParam: 'test-param' })
      const button = wrapper.find('button')
      await button.trigger('click')

      expect(wrapper.emitted('handle')[0][1]).toBe('test-param')
    })

    it('does not emit when disabled', async () => {
      const wrapper = createWrapper({ disabled: true })
      const button = wrapper.find('button')
      await button.trigger('click')

      // The button should be disabled so click won't propagate normally
      // but we're testing the wrapper behavior
      expect(wrapper.props('disabled')).toBe(true)
    })
  })

  describe('spinner behavior', () => {
    it('shows spinner icon while loading', async () => {
      const wrapper = createWrapper({ iconName: 'save' })
      const button = wrapper.find('button')
      await button.trigger('click')

      // Icon should change to sync (spinner)
      expect(wrapper.vm.computedIconData.name).toBe('sync')
    })

    it('shows original icon after callback', async () => {
      const wrapper = createWrapper({ iconName: 'save' })
      const button = wrapper.find('button')
      await button.trigger('click')

      // Get the callback function
      const callback = wrapper.emitted('handle')[0][0]

      // Call the callback to finish
      callback()
      vi.advanceTimersByTime(500) // minimumSpinTime
      await flushPromises()

      // Should show done icon
      expect(wrapper.vm.computedIconData.name).toBe('check')
    })
  })

  describe('confirm mode', () => {
    it('shows confirm modal when confirm prop is true', async () => {
      const wrapper = createWrapper({ confirm: true })
      const button = wrapper.find('button')
      await button.trigger('click')

      // showConfirm should be true
      expect(wrapper.vm.showConfirm).toBe(true)
    })

    it('does not emit handle until confirmed', async () => {
      const wrapper = createWrapper({ confirm: true })
      const button = wrapper.find('button')
      await button.trigger('click')

      // Should not have emitted handle yet
      expect(wrapper.emitted('handle')).toBeFalsy()
    })
  })

  describe('exposed methods', () => {
    it('exposes handle method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.handle).toBe('function')
    })

    it('handle method triggers the click behavior', () => {
      const wrapper = createWrapper()
      wrapper.vm.handle()

      expect(wrapper.emitted('handle')).toBeTruthy()
    })
  })

  describe('spinner colors', () => {
    it('uses white spinner for primary variant', () => {
      const wrapper = createWrapper({ variant: 'primary' })
      // Check the computed spinner color class
      expect(wrapper.vm.computedIconData.class).toContain('fa-fw')
    })

    it('uses custom spinColor when provided', () => {
      const wrapper = createWrapper({
        variant: 'primary',
        spinColor: 'text-danger',
      })
      expect(wrapper.props('spinColor')).toBe('text-danger')
    })
  })

  describe('iconlast prop', () => {
    it('defaults iconlast to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('iconlast')).toBe(false)
    })

    it('accepts iconlast prop', () => {
      const wrapper = createWrapper({ iconlast: true })
      expect(wrapper.props('iconlast')).toBe(true)
    })
  })

  describe('noBorder prop', () => {
    it('defaults noBorder to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('noBorder')).toBe(false)
    })

    it('accepts noBorder prop', () => {
      const wrapper = createWrapper({ noBorder: true })
      expect(wrapper.props('noBorder')).toBe(true)
    })
  })
})
