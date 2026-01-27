import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import NewsCommunityEvent from '~/components/NewsCommunityEvent.vue'

const { mockNewsfeed, mockEvent, mockGroup } = vi.hoisted(() => {
  return {
    mockNewsfeed: {
      id: 1,
      eventid: 100,
      userid: 200,
      added: '2024-01-15T10:00:00Z',
    },
    mockEvent: {
      id: 100,
      title: 'Community Cleanup Day',
      description: 'Join us for a neighborhood cleanup event.',
      location: 'Town Hall, Main Street',
      dates: [
        {
          start: '2024-02-01',
          starttime: '10:00',
          end: '2024-02-01',
          endtime: '14:00',
        },
      ],
      groups: [300],
      image: {
        paththumb: '/images/event.jpg',
      },
    },
    mockGroup: {
      id: 300,
      namedisplay: 'Freegle Community Group',
      nameshort: 'Community',
    },
  }
})

const mockNewsfeedStore = {
  byId: vi.fn().mockReturnValue(mockNewsfeed),
}

const mockCommunityEventStore = {
  fetch: vi.fn().mockResolvedValue(mockEvent),
  byId: vi.fn().mockReturnValue(mockEvent),
}

const mockUserStore = {
  fetch: vi.fn().mockResolvedValue({ id: 200, displayname: 'Organizer' }),
}

const mockGroupStore = {
  fetch: vi.fn().mockResolvedValue(mockGroup),
  get: vi.fn().mockReturnValue(mockGroup),
}

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => mockNewsfeedStore,
}))

vi.mock('~/stores/communityevent', () => ({
  useCommunityEventStore: () => mockCommunityEventStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/composables/useTimeFormat', () => ({
  timeago: vi.fn().mockReturnValue('3 days ago'),
}))

describe('NewsCommunityEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNewsfeedStore.byId.mockReturnValue(mockNewsfeed)
    mockCommunityEventStore.fetch.mockResolvedValue(mockEvent)
    mockCommunityEventStore.byId.mockReturnValue(mockEvent)
    mockGroupStore.get.mockReturnValue(mockGroup)
  })

  function createWrapper(props = {}) {
    return mount(NewsCommunityEvent, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
          },
          'b-img': {
            template: '<img class="b-img" :src="src" />',
            props: ['src', 'lazy'],
          },
          OurUploadedImage: {
            template: '<img class="our-uploaded-image" :src="src" />',
            props: ['src', 'modifiers', 'alt'],
          },
          NuxtPicture: {
            template: '<img class="nuxt-picture" :src="src" />',
            props: ['src', 'format', 'fit', 'provider', 'modifiers', 'alt'],
          },
          NewsLoveComment: {
            template: '<div class="news-love-comment" />',
            props: ['newsfeed'],
            emits: ['focus-comment'],
          },
          CommunityEventModal: {
            template: '<div class="community-event-modal" />',
            props: ['id', 'startEdit'],
            emits: ['hidden'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders community event container', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.community-event').exists()).toBe(true)
    })

    it('shows type badge', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Community event')
    })

    it('shows calendar icon', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('[data-icon="calendar-alt"]').exists()).toBe(true)
    })

    it('shows event title', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Community Cleanup Day')
    })

    it('shows time ago', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('3 days ago')
    })

    it('shows group name', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Freegle Community Group')
    })
  })

  describe('event details', () => {
    it('shows date and time', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('[data-icon="clock"]').exists()).toBe(true)
    })

    it('shows location', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Town Hall, Main Street')
    })

    it('shows location icon', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('[data-icon="map-marker-alt"]').exists()).toBe(true)
    })

    it('shows description', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('neighborhood cleanup event')
    })

    it('shows info icon', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('[data-icon="info-circle"]').exists()).toBe(true)
    })
  })

  describe('event image', () => {
    it('shows image when present', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })

    it('does not show image when not present', async () => {
      mockCommunityEventStore.byId.mockReturnValue({
        ...mockEvent,
        image: null,
      })
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.event-photo').exists()).toBe(false)
    })
  })

  describe('action buttons', () => {
    it('shows More info button', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('More info')
    })

    it('shows Add yours button', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Add yours')
    })

    it('opens more info modal on button click', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      const moreInfoBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('More info'))
      await moreInfoBtn.trigger('click')
      await flushPromises()
      expect(wrapper.findAll('.community-event-modal').length).toBeGreaterThan(
        0
      )
    })

    it('opens add event modal on button click', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      const addBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Add yours'))
      await addBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.community-event-modal').exists()).toBe(true)
    })
  })

  describe('NewsLoveComment', () => {
    it('renders NewsLoveComment component', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.news-love-comment').exists()).toBe(true)
    })

    it('passes newsfeed to NewsLoveComment', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      const loveComment = wrapper.findComponent('.news-love-comment')
      expect(loveComment.props('newsfeed')).toEqual(mockNewsfeed)
    })

    it('emits focus-comment when NewsLoveComment emits', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      const loveComment = wrapper.findComponent('.news-love-comment')
      await loveComment.vm.$emit('focus-comment')
      expect(wrapper.emitted('focus-comment')).toBeTruthy()
    })
  })

  describe('data initialization', () => {
    it('fetches user data', async () => {
      createWrapper()
      await flushPromises()
      expect(mockUserStore.fetch).toHaveBeenCalledWith(200)
    })

    it('fetches event data', async () => {
      createWrapper()
      await flushPromises()
      expect(mockCommunityEventStore.fetch).toHaveBeenCalledWith(100)
    })

    it('fetches group data', async () => {
      createWrapper()
      await flushPromises()
      expect(mockGroupStore.fetch).toHaveBeenCalledWith(300)
    })

    it('emits hide when event fetch fails', async () => {
      mockCommunityEventStore.fetch.mockRejectedValue(new Error('Not found'))
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.emitted('hide')).toBeTruthy()
    })
  })

  describe('date formatting', () => {
    it('handles events with valid dates', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.detail-row').exists()).toBe(true)
    })

    it('handles events without dates', async () => {
      mockCommunityEventStore.byId.mockReturnValue({
        ...mockEvent,
        dates: null,
      })
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('[data-icon="clock"]').exists()).toBe(false)
    })

    it('handles events with empty dates array', async () => {
      mockCommunityEventStore.byId.mockReturnValue({ ...mockEvent, dates: [] })
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('[data-icon="clock"]').exists()).toBe(false)
    })
  })

  describe('styling', () => {
    it('has event-header class', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.event-header').exists()).toBe(true)
    })

    it('has event-title class', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.event-title').exists()).toBe(true)
    })

    it('has event-meta class', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.event-meta').exists()).toBe(true)
    })

    it('has event-content class', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.event-content').exists()).toBe(true)
    })

    it('has event-actions class', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.event-actions').exists()).toBe(true)
    })
  })

  describe('multiple groups', () => {
    it('shows multiple group names', async () => {
      const multiGroupEvent = {
        ...mockEvent,
        groups: [300, 400],
      }
      mockCommunityEventStore.byId.mockReturnValue(multiGroupEvent)
      mockCommunityEventStore.fetch.mockResolvedValue(multiGroupEvent)
      mockGroupStore.get.mockImplementation((id) => {
        if (id === 300) return mockGroup
        if (id === 400) return { id: 400, namedisplay: 'Another Group' }
        return null
      })

      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Freegle Community Group')
    })
  })
})
