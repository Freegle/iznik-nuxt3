import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import FreeglerPhotosCarousel from '~/components/FreeglerPhotosCarousel.vue'

// Mock useState to return consistent shuffled indices
const mockShuffledIndices = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
]

vi.mock('#imports', () => ({
  useState: vi.fn((key, init) => {
    // Return the mock shuffled indices as a ref
    return ref(mockShuffledIndices)
  }),
}))

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback) {
    this.callback = callback
  }

  observe() {}
  disconnect() {}
}

global.ResizeObserver = MockResizeObserver

describe('FreeglerPhotosCarousel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper() {
    return mount(FreeglerPhotosCarousel, {
      global: {
        stubs: {
          ProxyImage: {
            name: 'ProxyImage',
            template:
              '<div class="proxy-image" :class="className" :data-src="src"><img :src="src" :alt="alt" /></div>',
            props: ['src', 'alt', 'className'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders gallery section', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.gallery-section').exists()).toBe(true)
    })

    it('renders gallery wall', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.gallery-wall').exists()).toBe(true)
    })

    it('renders center frame', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.frame-wrapper--center').exists()).toBe(true)
    })
  })

  describe('slogan', () => {
    it('shows slogan section', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.gallery-slogan').exists()).toBe(true)
    })

    it('shows first slogan line', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Share the love.')
    })

    it('shows second slogan line', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Love the share.')
    })

    it('has slogan title', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.slogan-title').exists()).toBe(true)
    })
  })

  describe('frame structure', () => {
    it('renders frame containers', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.findAll('.frame-container').length).toBeGreaterThan(0)
    })

    it('renders photo wrappers', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.findAll('.photo-wrapper').length).toBeGreaterThan(0)
    })

    it('renders center frame container', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      const centerFrame = wrapper.find(
        '.frame-wrapper--center .frame-container'
      )
      expect(centerFrame.exists()).toBe(true)
    })
  })

  describe('photo sources', () => {
    it('generates correct photo paths for center image', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const centerFrame = wrapper.find('.frame-wrapper--center')
      const centerPhoto = centerFrame.find('[data-src]')
      expect(centerPhoto.attributes('data-src')).toMatch(
        /\/landingpage\/Freegler\d+\.jpeg/
      )
    })

    it('uses frame image for overlays', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const frameOverlay = wrapper
        .findAll('.proxy-image')
        .find((w) => w.attributes('data-src') === '/landingpage/frame.png')
      expect(frameOverlay).toBeDefined()
    })
  })

  describe('alt text', () => {
    it('provides alt text for photos mentioning freegler', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const centerFrame = wrapper.find('.frame-wrapper--center')
      const photo = centerFrame.find('.proxy-image img')
      expect(photo.attributes('alt')).toContain('freegler')
    })

    it('provides alt text mentioning Alex Bamford', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const centerFrame = wrapper.find('.frame-wrapper--center')
      const photo = centerFrame.find('.proxy-image img')
      expect(photo.attributes('alt')).toContain('Alex Bamford')
    })
  })

  describe('responsive behavior', () => {
    it('creates ResizeObserver on mount', async () => {
      const observeSpy = vi.spyOn(MockResizeObserver.prototype, 'observe')

      createWrapper()
      await flushPromises()

      expect(observeSpy).toHaveBeenCalled()
    })

    it('disconnects ResizeObserver on unmount', async () => {
      const disconnectSpy = vi.spyOn(MockResizeObserver.prototype, 'disconnect')

      const wrapper = createWrapper()
      await flushPromises()

      wrapper.unmount()

      expect(disconnectSpy).toHaveBeenCalled()
    })
  })

  describe('shuffled indices', () => {
    it('uses useState for shuffled indices', async () => {
      const { useState } = await import('#imports')

      createWrapper()
      await flushPromises()

      expect(useState).toHaveBeenCalledWith(
        'freegler-carousel-photos',
        expect.any(Function)
      )
    })
  })

  describe('total photos', () => {
    it('has 18 total photos available in mock', () => {
      expect(mockShuffledIndices.length).toBe(18)
    })
  })
})
