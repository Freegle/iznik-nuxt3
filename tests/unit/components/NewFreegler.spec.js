import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NewFreegler from '~/components/NewFreegler.vue'

describe('NewFreegler', () => {
  function createWrapper() {
    return mount(NewFreegler, {
      global: {
        stubs: {
          'nuxt-link': {
            template: '<a :to="to" :target="target"><slot /></a>',
            props: ['to', 'target', 'noPrefetch'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('displays welcome message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("If you're a new freegler then welcome!")
    })

    it('mentions cookies', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('cookies')
    })

    it('mentions local storage', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('local storage')
    })
  })

  describe('links', () => {
    it('has Terms of Use link', () => {
      const wrapper = createWrapper()
      const links = wrapper.findAll('a')
      const termsLink = links.find((l) => l.text() === 'Terms of Use')
      expect(termsLink).toBeDefined()
    })

    it('has Privacy link', () => {
      const wrapper = createWrapper()
      const links = wrapper.findAll('a')
      const privacyLink = links.find((l) => l.text() === 'Privacy')
      expect(privacyLink).toBeDefined()
    })

    it('opens links in new tab', () => {
      const wrapper = createWrapper()
      const links = wrapper.findAll('a')
      links.forEach((link) => {
        expect(link.attributes('target')).toBe('_blank')
      })
    })
  })
})
