import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProxyImage from '~/components/ProxyImage.vue'

// Mock Sentry
vi.mock('@sentry/browser', () => ({
  captureMessage: vi.fn(),
}))

describe('ProxyImage', () => {
  function createWrapper(props = {}) {
    return mount(ProxyImage, {
      props: {
        src: '/test/image.jpg',
        ...props,
      },
      global: {
        stubs: {
          NuxtPicture: {
            template:
              '<span><img :src="src" :alt="alt" :width="width" :height="height" :loading="loading" :placeholder="placeholder" @error="$emit(\'error\', $event)" /></span>',
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
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders an img element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('img').exists()).toBe(true)
    })

    it('sets src attribute', () => {
      const wrapper = createWrapper({ src: '/my/photo.png' })
      expect(wrapper.find('img').attributes('src')).toBe('/my/photo.png')
    })

    it('sets alt attribute', () => {
      const wrapper = createWrapper({ alt: 'Test image' })
      expect(wrapper.find('img').attributes('alt')).toBe('Test image')
    })

    it('sets width attribute', () => {
      const wrapper = createWrapper({ width: 200 })
      expect(wrapper.find('img').attributes('width')).toBe('200')
    })

    it('sets height attribute', () => {
      const wrapper = createWrapper({ height: 150 })
      expect(wrapper.find('img').attributes('height')).toBe('150')
    })

    it('sets placeholder attribute', () => {
      const wrapper = createWrapper({ placeholder: 'blur' })
      expect(wrapper.find('img').attributes('placeholder')).toBe('blur')
    })
  })

  describe('className prop', () => {
    it('applies className to wrapper span', () => {
      const wrapper = createWrapper({ className: 'custom-class' })
      expect(wrapper.find('span').classes()).toContain('custom-class')
    })

    it('handles null className', () => {
      const wrapper = createWrapper({ className: null })
      expect(wrapper.find('span').exists()).toBe(true)
    })
  })

  describe('error handling', () => {
    it('emits error event on broken image', async () => {
      const wrapper = createWrapper()
      await wrapper.find('img').trigger('error')
      expect(wrapper.emitted('error')).toBeTruthy()
    })
  })

  describe('props', () => {
    it('requires src prop', () => {
      const wrapper = createWrapper({ src: '/required/image.jpg' })
      expect(wrapper.props('src')).toBe('/required/image.jpg')
    })

    it('defaults modifiers to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('modifiers')).toBe(null)
    })

    it('defaults preload to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('preload')).toBe(false)
    })

    it('defaults loading to lazy', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('loading')).toBe('lazy')
    })

    it('defaults className to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('className')).toBe(null)
    })

    it('defaults fluid to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('fluid')).toBe(false)
    })

    it('defaults fit to inside', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('fit')).toBe('inside')
    })

    it('defaults format to webp', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('format')).toBe('webp')
    })

    it('defaults alt to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('alt')).toBe(null)
    })

    it('defaults width to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('width')).toBe(null)
    })

    it('defaults height to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('height')).toBe(null)
    })

    it('defaults sizes to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('sizes')).toBe(null)
    })

    it('defaults placeholder to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('placeholder')).toBe(null)
    })
  })
})
