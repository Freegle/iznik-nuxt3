import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import ModMergeButton from '~/modtools/components/ModMergeButton.vue'

// Define a proper modal stub component
const ModMergeMemberModalStub = defineComponent({
  name: 'ModMergeMemberModal',
  emits: ['hidden'],
  template: '<div class="merge-modal" />',
})

describe('ModMergeButton', () => {
  function mountComponent() {
    return mount(ModMergeButton, {
      global: {
        stubs: {
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<span class="icon" :data-icon="icon" />',
            props: ['icon'],
          },
          ModMergeMemberModal: ModMergeMemberModalStub,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders a button element', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('displays Merge text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Merge')
    })

    it('displays the equals icon', () => {
      const wrapper = mountComponent()
      const icon = wrapper.find('.icon')
      expect(icon.exists()).toBe(true)
      expect(icon.attributes('data-icon')).toBe('equals')
    })

    it('does not show modal initially', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showMergeMemberModal).toBe(false)
    })

    it('does not render ModMergeMemberModal when showMergeMemberModal is false', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.merge-modal').exists()).toBe(false)
    })
  })

  describe('user interactions', () => {
    it('sets showMergeMemberModal to true when button is clicked', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showMergeMemberModal).toBe(false)

      await wrapper.find('button').trigger('click')

      expect(wrapper.vm.showMergeMemberModal).toBe(true)
    })

    it('renders ModMergeMemberModal when showMergeMemberModal is true', async () => {
      const wrapper = mountComponent()
      await wrapper.find('button').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.merge-modal').exists()).toBe(true)
    })

    it('resets showMergeMemberModal to false when modal emits hidden event', async () => {
      const wrapper = mountComponent()

      // Click to show modal
      await wrapper.find('button').trigger('click')
      expect(wrapper.vm.showMergeMemberModal).toBe(true)

      // Emit hidden from modal
      await wrapper
        .findComponent({ name: 'ModMergeMemberModal' })
        .vm.$emit('hidden')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.showMergeMemberModal).toBe(false)
    })
  })

  describe('methods', () => {
    it('mergeMember sets showMergeMemberModal to true', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showMergeMemberModal).toBe(false)

      wrapper.vm.mergeMember()

      expect(wrapper.vm.showMergeMemberModal).toBe(true)
    })

    it('calling mergeMember multiple times keeps showMergeMemberModal true', () => {
      const wrapper = mountComponent()

      wrapper.vm.mergeMember()
      expect(wrapper.vm.showMergeMemberModal).toBe(true)

      wrapper.vm.mergeMember()
      expect(wrapper.vm.showMergeMemberModal).toBe(true)
    })
  })

  describe('button styling', () => {
    it('button has white variant', () => {
      const wrapper = mount(ModMergeButton, {
        global: {
          stubs: {
            'b-button': {
              template: '<button :data-variant="variant"><slot /></button>',
              props: ['variant'],
            },
            'v-icon': {
              template: '<span />',
              props: ['icon'],
            },
            ModMergeMemberModal: {
              template: '<div />',
            },
          },
        },
      })

      expect(wrapper.find('button').attributes('data-variant')).toBe('white')
    })
  })

  describe('modal toggle behavior', () => {
    it('modal is shown after click and hidden after hidden event', async () => {
      const wrapper = mountComponent()

      // Initially modal not shown
      expect(wrapper.find('.merge-modal').exists()).toBe(false)

      // Click button to show modal
      await wrapper.find('button').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.merge-modal').exists()).toBe(true)

      // Emit hidden to hide modal
      await wrapper
        .findComponent({ name: 'ModMergeMemberModal' })
        .vm.$emit('hidden')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.merge-modal').exists()).toBe(false)
    })

    it('can toggle modal multiple times', async () => {
      const wrapper = mountComponent()

      // First toggle cycle
      await wrapper.find('button').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showMergeMemberModal).toBe(true)

      await wrapper
        .findComponent({ name: 'ModMergeMemberModal' })
        .vm.$emit('hidden')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showMergeMemberModal).toBe(false)

      // Second toggle cycle
      await wrapper.find('button').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showMergeMemberModal).toBe(true)

      await wrapper
        .findComponent({ name: 'ModMergeMemberModal' })
        .vm.$emit('hidden')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showMergeMemberModal).toBe(false)
    })
  })
})
