import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WizardProgress from '~/components/WizardProgress.vue'

describe('WizardProgress', () => {
  function createWrapper(props = {}) {
    return mount(WizardProgress, {
      props: {
        activeStage: 1,
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('renders three wizard steps', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.wizard__step')).toHaveLength(3)
    })

    it('renders step labels', () => {
      const wrapper = createWrapper()
      const labels = wrapper.findAll('.wizard__info')
      expect(labels[0].text()).toBe('What is it?')
      expect(labels[1].text()).toBe('Where are you?')
      expect(labels[2].text()).toBe('Who are you?')
    })

    it('renders progress bars for each step', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.wizard__progress')).toHaveLength(3)
    })

    it('renders dots for each step', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.wizard__dot')).toHaveLength(3)
    })
  })

  describe('active stage', () => {
    it.each([
      [1, 0],
      [2, 1],
      [3, 2],
    ])(
      'activeStage=%d applies active class to step index %d',
      (stage, expectedIndex) => {
        const wrapper = createWrapper({ activeStage: stage })
        const steps = wrapper.findAll('.wizard__step')
        steps.forEach((step, index) => {
          if (index === expectedIndex) {
            expect(step.classes()).toContain('active')
          } else {
            expect(step.classes()).not.toContain('active')
          }
        })
      }
    )

    it('only one step is active at a time', () => {
      const wrapper = createWrapper({ activeStage: 2 })
      const activeSteps = wrapper.findAll('.wizard__step.active')
      expect(activeSteps).toHaveLength(1)
    })
  })
})
