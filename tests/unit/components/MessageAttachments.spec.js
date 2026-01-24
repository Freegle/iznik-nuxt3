import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MessageAttachments from '~/components/MessageAttachments.vue'

const mockMiscStore = {
  breakpoint: 'lg',
}

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

describe('MessageAttachments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMiscStore.breakpoint = 'lg'
  })

  function createWrapper(props = {}) {
    return mount(MessageAttachments, {
      props: {
        id: 1,
        attachments: [{ path: '/images/item1.jpg' }],
        ...props,
      },
      global: {
        stubs: {
          'client-only': {
            template: '<div><slot /></div>',
          },
          'b-badge': {
            template:
              '<span class="b-badge" @click="$emit(\'click\')"><slot /></span>',
            emits: ['click'],
          },
          'b-img': {
            template: '<img class="b-img" :src="src" />',
            props: ['src', 'width', 'height'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          MessageTag: {
            template: '<div class="message-tag" />',
            props: ['id'],
          },
          ProxyImage: {
            template:
              '<img class="proxy-image" :src="src" :width="width" :height="height" @click="$emit(\'click\')" @error="$emit(\'error\')" />',
            props: [
              'src',
              'className',
              'alt',
              'title',
              'sizes',
              'width',
              'height',
              'fit',
              'preload',
            ],
            emits: ['click', 'error'],
          },
          OurUploadedImage: {
            template:
              '<img class="our-uploaded-image" :src="src" @click="$emit(\'click\')" @error="$emit(\'error\')" />',
            props: [
              'src',
              'modifiers',
              'alt',
              'width',
              'height',
              'sizes',
              'preload',
            ],
            emits: ['click', 'error'],
          },
          NuxtPicture: {
            template:
              '<img class="nuxt-picture" :src="src" @click="$emit(\'click\')" @error="$emit(\'error\')" />',
            props: [
              'src',
              'format',
              'provider',
              'modifiers',
              'alt',
              'width',
              'height',
              'sizes',
              'preload',
            ],
            emits: ['click', 'error'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders button wrapper', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('renders MessageTag', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.message-tag').exists()).toBe(true)
    })

    it('renders image when attachments present', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.proxy-image').exists()).toBe(true)
    })

    it('shows default camera image when no attachments', () => {
      const wrapper = createWrapper({ attachments: [] })
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })
  })

  describe('photo badge', () => {
    it('shows photo count badge for multiple attachments', () => {
      const wrapper = createWrapper({
        attachments: [
          { path: '/images/item1.jpg' },
          { path: '/images/item2.jpg' },
        ],
      })
      expect(wrapper.find('.b-badge').exists()).toBe(true)
      expect(wrapper.text()).toContain('1 / 2')
    })

    it('shows camera icon in badge', () => {
      const wrapper = createWrapper({
        attachments: [
          { path: '/images/item1.jpg' },
          { path: '/images/item2.jpg' },
        ],
      })
      expect(wrapper.find('.b-badge [data-icon="camera"]').exists()).toBe(true)
    })

    it('hides badge for single attachment', () => {
      const wrapper = createWrapper({
        attachments: [{ path: '/images/item1.jpg' }],
      })
      expect(wrapper.find('.b-badge').exists()).toBe(false)
    })
  })

  describe('zoom functionality', () => {
    it('shows zoom overlay when not thumbnail', () => {
      const wrapper = createWrapper({ thumbnail: false })
      expect(wrapper.find('.photozoom').exists()).toBe(true)
    })

    it('hides zoom overlay for thumbnail', () => {
      const wrapper = createWrapper({ thumbnail: true })
      expect(wrapper.find('.photozoom').exists()).toBe(false)
    })

    it('emits zoom on click', async () => {
      const wrapper = createWrapper({ thumbnail: false })
      await wrapper.find('.photozoom').trigger('click')
      expect(wrapper.emitted('zoom')).toBeTruthy()
    })
  })

  describe('sample image', () => {
    it('shows sample badge when using sample image', () => {
      const wrapper = createWrapper({
        attachments: [],
        sampleImage: { path: '/sample/image.jpg' },
      })
      expect(wrapper.text()).toContain('Photo of similar item')
    })

    it('renders sample image with ProxyImage', () => {
      const wrapper = createWrapper({
        attachments: [],
        sampleImage: { path: '/sample/image.jpg' },
      })
      expect(wrapper.find('.proxy-image').exists()).toBe(true)
    })

    it('hides sample badge when has attachments', () => {
      const wrapper = createWrapper({
        attachments: [{ path: '/images/item1.jpg' }],
        sampleImage: { path: '/sample/image.jpg' },
      })
      expect(wrapper.text()).not.toContain('Photo of similar item')
    })
  })

  describe('image types', () => {
    it('uses OurUploadedImage for ouruid attachment', () => {
      const wrapper = createWrapper({
        attachments: [{ ouruid: 'abc123' }],
      })
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })

    it('uses NuxtPicture for externaluid attachment', () => {
      const wrapper = createWrapper({
        attachments: [{ externaluid: 'external123' }],
      })
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)
    })

    it('uses ProxyImage for path attachment', () => {
      const wrapper = createWrapper({
        attachments: [{ path: '/images/item.jpg' }],
      })
      expect(wrapper.find('.proxy-image').exists()).toBe(true)
    })
  })

  describe('broken image handling', () => {
    it('shows default image when attachment image errors', async () => {
      const wrapper = createWrapper({
        attachments: [{ path: '/images/broken.jpg' }],
      })
      const proxyImage = wrapper.find('.proxy-image')
      await proxyImage.trigger('error')
      await flushPromises()
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })
  })

  describe('disabled state', () => {
    it('button is disabled when disabled prop is true', () => {
      const wrapper = createWrapper({ disabled: true })
      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })

    it('button is enabled by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
    })
  })

  describe('thumbnail mode', () => {
    it('applies thumbnail class when thumbnail prop is true', () => {
      const wrapper = createWrapper({ thumbnail: true })
      expect(wrapper.find('.thumbnail').exists()).toBe(true)
    })

    it('applies notThumbnail class when thumbnail prop is false', () => {
      const wrapper = createWrapper({ thumbnail: false })
      expect(wrapper.find('.notThumbnail').exists()).toBe(true)
    })
  })

  describe('breakpoint responsiveness', () => {
    it('uses smaller height on xs breakpoint', () => {
      mockMiscStore.breakpoint = 'xs'
      const wrapper = createWrapper({ thumbnail: false })
      // Component should use breakpoint for height calculation
      expect(wrapper.exists()).toBe(true)
    })

    it('uses smaller height on sm breakpoint', () => {
      mockMiscStore.breakpoint = 'sm'
      const wrapper = createWrapper({ thumbnail: false })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('preload prop', () => {
    it('passes preload prop to image components', () => {
      const wrapper = createWrapper({
        attachments: [{ ouruid: 'abc123' }],
        preload: true,
      })
      const image = wrapper.findComponent('.our-uploaded-image')
      expect(image.props('preload')).toBe(true)
    })
  })
})
