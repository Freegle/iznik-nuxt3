import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WizardProgressCompact from '~/components/WizardProgressCompact.vue'

describe('WizardProgressCompact', () => {
  function createWrapper(props = {}) {
    return mount(WizardProgressCompact, {
      props: {
        activeStage: 1,
        ...props,
      },
      global: {
        stubs: {
          'v-icon': {
            template: '<i :data-icon="icon" class="icon"></i>',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders wizard container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.wizard-compact').exists()).toBe(true)
    })

    it('renders 4 steps by default (Item, Location, Options, Post)', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.step')).toHaveLength(4)
    })

    it('renders 3 steps when showOptions is false', () => {
      const wrapper = createWrapper({ showOptions: false })
      expect(wrapper.findAll('.step')).toHaveLength(3)
    })

    it('displays step labels', () => {
      const wrapper = createWrapper()
      const labels = wrapper.findAll('.step-label')
      expect(labels[0].text()).toBe('Item')
      expect(labels[1].text()).toBe('Location')
      expect(labels[2].text()).toBe('Options')
      expect(labels[3].text()).toBe('Post')
    })
  })

  describe('step icons', () => {
    it('shows camera icon for Item step', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('.step-icon')
      expect(icons[0].attributes('data-icon')).toBe('camera')
    })

    it('shows map-marker-alt icon for Location step', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('.step-icon')
      expect(icons[1].attributes('data-icon')).toBe('map-marker-alt')
    })

    it('shows check icon for completed steps', () => {
      const wrapper = createWrapper({ activeStage: 3 })
      const checkIcons = wrapper.findAll('.check-icon')
      expect(checkIcons.length).toBeGreaterThan(0)
    })
  })

  describe('active state', () => {
    it.each([
      [1, 0],
      [2, 1],
      [3, 2],
      [4, 3],
    ])(
      'activeStage=%d applies active class to step index %d',
      (stage, expectedIndex) => {
        const wrapper = createWrapper({ activeStage: stage })
        const steps = wrapper.findAll('.step')
        expect(steps[expectedIndex].classes()).toContain('active')
      }
    )

    it('only one step is active at a time', () => {
      const wrapper = createWrapper({ activeStage: 2 })
      const activeSteps = wrapper.findAll('.step.active')
      expect(activeSteps).toHaveLength(1)
    })
  })

  describe('completed state', () => {
    it('marks previous steps as completed', () => {
      const wrapper = createWrapper({ activeStage: 3 })
      const steps = wrapper.findAll('.step')
      expect(steps[0].classes()).toContain('completed')
      expect(steps[1].classes()).toContain('completed')
      expect(steps[2].classes()).toContain('active')
      expect(steps[3].classes()).not.toContain('completed')
    })
  })

  describe('step connectors', () => {
    it('renders connectors for each step', () => {
      const wrapper = createWrapper()
      const connectors = wrapper.findAll('.step-connector')
      // Each step has 2 connectors (left and right)
      expect(connectors.length).toBe(8)
    })

    it('first connector has first class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.step-connector.first').exists()).toBe(true)
    })

    it('last connector has last class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.step-connector.last').exists()).toBe(true)
    })
  })

  describe('steps computed', () => {
    it('includes Options step when showOptions is true', () => {
      const wrapper = createWrapper({ showOptions: true })
      expect(wrapper.vm.steps.map((s) => s.label)).toContain('Options')
    })

    it('excludes Options step when showOptions is false', () => {
      const wrapper = createWrapper({ showOptions: false })
      expect(wrapper.vm.steps.map((s) => s.label)).not.toContain('Options')
    })

    it('always includes Post as last step', () => {
      const wrapper = createWrapper()
      const lastStep = wrapper.vm.steps[wrapper.vm.steps.length - 1]
      expect(lastStep.label).toBe('Post')
    })
  })
})
