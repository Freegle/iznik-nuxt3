import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatNotVisible from '~/components/ChatNotVisible.vue'

describe('ChatNotVisible', () => {
  function createWrapper() {
    return mount(ChatNotVisible, {
      global: {
        stubs: {
          'b-alert': {
            template: '<div class="b-alert" :class="variant"><slot /></div>',
            props: ['variant', 'modelValue'],
          },
          'nuxt-link': {
            template: '<a :to="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          SupportLink: {
            template: '<a class="support-link">Support</a>',
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

    it('renders as danger alert', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-alert.danger').exists()).toBe(true)
    })

    it('displays error heading', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h3').text()).toBe(
        "That chat isn't for this account."
      )
    })

    it('suggests checking email settings', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Please check your email')
    })
  })

  describe('links', () => {
    it('has Settings link', () => {
      const wrapper = createWrapper()
      const links = wrapper.findAll('a')
      const settingsLink = links.find((l) => l.text() === 'Settings')
      expect(settingsLink).toBeDefined()
    })

    it('has SupportLink component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.support-link').exists()).toBe(true)
    })

    it('mentions merging accounts', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('merge multiple accounts')
    })
  })
})
