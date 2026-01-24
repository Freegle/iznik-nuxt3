import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BirthdayHero from '~/components/BirthdayHero.vue'

const mockGroupStore = {
  fetch: vi.fn(),
  get: vi.fn(),
}

const mockUserStore = {
  fetch: vi.fn(),
}

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('BirthdayHero', () => {
  let mockIntersectionObserver

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock IntersectionObserver
    mockIntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    }))
    global.IntersectionObserver = mockIntersectionObserver

    // Default group mock
    mockGroupStore.get.mockReturnValue({
      namefull: 'Test Community',
      profile: '/test-profile.jpg',
      showmods: [],
    })
  })

  afterEach(() => {
    delete global.IntersectionObserver
  })

  function createWrapper(props = {}) {
    return mount(BirthdayHero, {
      props: {
        groupAge: 10,
        title: 'Celebrating 10 years!',
        groupId: 123,
        ...props,
      },
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          DonationAskStripe: {
            template: '<div class="donation-ask-stripe" />',
            props: [
              'groupid',
              'groupname',
              'default',
              'amounts',
              'hideIntro',
              'hideThermometer',
            ],
          },
          ProfileImage: {
            template: '<div class="profile-image" :data-alt="altText" />',
            props: ['image', 'altText', 'size', 'isThumbnail'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders birthday-hero container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.birthday-hero').exists()).toBe(true)
    })

    it('renders floating balloons section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.floating-balloons').exists()).toBe(true)
    })

    it('renders 10 balloons', () => {
      const wrapper = createWrapper()
      const balloons = wrapper.findAll('.balloon')
      expect(balloons.length).toBe(10)
    })

    it('renders floating cakes section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.floating-cakes').exists()).toBe(true)
    })

    it('renders 8 cakes', () => {
      const wrapper = createWrapper()
      const cakes = wrapper.findAll('.cake')
      expect(cakes.length).toBe(8)
    })

    it('renders party poppers section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.party-poppers').exists()).toBe(true)
    })

    it('renders 3 poppers', () => {
      const wrapper = createWrapper()
      const poppers = wrapper.findAll('.popper')
      expect(poppers.length).toBe(3)
    })

    it('renders hero content', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.hero-content').exists()).toBe(true)
    })

    it('renders celebration header', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.celebration-header').exists()).toBe(true)
    })

    it('renders age display', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.age-display').exists()).toBe(true)
    })

    it('displays group age in age-number', () => {
      const wrapper = createWrapper({ groupAge: 15 })
      expect(wrapper.find('.age-number').text()).toBe('15')
    })

    it('displays YEARS text', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.age-text').text()).toBe('YEARS')
    })

    it('renders birthday title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.birthday-title').exists()).toBe(true)
    })

    it('renders birthday subtitle', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.birthday-subtitle').exists()).toBe(true)
    })

    it('renders CTA section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.cta-section').exists()).toBe(true)
    })

    it('renders CTA heading', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.cta-heading').text()).toBe(
        'Free to use, but not free to run'
      )
    })

    it('renders donation wrapper', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.donation-wrapper').exists()).toBe(true)
    })

    it('renders DonationAskStripe component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.donation-ask-stripe').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires groupAge prop', () => {
      const wrapper = createWrapper({ groupAge: 5 })
      expect(wrapper.props('groupAge')).toBe(5)
    })

    it('requires title prop', () => {
      const wrapper = createWrapper({ title: 'Custom Title' })
      expect(wrapper.props('title')).toBe('Custom Title')
    })

    it('requires groupId prop', () => {
      const wrapper = createWrapper({ groupId: 456 })
      expect(wrapper.props('groupId')).toBe(456)
    })

    it('has default isToday of false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('isToday')).toBe(false)
    })

    it('accepts isToday prop', () => {
      const wrapper = createWrapper({ isToday: true })
      expect(wrapper.props('isToday')).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('computes groupName from store', () => {
      mockGroupStore.get.mockReturnValue({ namefull: 'Freegle Acton' })
      const wrapper = createWrapper()
      expect(wrapper.vm.groupName).toBe('Freegle Acton')
    })

    it('returns Community as default groupName', () => {
      mockGroupStore.get.mockReturnValue({})
      const wrapper = createWrapper()
      expect(wrapper.vm.groupName).toBe('Community')
    })

    it('computes groupProfile from store', () => {
      mockGroupStore.get.mockReturnValue({ profile: '/group-image.jpg' })
      const wrapper = createWrapper()
      expect(wrapper.vm.groupProfile).toBe('/group-image.jpg')
    })

    it('returns null when no groupProfile', () => {
      mockGroupStore.get.mockReturnValue({})
      const wrapper = createWrapper()
      expect(wrapper.vm.groupProfile).toBe(null)
    })

    it('computes displayTitle with isToday true', () => {
      mockGroupStore.get.mockReturnValue({ namefull: 'Freegle Test' })
      const wrapper = createWrapper({ isToday: true, groupAge: 12 })
      expect(wrapper.vm.displayTitle).toBe(
        'Happy Birthday to Freegle Test! 12 years old today!'
      )
    })

    it('uses title prop when isToday is false', () => {
      const wrapper = createWrapper({
        isToday: false,
        title: 'Anniversary celebration',
      })
      expect(wrapper.vm.displayTitle).toBe('Anniversary celebration')
    })

    it('computes localVolunteersText for single volunteer', async () => {
      const wrapper = createWrapper()
      wrapper.vm.activeVolunteers = [{ id: 1, firstName: 'Alice' }]
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.localVolunteersText).toBe(
        'Your local volunteer is Alice.'
      )
    })

    it('computes localVolunteersText for two volunteers', async () => {
      const wrapper = createWrapper()
      wrapper.vm.activeVolunteers = [
        { id: 1, firstName: 'Alice' },
        { id: 2, firstName: 'Bob' },
      ]
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.localVolunteersText).toBe(
        'Your local volunteers are Alice and Bob.'
      )
    })

    it('computes localVolunteersText for multiple volunteers', async () => {
      const wrapper = createWrapper()
      wrapper.vm.activeVolunteers = [
        { id: 1, firstName: 'Alice' },
        { id: 2, firstName: 'Bob' },
        { id: 3, firstName: 'Charlie' },
      ]
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.localVolunteersText).toBe(
        'Your local volunteers are Alice, Bob, and Charlie.'
      )
    })

    it('returns null for localVolunteersText when no volunteers', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.localVolunteersText).toBe(null)
    })
  })

  describe('scroll indicator', () => {
    it('shows scroll indicator when donation section not visible', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.scroll-indicator-top').exists()).toBe(true)
    })

    it('hides scroll indicator when donation section visible', async () => {
      const wrapper = createWrapper()
      wrapper.vm.donationSectionVisible = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.scroll-indicator-top').exists()).toBe(false)
    })

    it('displays angle-double-down icons', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll(
        '.scroll-indicator .v-icon[data-icon="angle-double-down"]'
      )
      expect(icons.length).toBe(2)
    })
  })

  describe('volunteers section', () => {
    it('hides volunteers section when no active volunteers', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.volunteers-section').exists()).toBe(false)
    })

    it('shows volunteers section when active volunteers exist', async () => {
      const wrapper = createWrapper()
      wrapper.vm.activeVolunteers = [
        {
          id: 1,
          displayname: 'Alice',
          firstName: 'Alice',
          profile: { paththumb: '/alice.jpg' },
        },
      ]
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.volunteers-section').exists()).toBe(true)
    })

    it('renders ProfileImage for each volunteer', async () => {
      const wrapper = createWrapper()
      wrapper.vm.activeVolunteers = [
        {
          id: 1,
          displayname: 'Alice',
          firstName: 'Alice',
          profile: { paththumb: '/alice.jpg' },
        },
        {
          id: 2,
          displayname: 'Bob',
          firstName: 'Bob',
          profile: { paththumb: '/bob.jpg' },
        },
      ]
      await wrapper.vm.$nextTick()
      const images = wrapper.findAll('.profile-image')
      expect(images.length).toBe(2)
    })
  })

  describe('group logo', () => {
    it('shows group logo when groupProfile exists', async () => {
      mockGroupStore.get.mockReturnValue({
        profile: '/logo.jpg',
        namefull: 'Test',
      })
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.group-logo-mini-1').exists()).toBe(true)
    })

    it('hides group logo when groupLogoError is true', async () => {
      mockGroupStore.get.mockReturnValue({
        profile: '/logo.jpg',
        namefull: 'Test',
      })
      const wrapper = createWrapper()
      wrapper.vm.groupLogoError = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.group-logo-mini-1').exists()).toBe(false)
    })
  })

  describe('age decorations', () => {
    it('renders left decorations', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.age-decorations.left').exists()).toBe(true)
    })

    it('renders right decorations', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.age-decorations.right').exists()).toBe(true)
    })

    it('renders mini balloons in decorations', () => {
      const wrapper = createWrapper()
      const miniBalloons = wrapper.findAll('.balloon-mini')
      expect(miniBalloons.length).toBe(4)
    })

    it('renders mini poppers in decorations', () => {
      const wrapper = createWrapper()
      const miniPoppers = wrapper.findAll('.popper-mini')
      expect(miniPoppers.length).toBe(2)
    })

    it('renders mini cakes in decorations', () => {
      const wrapper = createWrapper()
      const miniCakes = wrapper.findAll('.cake-mini')
      expect(miniCakes.length).toBe(2)
    })

    it('renders mini logos in decorations', () => {
      const wrapper = createWrapper()
      const miniLogos = wrapper.findAll('.logo-mini')
      expect(miniLogos.length).toBe(2)
    })
  })

  describe('lifecycle', () => {
    it('fetches group data on mount', async () => {
      createWrapper({ groupId: 789 })
      // Wait for async onMounted to complete
      await vi.waitFor(() => {
        expect(mockGroupStore.fetch).toHaveBeenCalledWith(789, true)
      })
    })
  })

  describe('CTA text', () => {
    it('displays group name in CTA text', () => {
      mockGroupStore.get.mockReturnValue({ namefull: 'Freegle London' })
      const wrapper = createWrapper()
      expect(wrapper.find('.cta-text').text()).toContain('Freegle London')
    })

    it('displays Community when no group name', () => {
      mockGroupStore.get.mockReturnValue({})
      const wrapper = createWrapper()
      // groupName computed returns 'Community' as default
      expect(wrapper.find('.cta-text').text()).toContain('Community')
    })
  })

  describe('emits', () => {
    it('defines donation-success emit', () => {
      const wrapper = createWrapper()
      const emits = wrapper.vm.$options.emits || []
      expect(emits).toContain('donation-success')
    })

    it('defines donation-click emit', () => {
      const wrapper = createWrapper()
      const emits = wrapper.vm.$options.emits || []
      expect(emits).toContain('donation-click')
    })
  })
})
