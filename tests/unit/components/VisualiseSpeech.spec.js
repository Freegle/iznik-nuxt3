import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VisualiseSpeech from '~/components/VisualiseSpeech.vue'

describe('VisualiseSpeech', () => {
  function createWrapper(props = {}) {
    return mount(VisualiseSpeech, {
      props: {
        text: 'Hello World',
        latLng: [51.5, -0.1],
        ...props,
      },
      global: {
        stubs: {
          'l-marker': {
            template:
              '<div class="l-marker" :data-latlng="latLng"><slot /></div>',
            props: ['latLng'],
          },
          'l-icon': {
            template: '<div class="l-icon"><slot /></div>',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders marker', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.l-marker').exists()).toBe(true)
    })

    it('renders icon inside marker', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.l-marker .l-icon').exists()).toBe(true)
    })

    it('renders speech bubble', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.speech-bubble').exists()).toBe(true)
    })

    it('displays text in speech bubble', () => {
      const wrapper = createWrapper({ text: 'Test message' })
      expect(wrapper.find('.speech-bubble h3').text()).toBe('Test message')
    })
  })

  describe('props', () => {
    it('requires text prop', () => {
      const wrapper = createWrapper({ text: 'My text' })
      expect(wrapper.props('text')).toBe('My text')
    })

    it('requires latLng prop', () => {
      const wrapper = createWrapper({ latLng: [52.0, -1.0] })
      expect(wrapper.props('latLng')).toEqual([52.0, -1.0])
    })

    it('passes latLng to marker', () => {
      const wrapper = createWrapper({ latLng: [50.5, -2.5] })
      const marker = wrapper.find('.l-marker')
      expect(marker.attributes('data-latlng')).toBe('50.5,-2.5')
    })
  })

  describe('styling classes', () => {
    it('has thick class for border', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.thick').exists()).toBe(true)
    })

    it('has wide class for positioning', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.wide').exists()).toBe(true)
    })

    it('has bg-white for background', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.bg-white').exists()).toBe(true)
    })

    it('has text-center for centering', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.text-center').exists()).toBe(true)
    })

    it('has rounded class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.rounded').exists()).toBe(true)
    })
  })
})
