import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SidebarLeft from '~/components/SidebarLeft.vue'

const mockMe = vi.fn()

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe(),
  }),
}))

describe('SidebarLeft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMe.mockReturnValue({ id: 1 })
  })

  function createWrapper(props = {}) {
    return mount(SidebarLeft, {
      props: {
        ...props,
      },
      global: {
        stubs: {
          ExternalDa: {
            template: '<div class="external-da" />',
            props: ['adUnitPath', 'maxHeight', 'divId', 'listOnly'],
            emits: ['rendered'],
          },
          CommunityEventSidebar: {
            template: '<div class="community-event-sidebar" />',
          },
          VolunteerOpportunitySidebar: {
            template: '<div class="volunteer-opportunity-sidebar" />',
          },
          BotLeftBox: {
            template: '<div class="bot-left-box" />',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders when hasContent is true', () => {
      const wrapper = createWrapper({ showCommunityEvents: true })
      expect(wrapper.find('.sidebar__wrapper').exists()).toBe(true)
    })

    it('renders when adUnitPath provided', () => {
      const wrapper = createWrapper({ adUnitPath: '/test/ad' })
      expect(wrapper.find('.sidebar__wrapper').exists()).toBe(true)
    })

    it('shows BotLeftBox by default', () => {
      const wrapper = createWrapper({ showCommunityEvents: true })
      expect(wrapper.find('.bot-left-box').exists()).toBe(true)
    })

    it('hides BotLeftBox when showBotLeft is false', () => {
      const wrapper = createWrapper({
        showCommunityEvents: true,
        showBotLeft: false,
      })
      expect(wrapper.find('.bot-left-box').exists()).toBe(false)
    })
  })

  describe('ExternalDa', () => {
    it('shows ExternalDa when adUnitPath provided', () => {
      const wrapper = createWrapper({ adUnitPath: '/some/ad/path' })
      expect(wrapper.find('.external-da').exists()).toBe(true)
    })

    it('hides ExternalDa when no adUnitPath', () => {
      const wrapper = createWrapper({ showCommunityEvents: true })
      expect(wrapper.find('.external-da').exists()).toBe(false)
    })
  })

  describe('CommunityEventSidebar', () => {
    it('shows when me exists and showCommunityEvents true', () => {
      mockMe.mockReturnValue({ id: 1 })
      const wrapper = createWrapper({ showCommunityEvents: true })
      expect(wrapper.find('.community-event-sidebar').exists()).toBe(true)
    })

    it('hides when showCommunityEvents false', () => {
      mockMe.mockReturnValue({ id: 1 })
      const wrapper = createWrapper({
        showCommunityEvents: false,
        adUnitPath: '/ad',
      })
      expect(wrapper.find('.community-event-sidebar').exists()).toBe(false)
    })

    it('hides when me is null', () => {
      mockMe.mockReturnValue(null)
      const wrapper = createWrapper({
        showCommunityEvents: true,
        adUnitPath: '/ad',
      })
      expect(wrapper.find('.community-event-sidebar').exists()).toBe(false)
    })
  })

  describe('VolunteerOpportunitySidebar', () => {
    it('shows when me exists and showVolunteerOpportunities true', () => {
      mockMe.mockReturnValue({ id: 1 })
      const wrapper = createWrapper({ showVolunteerOpportunities: true })
      expect(wrapper.find('.volunteer-opportunity-sidebar').exists()).toBe(true)
    })

    it('hides when showVolunteerOpportunities false', () => {
      mockMe.mockReturnValue({ id: 1 })
      const wrapper = createWrapper({
        showVolunteerOpportunities: false,
        adUnitPath: '/ad',
      })
      expect(wrapper.find('.volunteer-opportunity-sidebar').exists()).toBe(
        false
      )
    })

    it('hides when me is null', () => {
      mockMe.mockReturnValue(null)
      const wrapper = createWrapper({
        showVolunteerOpportunities: true,
        adUnitPath: '/ad',
      })
      expect(wrapper.find('.volunteer-opportunity-sidebar').exists()).toBe(
        false
      )
    })
  })

  describe('props', () => {
    it('defaults showCommunityEvents to false', () => {
      const wrapper = createWrapper({ adUnitPath: '/ad' })
      expect(wrapper.props('showCommunityEvents')).toBe(false)
    })

    it('defaults showVolunteerOpportunities to false', () => {
      const wrapper = createWrapper({ adUnitPath: '/ad' })
      expect(wrapper.props('showVolunteerOpportunities')).toBe(false)
    })

    it('defaults showBotLeft to true', () => {
      const wrapper = createWrapper({ showCommunityEvents: true })
      expect(wrapper.props('showBotLeft')).toBe(true)
    })

    it('defaults adUnitPath to null', () => {
      const wrapper = createWrapper({ showCommunityEvents: true })
      expect(wrapper.props('adUnitPath')).toBe(null)
    })

    it('defaults adDivId to null', () => {
      const wrapper = createWrapper({ showCommunityEvents: true })
      expect(wrapper.props('adDivId')).toBe(null)
    })
  })
})
