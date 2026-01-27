import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import NewsNoticeboard from '~/components/NewsNoticeboard.vue'

const mockNewsfeed = {
  id: 123,
  userid: 456,
  displayname: 'Test User',
  message: JSON.stringify({
    title: 'Test Noticeboard',
    name: 'Community Board',
    description: 'A description',
    lat: 51.5074,
    lng: -0.1278,
    photo: 'photo123',
  }),
}

const mockNewsfeedStore = {
  byId: vi.fn().mockReturnValue(mockNewsfeed),
}

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => mockNewsfeedStore,
}))

vi.mock('~/composables/useTwem', () => ({
  twem: (text) => text,
}))

vi.mock('~/composables/useMap', () => ({
  attribution: () => 'Map attribution',
  osmtile: () => 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
}))

vi.mock('~/constants', () => ({
  MAX_MAP_ZOOM: 18,
}))

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      IMAGE_SITE: 'https://images.example.com',
    },
  }),
}))

vi.mock('nuxt/app', () => ({
  useRuntimeConfig: () => ({
    public: {
      IMAGE_SITE: 'https://images.example.com',
    },
  }),
}))

describe('NewsNoticeboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNewsfeedStore.byId.mockReturnValue({ ...mockNewsfeed })
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(NewsNoticeboard, { id: 123, ...props }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          NewsUserIntro: {
            template:
              '<div class="news-user-intro" :data-userid="userid">{{ append }}</div>',
            props: ['userid', 'newsfeed', 'append', 'appendBold'],
          },
          'notice-message': {
            template: '<div class="notice-message"><slot /></div>',
          },
          OurUploadedImage: {
            template:
              '<img class="our-uploaded-image" :src="src" @click="$emit(\'click\')" />',
            props: ['src', 'modifiers', 'alt', 'width'],
            emits: ['click'],
          },
          NuxtPicture: {
            template:
              '<picture class="nuxt-picture" @click="$emit(\'click\')"><img :src="src" /></picture>',
            props: [
              'format',
              'fit',
              'provider',
              'src',
              'modifiers',
              'alt',
              'width',
            ],
            emits: ['click'],
          },
          'b-img': {
            template:
              '<img class="b-img" :src="src" @click="$emit(\'click\')" />',
            props: ['rounded', 'lazy', 'src'],
            emits: ['click'],
          },
          'l-map': {
            template: '<div class="l-map"><slot /></div>',
            props: ['zoom', 'maxZoom', 'center', 'style'],
          },
          'l-tile-layer': {
            template: '<div class="l-tile-layer" />',
            props: ['url', 'attribution'],
          },
          'l-marker': {
            template: '<div class="l-marker" />',
            props: ['latLng', 'interactive'],
          },
          NewsLoveComment: {
            template: '<div class="news-love-comment" />',
            props: ['newsfeed'],
            emits: ['focus-comment'],
          },
          'nuxt-link': {
            template: '<a class="nuxt-link" :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant"><slot /></button>',
            props: ['variant', 'size'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          NewsShareModal: {
            template: '<div class="news-share-modal" />',
            props: ['newsfeed'],
            emits: ['hidden'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders NewsUserIntro with userid', async () => {
      const wrapper = await createWrapper()
      const intro = wrapper.find('.news-user-intro')
      expect(intro.exists()).toBe(true)
      expect(intro.attributes('data-userid')).toBe('456')
    })

    it('shows "put up a poster" append text', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('put up a poster')
    })

    it('renders poster promotion text', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('printed a Freegle poster')
    })
  })

  describe('noticeboard info display', () => {
    it('shows noticeboard name', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Community Board')
    })

    it('shows noticeboard description', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('A description')
    })

    it('handles missing name and description', async () => {
      mockNewsfeedStore.byId.mockReturnValue({
        ...mockNewsfeed,
        message: JSON.stringify({ lat: 51, lng: 0 }),
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })
  })

  describe('map display', () => {
    it('renders Leaflet map', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.l-map').exists()).toBe(true)
    })

    it('renders tile layer', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.l-tile-layer').exists()).toBe(true)
    })

    it('renders marker at noticeboard location', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.l-marker').exists()).toBe(true)
    })
  })

  describe('photo handling', () => {
    it('renders b-img when photo exists', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.noticeboard__photo').exists()).toBe(true)
    })

    it('does not render photo section when no photo', async () => {
      mockNewsfeedStore.byId.mockReturnValue({
        ...mockNewsfeed,
        message: JSON.stringify({ name: 'Test', lat: 51, lng: 0 }),
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.noticeboard__photo').exists()).toBe(false)
    })
  })

  describe('call to action', () => {
    it('shows call to action text', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('We need your help')
    })

    it('renders Put up a poster button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Put up a poster')
    })

    it('links to /promote page', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('a[href="/promote"]').exists()).toBe(true)
    })
  })

  describe('NewsLoveComment integration', () => {
    it('renders NewsLoveComment', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-love-comment').exists()).toBe(true)
    })
  })

  describe('share modal', () => {
    it('does not show share modal initially', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-share-modal').exists()).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('handles invalid JSON in message gracefully', async () => {
      mockNewsfeedStore.byId.mockReturnValue({
        ...mockNewsfeed,
        message: 'invalid json',
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.l-map').exists()).toBe(true)
    })
  })
})
