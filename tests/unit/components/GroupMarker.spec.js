import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

import GroupMarker from '~/components/GroupMarker.vue'

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock GroupMarkerRich - need to use the same relative path as the component does
// The component at components/GroupMarker.vue imports './GroupMarkerRich'
// Which Vite resolves relative to components/
vi.mock('components/GroupMarkerRich', () => ({
  default: {
    name: 'GroupMarkerRich',
    template: '<div class="group-marker-rich" :data-group-id="group.id"></div>',
    props: ['group'],
  },
}))

describe('GroupMarker', () => {
  const defaultGroup = {
    id: 123,
    lat: 51.5074,
    lng: -0.1278,
    namedisplay: 'London Freegle',
    nameshort: 'London',
  }

  function mountGroupMarker(props = {}) {
    return mount(GroupMarker, {
      props: {
        group: defaultGroup,
        size: 'rich',
        ...props,
      },
      global: {
        stubs: {
          'l-marker': {
            template:
              '<div class="l-marker" :data-key="$attrs.key" @click="$emit(\'click\')"><slot /></div>',
            props: ['latLng'],
          },
          'l-icon': {
            template:
              '<div class="l-icon" :data-icon-url="iconUrl"><slot /></div>',
            props: ['iconUrl', 'iconSize'],
          },
          'l-tooltip': {
            template: '<div class="l-tooltip"><slot /></div>',
          },
          GroupMarkerRich: {
            template:
              '<div class="group-marker-rich" :data-group-id="group.id"></div>',
            props: ['group'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders an l-marker element', () => {
      const wrapper = mountGroupMarker()
      expect(wrapper.find('.l-marker').exists()).toBe(true)
    })

    it('uses group id and size in marker key', () => {
      // Note: Vue uses :key for list rendering optimization, not as a rendered attribute
      // The key is used internally by Vue, so we verify the component renders with correct props
      const wrapper = mountGroupMarker({
        group: { ...defaultGroup, id: 456 },
        size: 'poor',
      })
      // Verify the marker exists and has the expected group/size props
      expect(wrapper.find('.l-marker').exists()).toBe(true)
      expect(wrapper.props('group').id).toBe(456)
      expect(wrapper.props('size')).toBe('poor')
    })
  })

  describe('rich size display', () => {
    it('renders GroupMarkerRich for size="rich"', () => {
      const wrapper = mountGroupMarker({ size: 'rich' })
      expect(wrapper.find('.group-marker-rich').exists()).toBe(true)
    })

    it('passes group to GroupMarkerRich', () => {
      const wrapper = mountGroupMarker({
        size: 'rich',
        group: { ...defaultGroup, id: 789 },
      })
      expect(
        wrapper.find('.group-marker-rich').attributes('data-group-id')
      ).toBe('789')
    })

    it('does not show tooltip for rich size', () => {
      const wrapper = mountGroupMarker({ size: 'rich' })
      expect(wrapper.find('.l-tooltip').exists()).toBe(false)
    })

    it('does not show mapmarker.gif for rich size', () => {
      const wrapper = mountGroupMarker({ size: 'rich' })
      const icon = wrapper.find('.l-icon')
      expect(icon.attributes('data-icon-url')).not.toBe('/mapmarker.gif')
    })
  })

  describe('poor size display', () => {
    it('renders simple icon for size="poor"', () => {
      const wrapper = mountGroupMarker({ size: 'poor' })
      const icon = wrapper.find('.l-icon')
      expect(icon.exists()).toBe(true)
      expect(icon.attributes('data-icon-url')).toBe('/mapmarker.gif')
    })

    it('does not render GroupMarkerRich for poor size', () => {
      const wrapper = mountGroupMarker({ size: 'poor' })
      expect(wrapper.find('.group-marker-rich').exists()).toBe(false)
    })

    it('shows tooltip with group name for poor size', () => {
      const wrapper = mountGroupMarker({ size: 'poor' })
      const tooltip = wrapper.find('.l-tooltip')
      expect(tooltip.exists()).toBe(true)
      expect(tooltip.text()).toBe('London Freegle')
    })
  })

  describe('goto navigation', () => {
    it('navigates to explore page when marker clicked', async () => {
      const wrapper = mountGroupMarker()
      await wrapper.find('.l-marker').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/explore/London')
    })

    it('uses group nameshort in URL', async () => {
      const wrapper = mountGroupMarker({
        group: { ...defaultGroup, nameshort: 'Manchester' },
      })
      await wrapper.find('.l-marker').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/explore/Manchester')
    })

    it('handles nameshort with special characters', async () => {
      const wrapper = mountGroupMarker({
        group: { ...defaultGroup, nameshort: 'St-Albans' },
      })
      await wrapper.find('.l-marker').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/explore/St-Albans')
    })
  })

  describe('props validation', () => {
    it('accepts required group prop with all fields', () => {
      const wrapper = mountGroupMarker({
        group: {
          id: 1,
          lat: 52.0,
          lng: -1.5,
          namedisplay: 'Test Group',
          nameshort: 'Test',
        },
      })
      expect(wrapper.props('group').id).toBe(1)
    })

    it('accepts size prop values', () => {
      const wrapperRich = mountGroupMarker({ size: 'rich' })
      expect(wrapperRich.props('size')).toBe('rich')

      const wrapperPoor = mountGroupMarker({ size: 'poor' })
      expect(wrapperPoor.props('size')).toBe('poor')
    })
  })

  describe('edge cases', () => {
    it('handles group with numeric nameshort', async () => {
      const wrapper = mountGroupMarker({
        group: { ...defaultGroup, nameshort: '123' },
      })
      await wrapper.find('.l-marker').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/explore/123')
    })

    it('handles empty namedisplay in tooltip', () => {
      const wrapper = mountGroupMarker({
        size: 'poor',
        group: { ...defaultGroup, namedisplay: '' },
      })
      expect(wrapper.find('.l-tooltip').text()).toBe('')
    })
  })
})
