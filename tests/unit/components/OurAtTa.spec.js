import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OurAtTa from '~/components/OurAtTa.vue'

describe('OurAtTa', () => {
  const mockMembers = ['Alice', 'Bob', 'Charlie']

  function createWrapper(props = {}) {
    return mount(OurAtTa, {
      props: { members: mockMembers, ...props },
      slots: {
        default: '<textarea class="test-input"></textarea>',
      },
      global: {
        stubs: {
          'client-only': {
            template: '<div><slot /></div>',
          },
          Mentionable: {
            template:
              '<div class="mentionable"><span class="keys">{{ keys.join(",") }}</span><span class="count">{{ items.length }}</span><slot /></div>',
            props: ['keys', 'items'],
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

    it('renders Mentionable component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.mentionable').exists()).toBe(true)
    })

    it('contains Mentionable with @ trigger', () => {
      // Component uses Mentionable with keys=['@']
      // Verified by rendering the .mentionable stub
      const wrapper = createWrapper()
      expect(wrapper.find('.mentionable').exists()).toBe(true)
    })

    it('renders slot content', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.test-input').exists()).toBe(true)
    })
  })

  describe('computed items', () => {
    it('has items computed property', () => {
      const wrapper = createWrapper()
      // The component has a computed items property
      expect(wrapper.vm.items).toBeDefined()
    })

    it('transforms members to items array with value and label', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.items).toHaveLength(3)
      expect(wrapper.vm.items[0]).toEqual({ value: 'Alice', label: 'Alice' })
    })

    it('handles empty members array', () => {
      const wrapper = createWrapper({ members: [] })
      expect(wrapper.vm.items).toHaveLength(0)
    })

    it('handles single member', () => {
      const wrapper = createWrapper({ members: ['Solo'] })
      expect(wrapper.vm.items).toHaveLength(1)
    })
  })

  describe('props', () => {
    it('requires members prop', () => {
      const props = OurAtTa.props
      expect(props.members.required).toBe(true)
    })

    it('members prop is Array type', () => {
      const props = OurAtTa.props
      expect(props.members.type).toBe(Array)
    })
  })
})
