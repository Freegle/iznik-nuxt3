import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SponsorLogo from '~/components/SponsorLogo.vue'

describe('SponsorLogo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(SponsorLogo, {
      props: {
        ...props,
      },
      global: {
        stubs: {
          'b-img': {
            template:
              '<img :src="src" :alt="alt" class="b-img" @error="$emit(\'error\', $event)" />',
            props: ['src', 'alt', 'lazy', 'thumbnail'],
            emits: ['error'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('shows image by default', () => {
      const wrapper = createWrapper({ image: '/sponsor.png' })
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })

    it('renders with image src', () => {
      const wrapper = createWrapper({ image: '/logo.png' })
      expect(wrapper.find('.b-img').attributes('src')).toBe('/logo.png')
    })

    it('uses default alt text', () => {
      const wrapper = createWrapper({ image: '/logo.png' })
      expect(wrapper.find('.b-img').attributes('alt')).toBe('Sponsor logo')
    })

    it('uses custom alt text', () => {
      const wrapper = createWrapper({
        image: '/logo.png',
        altText: 'Acme Corp Logo',
      })
      expect(wrapper.find('.b-img').attributes('alt')).toBe('Acme Corp Logo')
    })
  })

  describe('props', () => {
    it('defaults image to empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('image')).toBe('')
    })

    it('defaults altText to "Sponsor logo"', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('altText')).toBe('Sponsor logo')
    })

    it('accepts custom image prop', () => {
      const wrapper = createWrapper({ image: '/custom/path.jpg' })
      expect(wrapper.props('image')).toBe('/custom/path.jpg')
    })

    it('accepts custom altText prop', () => {
      const wrapper = createWrapper({ altText: 'Custom Alt' })
      expect(wrapper.props('altText')).toBe('Custom Alt')
    })
  })

  describe('error handling', () => {
    it('hides image on error', async () => {
      const wrapper = createWrapper({ image: '/broken.png' })
      expect(wrapper.find('.b-img').exists()).toBe(true)

      // Trigger error event
      await wrapper.find('.b-img').trigger('error')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.b-img').exists()).toBe(false)
    })

    it('logs broken image to console', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const wrapper = createWrapper({ image: '/broken-image.png' })

      await wrapper.find('.b-img').trigger('error')

      expect(consoleSpy).toHaveBeenCalledWith('Broken', '/broken-image.png')
      consoleSpy.mockRestore()
    })

    it('remains hidden after error', async () => {
      const wrapper = createWrapper({ image: '/error.png' })
      await wrapper.find('.b-img').trigger('error')
      await wrapper.vm.$nextTick()

      // Verify it stays hidden
      expect(wrapper.find('.b-img').exists()).toBe(false)
    })
  })
})
