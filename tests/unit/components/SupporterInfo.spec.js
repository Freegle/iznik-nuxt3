import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SupporterInfo from '~/components/SupporterInfo.vue'

describe('SupporterInfo', () => {
  function createWrapper(props = {}) {
    return mount(SupporterInfo, {
      props,
      global: {
        stubs: {
          'b-badge': {
            template:
              '<span :class="[$attrs.class, variant]" @click="$emit(\'click\', $event)"><slot /></span>',
            props: ['variant'],
            emits: ['click'],
          },
          'v-icon': {
            template: '<i :data-icon="icon"></i>',
            props: ['icon'],
          },
          SupporterInfoModal: {
            template: '<div class="supporter-modal" />',
            emits: ['hidden'],
          },
        },
        directives: {
          'b-tooltip': {},
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders badge with Supporter text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Supporter')
    })

    it('shows trophy icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="trophy"]').exists()).toBe(true)
    })

    it('uses primary variant', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('span').attributes('class')).toContain('primary')
    })
  })

  describe('size prop', () => {
    it.each(['sm', 'md', 'lg'])('applies size-%s class', (size) => {
      const wrapper = createWrapper({ size })
      expect(wrapper.find('span').classes()).toContain(`size-${size}`)
    })

    it('defaults to md size', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('span').classes()).toContain('size-md')
    })
  })

  describe('hidden prop', () => {
    it('applies hidden class when hidden is true', () => {
      const wrapper = createWrapper({ hidden: true })
      expect(wrapper.find('div').classes()).toContain('hidden')
    })

    it('does not apply hidden class by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').classes()).not.toContain('hidden')
    })
  })

  describe('modal interaction', () => {
    it('does not show modal by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showInfoModal).toBe(false)
    })

    it('shows modal when badge clicked', async () => {
      const wrapper = createWrapper()
      const mockEvent = { preventDefault: vi.fn(), stopPropagation: vi.fn() }
      await wrapper.vm.showModal(mockEvent)
      expect(wrapper.vm.showInfoModal).toBe(true)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockEvent.stopPropagation).toHaveBeenCalled()
    })
  })
})
