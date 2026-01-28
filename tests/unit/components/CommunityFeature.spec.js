import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CommunityFeature from '~/components/CommunityFeature.vue'

describe('CommunityFeature', () => {
  function createWrapper(props = {}) {
    return mount(CommunityFeature, {
      props: {
        items: [1, 2, 3],
        title: 'Test Feature',
        link: '/test/link',
        iconName: 'calendar',
        addButtonLabel: 'Add new item',
        itemDescription: 'Here are some items',
        noItemsMessage: 'No items yet',
        featureComponent: 'CommunityEvent',
        addModalComponent: 'CommunityEventModal',
        itemKey: 'event-',
        ...props,
      },
      global: {
        stubs: {
          'nuxt-link': {
            template: '<a :href="to" :class="$attrs.class"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          CommunityEvent: {
            template: '<div class="community-event" :data-id="id" />',
            props: ['id', 'summary'],
          },
          VolunteerOpportunity: {
            template: '<div class="volunteer-opportunity" :data-id="id" />',
            props: ['id', 'summary'],
          },
          CommunityEventModal: {
            template: '<div class="community-event-modal" />',
            props: ['startEdit'],
            emits: ['hidden'],
          },
          VolunteerOpportunityModal: {
            template: '<div class="volunteer-opportunity-modal" />',
            props: ['startEdit'],
            emits: ['hidden'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders feature container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.feature-container').exists()).toBe(true)
    })

    it('shows title', () => {
      const wrapper = createWrapper({ title: 'Community Events' })
      expect(wrapper.text()).toContain('Community Events')
    })

    it('shows header icon', () => {
      const wrapper = createWrapper({ iconName: 'calendar' })
      expect(wrapper.find('.v-icon[data-icon="calendar"]').exists()).toBe(true)
    })

    it('links to correct path', () => {
      const wrapper = createWrapper({ link: '/events' })
      expect(wrapper.find('.header-link').attributes('href')).toBe('/events')
    })

    it('shows add button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.add-btn').exists()).toBe(true)
      expect(wrapper.text()).toContain('Add')
    })
  })

  describe('items display', () => {
    it('shows item description when items exist', () => {
      const wrapper = createWrapper({
        itemDescription: 'Check out these events',
      })
      expect(wrapper.text()).toContain('Check out these events')
    })

    it('renders CommunityEvent for each item', () => {
      const wrapper = createWrapper({
        items: [1, 2, 3],
        featureComponent: 'CommunityEvent',
      })
      expect(wrapper.findAll('.community-event').length).toBe(3)
    })

    it('renders VolunteerOpportunity for volunteer feature', () => {
      const wrapper = createWrapper({
        items: [1, 2],
        featureComponent: 'VolunteerOpportunity',
      })
      expect(wrapper.findAll('.volunteer-opportunity').length).toBe(2)
    })

    it('shows no items message when empty', () => {
      const wrapper = createWrapper({
        items: [],
        noItemsMessage: 'No events found',
      })
      expect(wrapper.text()).toContain('No events found')
    })

    it('hides description when no items', () => {
      const wrapper = createWrapper({
        items: [],
        itemDescription: 'Check out these events',
      })
      expect(wrapper.text()).not.toContain('Check out these events')
    })
  })

  describe('modal', () => {
    it('shows CommunityEventModal when add clicked for events', async () => {
      const wrapper = createWrapper({
        featureComponent: 'CommunityEvent',
      })

      expect(wrapper.find('.community-event-modal').exists()).toBe(false)

      await wrapper.find('.add-btn').trigger('click')

      expect(wrapper.find('.community-event-modal').exists()).toBe(true)
    })

    it('shows VolunteerOpportunityModal when add clicked for volunteers', async () => {
      const wrapper = createWrapper({
        featureComponent: 'VolunteerOpportunity',
      })

      expect(wrapper.find('.volunteer-opportunity-modal').exists()).toBe(false)

      await wrapper.find('.add-btn').trigger('click')

      expect(wrapper.find('.volunteer-opportunity-modal').exists()).toBe(true)
    })

    it('does not show modal initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.community-event-modal').exists()).toBe(false)
      expect(wrapper.find('.volunteer-opportunity-modal').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('requires items prop', () => {
      const wrapper = createWrapper({ items: [5, 10] })
      expect(wrapper.props('items')).toEqual([5, 10])
    })

    it('requires title prop', () => {
      const wrapper = createWrapper({ title: 'My Title' })
      expect(wrapper.props('title')).toBe('My Title')
    })

    it('requires link prop', () => {
      const wrapper = createWrapper({ link: '/my/link' })
      expect(wrapper.props('link')).toBe('/my/link')
    })

    it('requires iconName prop', () => {
      const wrapper = createWrapper({ iconName: 'star' })
      expect(wrapper.props('iconName')).toBe('star')
    })

    it('requires addButtonLabel prop', () => {
      const wrapper = createWrapper({ addButtonLabel: 'Add event' })
      expect(wrapper.props('addButtonLabel')).toBe('Add event')
    })

    it('requires itemDescription prop', () => {
      const wrapper = createWrapper({ itemDescription: 'Some events' })
      expect(wrapper.props('itemDescription')).toBe('Some events')
    })

    it('requires noItemsMessage prop', () => {
      const wrapper = createWrapper({ noItemsMessage: 'Empty' })
      expect(wrapper.props('noItemsMessage')).toBe('Empty')
    })

    it('requires featureComponent prop', () => {
      const wrapper = createWrapper({ featureComponent: 'CommunityEvent' })
      expect(wrapper.props('featureComponent')).toBe('CommunityEvent')
    })

    it('requires addModalComponent prop', () => {
      const wrapper = createWrapper({
        addModalComponent: 'CommunityEventModal',
      })
      expect(wrapper.props('addModalComponent')).toBe('CommunityEventModal')
    })

    it('requires itemKey prop', () => {
      const wrapper = createWrapper({ itemKey: 'event-' })
      expect(wrapper.props('itemKey')).toBe('event-')
    })
  })
})
