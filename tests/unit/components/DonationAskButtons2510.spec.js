import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DonationAskButtons2510 from '~/components/DonationAskButtons2510.vue'

describe('DonationAskButtons2510', () => {
  function createWrapper(props = {}) {
    return mount(DonationAskButtons2510, {
      props: {
        groupname: 'Test Freegle',
        ...props,
      },
      global: {
        stubs: {
          DonationButton: {
            template:
              '<button class="donation-btn" :data-value="value" @click="$emit(\'clicked\')">£{{ value }}</button>',
            props: ['value'],
            emits: ['clicked'],
          },
          DonationThermometer: {
            template: '<div class="thermometer" />',
            props: ['groupid'],
          },
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
    it('renders container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('displays group name', () => {
      const wrapper = createWrapper({ groupname: 'My Local Group' })
      expect(wrapper.text()).toContain('My Local Group')
    })

    it('shows target amount', () => {
      const wrapper = createWrapper({ target: 3000 })
      expect(wrapper.text()).toContain('£3000')
    })

    it('defaults target to 2000', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('£2000')
    })

    it('includes 3 donation buttons', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.donation-btn')
      expect(buttons.length).toBe(3)
    })

    it('has £2 button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.donation-btn[data-value="2"]').exists()).toBe(true)
    })

    it('has £5 button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.donation-btn[data-value="5"]').exists()).toBe(true)
    })

    it('has £10 button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.donation-btn[data-value="10"]').exists()).toBe(true)
    })

    it('includes thermometer', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.thermometer').exists()).toBe(true)
    })

    it('includes supporter info', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.supporter-info').exists()).toBe(true)
    })

    it('mentions badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('badge')
    })

    it('links to donate page', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a[href="/donate"]').exists()).toBe(true)
    })
  })

  describe('when user has donated before', () => {
    it('shows thank you message', () => {
      const wrapper = createWrapper({ donated: 'yes' })
      expect(wrapper.text()).toContain("You've donated before")
    })

    it('encourages donate again', () => {
      const wrapper = createWrapper({ donated: 'yes' })
      expect(wrapper.text()).toContain('donate again')
    })
  })

  describe('when user has not donated', () => {
    it('does not show donate again message', () => {
      const wrapper = createWrapper({ donated: null })
      expect(wrapper.text()).not.toContain("You've donated before")
    })
  })

  describe('groupid and targetMet behavior', () => {
    it('shows "for this community" when groupid set and target not met', () => {
      const wrapper = createWrapper({
        groupid: 1,
        targetMet: false,
      })
      expect(wrapper.text()).toContain('for this community')
    })

    it('shows "across the UK" when groupid is null', () => {
      const wrapper = createWrapper({ groupid: null })
      expect(wrapper.text()).toContain('across the UK')
    })

    it('shows general fund message when groupid set and target not met', () => {
      const wrapper = createWrapper({
        groupid: 1,
        targetMet: false,
      })
      expect(wrapper.text()).toContain('general fund')
    })
  })

  describe('events', () => {
    it('emits score 2 when £2 button clicked', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.donation-btn[data-value="2"]').trigger('click')
      expect(wrapper.emitted('score')).toBeTruthy()
      expect(wrapper.emitted('score')[0]).toEqual([2])
    })

    it('emits score 5 when £5 button clicked', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.donation-btn[data-value="5"]').trigger('click')
      expect(wrapper.emitted('score')[0]).toEqual([5])
    })

    it('emits score 10 when £10 button clicked', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.donation-btn[data-value="10"]').trigger('click')
      expect(wrapper.emitted('score')[0]).toEqual([10])
    })
  })

  describe('props', () => {
    it('requires groupname prop', () => {
      const wrapper = createWrapper({ groupname: 'Local Group' })
      expect(wrapper.props('groupname')).toBe('Local Group')
    })

    it('defaults groupid to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('groupid')).toBe(null)
    })

    it('defaults target to 2000', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('target')).toBe(2000)
    })

    it('defaults raised to 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('raised')).toBe(0)
    })

    it('defaults targetMet to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('targetMet')).toBe(false)
    })

    it('defaults donated to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('donated')).toBe(null)
    })
  })
})
