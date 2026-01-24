import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppProgressDots from '~/components/AppProgressDots.vue'

describe('AppProgressDots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(AppProgressDots, {
      props: {
        currentStep: 1,
        ...props,
      },
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders progress dots container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.app-progress-dots').exists()).toBe(true)
    })

    it('renders correct number of steps by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.progress-step').length).toBe(3)
    })

    it('renders custom number of steps', () => {
      const wrapper = createWrapper({ totalSteps: 5 })
      expect(wrapper.findAll('.progress-step').length).toBe(5)
    })

    it('renders progress line', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.progress-line').exists()).toBe(true)
      expect(wrapper.find('.progress-line-fill').exists()).toBe(true)
    })
  })

  describe('step states', () => {
    it('marks completed steps', () => {
      const wrapper = createWrapper({ currentStep: 3 })
      const steps = wrapper.findAll('.progress-step')
      expect(steps[0].classes()).toContain('step-completed')
      expect(steps[1].classes()).toContain('step-completed')
      expect(steps[2].classes()).toContain('step-active')
    })

    it('marks active step', () => {
      const wrapper = createWrapper({ currentStep: 2 })
      const steps = wrapper.findAll('.progress-step')
      expect(steps[1].classes()).toContain('step-active')
    })

    it('marks pending steps', () => {
      const wrapper = createWrapper({ currentStep: 1 })
      const steps = wrapper.findAll('.progress-step')
      expect(steps[1].classes()).toContain('step-pending')
      expect(steps[2].classes()).toContain('step-pending')
    })

    it('shows check icon for completed steps', () => {
      const wrapper = createWrapper({ currentStep: 2 })
      const firstStep = wrapper.findAll('.progress-step')[0]
      expect(firstStep.find('.v-icon').exists()).toBe(true)
      expect(firstStep.find('.v-icon').attributes('data-icon')).toBe('check')
    })

    it('shows step number for non-completed steps', () => {
      const wrapper = createWrapper({ currentStep: 1 })
      const steps = wrapper.findAll('.progress-step')
      expect(steps[0].find('.step-number').text()).toBe('1')
      expect(steps[1].find('.step-number').text()).toBe('2')
    })
  })

  describe('labels', () => {
    it('shows default labels', () => {
      const wrapper = createWrapper()
      const labels = wrapper.findAll('.step-label')
      expect(labels[0].text()).toBe('Photos')
      expect(labels[1].text()).toBe('Details')
      expect(labels[2].text()).toBe('Confirm')
    })

    it('shows custom labels', () => {
      const wrapper = createWrapper({
        labels: ['First', 'Second', 'Third'],
      })
      const labels = wrapper.findAll('.step-label')
      expect(labels[0].text()).toBe('First')
      expect(labels[1].text()).toBe('Second')
      expect(labels[2].text()).toBe('Third')
    })

    it('hides labels when showLabels is false', () => {
      const wrapper = createWrapper({ showLabels: false })
      expect(wrapper.find('.step-label').exists()).toBe(false)
    })

    it('uses fallback label when not provided', () => {
      const wrapper = createWrapper({
        totalSteps: 4,
        labels: ['One', 'Two'],
      })
      const labels = wrapper.findAll('.step-label')
      expect(labels[2].text()).toBe('Step 3')
      expect(labels[3].text()).toBe('Step 4')
    })
  })

  describe('progress width', () => {
    it('shows 0% at step 1', () => {
      const wrapper = createWrapper({ currentStep: 1, totalSteps: 3 })
      expect(wrapper.vm.progressWidth).toBe('0%')
    })

    it('shows 50% at step 2 of 3', () => {
      const wrapper = createWrapper({ currentStep: 2, totalSteps: 3 })
      expect(wrapper.vm.progressWidth).toBe('50%')
    })

    it('shows 100% at last step', () => {
      const wrapper = createWrapper({ currentStep: 3, totalSteps: 3 })
      expect(wrapper.vm.progressWidth).toBe('100%')
    })

    it('shows 100% when currentStep exceeds totalSteps', () => {
      const wrapper = createWrapper({ currentStep: 5, totalSteps: 3 })
      expect(wrapper.vm.progressWidth).toBe('100%')
    })

    it('calculates correct width for 4 steps at step 3', () => {
      const wrapper = createWrapper({ currentStep: 3, totalSteps: 4 })
      // (3-1)/(4-1) * 100 = 66.66%
      expect(wrapper.vm.progressWidth).toContain('66')
    })
  })

  describe('props', () => {
    it('requires currentStep prop', () => {
      const wrapper = createWrapper({ currentStep: 2 })
      expect(wrapper.props('currentStep')).toBe(2)
    })

    it('has totalSteps prop defaulting to 3', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('totalSteps')).toBe(3)
    })

    it('has default labels', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('labels')).toEqual(['Photos', 'Details', 'Confirm'])
    })

    it('has showLabels prop defaulting to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('showLabels')).toBe(true)
    })
  })

  describe('computed steps', () => {
    it('generates steps array from totalSteps', () => {
      const wrapper = createWrapper({ totalSteps: 4 })
      expect(wrapper.vm.steps.length).toBe(4)
      expect(wrapper.vm.steps[0]).toEqual({ number: 1, label: 'Photos' })
      expect(wrapper.vm.steps[3]).toEqual({ number: 4, label: 'Step 4' })
    })
  })
})
