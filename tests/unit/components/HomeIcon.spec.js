import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeIcon from '~/components/HomeIcon.vue'

describe('HomeIcon', () => {
  function createWrapper() {
    return mount(HomeIcon, {
      global: {
        stubs: {
          'v-icon': {
            template: '<i :class="icon" class="v-icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders a v-icon component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon').exists()).toBe(true)
    })

    it('uses home icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.home').exists()).toBe(true)
    })
  })
})
