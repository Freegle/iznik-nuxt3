import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModSupporter from '~/modtools/components/ModSupporter.vue'

describe('ModSupporter', () => {
  const defaultProps = {}

  function mountComponent(props = {}) {
    return mount(ModSupporter, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-badge': {
            template:
              '<span class="badge" @click="$emit(\'click\', $event)"><slot /></span>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<span class="icon" />',
            props: ['icon'],
          },
          SupporterInfoModal: {
            template: '<div class="supporter-modal" />',
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders badge with Supporter text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Supporter')
    })

    it('renders trophy icon', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.icon').exists()).toBe(true)
    })

    it('does not show modal initially', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showSupporterInfoModal).toBe(false)
    })

    it('applies hidden class when hidden prop is true', () => {
      const wrapper = mountComponent({ hidden: true })
      expect(wrapper.find('.hidden').exists()).toBe(true)
    })

    it('does not apply hidden class when hidden prop is false', () => {
      const wrapper = mountComponent({ hidden: false })
      expect(wrapper.find('.hidden').exists()).toBe(false)
    })
  })

  describe('methods', () => {
    it('showModal sets showSupporterInfoModal to true', () => {
      const wrapper = mountComponent()
      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() }
      wrapper.vm.showModal(event)
      expect(wrapper.vm.showSupporterInfoModal).toBe(true)
    })

    it('showModal calls preventDefault', () => {
      const wrapper = mountComponent()
      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() }
      wrapper.vm.showModal(event)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('showModal calls stopPropagation', () => {
      const wrapper = mountComponent()
      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() }
      wrapper.vm.showModal(event)
      expect(event.stopPropagation).toHaveBeenCalled()
    })

    it('clicking badge triggers showModal', async () => {
      const wrapper = mountComponent()
      await wrapper.find('.badge').trigger('click')
      expect(wrapper.vm.showSupporterInfoModal).toBe(true)
    })
  })

  describe('props', () => {
    it('has default size of md', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('size')).toBe('md')
    })

    it('accepts size prop', () => {
      const wrapper = mountComponent({ size: 'lg' })
      expect(wrapper.props('size')).toBe('lg')
    })

    it('has default hidden of false', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('hidden')).toBe(false)
    })

    it('accepts hidden prop', () => {
      const wrapper = mountComponent({ hidden: true })
      expect(wrapper.props('hidden')).toBe(true)
    })
  })
})
