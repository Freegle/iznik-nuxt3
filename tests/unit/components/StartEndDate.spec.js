import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StartEndDate from '~/components/StartEndDate.vue'

vi.mock('dayjs', async () => {
  const actualDayjs = await vi.importActual('dayjs')
  return {
    default: actualDayjs.default,
    extend: actualDayjs.extend,
  }
})

describe('StartEndDate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createWrapper(props = {}) {
    return mount(StartEndDate, {
      props: {
        modelValue: {
          start: '2025-06-20',
          end: '2025-06-25',
        },
        ...props,
      },
      global: {
        stubs: {
          'b-form-input': {
            template:
              '<input :value="modelValue" :type="type" :min="min" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'type', 'min', 'placeholder', 'list'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size'],
          },
          'v-icon': {
            template:
              '<span class="v-icon" :data-icon="icon" :title="title" />',
            props: ['icon', 'title'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders container div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.form__element').exists()).toBe(true)
    })

    it('renders start date input', () => {
      const wrapper = createWrapper()
      const inputs = wrapper.findAll('input[type="date"]')
      expect(inputs.length).toBeGreaterThanOrEqual(2)
    })

    it('renders end date input', () => {
      const wrapper = createWrapper()
      const inputs = wrapper.findAll('input[type="date"]')
      expect(inputs.length).toBe(2)
    })

    it('renders from label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Starts at:')
    })

    it('renders to label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Ends at:')
    })
  })

  describe('custom labels', () => {
    it('uses custom fromLabel', () => {
      const wrapper = createWrapper({ fromLabel: 'From:' })
      expect(wrapper.text()).toContain('From:')
    })

    it('uses custom toLabel', () => {
      const wrapper = createWrapper({ toLabel: 'Until:' })
      expect(wrapper.text()).toContain('Until:')
    })
  })

  describe('remove button', () => {
    it('renders remove button when removable is true', () => {
      const wrapper = createWrapper({ removable: true })
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('does not render remove button when removable is false', () => {
      const wrapper = createWrapper({ removable: false })
      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('emits remove event when button clicked', async () => {
      const wrapper = createWrapper({ removable: true })
      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('remove')).toBeTruthy()
    })

    it('renders trash icon in remove button', () => {
      const wrapper = createWrapper({ removable: true })
      expect(wrapper.find('.v-icon[data-icon="trash-alt"]').exists()).toBe(true)
    })

    it('shows Remove text in button', () => {
      const wrapper = createWrapper({ removable: true })
      expect(wrapper.text()).toContain('Remove')
    })
  })

  describe('time inputs', () => {
    it('does not render time inputs by default', () => {
      const wrapper = createWrapper()
      const timeInputs = wrapper.findAll('input[type="time"]')
      expect(timeInputs.length).toBe(0)
    })

    it('renders time inputs when time prop is true', () => {
      const wrapper = createWrapper({
        time: true,
        modelValue: {
          start: '2025-06-20',
          end: '2025-06-25',
          starttime: '10:00',
          endtime: '12:00',
        },
      })
      const timeInputs = wrapper.findAll('input[type="time"]')
      expect(timeInputs.length).toBe(2)
    })
  })

  describe('computed today', () => {
    it('returns current date in YYYY-MM-DD format', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.today).toBe('2025-06-15')
    })
  })

  describe('computed minEndDate', () => {
    it('returns start date when set', () => {
      const wrapper = createWrapper({
        modelValue: {
          start: '2025-06-20',
          end: '2025-06-25',
        },
      })
      expect(wrapper.vm.minEndDate).toBe('2025-06-20')
    })

    it('returns today when start not set', () => {
      const wrapper = createWrapper({
        modelValue: {
          start: null,
          end: '2025-06-25',
        },
      })
      expect(wrapper.vm.minEndDate).toBe('2025-06-15')
    })
  })

  describe('computed timeList', () => {
    it('generates time options every 15 minutes', () => {
      const wrapper = createWrapper()
      const timeList = wrapper.vm.timeList
      expect(timeList).toContain('00:00')
      expect(timeList).toContain('00:15')
      expect(timeList).toContain('00:30')
      expect(timeList).toContain('00:45')
      expect(timeList).toContain('12:00')
      expect(timeList).toContain('23:45')
    })

    it('generates 96 time options', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.timeList.length).toBe(96) // 24 hours * 4 intervals
    })
  })

  describe('v-model update', () => {
    it('emits update:modelValue when current changes', async () => {
      const wrapper = createWrapper()

      // Modify internal state directly
      wrapper.vm.current.start = '2025-07-01'
      await flushPromises()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('props', () => {
    it('requires modelValue', () => {
      const wrapper = createWrapper({
        modelValue: { start: '2025-06-20', end: '2025-06-25' },
      })
      expect(wrapper.props('modelValue')).toEqual({
        start: '2025-06-20',
        end: '2025-06-25',
      })
    })

    it('has removable defaulting to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('removable')).toBe(true)
    })

    it('has fromLabel defaulting to Starts at:', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('fromLabel')).toBe('Starts at:')
    })

    it('has toLabel defaulting to Ends at:', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('toLabel')).toBe('Ends at:')
    })

    it('has maxDurationDays defaulting to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('maxDurationDays')).toBeNull()
    })

    it('has time defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('time')).toBe(false)
    })
  })

  describe('date validation', () => {
    it('sets min attribute on start date to today', () => {
      const wrapper = createWrapper()
      const startInput = wrapper.findAll('input[type="date"]')[0]
      expect(startInput.attributes('min')).toBe('2025-06-15')
    })
  })
})
