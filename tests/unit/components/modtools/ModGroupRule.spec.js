import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModGroupRule from '~/modtools/components/ModGroupRule.vue'

// Mock the store
vi.mock('@/stores/modgroup', () => ({
  useModGroupStore: () => ({}),
}))

describe('ModGroupRule', () => {
  const defaultProps = {
    setting: 'test value',
    name: 'testSetting',
    label: 'Test Label',
    readonly: false,
  }

  function mountComponent(props = {}) {
    return mount(ModGroupRule, {
      props: { ...defaultProps, ...props },
      global: {
        plugins: [createPinia()],
        stubs: {
          'b-form-group': {
            template: '<div class="form-group"><slot /></div>',
            props: ['label'],
          },
          'b-form-text': {
            template: '<div class="form-text"><slot /></div>',
          },
          'b-input-group': {
            template: '<div class="input-group"><slot /></div>',
          },
          'b-input': {
            template:
              '<input class="input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'type', 'step'],
          },
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
          },
          'b-form-textarea': {
            template:
              '<textarea class="textarea" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'rows'],
          },
          OurToggle: {
            template:
              '<div class="toggle" @click="$emit(\'update:modelValue\', !modelValue)" />',
            props: [
              'modelValue',
              'height',
              'width',
              'fontSize',
              'sync',
              'labels',
              'variant',
              'disabled',
            ],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('rendering', () => {
    it('renders form group with label', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.form-group').exists()).toBe(true)
    })

    it('renders description when provided', () => {
      const wrapper = mountComponent({ description: 'Test description' })
      expect(wrapper.text()).toContain('Test description')
    })

    it('does not render description when not provided', () => {
      const wrapper = mountComponent()
      expect(wrapper.findAll('.form-text')).toHaveLength(0)
    })

    it('shows "No answer given yet" when setting is null', () => {
      const wrapper = mountComponent({ setting: null })
      expect(wrapper.text()).toContain('No answer given yet')
    })

    it('shows "New" badge when newRule is true', () => {
      const wrapper = mountComponent({ newRule: true })
      expect(wrapper.text()).toContain('New')
    })

    it('does not show "New" badge when newRule is false', () => {
      const wrapper = mountComponent({ newRule: false })
      expect(wrapper.text()).not.toContain('New')
    })
  })

  describe('input types', () => {
    it('renders text input for type="input"', () => {
      const wrapper = mountComponent({ type: 'input' })
      expect(wrapper.find('.input').exists()).toBe(true)
    })

    it('renders number input for type="number"', () => {
      const wrapper = mountComponent({ type: 'number' })
      expect(wrapper.find('.input').exists()).toBe(true)
    })

    it('renders textarea for type="textarea"', () => {
      const wrapper = mountComponent({ type: 'textarea' })
      expect(wrapper.find('.textarea').exists()).toBe(true)
    })

    it('renders toggle for type="toggle"', () => {
      const wrapper = mountComponent({ type: 'toggle' })
      expect(wrapper.find('.toggle').exists()).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('haveValue returns true when setting is not null', () => {
      const wrapper = mountComponent({ setting: 'value' })
      expect(wrapper.vm.haveValue).toBe(true)
    })

    it('haveValue returns false when setting is null', () => {
      const wrapper = mountComponent({ setting: null })
      expect(wrapper.vm.haveValue).toBe(false)
    })

    it('bsetting getter returns setting value', () => {
      const wrapper = mountComponent({ setting: 'test value' })
      expect(wrapper.vm.bsetting).toBe('test value')
    })

    it('bsetting setter emits change event', () => {
      const wrapper = mountComponent()
      wrapper.vm.bsetting = 'new value'
      expect(wrapper.emitted('change')).toHaveLength(1)
      expect(wrapper.emitted('change')[0]).toEqual(['new value'])
    })
  })

  describe('props', () => {
    it('has default type of input', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('type')).toBe('input')
    })

    it('has default rows of 3', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('rows')).toBe(3)
    })
  })
})
