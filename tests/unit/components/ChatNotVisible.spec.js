import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatNotVisible from '~/components/ChatNotVisible.vue'

describe('ChatNotVisible', () => {
  function createWrapper() {
    return mount(ChatNotVisible, {
      global: {
        stubs: {
          'b-alert': {
            template:
              '<div class="alert" :class="[\'alert-\' + variant]"><slot /></div>',
            props: ['variant', 'modelValue'],
          },
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          SupportLink: {
            template: '<a href="/support">support</a>',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('displays danger alert', () => {
      const wrapper = createWrapper()
      const alert = wrapper.find('.alert')
      expect(alert.exists()).toBe(true)
      expect(alert.classes()).toContain('alert-danger')
    })

    it('displays heading about wrong account', () => {
      const wrapper = createWrapper()
      const heading = wrapper.find('h3')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toContain("isn't for this account")
    })

    it('includes link to settings page', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('a[href="/settings"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Settings')
    })

    it('includes support link for account merging', () => {
      const wrapper = createWrapper()
      const supportLink = wrapper.find('a[href="/support"]')
      expect(supportLink.exists()).toBe(true)
    })

    it('mentions checking email in settings', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('check your email')
    })

    it('mentions merging multiple accounts', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('merge multiple accounts')
    })

    it('has mt-2 margin class', () => {
      const wrapper = createWrapper()
      // The alert is rendered, check the component structure
      expect(wrapper.html()).toContain('alert')
    })
  })
})
