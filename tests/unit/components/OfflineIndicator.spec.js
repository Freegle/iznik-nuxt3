import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OfflineIndicator from '~/components/OfflineIndicator.vue'

describe('OfflineIndicator', () => {
  function createWrapper() {
    return mount(OfflineIndicator, {
      global: {
        stubs: {
          'v-icon': {
            template: '<i :data-icon="icon" :class="$attrs.class"></i>',
            props: ['icon', 'size'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders pulsate container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.pulsate').exists()).toBe(true)
    })

    it('displays "Offline" text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Offline')
    })

    it('renders stacked icons container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.stacked').exists()).toBe(true)
    })

    it('shows cloud icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="cloud"]').exists()).toBe(true)
    })

    it('shows ban icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="ban"]').exists()).toBe(true)
    })

    it('cloud icon has white text class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="cloud"]').classes()).toContain(
        'text-white'
      )
    })

    it('ban icon has danger text class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="ban"]').classes()).toContain(
        'text-danger'
      )
    })
  })

  describe('accessibility', () => {
    it('has title attribute for screen readers', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.stacked').attributes('title')).toBe(
        'Network is offline'
      )
    })
  })
})
