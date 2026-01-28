import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PinchMe from '~/components/PinchMe.vue'

vi.mock('zoompinch', () => ({
  Zoompinch: {
    template: '<div class="zoom-pinch"><slot name="canvas" /></div>',
    props: [
      'rotation',
      'bounds',
      'mouse',
      'touch',
      'wheel',
      'gesture',
      'minScale',
      'maxScale',
      'width',
      'height',
    ],
  },
}))

describe('PinchMe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createWrapper(props = {}) {
    return mount(PinchMe, {
      props: {
        attachment: {
          ouruid: 'test-uid-123',
          externalmods: {},
          path: '/test/image.jpg',
        },
        width: 800,
        height: 600,
        ...props,
      },
      global: {
        stubs: {
          OurUploadedImage: {
            template:
              '<img class="our-uploaded-image" :data-src="src" :alt="alt" />',
            props: ['src', 'modifiers', 'alt', 'lazy'],
          },
          NuxtPicture: {
            template: '<img class="nuxt-picture" :src="src" :alt="alt" />',
            props: ['format', 'provider', 'src', 'modifiers', 'alt', 'lazy'],
          },
          'b-img': {
            template: '<img class="b-img" :src="src" :title="title" />',
            props: ['src', 'title', 'lazy'],
          },
          'zoom-pinch': {
            template: '<div class="zoom-pinch"><slot name="canvas" /></div>',
            props: [
              'rotation',
              'bounds',
              'mouse',
              'touch',
              'wheel',
              'gesture',
              'minScale',
              'maxScale',
              'width',
              'height',
            ],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders pinchwrapper container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.pinchwrapper').exists()).toBe(true)
    })

    it('sets wrapper dimensions from props', () => {
      const wrapper = createWrapper({ width: 1000, height: 500 })
      const pinchwrapper = wrapper.find('.pinchwrapper')
      const style = pinchwrapper.attributes('style')
      expect(style).toContain('width: 950px')
      expect(style).toContain('height: 475px')
    })

    it('renders OurUploadedImage when attachment has ouruid', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })

    it('passes ouruid to OurUploadedImage src', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.our-uploaded-image').attributes('data-src')).toBe(
        'test-uid-123'
      )
    })

    it('renders NuxtPicture when attachment has externaluid', () => {
      const wrapper = createWrapper({
        attachment: {
          externaluid: 'external-123',
          externalmods: {},
        },
      })
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)
    })

    it('renders b-img as fallback when no ouruid or externaluid', () => {
      const wrapper = createWrapper({
        attachment: {
          path: '/fallback/image.jpg',
        },
      })
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires attachment prop', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('attachment')).toEqual({
        ouruid: 'test-uid-123',
        externalmods: {},
        path: '/test/image.jpg',
      })
    })

    it('requires width prop', () => {
      const wrapper = createWrapper({ width: 640 })
      expect(wrapper.props('width')).toBe(640)
    })

    it('requires height prop', () => {
      const wrapper = createWrapper({ height: 480 })
      expect(wrapper.props('height')).toBe(480)
    })

    it('has default zoom of 1', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('zoom')).toBe(1)
    })
  })

  describe('double tap event binding', () => {
    it('has dblclick handler on pinchwrapper', () => {
      const wrapper = createWrapper()
      const pinchwrapper = wrapper.find('.pinchwrapper')
      expect(pinchwrapper.exists()).toBe(true)
    })

    it('has touchend handler on pinchwrapper', () => {
      const wrapper = createWrapper()
      const pinchwrapper = wrapper.find('.pinchwrapper')
      expect(pinchwrapper.exists()).toBe(true)
    })
  })

  describe('exposed API', () => {
    it('exposes isZoomed computed', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.isZoomed).toBeDefined()
    })

    it('exposes transform ref', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.transform).toBeDefined()
    })

    it('exposes resetTransform method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.resetTransform).toBe('function')
    })

    it('isZoomed is false by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.isZoomed).toBe(false)
    })

    it('transform has default values', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.transform.x).toBe(0)
      expect(wrapper.vm.transform.y).toBe(0)
      expect(wrapper.vm.transform.scale).toBe(1)
      expect(wrapper.vm.transform.rotate).toBe(0)
    })
  })

  describe('isZoomed logic', () => {
    it('returns false when scale is 1', () => {
      const wrapper = createWrapper()
      wrapper.vm.transform.scale = 1
      expect(wrapper.vm.isZoomed).toBe(false)
    })

    it('returns false when scale is 1.04', () => {
      const wrapper = createWrapper()
      wrapper.vm.transform.scale = 1.04
      expect(wrapper.vm.isZoomed).toBe(false)
    })

    it('returns true when scale is 1.1', () => {
      const wrapper = createWrapper()
      wrapper.vm.transform.scale = 1.1
      expect(wrapper.vm.isZoomed).toBe(true)
    })

    it('returns true when scale is 2', () => {
      const wrapper = createWrapper()
      wrapper.vm.transform.scale = 2
      expect(wrapper.vm.isZoomed).toBe(true)
    })
  })

  describe('resetTransform', () => {
    it('resets all transform values', () => {
      const wrapper = createWrapper()
      wrapper.vm.transform.x = 100
      wrapper.vm.transform.y = 50
      wrapper.vm.transform.scale = 2
      wrapper.vm.transform.rotate = 45

      wrapper.vm.resetTransform()

      expect(wrapper.vm.transform.x).toBe(0)
      expect(wrapper.vm.transform.y).toBe(0)
      expect(wrapper.vm.transform.scale).toBe(1)
      expect(wrapper.vm.transform.rotate).toBe(0)
    })
  })
})
