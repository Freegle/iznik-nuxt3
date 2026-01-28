import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import BirthdayDonateHero from '~/components/BirthdayDonateHero.vue'

const mockGroup = {
  id: 123,
  namefull: 'Test Freegle Community',
  profile: 'https://example.com/group-logo.png',
}

const mockGroupStore = {
  get: vi.fn().mockReturnValue(mockGroup),
  fetch: vi.fn().mockResolvedValue(undefined),
}

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

describe('BirthdayDonateHero', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockGroupStore.get.mockReturnValue({ ...mockGroup })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createWrapper(props = {}) {
    return mount(BirthdayDonateHero, {
      props: {
        groupAge: 15,
        title: 'Happy Birthday!',
        groupId: 123,
        donationAmount: 15,
        ...props,
      },
      global: {
        stubs: {
          DonationAskStripe: true,
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders birthday-donate-hero container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.birthday-donate-hero').exists()).toBe(true)
    })

    it('renders floating balloons', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.floating-balloons').exists()).toBe(true)
      expect(wrapper.findAll('.balloon').length).toBe(10)
    })

    it('renders floating cakes', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.floating-cakes').exists()).toBe(true)
      expect(wrapper.findAll('.cake').length).toBe(8)
    })

    it('renders party poppers', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.party-poppers').exists()).toBe(true)
      expect(wrapper.findAll('.popper').length).toBe(3)
    })

    it('renders hero content', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.hero-content').exists()).toBe(true)
    })

    it('renders celebration header', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.celebration-header').exists()).toBe(true)
    })
  })

  describe('birthday message mode', () => {
    it('shows birthday message when showThankYou is false', () => {
      const wrapper = createWrapper({ showThankYou: false })
      expect(wrapper.find('.birthday-message').exists()).toBe(true)
      expect(wrapper.find('.thank-you-message').exists()).toBe(false)
    })

    it('renders age display', () => {
      const wrapper = createWrapper({ groupAge: 20 })
      expect(wrapper.find('.age-display').exists()).toBe(true)
      expect(wrapper.find('.age-number').text()).toBe('20')
      expect(wrapper.find('.age-text').text()).toBe('YEARS')
    })

    it('renders age decorations', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.age-decorations').length).toBe(2)
      expect(wrapper.find('.age-decorations.left').exists()).toBe(true)
      expect(wrapper.find('.age-decorations.right').exists()).toBe(true)
    })

    it('renders mini balloons around age', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.balloon-mini').length).toBe(4)
    })

    it('renders mini poppers around age', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.popper-mini').length).toBe(2)
    })

    it('renders mini cakes around age', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.cake-mini').length).toBe(2)
    })

    it('renders Freegle logo minis', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.logo-mini').length).toBe(2)
    })

    it('renders group logo minis when group has profile', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.group-logo-mini').length).toBe(2)
    })

    it('does not render group logo when profile is null', () => {
      mockGroupStore.get.mockReturnValue({ ...mockGroup, profile: null })
      const wrapper = createWrapper()
      expect(wrapper.findAll('.group-logo-mini').length).toBe(0)
    })

    it('renders donation section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.donation-section').exists()).toBe(true)
    })

    it('renders DonationAskStripe component', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.findComponent({ name: 'DonationAskStripe' }).exists()
      ).toBe(true)
    })

    it('passes correct props to DonationAskStripe', () => {
      const wrapper = createWrapper({ groupId: 456, donationAmount: 25 })
      const stripe = wrapper.findComponent({ name: 'DonationAskStripe' })
      expect(stripe.exists()).toBe(true)
    })
  })

  describe('thank you mode', () => {
    it('shows thank you message when showThankYou is true', () => {
      const wrapper = createWrapper({ showThankYou: true })
      expect(wrapper.find('.thank-you-message').exists()).toBe(true)
      expect(wrapper.find('.birthday-message').exists()).toBe(false)
    })

    it('renders thank you title', () => {
      const wrapper = createWrapper({ showThankYou: true })
      expect(wrapper.find('.thank-you-title').text()).toBe('Thank you!')
    })

    it('renders cake slice graphic', () => {
      const wrapper = createWrapper({ showThankYou: true })
      expect(wrapper.find('.cake-slice-graphic').exists()).toBe(true)
    })

    it('displays donation amount in thank you message', () => {
      const wrapper = createWrapper({ showThankYou: true, donationAmount: 30 })
      expect(wrapper.find('.thank-you-subtitle').text()).toContain('£30')
    })

    it('includes group name in thank you message', () => {
      const wrapper = createWrapper({ showThankYou: true })
      expect(wrapper.find('.thank-you-subtitle').text()).toContain(
        'Test Freegle Community'
      )
    })

    it('hides donation section in thank you mode', () => {
      const wrapper = createWrapper({ showThankYou: true })
      expect(wrapper.find('.donation-section').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('requires groupAge prop', () => {
      const wrapper = createWrapper({ groupAge: 10 })
      expect(wrapper.props('groupAge')).toBe(10)
    })

    it('requires title prop', () => {
      const wrapper = createWrapper({ title: 'Birthday Celebration' })
      expect(wrapper.props('title')).toBe('Birthday Celebration')
    })

    it('requires groupId prop', () => {
      const wrapper = createWrapper({ groupId: 789 })
      expect(wrapper.props('groupId')).toBe(789)
    })

    it('requires donationAmount prop', () => {
      const wrapper = createWrapper({ donationAmount: 50 })
      expect(wrapper.props('donationAmount')).toBe(50)
    })

    it('has default isToday of false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('isToday')).toBe(false)
    })

    it('has default showThankYou of false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('showThankYou')).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('returns group from store', () => {
      createWrapper()
      expect(mockGroupStore.get).toHaveBeenCalledWith(123)
    })

    it('returns group name from group data', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.groupName).toBe('Test Freegle Community')
    })

    it('returns Community as fallback for group name', () => {
      mockGroupStore.get.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.vm.groupName).toBe('Community')
    })

    it('returns group profile URL', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.groupProfile).toBe('https://example.com/group-logo.png')
    })

    it('returns null for group profile when group has none', () => {
      mockGroupStore.get.mockReturnValue({ ...mockGroup, profile: null })
      const wrapper = createWrapper()
      expect(wrapper.vm.groupProfile).toBeNull()
    })
  })

  describe('lifecycle and data fetching', () => {
    it('fetches group data on mount', async () => {
      createWrapper({ groupId: 456 })
      await flushPromises()
      expect(mockGroupStore.fetch).toHaveBeenCalledWith(456, true)
    })

    it('fetches with default groupId when provided', async () => {
      createWrapper({ groupId: 123 })
      await flushPromises()
      expect(mockGroupStore.fetch).toHaveBeenCalledWith(123, true)
    })
  })

  describe('emits', () => {
    it('defines donation-success emit', () => {
      const wrapper = createWrapper()
      // Component defines emits for donation-success
      expect(wrapper.vm.$options.emits || []).toContain('donation-success')
    })

    it('defines donation-click emit', () => {
      const wrapper = createWrapper()
      // Component defines emits for donation-click
      expect(wrapper.vm.$options.emits || []).toContain('donation-click')
    })
  })

  describe('group logo error handling', () => {
    it('hides group logo on error', async () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.group-logo-mini').length).toBe(2)

      // Simulate error on one of the group logo images
      await wrapper.find('.group-logo-img-mini').trigger('error')

      // After error, logos should be hidden
      expect(wrapper.findAll('.group-logo-mini').length).toBe(0)
    })
  })
})
