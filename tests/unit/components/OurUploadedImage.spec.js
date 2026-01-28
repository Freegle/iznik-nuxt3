import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import OurUploadedImage from '~/components/OurUploadedImage.vue'

vi.mock('@sentry/browser', () => ({
  captureMessage: vi.fn(),
}))

describe('OurUploadedImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(OurUploadedImage, {
      props: {
        src: 'abc123',
        ...props,
      },
      global: {
        stubs: {
          NuxtPicture: {
            template:
              '<img class="nuxt-picture" :src="src" :alt="alt" :class="imageClass" :data-provider="provider" :data-modifiers="modString" :width="width" :height="height" :loading="loading" @error="$emit(\'error\', $event)" />',
            props: [
              'src',
              'alt',
              'format',
              'fit',
              'preload',
              'provider',
              'modifiers',
              'class',
              'width',
              'height',
              'loading',
              'sizes',
              'placeholder',
            ],
            emits: ['error'],
            computed: {
              imageClass() {
                return this.class
              },
              modString() {
                return JSON.stringify(this.modifiers)
              },
            },
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders NuxtPicture when show is true', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)
    })

    it('passes src to NuxtPicture', () => {
      const wrapper = createWrapper({ src: 'image123' })
      expect(wrapper.find('.nuxt-picture').attributes('src')).toBe('image123')
    })

    it('passes alt to NuxtPicture', () => {
      const wrapper = createWrapper({ alt: 'Test image' })
      expect(wrapper.find('.nuxt-picture').attributes('alt')).toBe('Test image')
    })
  })

  describe('provider selection', () => {
    it('uses uploadcare by default', () => {
      const wrapper = createWrapper({ src: 'regular-image-id' })
      expect(wrapper.find('.nuxt-picture').attributes('data-provider')).toBe(
        'uploadcare'
      )
    })

    it('uses weserv for freegletusd- prefixed sources', () => {
      const wrapper = createWrapper({ src: 'freegletusd-image.jpg' })
      expect(wrapper.find('.nuxt-picture').attributes('data-provider')).toBe(
        'weserv'
      )
    })

    it('strips freegletusd- prefix from source', () => {
      const wrapper = createWrapper({ src: 'freegletusd-myimage.jpg' })
      expect(wrapper.find('.nuxt-picture').attributes('src')).toBe(
        'myimage.jpg'
      )
    })
  })

  describe('modifiers', () => {
    it('passes null modifiers when not provided', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.nuxt-picture').attributes('data-modifiers')).toBe(
        'null'
      )
    })

    it('parses string modifiers to object', () => {
      const wrapper = createWrapper({
        modifiers: '{"width": 100}',
      })
      expect(wrapper.find('.nuxt-picture').attributes('data-modifiers')).toBe(
        '{"width":100}'
      )
    })

    it('passes object modifiers directly', () => {
      const wrapper = createWrapper({
        modifiers: { width: 200 },
      })
      expect(wrapper.find('.nuxt-picture').attributes('data-modifiers')).toBe(
        '{"width":200}'
      )
    })
  })

  describe('CSS classes', () => {
    it('applies className when provided', () => {
      const wrapper = createWrapper({ className: 'custom-class' })
      expect(wrapper.find('.nuxt-picture').attributes('class')).toContain(
        'custom-class'
      )
    })

    it('applies img-fluid when fluid is true', () => {
      const wrapper = createWrapper({ fluid: true })
      expect(wrapper.find('.nuxt-picture').attributes('class')).toContain(
        'img-fluid'
      )
    })

    it('does not apply img-fluid when fluid is false', () => {
      const wrapper = createWrapper({ fluid: false })
      const classes = wrapper.find('.nuxt-picture').attributes('class') || ''
      expect(classes).not.toContain('img-fluid')
    })

    it('applies ai-image-duotone when modifiers has ai: true', () => {
      const wrapper = createWrapper({
        modifiers: { ai: true },
      })
      expect(wrapper.find('.nuxt-picture').attributes('class')).toContain(
        'ai-image-duotone'
      )
    })

    it('applies ai-image-duotone when string modifiers has ai: true', () => {
      const wrapper = createWrapper({
        modifiers: '{"ai": true}',
      })
      expect(wrapper.find('.nuxt-picture').attributes('class')).toContain(
        'ai-image-duotone'
      )
    })

    it('does not apply ai class when ai is false', () => {
      const wrapper = createWrapper({
        modifiers: { ai: false },
      })
      const classes = wrapper.find('.nuxt-picture').attributes('class') || ''
      expect(classes).not.toContain('ai-image-duotone')
    })

    it('combines multiple classes', () => {
      const wrapper = createWrapper({
        className: 'custom',
        fluid: true,
        modifiers: { ai: true },
      })
      const classes = wrapper.find('.nuxt-picture').attributes('class')
      expect(classes).toContain('custom')
      expect(classes).toContain('img-fluid')
      expect(classes).toContain('ai-image-duotone')
    })
  })

  describe('error handling', () => {
    it('hides image on error', async () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)

      await wrapper.vm.brokenImage({ target: {} })
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.nuxt-picture').exists()).toBe(false)
    })

    it('emits error event on broken image', async () => {
      const wrapper = createWrapper()
      const mockEvent = { target: {} }

      await wrapper.vm.brokenImage(mockEvent)

      expect(wrapper.emitted('error')).toBeTruthy()
      expect(wrapper.emitted('error')[0][0]).toBe(mockEvent)
    })
  })

  describe('loading behavior', () => {
    it('uses lazy loading by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.nuxt-picture').attributes('loading')).toBe('lazy')
    })

    it('uses eager loading when preload is true', () => {
      const wrapper = createWrapper({ preload: true })
      expect(wrapper.find('.nuxt-picture').attributes('loading')).toBe('eager')
    })

    it('respects custom loading value when not preloading', () => {
      const wrapper = createWrapper({ loading: 'eager', preload: false })
      expect(wrapper.find('.nuxt-picture').attributes('loading')).toBe('eager')
    })
  })

  describe('image properties', () => {
    it('passes width and height', () => {
      const wrapper = createWrapper({ width: 300, height: 200 })
      expect(wrapper.find('.nuxt-picture').attributes('width')).toBe('300')
      expect(wrapper.find('.nuxt-picture').attributes('height')).toBe('200')
    })

    it('defaults format to webp', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('format')).toBe('webp')
    })

    it('defaults fit to cover', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('fit')).toBe('cover')
    })
  })

  describe('props', () => {
    it('requires src prop', () => {
      const wrapper = createWrapper({ src: 'test-src' })
      expect(wrapper.props('src')).toBe('test-src')
    })

    it('has optional modifiers prop', () => {
      const wrapper = createWrapper({ modifiers: { test: true } })
      expect(wrapper.props('modifiers')).toEqual({ test: true })
    })

    it('has optional preload prop defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('preload')).toBe(false)
    })

    it('has optional className prop', () => {
      const wrapper = createWrapper({ className: 'my-class' })
      expect(wrapper.props('className')).toBe('my-class')
    })

    it('has optional fluid prop defaulting to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('fluid')).toBe(false)
    })

    it('has optional sizes prop', () => {
      const wrapper = createWrapper({ sizes: '100vw' })
      expect(wrapper.props('sizes')).toBe('100vw')
    })

    it('has optional placeholder prop', () => {
      const wrapper = createWrapper({ placeholder: 'placeholder.jpg' })
      expect(wrapper.props('placeholder')).toBe('placeholder.jpg')
    })
  })
})
