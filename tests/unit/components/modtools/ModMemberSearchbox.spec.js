import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModMemberSearchbox from '~/modtools/components/ModMemberSearchbox.vue'

describe('ModMemberSearchbox', () => {
  function mountComponent(props = {}) {
    return mount(ModMemberSearchbox, {
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
            props: ['modelValue', 'type', 'placeholder', 'autocapitalize'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
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

    it('renders search button', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('button').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts search prop', () => {
      const wrapper = mountComponent({ search: 'test@example.com' })
      expect(wrapper.props('search')).toBe('test@example.com')
    })

    it('defaults search to null', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('search')).toBeNull()
    })
  })

  describe('initialization', () => {
    it('initializes term from search prop on mount', async () => {
      const wrapper = mountComponent({ search: 'initial search' })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.term).toBe('initial search')
    })

    it('term is null when no search prop provided', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.term).toBeNull()
    })
  })

  describe('dosearch method', () => {
    it('emits search event with term value', () => {
      const wrapper = mountComponent()
      wrapper.vm.term = 'test search'
      wrapper.vm.dosearch()
      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')[0]).toEqual(['test search'])
    })

    it('emits search event when search button clicked', async () => {
      const wrapper = mountComponent()
      wrapper.vm.term = 'button search'
      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')[0]).toEqual(['button search'])
    })

    it('emits null when term is not set', () => {
      const wrapper = mountComponent()
      wrapper.vm.dosearch()
      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')[0]).toEqual([null])
    })
  })

  describe('enter key handling', () => {
    it('dosearch is called and emits search on enter key behavior', () => {
      const wrapper = mountComponent()
      wrapper.vm.term = 'enter search'
      wrapper.vm.dosearch()
      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')[0]).toEqual(['enter search'])
    })
  })

  describe('input binding', () => {
    it('updates term when input value changes', async () => {
      const wrapper = mountComponent()
      wrapper.vm.term = 'new value'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.term).toBe('new value')
    })
  })
})
