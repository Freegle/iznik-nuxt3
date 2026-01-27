import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import JustGivingDonationButton from '~/components/JustGivingDonationButton.vue'

describe('JustGivingDonationButton', () => {
  beforeEach(() => {
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function createWrapper() {
    return mount(JustGivingDonationButton, {
      global: {
        stubs: {
          'b-img': {
            template: '<img :src="src" />',
            props: ['src'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders button element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('has jgbutton class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.jgbutton').exists()).toBe(true)
    })

    it('renders JustGiving image', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('img').attributes('src')).toContain('jg-cdn.com')
    })
  })

  describe('data attributes', () => {
    it('has data-jg-donate-button attribute', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('button').attributes('data-jg-donate-button')
      ).toBeDefined()
    })

    it('has linkid attribute', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').attributes('data-linkid')).toBe(
        'fx6eedvc49'
      )
    })

    it('has marketcode GB attribute', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').attributes('data-marketcode')).toBe('GB')
    })

    it('has donatebuttontype attribute', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').attributes('data-donatebuttontype')).toBe(
        'justgivingSmall'
      )
    })

    it('has popupcheckout enabled', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').attributes('data-popupcheckout')).toBe(
        'true'
      )
    })
  })
})
