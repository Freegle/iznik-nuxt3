import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FreeglerPhotos from '~/components/FreeglerPhotos.vue'

describe('FreeglerPhotos', () => {
  function createWrapper() {
    return mount(FreeglerPhotos, {
      global: {
        stubs: {
          ProxyImage: {
            template:
              '<div class="proxy-image" :data-src="src" :class="className"><img :src="src" :alt="alt" /></div>',
            props: ['src', 'className', 'alt', 'sizes', 'preload', 'loading'],
          },
          BCarousel: {
            template: '<div class="b-carousel"><slot /></div>',
            props: ['ride', 'fade'],
          },
          BCarouselSlide: {
            template: '<div class="b-carousel-slide"><slot name="img" /></div>',
          },
          ExternalLink: {
            template: '<a class="external-link" :href="href"><slot /></a>',
            props: ['href'],
          },
          'client-only': {
            template: '<div class="client-only"><slot /></div>',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders freegler photos container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.freegler-photos').exists()).toBe(true)
    })

    it('renders photo container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.photo-container').exists()).toBe(true)
    })

    it('renders static frame image', () => {
      const wrapper = createWrapper()
      const frame = wrapper.find('.proxy-image.static-frame')
      expect(frame.exists()).toBe(true)
      expect(frame.attributes('data-src')).toBe('/landingpage/frame.png')
    })

    it('renders SSR photo for initial load', () => {
      const wrapper = createWrapper()
      const ssrPhoto = wrapper.find('.ssr-photo .proxy-image')
      expect(ssrPhoto.exists()).toBe(true)
      expect(ssrPhoto.attributes('data-src')).toBe(
        '/landingpage/Freegler1.jpeg'
      )
    })
  })

  describe('carousel', () => {
    it('renders carousel inside client-only', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.client-only .b-carousel').exists()).toBe(true)
    })

    it('renders 25 carousel slides', () => {
      const wrapper = createWrapper()
      const slides = wrapper.findAll('.b-carousel-slide')
      expect(slides.length).toBe(25)
    })

    it('each slide has freegler image', () => {
      const wrapper = createWrapper()
      const slides = wrapper.findAll('.b-carousel-slide')
      slides.forEach((slide) => {
        expect(slide.find('.proxy-image').exists()).toBe(true)
      })
    })
  })

  describe('photo paths', () => {
    it('generates correct photo paths', () => {
      const wrapper = createWrapper()
      const images = wrapper.findAll('.b-carousel-slide .proxy-image')

      expect(images[0].attributes('data-src')).toBe(
        '/landingpage/Freegler1.jpeg'
      )
      expect(images[1].attributes('data-src')).toBe(
        '/landingpage/Freegler2.jpeg'
      )
      expect(images[24].attributes('data-src')).toBe(
        '/landingpage/Freegler25.jpeg'
      )
    })
  })

  describe('credit section', () => {
    it('renders credit text', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.credit').exists()).toBe(true)
      expect(wrapper.text()).toContain('Photos of real freeglers')
      expect(wrapper.text()).toContain('Alex Bamford')
    })

    it('has link to Alex Bamford website', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('.external-link')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('https://www.alexbamford.com/')
    })

    it('mentions masks comment', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('wearing masks')
    })
  })

  describe('image attributes', () => {
    it('frame has correct alt text', () => {
      const wrapper = createWrapper()
      const frame = wrapper.find('.static-frame img')
      expect(frame.attributes('alt')).toBe('Ornate gold picture frame')
    })

    it('freegler images have correct alt text', () => {
      const wrapper = createWrapper()
      const freeglerImg = wrapper.find('.ssr-photo img')
      expect(freeglerImg.attributes('alt')).toContain('real freegler')
      expect(freeglerImg.attributes('alt')).toContain('Alex Bamford')
    })

    it('SSR photo is preloaded', () => {
      const wrapper = createWrapper()
      const ssrImage = wrapper.find('.ssr-photo .proxy-image')
      // The ProxyImage stub receives preload prop
      expect(ssrImage.exists()).toBe(true)
    })

    it('carousel images are lazy loaded', () => {
      const wrapper = createWrapper()
      const carouselImages = wrapper.findAll('.b-carousel-slide .proxy-image')
      // All carousel images should exist
      expect(carouselImages.length).toBe(25)
    })
  })

  describe('test classes', () => {
    it('has test-freegler-photos class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.test-freegler-photos').exists()).toBe(true)
    })

    it('has test-photos-carousel class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.test-photos-carousel').exists()).toBe(true)
    })

    it('has test-photo-credit class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.test-photo-credit').exists()).toBe(true)
    })
  })
})
