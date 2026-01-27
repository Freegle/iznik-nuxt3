import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DonationAskWhatYouCan from '~/components/DonationAskWhatYouCan.vue'

describe('DonationAskWhatYouCan', () => {
  function createWrapper(props = {}) {
    return mount(DonationAskWhatYouCan, {
      props: {
        groupname: 'Test Freegle',
        ...props,
      },
      global: {
        stubs: {
          DonationButton: {
            template:
              '<button class="donation-btn" @click="$emit(\'clicked\')">Donate</button>',
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
      const wrapper = createWrapper({ groupname: 'My Freegle Group' })
      expect(wrapper.text()).toContain('My Freegle Group')
    })

    it('shows target amount', () => {
      const wrapper = createWrapper({ target: 3000 })
      expect(wrapper.text()).toContain('£3000')
    })

    it('defaults target to 2000', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('£2000')
    })

    it('includes donation button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.donation-btn').exists()).toBe(true)
    })

    it('includes thermometer', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.thermometer').exists()).toBe(true)
    })

    it('includes supporter info', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.supporter-info').exists()).toBe(true)
    })

    it('mentions badge for supporters', () => {
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
    it('shows charity message without donate again', () => {
      const wrapper = createWrapper({ donated: null })
      expect(wrapper.text()).toContain("is a charity that's free to use")
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

    it('shows "across the UK" when target is met', () => {
      const wrapper = createWrapper({
        groupid: 1,
        targetMet: true,
      })
      expect(wrapper.text()).toContain('across the UK')
    })

    it('shows general fund message when groupid set and target not met', () => {
      const wrapper = createWrapper({
        groupid: 1,
        targetMet: false,
      })
      expect(wrapper.text()).toContain('general fund')
    })

    it('does not show general fund message when target met', () => {
      const wrapper = createWrapper({
        groupid: 1,
        targetMet: true,
      })
      expect(wrapper.text()).not.toContain('general fund')
    })
  })

  describe('events', () => {
    it('emits score event when donation button clicked', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.donation-btn').trigger('click')
      expect(wrapper.emitted('score')).toBeTruthy()
      expect(wrapper.emitted('score')[0]).toEqual([5])
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
