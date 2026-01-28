import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import VisualiseMessage from '~/components/VisualiseMessage.vue'

describe('VisualiseMessage', () => {
  function createWrapper(props = {}) {
    return mount(VisualiseMessage, {
      props: {
        id: 1,
        icon: '/test-icon.png',
        lat: 51.5074,
        lng: -0.1278,
        ...props,
      },
      global: {
        stubs: {
          'l-marker': {
            template:
              '<div class="l-marker" :data-lat="latLng[0]" :data-lng="latLng[1]"><slot /></div>',
            props: ['latLng', 'title', 'duration'],
          },
          'l-icon': {
            template: '<div class="l-icon" :data-url="iconUrl" />',
            props: ['iconUrl', 'iconSize', 'iconAnchor', 'className'],
          },
        },
      },
    })
  }

  describe('initial state', () => {
    it('starts with null coordinates before mount', () => {
      const wrapper = createWrapper()
      // After mount, coordinates should be set
      expect(wrapper.vm.currlat).toBe(51.5074)
      expect(wrapper.vm.currlng).toBe(-0.1278)
    })
  })

  describe('after mount', () => {
    it('sets currlat from props', async () => {
      const wrapper = createWrapper({ lat: 40.7128 })
      await flushPromises()
      expect(wrapper.vm.currlat).toBe(40.7128)
    })

    it('sets currlng from props', async () => {
      const wrapper = createWrapper({ lng: -74.006 })
      await flushPromises()
      expect(wrapper.vm.currlng).toBe(-74.006)
    })
  })

  describe('rendering', () => {
    it('renders marker when coordinates are set', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.l-marker').exists()).toBe(true)
    })

    it('renders icon inside marker', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.l-icon').exists()).toBe(true)
    })

    it('passes icon url to l-icon', async () => {
      const wrapper = createWrapper({ icon: '/my-icon.png' })
      await flushPromises()
      expect(wrapper.find('.l-icon').attributes('data-url')).toBe(
        '/my-icon.png'
      )
    })

    it('passes lat/lng to marker', async () => {
      const wrapper = createWrapper({ lat: 52.52, lng: 13.405 })
      await flushPromises()
      expect(wrapper.find('.l-marker').attributes('data-lat')).toBe('52.52')
      expect(wrapper.find('.l-marker').attributes('data-lng')).toBe('13.405')
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 42 })
      expect(wrapper.props('id')).toBe(42)
    })

    it('requires icon prop', () => {
      const wrapper = createWrapper({ icon: '/custom-icon.jpg' })
      expect(wrapper.props('icon')).toBe('/custom-icon.jpg')
    })

    it('requires lat prop', () => {
      const wrapper = createWrapper({ lat: 48.8566 })
      expect(wrapper.props('lat')).toBe(48.8566)
    })

    it('requires lng prop', () => {
      const wrapper = createWrapper({ lng: 2.3522 })
      expect(wrapper.props('lng')).toBe(2.3522)
    })
  })
})
