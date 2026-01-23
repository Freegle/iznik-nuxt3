import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppProgressDots from '~/components/AppProgressDots.vue'

describe('AppProgressDots', () => {
  function createWrapper(props = {}) {
    return mount(AppProgressDots, {
      props: {
        currentStep: 1,
        ...props,
      },
      global: {
        stubs: {
          'v-icon': { template: '<i class="v-icon"><slot /></i>' },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders the correct number of steps by default (3)', () => {
      const wrapper = createWrapper()
      const steps = wrapper.findAll('.progress-step')
      expect(steps.length).toBe(3)
    })

    it('renders custom number of steps', () => {
      const wrapper = createWrapper({ totalSteps: 5 })
      const steps = wrapper.findAll('.progress-step')
      expect(steps.length).toBe(5)
    })

    it('displays default labels', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Photos')
      expect(wrapper.text()).toContain('Details')
      expect(wrapper.text()).toContain('Confirm')
    })

    it('displays custom labels', () => {
      const wrapper = createWrapper({
        labels: ['Step A', 'Step B', 'Step C'],
      })
      expect(wrapper.text()).toContain('Step A')
      expect(wrapper.text()).toContain('Step B')
      expect(wrapper.text()).toContain('Step C')
    })

    it('hides labels when showLabels is false', () => {
      const wrapper = createWrapper({ showLabels: false })
      expect(wrapper.text()).not.toContain('Photos')
      expect(wrapper.text()).not.toContain('Details')
      expect(wrapper.text()).not.toContain('Confirm')
    })

    it('shows step numbers for pending and active steps', () => {
      const wrapper = createWrapper({ currentStep: 2 })
      expect(wrapper.text()).toContain('2')
      expect(wrapper.text()).toContain('3')
    })

    it('shows check icon for completed steps', () => {
      const wrapper = createWrapper({ currentStep: 3 })
      const icons = wrapper.findAll('.v-icon')
      // Steps 1 and 2 should have check icons (completed)
      expect(icons.length).toBe(2)
    })
  })

  describe('step classes', () => {
    it('marks steps before currentStep as completed', () => {
      const wrapper = createWrapper({ currentStep: 2 })
      const steps = wrapper.findAll('.progress-step')
      expect(steps[0].classes()).toContain('step-completed')
    })

    it('marks currentStep as active', () => {
      const wrapper = createWrapper({ currentStep: 2 })
      const steps = wrapper.findAll('.progress-step')
      expect(steps[1].classes()).toContain('step-active')
    })

    it('marks steps after currentStep as pending', () => {
      const wrapper = createWrapper({ currentStep: 1 })
      const steps = wrapper.findAll('.progress-step')
      expect(steps[1].classes()).toContain('step-pending')
      expect(steps[2].classes()).toContain('step-pending')
    })

    it('first step is active when currentStep is 1', () => {
      const wrapper = createWrapper({ currentStep: 1 })
      const steps = wrapper.findAll('.progress-step')
      expect(steps[0].classes()).toContain('step-active')
    })

    it('all steps before last are completed when at final step', () => {
      const wrapper = createWrapper({ currentStep: 3 })
      const steps = wrapper.findAll('.progress-step')
      expect(steps[0].classes()).toContain('step-completed')
      expect(steps[1].classes()).toContain('step-completed')
      expect(steps[2].classes()).toContain('step-active')
    })
  })

  describe('progress line', () => {
    it('renders progress line', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.progress-line').exists()).toBe(true)
    })

    it('renders progress line fill', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.progress-line-fill').exists()).toBe(true)
    })

    it('progress width is 0% when at step 1', () => {
      const wrapper = createWrapper({ currentStep: 1 })
      const fill = wrapper.find('.progress-line-fill')
      expect(fill.attributes('style')).toContain('width: 0%')
    })

    it('progress width is 50% when at step 2 of 3', () => {
      const wrapper = createWrapper({ currentStep: 2, totalSteps: 3 })
      const fill = wrapper.find('.progress-line-fill')
      expect(fill.attributes('style')).toContain('width: 50%')
    })

    it('progress width is 100% when at final step', () => {
      const wrapper = createWrapper({ currentStep: 3, totalSteps: 3 })
      const fill = wrapper.find('.progress-line-fill')
      expect(fill.attributes('style')).toContain('width: 100%')
    })

    it('progress width scales correctly for 5 steps', () => {
      const wrapper = createWrapper({ currentStep: 3, totalSteps: 5 })
      const fill = wrapper.find('.progress-line-fill')
      // Step 3 of 5: (3-1)/(5-1) * 100 = 50%
      expect(fill.attributes('style')).toContain('width: 50%')
    })
  })

  describe('props', () => {
    it('defaults totalSteps to 3', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('totalSteps')).toBe(3)
    })

    it('defaults labels to Photos, Details, Confirm', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('labels')).toEqual(['Photos', 'Details', 'Confirm'])
    })
  })

  describe('fallback labels', () => {
    it('uses Step N format when more steps than labels', () => {
      const wrapper = createWrapper({
        totalSteps: 5,
        labels: ['First', 'Second'],
      })
      expect(wrapper.text()).toContain('First')
      expect(wrapper.text()).toContain('Second')
      expect(wrapper.text()).toContain('Step 3')
      expect(wrapper.text()).toContain('Step 4')
      expect(wrapper.text()).toContain('Step 5')
    })
  })
})
