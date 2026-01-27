import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileImage from '~/components/ProfileImage.vue'

describe('ProfileImage', () => {
  function createWrapper(props = {}) {
    return mount(ProfileImage, {
      props,
      global: {
        stubs: {
          OurUploadedImage: {
            template:
              '<img :src="src" :alt="altText" :width="width" :height="height" class="our-uploaded" />',
            props: ['src', 'modifiers', 'altText', 'width', 'height'],
          },
          NuxtPicture: {
            template: '<picture><img :src="src" :alt="altText" /></picture>',
            props: [
              'src',
              'modifiers',
              'altText',
              'width',
              'height',
              'format',
              'fit',
              'provider',
            ],
          },
          'b-img': {
            template: '<img :src="src" :alt="altText" class="b-img" />',
            props: ['src', 'className', 'altText', 'width', 'height'],
          },
          GeneratedAvatar: {
            template:
              '<div class="generated-avatar" :data-name="name">{{ name }}</div>',
            props: ['name', 'size'],
          },
          ProxyImage: {
            template:
              '<img :src="src" :alt="altText" class="proxy-image" @error="$emit(\'error\')" />',
            props: ['src', 'className', 'altText', 'sizes'],
            emits: ['error'],
          },
          'v-icon': {
            template: '<i :data-icon="icon" class="v-icon"></i>',
            props: ['icon'],
          },
          'b-badge': {
            template: '<span class="badge"><slot /></span>',
            props: ['variant'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders container with ProfileImage__container class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.ProfileImage__container').exists()).toBe(true)
    })

    it('uses OurUploadedImage when ouruid is provided', () => {
      const wrapper = createWrapper({ ouruid: 'abc123' })
      expect(wrapper.find('.our-uploaded').exists()).toBe(true)
    })

    it('uses NuxtPicture when externaluid is provided', () => {
      const wrapper = createWrapper({ externaluid: 'ext456' })
      expect(wrapper.find('picture').exists()).toBe(true)
    })

    it('uses b-img for data URL images', () => {
      const wrapper = createWrapper({ image: 'data:image/png;base64,abc123' })
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })

    it('uses GeneratedAvatar when name provided and no real image', () => {
      const wrapper = createWrapper({ name: 'John Doe' })
      expect(wrapper.find('.generated-avatar').exists()).toBe(true)
      expect(wrapper.find('.generated-avatar').attributes('data-name')).toBe(
        'John Doe'
      )
    })

    it('uses ProxyImage as fallback', () => {
      const wrapper = createWrapper({ image: 'https://example.com/image.jpg' })
      expect(wrapper.find('.proxy-image').exists()).toBe(true)
    })
  })

  describe('moderator indicator', () => {
    it('shows leaf icon when isModerator is true', () => {
      const wrapper = createWrapper({ isModerator: true })
      expect(wrapper.find('.v-icon').exists()).toBe(true)
      expect(wrapper.find('.v-icon').attributes('data-icon')).toBe('leaf')
    })

    it('hides leaf icon when isModerator is false', () => {
      const wrapper = createWrapper({ isModerator: false })
      expect(wrapper.find('.v-icon').exists()).toBe(false)
    })

    it.each(['sm', 'md', 'lg', 'xl'])(
      'applies size class %s to moderator icon',
      (size) => {
        const wrapper = createWrapper({ isModerator: true, size })
        expect(wrapper.find('.ProfileImage__moderator').classes()).toContain(
          `ProfileImage__moderator--${size}`
        )
      }
    )
  })

  describe('badge', () => {
    it('shows badge when badge prop is provided', () => {
      const wrapper = createWrapper({ badge: 5 })
      expect(wrapper.find('.badge').exists()).toBe(true)
      expect(wrapper.find('.badge').text()).toBe('5')
    })

    it('hides badge when badge is null', () => {
      const wrapper = createWrapper({ badge: null })
      expect(wrapper.find('.badge').exists()).toBe(false)
    })
  })

  describe('size computed', () => {
    it.each([
      ['sm', 25],
      ['md', 35],
      ['lg', 50],
      ['xl', 100],
    ])('size %s returns width %d', (size, expectedWidth) => {
      const wrapper = createWrapper({ size, ouruid: 'test' })
      expect(wrapper.vm.width).toBe(expectedWidth)
    })
  })

  describe('className computed', () => {
    it('includes size class', () => {
      const wrapper = createWrapper({ size: 'lg' })
      expect(wrapper.vm.className).toContain('profile--lg')
    })

    it('includes ourBorder when border is true', () => {
      const wrapper = createWrapper({ border: true })
      expect(wrapper.vm.className).toContain('ourBorder')
    })

    it('excludes ourBorder when border is false', () => {
      const wrapper = createWrapper({ border: false })
      expect(wrapper.vm.className).not.toContain('ourBorder')
    })
  })

  describe('default image handling', () => {
    it('treats defaultprofile images as default', () => {
      const wrapper = createWrapper({
        image: '/defaultprofile.png',
        name: 'Test',
      })
      expect(wrapper.vm.isDefaultImage).toBe(true)
    })

    it('uses generated avatar for default profile with name', () => {
      const wrapper = createWrapper({
        image: '/defaultprofile.png',
        name: 'Test User',
      })
      expect(wrapper.find('.generated-avatar').exists()).toBe(true)
    })
  })

  describe('alt text', () => {
    it('uses default alt text', () => {
      const wrapper = createWrapper({ ouruid: 'test' })
      expect(wrapper.find('.our-uploaded').attributes('alt')).toBe(
        'Profile picture'
      )
    })

    it('uses custom alt text when provided', () => {
      const wrapper = createWrapper({ ouruid: 'test', altText: 'Custom alt' })
      expect(wrapper.find('.our-uploaded').attributes('alt')).toBe('Custom alt')
    })
  })
})
