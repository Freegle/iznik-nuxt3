import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import NewsPhotoModal from '~/components/NewsPhotoModal.vue'

const mockHide = vi.fn()

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

describe('NewsPhotoModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(NewsPhotoModal, {
      props: {
        id: 1,
        newsfeedid: 100,
        src: 'https://example.com/photo.jpg',
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template: `<div class="b-modal" :id="id" :title="title">
              <slot name="default"></slot>
              <slot name="footer"></slot>
            </div>`,
            props: ['id', 'scrollable', 'title', 'size', 'noStacking'],
          },
          'b-img': {
            template:
              '<img class="b-img" :src="src" @error="$emit(\'error\', $event)" />',
            props: ['lazy', 'src', 'rounded', 'fluid'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders modal', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('has correct modal id', () => {
      const wrapper = createWrapper({ id: 5 })
      expect(wrapper.find('.b-modal').attributes('id')).toBe('newsPhotoModal-5')
    })

    it('has correct title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').attributes('title')).toBe(
        'ChitChat photo'
      )
    })

    it('renders image', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })

    it('passes src to image', () => {
      const wrapper = createWrapper({ src: 'https://example.com/test.png' })
      expect(wrapper.find('.b-img').attributes('src')).toBe(
        'https://example.com/test.png'
      )
    })

    it('shows Close button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Close')
    })
  })

  describe('actions', () => {
    it('hides modal when Close clicked', async () => {
      const wrapper = createWrapper()
      const closeButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Close'))

      await closeButton.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('image error handling', () => {
    it('brokenImage function sets placeholder path', () => {
      const wrapper = createWrapper()
      // Access the component's brokenImage function via vm
      // The function takes an event and sets event.target.src = '/placeholder.jpg'
      const mockEvent = { target: { src: '' } }

      // Call the internal function directly via vm
      wrapper.vm.brokenImage(mockEvent)

      expect(mockEvent.target.src).toBe('/placeholder.jpg')
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 10 })
      expect(wrapper.props('id')).toBe(10)
    })

    it('requires newsfeedid prop', () => {
      const wrapper = createWrapper({ newsfeedid: 200 })
      expect(wrapper.props('newsfeedid')).toBe(200)
    })

    it('requires src prop', () => {
      const wrapper = createWrapper({ src: 'https://example.com/image.jpg' })
      expect(wrapper.props('src')).toBe('https://example.com/image.jpg')
    })
  })
})
