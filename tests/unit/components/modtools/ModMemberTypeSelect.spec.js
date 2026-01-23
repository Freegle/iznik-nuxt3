import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModMemberTypeSelect from '~/modtools/components/ModMemberTypeSelect.vue'

describe('ModMemberTypeSelect', () => {
  function mountComponent(props = {}) {
    return mount(ModMemberTypeSelect, {
      props,
      global: {
        stubs: {
          'b-form-select': {
            template:
              '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
            props: ['modelValue'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('select').exists()).toBe(true)
    })

    it('renders All members option', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('All members')
    })

    it('renders Bouncing option', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Bouncing')
    })

    it('renders Moderation Team option', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Moderation Team')
    })

    it('renders With notes option', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('With notes')
    })

    it('renders Banned option', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Banned')
    })

    it('has correct option values', () => {
      const wrapper = mountComponent()
      const options = wrapper.findAll('option')
      expect(options.length).toBe(5)
      expect(options[0].attributes('value')).toBe('0')
      expect(options[1].attributes('value')).toBe('3')
      expect(options[2].attributes('value')).toBe('2')
      expect(options[3].attributes('value')).toBe('1')
      expect(options[4].attributes('value')).toBe('5')
    })
  })

  describe('props', () => {
    it('accepts modelValue prop', () => {
      const wrapper = mountComponent({ modelValue: '3' })
      expect(wrapper.props('modelValue')).toBe('3')
    })

    it('defaults modelValue to 0', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('modelValue')).toBe('0')
    })
  })

  describe('v-model behavior', () => {
    it('computed type getter returns modelValue', () => {
      const wrapper = mountComponent({ modelValue: '2' })
      expect(wrapper.vm.type).toBe('2')
    })

    it('emits update:modelValue when type changes', async () => {
      const wrapper = mountComponent({ modelValue: '0' })
      wrapper.vm.type = '3'
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['3'])
    })

    it('converts value to string on emit', async () => {
      const wrapper = mountComponent({ modelValue: '0' })
      wrapper.vm.type = 5
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['5'])
    })
  })

  describe('option mapping', () => {
    it('value 0 corresponds to All members', () => {
      const wrapper = mountComponent()
      const option = wrapper.find('option[value="0"]')
      expect(option.text()).toBe('All members')
    })

    it('value 3 corresponds to Bouncing', () => {
      const wrapper = mountComponent()
      const option = wrapper.find('option[value="3"]')
      expect(option.text()).toBe('Bouncing')
    })

    it('value 2 corresponds to Moderation Team', () => {
      const wrapper = mountComponent()
      const option = wrapper.find('option[value="2"]')
      expect(option.text()).toBe('Moderation Team')
    })

    it('value 1 corresponds to With notes', () => {
      const wrapper = mountComponent()
      const option = wrapper.find('option[value="1"]')
      expect(option.text()).toBe('With notes')
    })

    it('value 5 corresponds to Banned', () => {
      const wrapper = mountComponent()
      const option = wrapper.find('option[value="5"]')
      expect(option.text()).toBe('Banned')
    })
  })
})
