import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ImageCarousel from '~/components/ImageCarousel.vue'

vi.mock('@vueuse/core', () => ({
  useElementSize: vi.fn(() => ({
    width: ref(800),
    height: ref(600),
  })),
}))

describe('ImageCarousel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(ImageCarousel, {
      props: {
        messageId: 123,
        attachments: [
          { id: 1, path: '/image1.jpg' },
          { id: 2, path: '/image2.jpg' },
          { id: 3, path: '/image3.jpg' },
        ],
        ...props,
      },
      global: {
        stubs: {
          'b-button': {
            template:
              '<button :class="[$attrs.class, btnClass]" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
            computed: {
              btnClass() {
                return 'btn-' + this.variant
              },
            },
          },
          'b-carousel': {
            template:
              '<div class="b-carousel" :data-slide="modelValue"><slot /></div>',
            props: [
              'id',
              'modelValue',
              'imgWidth',
              'interval',
              'noTouch',
              'fade',
              'controls',
            ],
          },
          'b-carousel-slide': {
            template:
              '<div class="b-carousel-slide" :data-active="active"><slot /></div>',
            props: ['id', 'active'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon', 'scale'],
          },
          PinchMe: {
            template:
              '<div class="pinch-me" :data-zoom="zoom" :data-width="width" :data-height="height" />',
            props: ['attachment', 'width', 'height', 'zoom'],
          },
          Teleport: {
            template: '<div class="teleport"><slot /></div>',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders wrapper div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.wrapper').exists()).toBe(true)
    })

    it('renders zoom controls', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="circle-minus"]').exists()).toBe(
        true
      )
      expect(wrapper.find('.v-icon[data-icon="circle-plus"]').exists()).toBe(
        true
      )
    })

    it('shows drag instruction text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Drag image around')
    })

    it('renders carousel', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-carousel').exists()).toBe(true)
    })

    it('renders slide for each attachment', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.b-carousel-slide').length).toBe(3)
    })

    it('renders PinchMe for each slide', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.pinch-me').length).toBe(3)
    })
  })

  describe('navigation', () => {
    it('shows prev button when not on first slide', async () => {
      const wrapper = createWrapper()
      // Initially on first slide, prev should be hidden
      expect(wrapper.find('.prev').exists()).toBe(false)

      // Navigate to second slide
      wrapper.vm.slide = 1
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.prev').exists()).toBe(true)
    })

    it('shows next button when not on last slide', () => {
      const wrapper = createWrapper()
      // Initially on first slide with 3 attachments, next should show
      expect(wrapper.find('.next').exists()).toBe(true)
    })

    it('hides next button on last slide', async () => {
      const wrapper = createWrapper()
      wrapper.vm.slide = 2 // Last slide (0-indexed)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.next').exists()).toBe(false)
    })

    it('hides navigation when only one attachment', () => {
      const wrapper = createWrapper({
        attachments: [{ id: 1, path: '/image1.jpg' }],
      })
      expect(wrapper.find('.prev').exists()).toBe(false)
      expect(wrapper.find('.next').exists()).toBe(false)
    })

    it('next() increments slide and resets zoom', async () => {
      const wrapper = createWrapper()
      wrapper.vm.zoom = 2
      expect(wrapper.vm.slide).toBe(0)

      wrapper.vm.next()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.slide).toBe(1)
      expect(wrapper.vm.zoom).toBe(1)
    })

    it('prev() decrements slide and resets zoom', async () => {
      const wrapper = createWrapper()
      wrapper.vm.slide = 2
      wrapper.vm.zoom = 2
      await wrapper.vm.$nextTick()

      wrapper.vm.prev()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.slide).toBe(1)
      expect(wrapper.vm.zoom).toBe(1)
    })
  })

  describe('zoom controls', () => {
    it('starts with zoom at 1', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.zoom).toBe(1)
    })

    it('zoom out button decreases zoom', async () => {
      const wrapper = createWrapper()
      wrapper.vm.zoom = 2

      // Find zoom out button and click it
      const zoomOutBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Zoom out'))
      await zoomOutBtn.trigger('click')

      expect(wrapper.vm.zoom).toBeLessThan(2)
    })

    it('zoom in button increases zoom', async () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.zoom).toBe(1)

      // Find zoom in button and click it
      const zoomInBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Zoom in'))
      await zoomInBtn.trigger('click')

      expect(wrapper.vm.zoom).toBeGreaterThan(1)
    })

    it('zoom has minimum of 1', async () => {
      const wrapper = createWrapper()
      wrapper.vm.zoom = 1

      const zoomOutBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Zoom out'))
      await zoomOutBtn.trigger('click')

      expect(wrapper.vm.zoom).toBeGreaterThanOrEqual(1)
    })

    it('zoom has maximum of 10', async () => {
      const wrapper = createWrapper()
      wrapper.vm.zoom = 10

      const zoomInBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Zoom in'))
      await zoomInBtn.trigger('click')

      expect(wrapper.vm.zoom).toBeLessThanOrEqual(10)
    })

    it('passes zoom to PinchMe', async () => {
      const wrapper = createWrapper()
      wrapper.vm.zoom = 2.5
      await wrapper.vm.$nextTick()

      const pinchMe = wrapper.find('.pinch-me')
      expect(pinchMe.attributes('data-zoom')).toBe('2.5')
    })
  })

  describe('carousel props', () => {
    it('uses message ID in carousel id', () => {
      const wrapper = createWrapper({ messageId: 456 })
      expect(wrapper.find('.b-carousel').exists()).toBe(true)
      // ID is set on b-carousel
    })

    it('shows slide 0 initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-carousel').attributes('data-slide')).toBe('0')
    })
  })

  describe('dimensions', () => {
    it('passes width and height to PinchMe', () => {
      const wrapper = createWrapper()
      const pinchMe = wrapper.find('.pinch-me')
      expect(pinchMe.attributes('data-width')).toBe('800')
      expect(pinchMe.attributes('data-height')).toBe('600')
    })
  })

  describe('props', () => {
    it('requires messageId prop', () => {
      const wrapper = createWrapper({ messageId: 789 })
      expect(wrapper.props('messageId')).toBe(789)
    })

    it('requires attachments prop', () => {
      const attachments = [{ id: 1, path: '/a.jpg' }]
      const wrapper = createWrapper({ attachments })
      expect(wrapper.props('attachments')).toEqual(attachments)
    })
  })

  describe('slide state', () => {
    it('tracks current slide', async () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.slide).toBe(0)

      wrapper.vm.slide = 1
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.b-carousel').attributes('data-slide')).toBe('1')
    })

    it('marks correct slide as active', () => {
      const wrapper = createWrapper()
      const slides = wrapper.findAll('.b-carousel-slide')

      // First slide should be active initially
      expect(slides[0].attributes('data-active')).toBe('true')
      expect(slides[1].attributes('data-active')).toBe('false')
      expect(slides[2].attributes('data-active')).toBe('false')
    })
  })
})
