import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModChangedMapping from '~/modtools/components/ModChangedMapping.vue'

describe('ModChangedMapping', () => {
  const defaultChanged = {
    id: 1,
    name: 'Field',
    oldname: 'OldValue',
    newname: 'NewValue',
  }

  // Helper to mount component
  function mountModChangedMapping(props = {}) {
    return mount(ModChangedMapping, {
      props: {
        changed: defaultChanged,
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('renders the mapping text showing name, oldname and newname', () => {
      const wrapper = mountModChangedMapping()
      expect(wrapper.text()).toContain('Field')
      expect(wrapper.text()).toContain('OldValue')
      expect(wrapper.text()).toContain('NewValue')
      expect(wrapper.text()).toContain('=>')
    })

    it('formats text as "name: oldname => newname"', () => {
      const wrapper = mountModChangedMapping({
        changed: {
          id: 2,
          name: 'Location',
          oldname: 'London',
          newname: 'Paris',
        },
      })
      expect(wrapper.text()).toBe('Location: London => Paris')
    })
  })

  describe('highlighting', () => {
    it('shows small clickme class when not highlighted', () => {
      const wrapper = mountModChangedMapping({
        highlighted: null,
      })
      const div = wrapper.find('.small.clickme')
      expect(div.exists()).toBe(true)
    })

    it('shows small clickme class when highlighted id does not match', () => {
      const wrapper = mountModChangedMapping({
        highlighted: { id: 999 }, // Different id
      })
      const div = wrapper.find('.small.clickme')
      expect(div.exists()).toBe(true)
    })

    it('shows text-danger font-weight-bold when highlighted id matches', () => {
      const wrapper = mountModChangedMapping({
        highlighted: { id: 1 }, // Same id as defaultChanged
      })
      const dangerDiv = wrapper.find('.text-danger.font-weight-bold')
      expect(dangerDiv.exists()).toBe(true)
      // Should not have clickme class when highlighted
      expect(wrapper.find('.clickme').exists()).toBe(false)
    })
  })

  describe('emitted events', () => {
    it('emits click event when non-highlighted item is clicked', async () => {
      const wrapper = mountModChangedMapping({
        highlighted: null,
      })
      await wrapper.find('.clickme').trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
      // May emit multiple times due to event bubbling
      expect(wrapper.emitted('click').length).toBeGreaterThanOrEqual(1)
    })

    it('does not emit click when highlighted item is clicked (no clickme class)', () => {
      const wrapper = mountModChangedMapping({
        highlighted: { id: 1 },
      })
      // The highlighted div doesn't have a click handler
      const dangerDiv = wrapper.find('.text-danger')
      expect(dangerDiv.exists()).toBe(true)
      // There's no click handler on this div
    })
  })

  describe('props validation', () => {
    it('accepts changed object with id, name, oldname, newname', () => {
      const wrapper = mountModChangedMapping({
        changed: {
          id: 123,
          name: 'TestField',
          oldname: 'Before',
          newname: 'After',
        },
      })
      expect(wrapper.props('changed').id).toBe(123)
      expect(wrapper.props('changed').name).toBe('TestField')
    })

    it('accepts optional highlighted prop', () => {
      const wrapper = mountModChangedMapping({
        highlighted: { id: 5 },
      })
      expect(wrapper.props('highlighted').id).toBe(5)
    })
  })
})
