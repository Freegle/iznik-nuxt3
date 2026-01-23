import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BrowseHomeIcon from '~/components/BrowseHomeIcon.vue'

describe('BrowseHomeIcon', () => {
  function createWrapper() {
    return mount(BrowseHomeIcon, {
      global: {
        stubs: {
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders with icon class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.icon').exists()).toBe(true)
    })

    it('contains home icon', () => {
      const wrapper = createWrapper()
      const icon = wrapper.find('i')
      expect(icon.exists()).toBe(true)
      expect(icon.classes()).toContain('home')
    })

    it('has flex layout classes', () => {
      const wrapper = createWrapper()
      const iconDiv = wrapper.find('.icon')
      expect(iconDiv.classes()).toContain('d-flex')
      expect(iconDiv.classes()).toContain('flex-column')
      expect(iconDiv.classes()).toContain('justify-content-center')
    })

    it('has normal span wrapper', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.normal').exists()).toBe(true)
    })
  })
})
