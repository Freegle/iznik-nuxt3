import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TermsOfUse from '~/components/TermsOfUse.vue'

describe('TermsOfUse', () => {
  function createWrapper() {
    return mount(TermsOfUse, {
      global: {
        stubs: {
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders container div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders introductory text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(
        'We could give you a ten page long Terms of Use'
      )
      expect(wrapper.text()).toContain("it's simple")
    })

    it('renders ordered list', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('ol').exists()).toBe(true)
    })

    it('renders 11 list items', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('li')).toHaveLength(11)
    })
  })

  describe('key terms', () => {
    it.each([
      'Everything must be free and legal',
      'Be nice to other freeglers',
      'No sales, no swaps, just simple gifts',
      'Objectionable content or behaviour will not be tolerated',
      'You must be aged 13 or over',
    ])('includes term: %s', (term) => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(term)
    })
  })

  describe('links', () => {
    it('links to privacy page', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a[href="/privacy"]').exists()).toBe(true)
    })

    it('links to disclaimer page', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a[href="/disclaimer"]').exists()).toBe(true)
    })

    it('links to help page', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a[href="/help"]').exists()).toBe(true)
    })

    it('links to settings page', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a[href="/settings"]').exists()).toBe(true)
    })
  })
})
