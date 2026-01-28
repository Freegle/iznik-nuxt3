import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsPreview from '~/components/NewsPreview.vue'

describe('NewsPreview', () => {
  let windowOpenSpy

  beforeEach(() => {
    vi.clearAllMocks()
    windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => {})
  })

  function createWrapper(props = {}) {
    return mount(NewsPreview, {
      props: {
        preview: {
          url: 'https://example.com',
          title: 'Test Title',
          description: 'Test description text',
          image: '/preview.jpg',
        },
        ...props,
      },
      global: {
        stubs: {
          'b-card': {
            template:
              '<div class="b-card" :class="$attrs.class" @click="$emit(\'click\')"><slot /></div>',
            props: ['bgVariant', 'borderVariant', 'noBody'],
            emits: ['click'],
          },
          'b-card-body': {
            template: '<div class="b-card-body"><slot /></div>',
          },
          'b-img': {
            template:
              '<img class="b-img" :src="src" :class="$attrs.class" @error="$emit(\'error\', $event)" />',
            props: ['lazy', 'src'],
            emits: ['error'],
          },
          'read-more': {
            template: '<div class="read-more">{{ text }}</div>',
            props: ['text', 'maxChars'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders card container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })

    it('applies forcebreak and clickme classes', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.forcebreak').exists()).toBe(true)
      expect(wrapper.find('.clickme').exists()).toBe(true)
    })

    it('renders layout div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.layout').exists()).toBe(true)
    })
  })

  describe('title display', () => {
    it('shows h3 title for md size', () => {
      const wrapper = createWrapper({
        preview: { title: 'Medium Title', url: 'https://example.com' },
        size: 'md',
      })
      expect(wrapper.find('h3').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('Medium Title')
    })

    it('shows h5 title for sm size', () => {
      const wrapper = createWrapper({
        preview: { title: 'Small Title', url: 'https://example.com' },
        size: 'sm',
      })
      expect(wrapper.find('h5').exists()).toBe(true)
      expect(wrapper.find('h5').text()).toBe('Small Title')
    })

    it('hides title when not provided', () => {
      const wrapper = createWrapper({
        preview: { url: 'https://example.com' },
      })
      expect(wrapper.find('h3').exists()).toBe(false)
      expect(wrapper.find('h5').exists()).toBe(false)
    })
  })

  describe('image display', () => {
    it('shows previewimage class for md size', () => {
      const wrapper = createWrapper({
        preview: { image: '/test.jpg', url: 'https://example.com' },
        size: 'md',
      })
      expect(wrapper.find('.previewimage').exists()).toBe(true)
    })

    it('shows previewimagesm class for sm size', () => {
      const wrapper = createWrapper({
        preview: { image: '/test.jpg', url: 'https://example.com' },
        size: 'sm',
      })
      expect(wrapper.find('.previewimagesm').exists()).toBe(true)
    })

    it('hides image when not provided', () => {
      const wrapper = createWrapper({
        preview: { title: 'No Image', url: 'https://example.com' },
      })
      expect(wrapper.find('.image .b-img').exists()).toBe(false)
    })

    it('sets image src correctly', () => {
      const wrapper = createWrapper({
        preview: { image: '/my-image.jpg', url: 'https://example.com' },
        size: 'md',
      })
      expect(wrapper.find('.previewimage').attributes('src')).toBe(
        '/my-image.jpg'
      )
    })
  })

  describe('description display', () => {
    it('shows description with read-more for md size', () => {
      const wrapper = createWrapper({
        preview: {
          description: 'Long description text',
          url: 'https://example.com',
        },
        size: 'md',
      })
      expect(wrapper.find('.description .read-more').exists()).toBe(true)
    })

    it('shows description with small class for sm size', () => {
      const wrapper = createWrapper({
        preview: {
          description: 'Small description',
          url: 'https://example.com',
        },
        size: 'sm',
      })
      expect(wrapper.find('.description .small').exists()).toBe(true)
    })

    it('hides description when not provided', () => {
      const wrapper = createWrapper({
        preview: { title: 'No Desc', url: 'https://example.com' },
      })
      expect(wrapper.find('.description p').exists()).toBe(false)
    })
  })

  describe('click behavior', () => {
    it('opens URL in new window on click', async () => {
      const wrapper = createWrapper({
        preview: { url: 'https://freegle.org/test', title: 'Click Me' },
      })

      await wrapper.find('.b-card').trigger('click')

      expect(windowOpenSpy).toHaveBeenCalledWith('https://freegle.org/test')
    })
  })

  describe('error handling', () => {
    it('sets placeholder on image error', () => {
      const wrapper = createWrapper({
        preview: { image: '/broken.jpg', url: 'https://example.com' },
        size: 'md',
      })

      const mockEvent = { target: { src: '' } }
      wrapper.vm.brokenImage(mockEvent)

      expect(mockEvent.target.src).toBe('/placeholder.jpg')
    })
  })

  describe('size prop', () => {
    it('defaults to md', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('size')).toBe('md')
    })

    it('accepts sm size', () => {
      const wrapper = createWrapper({ size: 'sm' })
      expect(wrapper.props('size')).toBe('sm')
    })

    it('does not apply p-1 class for md size', () => {
      const wrapper = createWrapper({ size: 'md' })
      expect(wrapper.find('.b-card.p-1').exists()).toBe(false)
    })

    it('applies p-1 class for sm size', () => {
      const wrapper = createWrapper({ size: 'sm' })
      expect(wrapper.find('.b-card.p-1').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires preview prop', () => {
      const preview = { url: 'https://test.com', title: 'Test' }
      const wrapper = createWrapper({ preview })
      expect(wrapper.props('preview')).toEqual(preview)
    })

    it('has optional size prop with default md', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('size')).toBe('md')
    })
  })
})
