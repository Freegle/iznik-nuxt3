import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DonationTraditionalExtras from '~/components/DonationTraditionalExtras.vue'

describe('DonationTraditionalExtras', () => {
  function createWrapper(props = {}) {
    return mount(DonationTraditionalExtras, {
      props: {
        groupname: 'Test Community',
        ...props,
      },
      global: {
        stubs: {
          SupporterInfo: {
            template: '<span class="supporter-info" />',
            props: ['size'],
          },
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

    it('mentions supporter badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('badge')
    })

    it('mentions ads being turned off', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('turn off ads for a month')
    })

    it('includes SupporterInfo component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.supporter-info').exists()).toBe(true)
    })

    it('links to donate page with noguard', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a[href="/donate?noguard=true"]').exists()).toBe(true)
    })

    it('mentions alternative donation methods', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('bank transfer or cheque')
    })
  })

  describe('groupid prop behavior', () => {
    describe('when groupid is null', () => {
      it('does not show general fund message', () => {
        const wrapper = createWrapper({ groupid: null })
        expect(wrapper.text()).not.toContain('general fund')
      })
    })

    describe('when groupid is set', () => {
      it('shows general fund message when target not met and thermometer visible', () => {
        const wrapper = createWrapper({
          groupid: 1,
          targetMet: false,
          hideThermometer: false,
        })
        expect(wrapper.text()).toContain('general fund')
        expect(wrapper.text()).toContain('other communities')
      })

      it('does not show general fund message when target is met', () => {
        const wrapper = createWrapper({
          groupid: 1,
          targetMet: true,
          hideThermometer: false,
        })
        const paragraphs = wrapper.findAll('p')
        // Should only have one paragraph (the main text)
        const generalFundText = paragraphs.filter((p) =>
          p.text().includes('contribute to the general fund')
        )
        expect(generalFundText.length).toBeLessThan(2)
      })
    })
  })

  describe('hideThermometer prop behavior', () => {
    it('shows alternate message when thermometer is hidden', () => {
      const wrapper = createWrapper({
        groupid: 1,
        groupname: 'Test Group',
        hideThermometer: true,
      })
      expect(wrapper.text()).toContain('Test Group and other communities')
    })

    it('uses groupname in message when thermometer is hidden', () => {
      const wrapper = createWrapper({
        groupid: 1,
        groupname: 'My Freegle Group',
        hideThermometer: true,
      })
      expect(wrapper.text()).toContain('My Freegle Group')
    })
  })

  describe('props', () => {
    it('accepts groupid prop', () => {
      const wrapper = createWrapper({ groupid: 42 })
      expect(wrapper.props('groupid')).toBe(42)
    })

    it('accepts groupname prop', () => {
      const wrapper = createWrapper({ groupname: 'Test Name' })
      expect(wrapper.props('groupname')).toBe('Test Name')
    })

    it('defaults targetMet to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('targetMet')).toBe(false)
    })

    it('defaults hideThermometer to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('hideThermometer')).toBe(false)
    })
  })
})
