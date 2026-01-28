import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsUserInfo from '~/components/NewsUserInfo.vue'

const mockNewsfeed = vi.fn()

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => ({
    byId: mockNewsfeed,
  }),
}))

describe('NewsUserInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNewsfeed.mockReturnValue({
      userid: 1,
      displayname: 'Test User',
      location: 'London',
      userinfo: { openoffers: 0, openwanteds: 0 },
      showmod: false,
    })
  })

  function createWrapper(props = {}) {
    return mount(NewsUserInfo, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          'nuxt-link': {
            template:
              '<a :href="to" :title="title" :class="$attrs.class"><slot /></a>',
            props: ['to', 'noPrefetch', 'title'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders link to user profile', () => {
      mockNewsfeed.mockReturnValue({
        userid: 123,
        displayname: 'Test User',
        userinfo: { openoffers: 0, openwanteds: 0 },
      })
      const wrapper = createWrapper()
      expect(wrapper.find('a').attributes('href')).toBe('/profile/123')
    })

    it('has title with user displayname', () => {
      mockNewsfeed.mockReturnValue({
        userid: 1,
        displayname: 'John Doe',
        userinfo: { openoffers: 0, openwanteds: 0 },
      })
      const wrapper = createWrapper()
      expect(wrapper.find('a').attributes('title')).toContain('John Doe')
    })
  })

  describe('location display', () => {
    it('shows location when provided', () => {
      mockNewsfeed.mockReturnValue({
        userid: 1,
        location: 'Manchester',
        userinfo: { openoffers: 0, openwanteds: 0 },
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Manchester')
      expect(wrapper.find('.v-icon[data-icon="map-marker-alt"]').exists()).toBe(
        true
      )
    })

    it('hides location when not provided', () => {
      mockNewsfeed.mockReturnValue({
        userid: 1,
        location: null,
        userinfo: { openoffers: 0, openwanteds: 0 },
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="map-marker-alt"]').exists()).toBe(
        false
      )
    })
  })

  describe('offers and wanteds display', () => {
    it('shows offers count when has open offers', () => {
      mockNewsfeed.mockReturnValue({
        userid: 1,
        userinfo: { openoffers: 3, openwanteds: 0 },
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="gift"]').exists()).toBe(true)
    })

    it('shows wanteds count when has open wanteds', () => {
      mockNewsfeed.mockReturnValue({
        userid: 1,
        userinfo: { openoffers: 0, openwanteds: 5 },
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="search"]').exists()).toBe(true)
    })

    it('hides stats when no offers or wanteds', () => {
      mockNewsfeed.mockReturnValue({
        userid: 1,
        userinfo: { openoffers: 0, openwanteds: 0 },
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.user-stats').exists()).toBe(false)
    })

    it('shows both offers and wanteds', () => {
      mockNewsfeed.mockReturnValue({
        userid: 1,
        userinfo: { openoffers: 2, openwanteds: 3 },
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="gift"]').exists()).toBe(true)
      expect(wrapper.find('.v-icon[data-icon="search"]').exists()).toBe(true)
    })
  })

  describe('volunteer badge', () => {
    it('shows volunteer badge when showmod is true', () => {
      mockNewsfeed.mockReturnValue({
        userid: 1,
        userinfo: { openoffers: 0, openwanteds: 0 },
        showmod: true,
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Freegle Volunteer')
      expect(wrapper.find('.v-icon[data-icon="leaf"]').exists()).toBe(true)
    })

    it('hides volunteer badge when showmod is false', () => {
      mockNewsfeed.mockReturnValue({
        userid: 1,
        userinfo: { openoffers: 0, openwanteds: 0 },
        showmod: false,
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('Freegle Volunteer')
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 10 })
      expect(wrapper.props('id')).toBe(10)
    })
  })
})
