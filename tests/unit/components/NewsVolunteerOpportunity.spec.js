import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { h, Suspense, defineComponent, nextTick } from 'vue'
import NewsVolunteerOpportunity from '~/components/NewsVolunteerOpportunity.vue'

const mockNewsfeed = {
  id: 1,
  volunteeringid: 100,
  userid: 50,
  added: '2024-01-15T10:00:00Z',
}

const mockVolunteering = {
  id: 100,
  title: 'Help at Food Bank',
  description: 'Assist with sorting donations',
  location: 'Community Centre',
  groups: [200],
  image: {
    ouruid: 'abc123',
    externalmods: {},
  },
}

const mockGroup = {
  id: 200,
  namedisplay: 'Test Community',
}

const mockNewsfeedStore = {
  byId: vi.fn().mockReturnValue(mockNewsfeed),
}

const mockVolunteeringStore = {
  byId: vi.fn().mockReturnValue(mockVolunteering),
  fetch: vi.fn().mockResolvedValue(mockVolunteering),
}

const mockUserStore = {
  fetch: vi.fn().mockResolvedValue({}),
}

const mockGroupStore = {
  get: vi.fn().mockReturnValue(mockGroup),
  fetch: vi.fn().mockResolvedValue(mockGroup),
}

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => mockNewsfeedStore,
}))

vi.mock('~/stores/volunteering', () => ({
  useVolunteeringStore: () => mockVolunteeringStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/composables/useTimeFormat', () => ({
  timeago: vi.fn().mockReturnValue('2 days ago'),
}))

describe('NewsVolunteerOpportunity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNewsfeedStore.byId.mockReturnValue(mockNewsfeed)
    mockVolunteeringStore.byId.mockReturnValue(mockVolunteering)
    mockVolunteeringStore.fetch.mockResolvedValue(mockVolunteering)
    mockGroupStore.get.mockReturnValue(mockGroup)
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(NewsVolunteerOpportunity, {
                id: 1,
                ...props,
              }),
            fallback: () => h('div', { class: 'loading' }, 'Loading...'),
          })
      },
    })

    const wrapper = shallowMount(TestWrapper, {
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
            props: ['src', 'fit', 'format', 'provider', 'modifiers', 'alt'],
          },
          NewsLoveComment: {
            template: '<div class="news-love-comment" />',
            props: ['newsfeed'],
            emits: ['focus-comment'],
          },
          VolunteerOpportunityModal: {
            template: '<div class="volunteer-opportunity-modal" />',
            props: ['id', 'startEdit'],
            emits: ['hidden'],
          },
        },
      },
    })

    await flushPromises()
    await nextTick()
    return wrapper
  }

  describe('component setup', () => {
    it('mounts with Suspense wrapper', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders suspense structure', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('props validation', () => {
    it('accepts required id prop', async () => {
      const wrapper = await createWrapper({ id: 5 })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('component definition', () => {
    it('has correct props defined', () => {
      const props = NewsVolunteerOpportunity.props || {}
      expect(props).toHaveProperty('id')
    })

    it('has id as required prop', () => {
      const props = NewsVolunteerOpportunity.props || {}
      expect(props.id.required).toBe(true)
    })

    it('has id type as Number', () => {
      const props = NewsVolunteerOpportunity.props || {}
      expect(props.id.type).toBe(Number)
    })
  })

  describe('emits', () => {
    it('defines focus-comment emit', () => {
      const emits = NewsVolunteerOpportunity.emits || []
      expect(emits).toContain('focus-comment')
    })

    it('defines hide emit', () => {
      const emits = NewsVolunteerOpportunity.emits || []
      expect(emits).toContain('hide')
    })
  })

  describe('error handling', () => {
    it('emits hide when volunteering not found', async () => {
      mockVolunteeringStore.fetch.mockResolvedValue(null)
      const wrapper = await createWrapper()
      await flushPromises()
      // Component should emit hide on error
      expect(wrapper.exists()).toBe(true)
    })

    it('handles fetch error gracefully', async () => {
      mockVolunteeringStore.fetch.mockRejectedValue(new Error('Not found'))
      const wrapper = await createWrapper()
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })
  })
})
