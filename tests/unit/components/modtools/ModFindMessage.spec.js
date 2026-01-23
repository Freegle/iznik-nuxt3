import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModFindMessage from '~/modtools/components/ModFindMessage.vue'

describe('ModFindMessage', () => {
  function mountComponent(props = {}) {
    return mount(ModFindMessage, {
      props,
      global: {
        stubs: {
          'b-input-group': {
            template:
              '<div class="input-group"><slot /><slot name="append" /></div>',
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup.enter="$emit(\'keyup\', $event)" />',
            props: ['modelValue', 'placeholder'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" @click="$emit(\'handle\', () => {})"><slot /></button>',
            props: ['variant', 'iconName', 'label', 'spinclass'],
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
      expect(wrapper.find('.input-group').exists()).toBe(true)
    })

    it('renders input field', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('renders search button via SpinButton', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.spin-button').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts messageTerm prop', () => {
      const wrapper = mountComponent({ messageTerm: 'test subject' })
      expect(wrapper.props('messageTerm')).toBe('test subject')
    })

    it('defaults messageTerm to null', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('messageTerm')).toBeNull()
    })

    it('accepts groupid prop', () => {
      const wrapper = mountComponent({ groupid: 123 })
      expect(wrapper.props('groupid')).toBe(123)
    })

    it('defaults groupid to null', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('groupid')).toBeNull()
    })
  })

  describe('term computed property', () => {
    it('getter returns messageTerm prop value', () => {
      const wrapper = mountComponent({ messageTerm: 'search term' })
      expect(wrapper.vm.term).toBe('search term')
    })

    it('getter returns null when messageTerm not provided', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.term).toBeNull()
    })

    it('setter emits changed event with new value', () => {
      const wrapper = mountComponent()
      wrapper.vm.term = 'new search term'
      expect(wrapper.emitted('changed')).toBeTruthy()
      expect(wrapper.emitted('changed')[0]).toEqual(['new search term'])
    })

    it('setter emits changed event when value is cleared', () => {
      const wrapper = mountComponent({ messageTerm: 'existing' })
      wrapper.vm.term = ''
      expect(wrapper.emitted('changed')).toBeTruthy()
      expect(wrapper.emitted('changed')[0]).toEqual([''])
    })
  })

  describe('search method', () => {
    it('emits searched event with trimmed term', () => {
      const wrapper = mountComponent({ messageTerm: '  test search  ' })
      wrapper.vm.search()
      expect(wrapper.emitted('searched')).toBeTruthy()
      expect(wrapper.emitted('searched')[0]).toEqual(['test search'])
    })

    it('emits searched event with null when term is null', () => {
      const wrapper = mountComponent({ messageTerm: null })
      wrapper.vm.search()
      expect(wrapper.emitted('searched')).toBeTruthy()
      expect(wrapper.emitted('searched')[0]).toEqual([undefined])
    })

    it('emits searched event with empty string when term is empty', () => {
      const wrapper = mountComponent({ messageTerm: '' })
      wrapper.vm.search()
      expect(wrapper.emitted('searched')).toBeTruthy()
      expect(wrapper.emitted('searched')[0]).toEqual([''])
    })

    it('calls callback function when provided', () => {
      const wrapper = mountComponent({ messageTerm: 'test' })
      const callback = vi.fn()
      wrapper.vm.search(callback)
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('does not throw when callback is not a function', () => {
      const wrapper = mountComponent({ messageTerm: 'test' })
      expect(() => wrapper.vm.search('not a function')).not.toThrow()
      expect(() => wrapper.vm.search(null)).not.toThrow()
      expect(() => wrapper.vm.search(undefined)).not.toThrow()
    })

    it('handles whitespace-only term by trimming to empty string', () => {
      const wrapper = mountComponent({ messageTerm: '   ' })
      wrapper.vm.search()
      expect(wrapper.emitted('searched')).toBeTruthy()
      expect(wrapper.emitted('searched')[0]).toEqual([''])
    })
  })

  describe('emitted events', () => {
    it('emits changed event when term setter is called', () => {
      const wrapper = mountComponent()
      wrapper.vm.term = 'new value'
      expect(wrapper.emitted('changed')).toBeTruthy()
      expect(wrapper.emitted('changed')).toHaveLength(1)
    })

    it('emits searched event when search is called', () => {
      const wrapper = mountComponent({ messageTerm: 'search' })
      wrapper.vm.search()
      expect(wrapper.emitted('searched')).toBeTruthy()
      expect(wrapper.emitted('searched')).toHaveLength(1)
    })

    it('does not emit searched event until search is called', () => {
      const wrapper = mountComponent({ messageTerm: 'test' })
      expect(wrapper.emitted('searched')).toBeFalsy()
    })
  })

  describe('enter key behavior', () => {
    it('search method works correctly for enter key triggering', () => {
      const wrapper = mountComponent({ messageTerm: 'enter test' })
      wrapper.vm.search()
      expect(wrapper.emitted('searched')).toBeTruthy()
      expect(wrapper.emitted('searched')[0]).toEqual(['enter test'])
    })
  })

  describe('SpinButton integration', () => {
    it('search is called when SpinButton emits handle event', async () => {
      const wrapper = mountComponent({ messageTerm: 'button search' })
      await wrapper.find('.spin-button').trigger('click')
      expect(wrapper.emitted('searched')).toBeTruthy()
      expect(wrapper.emitted('searched')[0]).toEqual(['button search'])
    })
  })

  describe('edge cases', () => {
    it('handles numeric message id term', () => {
      const wrapper = mountComponent({ messageTerm: '12345' })
      wrapper.vm.search()
      expect(wrapper.emitted('searched')[0]).toEqual(['12345'])
    })

    it('handles term with leading/trailing spaces', () => {
      const wrapper = mountComponent({ messageTerm: '  OFFER: Sofa  ' })
      wrapper.vm.search()
      expect(wrapper.emitted('searched')[0]).toEqual(['OFFER: Sofa'])
    })

    it('handles term with internal spaces preserved', () => {
      const wrapper = mountComponent({ messageTerm: 'OFFER: Garden tools' })
      wrapper.vm.search()
      expect(wrapper.emitted('searched')[0]).toEqual(['OFFER: Garden tools'])
    })
  })
})
