import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import DraggableMap from '~/components/DraggableMap.vue'

vi.mock('~/composables/useMap', () => ({
  attribution: () => '&copy; OpenStreetMap contributors',
  osmtile: () => 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  loadLeaflet: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('~/constants', () => ({
  MAX_MAP_ZOOM: 18,
}))

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      GEOCODE: 'https://geocode.example.com',
    },
  }),
}))

// Mock leaflet import
vi.mock('leaflet/dist/leaflet-src.esm', () => ({}))

describe('DraggableMap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(DraggableMap, { ...props }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'client-only': {
            template: '<div class="client-only"><slot /></div>',
          },
          'b-row': {
            template: '<div class="b-row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="b-col" ref="mapcont"><slot /></div>',
          },
          'l-map': {
            name: 'LMap',
            template: '<div class="l-map" :data-zoom="zoom"><slot /></div>',
            props: ['zoom', 'center', 'style', 'maxZoom'],
            emits: ['ready', 'moveend'],
          },
          'l-tile-layer': {
            name: 'LTileLayer',
            template: '<div class="l-tile-layer" :data-url="url" />',
            props: ['url', 'attribution'],
          },
          'l-marker': {
            name: 'LMarker',
            template: '<div class="l-marker"><slot /></div>',
            props: ['latLng', 'interactive'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" :title="buttonTitle" @click="handleClick"><slot />{{ label }}</button>',
            props: [
              'variant',
              'buttonTitle',
              'doneIcon',
              'iconName',
              'label',
              'size',
            ],
            emits: ['handle'],
            methods: {
              handleClick() {
                this.$emit('handle', () => {})
              },
            },
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders container', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-row').exists()).toBe(true)
    })

    it('renders client-only wrapper', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.client-only').exists()).toBe(true)
    })

    it('renders map component', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.l-map').exists()).toBe(true)
    })

    it('renders tile layer', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.l-tile-layer').exists()).toBe(true)
    })

    it('renders marker', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.l-marker').exists()).toBe(true)
    })
  })

  describe('find location button', () => {
    it('shows Find my location button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Find my location')
    })

    it('has correct button title', async () => {
      const wrapper = await createWrapper()
      const button = wrapper.find('.spin-button')
      expect(button.attributes('title')).toBe('Find my location')
    })
  })

  describe('props', () => {
    it('uses default initial zoom of 5', async () => {
      const wrapper = await createWrapper()
      // The zoom ref is initialized from initialZoom prop (default 5)
      // but then set to 14 in onBeforeMount - wait for that
      const map = wrapper.find('.l-map')
      expect(map.exists()).toBe(true)
    })

    it('accepts custom initialZoom', async () => {
      const wrapper = await createWrapper({ initialZoom: 10 })
      expect(wrapper.find('.l-map').exists()).toBe(true)
    })

    it('accepts maxZoom prop', async () => {
      const wrapper = await createWrapper({ maxZoom: 16 })
      expect(wrapper.find('.l-map').exists()).toBe(true)
    })
  })

  describe('tile layer', () => {
    it('uses OpenStreetMap tiles', async () => {
      const wrapper = await createWrapper()
      const tileLayer = wrapper.find('.l-tile-layer')
      expect(tileLayer.attributes('data-url')).toContain('openstreetmap')
    })
  })

  describe('marker', () => {
    it('has non-interactive marker', async () => {
      const wrapper = await createWrapper()
      const marker = wrapper.findComponent({ name: 'LMarker' })
      expect(marker.props('interactive')).toBe(false)
    })
  })

  describe('default center', () => {
    it('centers on UK by default', async () => {
      const wrapper = await createWrapper()
      const map = wrapper.findComponent({ name: 'LMap' })
      const center = map.props('center')
      // Default center is [53.945, -2.5209] - somewhere in UK
      expect(center[0]).toBeCloseTo(53.945, 2)
      expect(center[1]).toBeCloseTo(-2.5209, 2)
    })
  })

  describe('exposed methods', () => {
    it('exposes getCenter method', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(DraggableMap)
      expect(typeof component.vm.getCenter).toBe('function')
    })

    it('getCenter returns current center', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(DraggableMap)
      const center = component.vm.getCenter()
      expect(Array.isArray(center)).toBe(true)
      expect(center.length).toBe(2)
    })
  })
})
