import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MainFooter from '~/components/MainFooter.vue'

describe('MainFooter', () => {
  function createWrapper(props = {}) {
    return mount(MainFooter, {
      props: {
        ...props,
      },
      global: {
        stubs: {
          ProxyImage: {
            template: '<img :src="src" :alt="alt" class="proxy-image" />',
            props: ['src', 'alt', 'preload', 'sizes'],
          },
          'nuxt-link': {
            template: '<a :href="to" class="nuxt-link"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders footer container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.footer').exists()).toBe(true)
    })

    it('has test-main-footer class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.test-main-footer').exists()).toBe(true)
    })
  })

  describe('sponsors section', () => {
    it('renders sponsors section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.sponsors-section').exists()).toBe(true)
    })

    it('shows sponsors label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Kindly supported by')
    })

    it('shows Krystal sponsor link', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.test-sponsor-krystal').exists()).toBe(true)
    })

    it('shows Mythic Beasts sponsor link', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.test-sponsor-mythic').exists()).toBe(true)
    })

    it('shows sponsor logos', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.proxy-image').length).toBe(2)
    })
  })

  describe('charity info', () => {
    it('shows charity text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(
        'Freegle is registered as a charity with HMRC'
      )
    })

    it('shows HMRC reference', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('XT32865')
    })
  })

  describe('navigation links', () => {
    it('has About link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('.test-footer-about')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('/about')
    })

    it('has Terms link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('.test-footer-terms')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('/terms')
    })

    it('has Privacy link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('.test-footer-privacy')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('/privacy')
    })

    it('has Donate link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('.test-footer-donate')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('/donate')
    })

    it('has Help link', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('.test-footer-contact')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('/help')
    })

    it('shows navigation dividers', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.nav-divider').length).toBe(4)
    })
  })
})
