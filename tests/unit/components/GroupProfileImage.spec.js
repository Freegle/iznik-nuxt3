import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GroupProfileImage from '~/components/GroupProfileImage.vue'

describe('GroupProfileImage', () => {
  function createWrapper(props = {}) {
    return mount(GroupProfileImage, {
      props,
      global: {
        stubs: {
          'b-img': {
            template:
              '<img :src="src" :alt="alt" :class="$attrs.class" @error="$emit(\'error\', $event)" />',
            props: ['src', 'alt', 'thumbnail'],
            emits: ['error'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders image element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('img').exists()).toBe(true)
    })

    it('uses provided image src', () => {
      const wrapper = createWrapper({ image: '/test-image.jpg' })
      expect(wrapper.find('img').attributes('src')).toBe('/test-image.jpg')
    })

    it('uses default empty string for image', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('img').attributes('src')).toBe('')
    })
  })

  describe('altText prop', () => {
    it('uses provided alt text', () => {
      const wrapper = createWrapper({ altText: 'Custom alt text' })
      expect(wrapper.find('img').attributes('alt')).toBe('Custom alt text')
    })

    it('defaults to "Profile picture"', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('img').attributes('alt')).toBe('Profile picture')
    })
  })

  describe('size prop', () => {
    it('applies ProfileImage class by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('img').classes()).toContain('ProfileImage')
    })

    it('applies ProfileImage-sm class when size is sm', () => {
      const wrapper = createWrapper({ size: 'sm' })
      expect(wrapper.find('img').classes()).toContain('ProfileImage-sm')
    })

    it('applies ProfileImage class for other sizes', () => {
      const wrapper = createWrapper({ size: 'lg' })
      expect(wrapper.find('img').classes()).toContain('ProfileImage')
    })
  })

  describe('error handling', () => {
    it('sets fallback image on error', () => {
      const wrapper = createWrapper({ image: '/broken.jpg' })
      const mockEvent = { target: { src: '/broken.jpg' } }

      // Call the error handler directly
      wrapper.vm.brokenProfileImage(mockEvent)

      expect(mockEvent.target.src).toBe('/icon.png')
    })
  })

  describe('profileClass computed', () => {
    it('returns ProfileImage-sm for sm size', () => {
      const wrapper = createWrapper({ size: 'sm' })
      expect(wrapper.vm.profileClass).toBe('ProfileImage-sm')
    })

    it('returns ProfileImage for null size', () => {
      const wrapper = createWrapper({ size: null })
      expect(wrapper.vm.profileClass).toBe('ProfileImage')
    })

    it('returns ProfileImage for md size', () => {
      const wrapper = createWrapper({ size: 'md' })
      expect(wrapper.vm.profileClass).toBe('ProfileImage')
    })
  })
})
