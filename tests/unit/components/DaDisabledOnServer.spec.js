import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DaDisabledOnServer from '~/components/DaDisabledOnServer.vue'

describe('DaDisabledOnServer', () => {
  function createWrapper() {
    return mount(DaDisabledOnServer, {
      global: {
        stubs: {
          'v-icon': {
            template: '<i :data-icon="icon"></i>',
            props: ['icon'],
          },
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders ad disabled container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.adDisabled').exists()).toBe(true)
    })

    it('displays thank you message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("We've raised enough")
      expect(wrapper.text()).toContain('to turn ads off today')
      expect(wrapper.text()).toContain('Thanks!')
    })

    it('shows hand-holding-heart icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="hand-holding-heart"]').exists()).toBe(
        true
      )
    })

    it('links to adsoff page', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a[href="/adsoff"]').exists()).toBe(true)
    })

    it('shows "Learn more" link text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Learn more')
    })
  })

  describe('styling', () => {
    it('has sticky class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.sticky').exists()).toBe(true)
    })

    it('has centered text', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.text-center').exists()).toBe(true)
    })

    it('has full width', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.w-100').exists()).toBe(true)
    })
  })
})
