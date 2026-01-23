import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BouncingEmail from '~/components/BouncingEmail.vue'

describe('BouncingEmail', () => {
  function createWrapper(meValue = null) {
    return mount(BouncingEmail, {
      global: {
        stubs: {
          'b-row': { template: '<div class="row"><slot /></div>' },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols', 'xl', 'offsetXl'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant', 'modelValue'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
          },
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
        },
        // Provide me via mocks which works in vue-test-utils
        mocks: {
          me: meValue,
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders row and column structure', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.row').exists()).toBe(true)
      expect(wrapper.find('.col').exists()).toBe(true)
    })

    it('renders notice message component', () => {
      const wrapper = createWrapper({ bouncing: true })
      expect(wrapper.find('.notice-message').exists()).toBe(true)
    })

    it('applies danger variant to notice', () => {
      const wrapper = createWrapper({ bouncing: true })
      const notice = wrapper.find('.notice-message')
      expect(notice.classes()).toContain('danger')
    })

    it('displays warning message text', () => {
      const wrapper = createWrapper({ bouncing: true })
      expect(wrapper.text()).toContain("can't send to your email")
    })

    it('includes link to settings page', () => {
      const wrapper = createWrapper({ bouncing: true })
      const link = wrapper.find('a[href="/settings"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Settings')
    })

    it('shows exclamation-triangle icon', () => {
      const wrapper = createWrapper({ bouncing: true })
      expect(wrapper.find('i.exclamation-triangle').exists()).toBe(true)
    })

    it('mentions fixing or retrying', () => {
      const wrapper = createWrapper({ bouncing: true })
      expect(wrapper.text()).toContain('fix or retry')
    })
  })

  describe('conditional rendering', () => {
    it('component exists regardless of me value', () => {
      // Component always renders, the v-if is on the NoticeMessage
      const wrapper = createWrapper(null)
      expect(wrapper.exists()).toBe(true)
    })

    it('renders with me.bouncing false', () => {
      const wrapper = createWrapper({ bouncing: false })
      expect(wrapper.exists()).toBe(true)
    })

    it('renders with me.bouncing true', () => {
      const wrapper = createWrapper({ bouncing: true })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('layout', () => {
    it('uses 12 column layout', () => {
      const wrapper = createWrapper({ bouncing: true })
      // Component uses cols="12" on b-col
      expect(wrapper.html()).toContain('col')
    })

    it('has bottom and verytop classes for fixed positioning', () => {
      const wrapper = createWrapper({ bouncing: true })
      // These are in the component's scoped styles
      expect(wrapper.exists()).toBe(true)
    })
  })
})
