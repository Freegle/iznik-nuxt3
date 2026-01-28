import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import CommunityEvent from '~/components/CommunityEvent.vue'

const mockEvent = {
  id: 123,
  userid: 456,
  title: 'Test Community Event',
  description: 'This is a test event description',
  location: 'Test Location',
  earliestDate: {
    string: {
      start: 'Mon 15 Jan 10:00',
      end: 'Mon 15 Jan 12:00',
    },
  },
  groups: [1, 2],
  image: {
    id: 1,
    path: '/test/image.jpg',
    paththumb: '/test/thumb.jpg',
  },
}

const mockGroup1 = { id: 1, namedisplay: 'Test Group 1' }
const mockGroup2 = { id: 2, namedisplay: 'Test Group 2' }

const mockCommunityEventStore = {
  fetch: vi.fn().mockResolvedValue(mockEvent),
  byId: vi.fn().mockReturnValue(mockEvent),
}

const mockUserStore = {
  fetch: vi.fn().mockResolvedValue({ id: 456, displayname: 'Test User' }),
}

const mockGroupStore = {
  fetch: vi.fn().mockResolvedValue(mockGroup1),
  get: vi.fn((id) => (id === 1 ? mockGroup1 : id === 2 ? mockGroup2 : null)),
}

vi.mock('~/stores/communityevent', () => ({
  useCommunityEventStore: () => mockCommunityEventStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/composables/useTwem', () => ({
  twem: (text) => text,
}))

