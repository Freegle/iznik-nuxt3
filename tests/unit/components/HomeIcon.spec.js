import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeIcon from '~/components/HomeIcon.vue'

describe('HomeIcon', () => {
  function mountHomeIcon() {
    return mount(HomeIcon, {
      global: {
        stubs: {
          'v-icon': {
            template: '<i :data-icon="icon" :class="$attrs.class"></i>',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders a v-icon element', () => {
      const wrapper = mountHomeIcon()
      expect(wrapper.find('i').exists()).toBe(true)
    })

    it('uses home icon', () => {
      const wrapper = mountHomeIcon()
      expect(wrapper.find('i').attributes('data-icon')).toBe('home')
    })

    it('has text-primary class for green coloring', () => {
      const wrapper = mountHomeIcon()
      expect(wrapper.find('i').classes()).toContain('text-primary')
    })

    it('has fa-2x class for larger size', () => {
      const wrapper = mountHomeIcon()
      expect(wrapper.find('i').classes()).toContain('fa-2x')
    })
  })

  describe('static component', () => {
    it('has no props', () => {
      const wrapper = mountHomeIcon()
      expect(Object.keys(wrapper.props())).toHaveLength(0)
    })

    it('renders consistently', () => {
      const wrapper1 = mountHomeIcon()
      const wrapper2 = mountHomeIcon()
      expect(wrapper1.html()).toBe(wrapper2.html())
    })
  })
})
