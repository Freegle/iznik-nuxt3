import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TrustPilot from '~/components/TrustPilot.vue'

// Mock useRuntimeConfig
const mockRuntimeConfig = {
  public: {
    TRUSTPILOT_LINK: 'https://www.trustpilot.com/review/ilovefreegle.org',
  },
}

beforeEach(() => {
  globalThis.useRuntimeConfig = vi.fn(() => mockRuntimeConfig)
})

describe('TrustPilot', () => {
  function createWrapper() {
    return mount(TrustPilot, {
      global: {
        stubs: {
          ExternalLink: {
            template: '<a :href="href" class="external-link"><slot /></a>',
            props: ['href'],
          },
          'b-button': {
            template: '<button :class="[variant, size]"><slot /></button>',
            props: ['variant', 'size'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders ExternalLink when trustpilotLink is set', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.external-link').exists()).toBe(true)
    })

    it('has correct href', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.external-link').attributes('href')).toBe(
        'https://www.trustpilot.com/review/ilovefreegle.org'
      )
    })

    it('renders button with correct text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Rate us on TrustPilot')
    })

    it('button has primary variant', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').classes()).toContain('primary')
    })

    it('button has lg size', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').classes()).toContain('lg')
    })
  })

  describe('when no trustpilot link', () => {
    beforeEach(() => {
      globalThis.useRuntimeConfig = vi.fn(() => ({
        public: { TRUSTPILOT_LINK: null },
      }))
    })

    it('does not render when trustpilotLink is null', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.external-link').exists()).toBe(false)
    })
  })
})