describe('CommunityEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCommunityEventStore.byId.mockReturnValue({ ...mockEvent })
    mockCommunityEventStore.fetch.mockResolvedValue({ ...mockEvent })
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(CommunityEvent, { id: 123, summary: false, ...props }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a class="nuxt-link" :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'ariaLabel'],
            emits: ['click'],
          },
          'b-img': {
            template: '<img class="b-img" :src="src" />',
            props: ['lazy', 'src'],
          },
          OurUploadedImage: {
            template: '<img class="our-uploaded-image" :src="src" />',
            props: ['src', 'modifiers', 'alt'],
          },
          NuxtPicture: {
            template:
              '<picture class="nuxt-picture"><img :src="src" /></picture>',
            props: ['format', 'fit', 'provider', 'src', 'modifiers', 'alt'],
          },
          'read-more': {
            template: '<div class="read-more">{{ text }}</div>',
            props: ['text', 'maxChars'],
          },
          CommunityEventModal: {
            template: '<div class="community-event-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders event card when event exists', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.event-card').exists()).toBe(true)
    })

    it('does not render when event is null', async () => {
      mockCommunityEventStore.byId.mockReturnValue(null)
      const wrapper = await createWrapper()
      expect(wrapper.find('.event-card').exists()).toBe(false)
    })

    it('renders event title as link', async () => {
      const wrapper = await createWrapper()
      const link = wrapper.find('.nuxt-link')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Test Community Event')
    })
  })

  describe('summary mode', () => {
    it('renders summary content in summary mode', async () => {
      const wrapper = await createWrapper({ summary: true })
      expect(wrapper.find('.event-card__summary').exists()).toBe(true)
    })

    it('shows description in summary mode', async () => {
      const wrapper = await createWrapper({ summary: true })
      expect(wrapper.find('.event-card__desc').exists()).toBe(true)
    })

    it('does not show event ID in summary mode', async () => {
      const wrapper = await createWrapper({ summary: true })
      expect(wrapper.find('.event-card__id').exists()).toBe(false)
    })
  })

  describe('detail mode', () => {
    it('renders detail content in detail mode', async () => {
      const wrapper = await createWrapper({ summary: false })
      expect(wrapper.find('.event-card__detail').exists()).toBe(true)
    })

    it('shows event ID in detail mode', async () => {
      const wrapper = await createWrapper({ summary: false })
      expect(wrapper.find('.event-card__id').text()).toBe('#123')
    })

    it('shows read-more for description', async () => {
      const wrapper = await createWrapper({ summary: false })
      expect(wrapper.find('.read-more').exists()).toBe(true)
    })
  })

  describe('date and location display', () => {
    it('displays event time', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Mon 15 Jan 10:00')
      expect(wrapper.text()).toContain('Mon 15 Jan 12:00')
    })

    it('displays event location', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Test Location')
    })

    it('shows clock icon for date', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-icon="clock"]').exists()).toBe(true)
    })

    it('shows map marker icon for location', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-icon="map-marker-alt"]').exists()).toBe(true)
    })
  })

  describe('groups display', () => {
    it('shows groups in detail mode', async () => {
      const wrapper = await createWrapper({ summary: false })
      expect(wrapper.text()).toContain('Test Group 1')
      expect(wrapper.text()).toContain('Test Group 2')
    })

    it('shows users icon for groups', async () => {
      const wrapper = await createWrapper({ summary: false })
      expect(wrapper.find('[data-icon="users"]').exists()).toBe(true)
    })
  })

  describe('image display', () => {
    it('renders b-img when event has standard image', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })

    it('renders OurUploadedImage when image has ouruid', async () => {
      mockCommunityEventStore.byId.mockReturnValue({
        ...mockEvent,
        image: { ouruid: 'our-123', externalmods: '{}' },
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })

    it('renders NuxtPicture when image has externaluid', async () => {
      mockCommunityEventStore.byId.mockReturnValue({
        ...mockEvent,
        image: { externaluid: 'ext-123', externalmods: '{}' },
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)
    })

    it('does not render image when no image', async () => {
      mockCommunityEventStore.byId.mockReturnValue({
        ...mockEvent,
        image: null,
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(false)
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(false)
    })
  })

  describe('More info button', () => {
    it('renders More info button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('More info')
    })

    it('shows modal when More info clicked', async () => {
      const wrapper = await createWrapper()
      const button = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('More info'))
      await button.trigger('click')
      expect(wrapper.find('.community-event-modal').exists()).toBe(true)
    })
  })

  describe('modal', () => {
    it('does not show modal initially', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.community-event-modal').exists()).toBe(false)
    })
  })

  describe('data fetching', () => {
    it('fetches event on mount', async () => {
      await createWrapper({ id: 456 })
      expect(mockCommunityEventStore.fetch).toHaveBeenCalledWith(456)
    })

    it('fetches user after event fetch', async () => {
      await createWrapper()
      expect(mockUserStore.fetch).toHaveBeenCalledWith(456)
    })

    it('fetches groups from event', async () => {
      await createWrapper()
      expect(mockGroupStore.fetch).toHaveBeenCalled()
    })
  })

  describe('filter by group', () => {
    it('shows event when filterGroup matches', async () => {
      const wrapper = await createWrapper({ filterGroup: 1 })
      expect(wrapper.find('.event-card').exists()).toBe(true)
    })

    it('hides event when filterGroup does not match', async () => {
      const wrapper = await createWrapper({ filterGroup: 999 })
      expect(wrapper.find('.event-card').exists()).toBe(false)
    })
  })

  describe('title tag', () => {
    it('uses h3 by default', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('h3.event-card__header').exists()).toBe(true)
    })

    it('uses custom title tag when specified', async () => {
      const wrapper = await createWrapper({ titleTag: 'h2' })
      expect(wrapper.find('h2.event-card__header').exists()).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('trims description', async () => {
      mockCommunityEventStore.byId.mockReturnValue({
        ...mockEvent,
        description: '  Test description with spaces  ',
      })
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(CommunityEvent)
      expect(component.vm.description).toBe('Test description with spaces')
    })

    it('returns empty string for null description', async () => {
      mockCommunityEventStore.byId.mockReturnValue({
        ...mockEvent,
        description: null,
      })
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(CommunityEvent)
      expect(component.vm.description).toBe('')
    })
  })
})
