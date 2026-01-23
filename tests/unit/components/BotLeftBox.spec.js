import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BotLeftBox from '~/components/BotLeftBox.vue'

describe('BotLeftBox', () => {
  function createWrapper() {
    return mount(BotLeftBox, {
      global: {
        stubs: {
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          ExternalLink: {
            template: '<a :href="href" :title="title"><slot /></a>',
            props: ['href', 'title'],
          },
          'v-icon': {
            template:
              '<i :class="Array.isArray(icon) ? icon.join(\' \') : icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders footer-nav container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.footer-nav').exists()).toBe(true)
    })

    it('renders footer-links section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.footer-links').exists()).toBe(true)
    })

    it('renders footer-social section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.footer-social').exists()).toBe(true)
    })
  })

  describe('navigation links', () => {
    it('includes About link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('a[href="/about"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('About')
    })

    it('includes Terms link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('a[href="/terms"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Terms')
    })

    it('includes Privacy link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('a[href="/privacy"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Privacy')
    })

    it('includes Disclaimer link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('a[href="/disclaimer"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Disclaimer')
    })

    it('includes Donate link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('a[href="/donate"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Donate')
    })

    it('includes Contact link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('a[href="/help"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Contact')
    })
  })

  describe('social links', () => {
    it('includes Facebook link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('a[href="https://www.facebook.com/Freegle/"]')
      expect(link.exists()).toBe(true)
      expect(link.attributes('title')).toBe('Facebook')
    })

    it('includes Instagram link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find(
        'a[href="https://www.instagram.com/thisisfreegle"]'
      )
      expect(link.exists()).toBe(true)
      expect(link.attributes('title')).toBe('Instagram')
    })

    it('includes Twitter link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('a[href="https://twitter.com/thisisfreegle"]')
      expect(link.exists()).toBe(true)
      expect(link.attributes('title')).toBe('X')
    })

    it('includes GitHub link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find(
        'a[href="https://github.com/Freegle/iznik-nuxt3"]'
      )
      expect(link.exists()).toBe(true)
      expect(link.attributes('title')).toContain('GitHub')
    })

    it('has 4 social links', () => {
      const wrapper = createWrapper()
      const socialLinks = wrapper.findAll('.footer-social a')
      expect(socialLinks).toHaveLength(4)
    })
  })
})
