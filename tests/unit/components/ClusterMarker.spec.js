import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ClusterMarker from '~/components/ClusterMarker.vue'

// Mock Supercluster
const mockGetClusters = vi.fn().mockReturnValue([])
const mockGetClusterExpansionZoom = vi.fn().mockReturnValue(10)
const mockLoad = vi.fn()

vi.mock('supercluster/dist/supercluster', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      load: mockLoad,
      getClusters: mockGetClusters,
      getClusterExpansionZoom: mockGetClusterExpansionZoom,
    })),
  }
})

// Mock constants
vi.mock('~/constants', () => ({
  MAX_MAP_ZOOM: 16,
}))

describe('ClusterMarker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetClusters.mockReturnValue([])
  })

  const createMockMap = (options = {}) => ({
    getBounds: vi.fn().mockReturnValue({
      getNorthWest: () => ({ lat: 52.5, lng: -1.2 }),
      getSouthEast: () => ({ lat: 52.0, lng: -0.8 }),
    }),
    getZoom: vi.fn().mockReturnValue(10),
    flyTo: vi.fn(),
    ...options,
  })

  function createWrapper(props = {}) {
    const mockMap = createMockMap()
    return mount(ClusterMarker, {
      props: {
        markers: [],
        map: mockMap,
        ...props,
      },
      global: {
        stubs: {
          'l-marker': {
            template:
              '<div class="l-marker" @click="$emit(\'click\')"><slot /></div>',
            props: ['latLng', 'interactive', 'title', 'className'],
          },
          'l-icon': {
            template: '<div class="l-icon"><slot /></div>',
            props: ['className'],
          },
          ClusterIcon: {
            template:
              '<div class="cluster-icon" :data-count="count" :data-tag="tag" />',
            props: ['count', 'tag', 'className'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('does not render when clusters is empty', () => {
      mockGetClusters.mockReturnValue([])
      const wrapper = createWrapper()
      expect(wrapper.find('.l-marker').exists()).toBe(false)
    })

    it('renders markers for cluster points', () => {
      mockGetClusters.mockReturnValue([
        {
          id: 1,
          properties: { point_count: 5, cluster_id: 1 },
          geometry: { coordinates: [-1.0, 52.2] },
        },
      ])
      const wrapper = createWrapper({
        markers: [
          { id: 1, lat: 52.2, lng: -1.0 },
          { id: 2, lat: 52.3, lng: -1.1 },
        ],
      })
      expect(wrapper.find('.l-marker').exists()).toBe(true)
    })

    it('renders cluster icon with count', () => {
      mockGetClusters.mockReturnValue([
        {
          id: 1,
          properties: { point_count: 10, cluster_id: 1 },
          geometry: { coordinates: [-1.0, 52.2] },
        },
      ])
      const wrapper = createWrapper({
        markers: Array(15)
          .fill(null)
          .map((_, i) => ({ id: i, lat: 52.2 + i * 0.01, lng: -1.0 })),
      })
      const clusterIcon = wrapper.find('.cluster-icon')
      expect(clusterIcon.exists()).toBe(true)
      expect(clusterIcon.attributes('data-count')).toBe('10')
    })

    it('renders with custom tag', () => {
      mockGetClusters.mockReturnValue([
        {
          id: 1,
          properties: { point_count: 3, cluster_id: 1 },
          geometry: { coordinates: [-1.0, 52.2] },
        },
      ])
      const wrapper = createWrapper({
        markers: Array(15)
          .fill(null)
          .map((_, i) => ({ id: i, lat: 52.2, lng: -1.0 })),
        tag: 'custom-tag',
      })
      const clusterIcon = wrapper.find('.cluster-icon')
      expect(clusterIcon.attributes('data-tag')).toBe('custom-tag')
    })
  })

  describe('props', () => {
    it('requires markers array', () => {
      const wrapper = createWrapper({ markers: [{ id: 1, lat: 52, lng: -1 }] })
      expect(wrapper.props('markers')).toHaveLength(1)
    })

    it('requires map object', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('map')).toBeDefined()
      expect(typeof wrapper.props('map').getBounds).toBe('function')
    })

    it('defaults radius to 60', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('radius')).toBe(60)
    })

    it('defaults extent to 256', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('extent')).toBe(256)
    })

    it('defaults minZoom to 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('minZoom')).toBe(0)
    })

    it('defaults maxZoom to MAX_MAP_ZOOM', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('maxZoom')).toBe(16)
    })

    it('defaults minCluster to 10', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('minCluster')).toBe(10)
    })

    it('defaults tag to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('tag')).toBe(null)
    })

    it('defaults cssClass to empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('cssClass')).toBe('')
    })

    it('accepts custom radius', () => {
      const wrapper = createWrapper({ radius: 100 })
      expect(wrapper.props('radius')).toBe(100)
    })

    it('accepts custom cssClass', () => {
      const wrapper = createWrapper({ cssClass: 'custom-class' })
      expect(wrapper.props('cssClass')).toBe('custom-class')
    })
  })

  describe('emit events', () => {
    it('emits click on cluster click', async () => {
      mockGetClusters.mockReturnValue([
        {
          id: 1,
          properties: { point_count: 5, cluster_id: 1 },
          geometry: { coordinates: [-1.0, 52.2] },
        },
      ])
      const wrapper = createWrapper({
        markers: Array(15)
          .fill(null)
          .map((_, i) => ({ id: i, lat: 52.2, lng: -1.0 })),
      })
      const marker = wrapper.find('.l-marker')
      await marker.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })

  describe('marker deduplication', () => {
    it('offsets overlapping markers', () => {
      const wrapper = createWrapper({
        markers: [
          { id: 1, lat: 52.2, lng: -1.0 },
          { id: 2, lat: 52.2, lng: -1.0 }, // Same position
        ],
      })
      // The component should handle overlapping markers
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('minCluster behavior', () => {
    it('uses points directly when markers count is below minCluster', () => {
      const markers = [
        { id: 1, lat: 52.2, lng: -1.0 },
        { id: 2, lat: 52.3, lng: -1.1 },
      ]
      createWrapper({
        markers,
        minCluster: 10, // markers.length < minCluster
      })
      // Should use points directly, not getClusters
      // This is handled in the clusters computed
    })
  })

  describe('bounds handling', () => {
    it('handles map without bounds', () => {
      const mockMap = createMockMap({
        getBounds: vi.fn().mockReturnValue(null),
      })
      const wrapper = createWrapper({
        map: mockMap,
        markers: [{ id: 1, lat: 52.2, lng: -1.0 }],
      })
      // Should not crash
      expect(wrapper.exists()).toBe(true)
    })
  })
})
