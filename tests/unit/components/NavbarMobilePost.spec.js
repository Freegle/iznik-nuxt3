import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NavbarMobilePost from '~/components/NavbarMobilePost.vue'

describe('NavbarMobilePost', () => {
  function createWrapper() {
    return mount(NavbarMobilePost, {
      global: {
        stubs: {
          'nuxt-link': {
            template: '<a :href="to" :class="$attrs.class"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders link to /post', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a[href="/post"]').exists()).toBe(true)
    })

    it('renders FAB button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.fab-button').exists()).toBe(true)
    })

    it('renders SVG icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('renders plus icon path', () => {
      const wrapper = createWrapper()
      const path = wrapper.find('svg path')
      expect(path.exists()).toBe(true)
      // The path draws a plus sign (vertical and horizontal lines)
      expect(path.attributes('d')).toContain('12 4v16')
      expect(path.attributes('d')).toContain('4 12h16')
    })
  })

  describe('styling', () => {
    it('has fab-link class on anchor', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a').classes()).toContain('fab-link')
    })

    it('has fab-icon class on SVG', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.fab-icon').exists()).toBe(true)
    })

    it('SVG has proper viewBox', () => {
      const wrapper = createWrapper()
      // Note: attribute names are lowercase in DOM
      const svg = wrapper.find('svg')
      expect(svg.attributes('viewbox') || svg.attributes('viewBox')).toBe(
        '0 0 24 24'
      )
    })
  })

  describe('accessibility', () => {
    it('link navigates to post page', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a').attributes('href')).toBe('/post')
    })
  })
})
