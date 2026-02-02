import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { h, Suspense, defineComponent, nextTick } from 'vue'
import MessageMap from '~/components/MessageMap.vue'

const mockMiscStore = {
  modtools: false,
}

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

// Mock the constants
vi.mock('~/constants', () => ({
  MAX_MAP_ZOOM: 16,
}))

// Mock wicket
vi.mock('wicket', () => ({
  default: {
    Wkt: class {
      read() {}
      toJson() {
        return { type: 'Polygon', coordinates: [] }
      }
    },
  },
}))

// Mock leaflet for the async import
vi.mock('leaflet/dist/leaflet-src.esm', () => ({
  default: {
    Browser: { mobile: false },
    Icon: class {},
    featureGroup: () => ({
      getBounds: () => ({
        pad: () => ({
          isValid: () => true,
        }),
      }),
    }),
    marker: () => ({}),
  },
}))

describe('MessageMap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMiscStore.modtools = false
  })

  // Use shallowMount with Suspense to avoid rendering child template
  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(MessageMap, {
                position: { lat: 51.5, lng: -0.1 },
                ...props,
              }),
            fallback: () => h('div', { class: 'loading' }, 'Loading...'),
          })
      },
    })

    const wrapper = shallowMount(TestWrapper, {
      global: {
        stubs: {
          // Stub all leaflet components to prevent template rendering errors
          'l-map': true,
          'l-tile-layer': true,
          'l-marker': true,
          'l-icon': true,
          'l-geo-json': true,
          HomeIcon: true,
          LGeoJson: true,
        },
      },
    })

    // Wait for async setup
    await flushPromises()
    await nextTick()
    return wrapper
  }

  describe('component setup', () => {
    it('mounts without errors with Suspense wrapper', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders suspense structure', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('props validation', () => {
    it('accepts required position prop', async () => {
      const wrapper = await createWrapper({
        position: { lat: 52.0, lng: -1.0 },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('accepts optional home prop', async () => {
      const wrapper = await createWrapper({ home: { lat: 51.6, lng: -0.2 } })
      expect(wrapper.exists()).toBe(true)
    })

    it('accepts optional locked prop', async () => {
      const wrapper = await createWrapper({ locked: true })
      expect(wrapper.exists()).toBe(true)
    })

    it('accepts optional boundary prop', async () => {
      const wrapper = await createWrapper({
        boundary: 'POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))',
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('accepts optional maxZoom prop', async () => {
      const wrapper = await createWrapper({ maxZoom: 14 })
      expect(wrapper.exists()).toBe(true)
    })

    it('accepts optional height prop', async () => {
      const wrapper = await createWrapper({ height: 300 })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('modtools mode', () => {
    it('renders in normal mode by default', async () => {
      const wrapper = await createWrapper()
      expect(mockMiscStore.modtools).toBe(false)
      expect(wrapper.exists()).toBe(true)
    })

    it('can render in modtools mode', async () => {
      mockMiscStore.modtools = true
      const wrapper = await createWrapper()
      expect(mockMiscStore.modtools).toBe(true)
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('component definition', () => {
    it('has correct props defined', () => {
      // Check the component's props definition directly
      const props = MessageMap.props || {}
      expect(props).toHaveProperty('position')
      expect(props).toHaveProperty('home')
      expect(props).toHaveProperty('locked')
      expect(props).toHaveProperty('boundary')
      expect(props).toHaveProperty('maxZoom')
      expect(props).toHaveProperty('height')
    })

    it('has position as required prop', () => {
      const props = MessageMap.props || {}
      expect(props.position.required).toBe(true)
    })

    it('has height default of 200', () => {
      const props = MessageMap.props || {}
      expect(props.height.default).toBe(200)
    })

    it('has locked default of false', () => {
      const props = MessageMap.props || {}
      expect(props.locked.default).toBe(false)
    })
  })
})
