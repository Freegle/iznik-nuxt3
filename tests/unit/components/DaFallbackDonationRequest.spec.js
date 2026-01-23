import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DaFallbackDonationRequest from '~/components/DaFallbackDonationRequest.vue'

describe('DaFallbackDonationRequest', () => {
  function createWrapper(meValue = null) {
    return mount(DaFallbackDonationRequest, {
      global: {
        mocks: {
          me: meValue,
        },
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
    it('renders the container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.adFallback').exists()).toBe(true)
    })

    it('links to donate page', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a[href="/donate"]').exists()).toBe(true)
    })

    it('has centered text', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.text-center').exists()).toBe(true)
    })
  })

  describe('when user has not donated', () => {
    it('shows donation request message', () => {
      const wrapper = createWrapper({ donated: false })
      expect(wrapper.text()).toContain('Help keep Freegle running')
      expect(wrapper.text()).toContain('Click to donate')
    })

    it('does not show thank you message', () => {
      const wrapper = createWrapper({ donated: false })
      expect(wrapper.text()).not.toContain('Thank you for donating')
    })
  })

  describe('when user has donated', () => {
    it('shows thank you message', () => {
      const wrapper = createWrapper({ donated: true })
      expect(wrapper.text()).toContain('Thank you for donating')
    })

    it('does not show donation request', () => {
      const wrapper = createWrapper({ donated: true })
      expect(wrapper.text()).not.toContain('Click to donate')
    })
  })

  describe('when me is null', () => {
    it('shows donation request (default state)', () => {
      const wrapper = createWrapper(null)
      expect(wrapper.text()).toContain('Help keep Freegle running')
    })
  })

  describe('styling', () => {
    it('has w-100 class for full width', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.w-100').exists()).toBe(true)
    })

    it('has flex layout', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.d-flex').exists()).toBe(true)
    })

    it('has ourBackLight background', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.ourBackLight').exists()).toBe(true)
    })
  })
})
