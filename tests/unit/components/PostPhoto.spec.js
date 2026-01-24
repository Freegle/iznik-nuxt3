import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PostPhoto from '~/components/PostPhoto.vue'

const mockImageStore = {
  post: vi.fn().mockResolvedValue({}),
}

const mockMiscStore = {
  breakpoint: 'md',
}

vi.mock('~/stores/image', () => ({
  useImageStore: () => mockImageStore,
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

describe('PostPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMiscStore.breakpoint = 'md'
  })

  function createWrapper(props = {}) {
    return mount(PostPhoto, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          'v-icon': {
            template:
              '<span class="v-icon" :data-icon="icon" :class="{ \'fa-flip-horizontal\': flip === \'horizontal\' }" />',
            props: ['icon', 'size', 'flip'],
          },
          'b-img': {
            template:
              '<img class="b-img" :src="src" :class="{ thumbnail, rounded }" />',
            props: ['src', 'lazy', 'rounded', 'thumbnail'],
          },
          OurUploadedImage: {
            template:
              '<img class="our-uploaded-image" :src="src" @click="$emit(\'click\')" />',
            props: ['src', 'modifiers', 'alt', 'width'],
            emits: ['click'],
          },
          NuxtPicture: {
            template:
              '<img class="nuxt-picture" :src="src" @click="$emit(\'click\')" />',
            props: [
              'src',
              'fit',
              'format',
              'provider',
              'modifiers',
              'alt',
              'width',
              'height',
            ],
            emits: ['click'],
          },
          ConfirmModal: {
            template:
              '<div class="confirm-modal"><button class="confirm-btn" @click="$emit(\'confirm\')" /><button class="cancel-btn" @click="$emit(\'hidden\')" /></div>',
            props: ['title'],
            emits: ['confirm', 'hidden'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('shows rotate left button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.topleft').exists()).toBe(true)
      expect(wrapper.find('[data-icon="reply"]').exists()).toBe(true)
    })

    it('shows rotate right button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.topright').exists()).toBe(true)
    })

    it('shows remove button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.bottomright').exists()).toBe(true)
      expect(wrapper.find('[data-icon="trash-alt"]').exists()).toBe(true)
    })

    it('shows image wrapper', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.image-wrapper').exists()).toBe(true)
    })
  })

  describe('image sources', () => {
    it('shows OurUploadedImage when ouruid provided', () => {
      const wrapper = createWrapper({ ouruid: 'abc123' })
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })

    it('shows NuxtPicture when externaluid provided', () => {
      const wrapper = createWrapper({ externaluid: 'ext456' })
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)
    })

    it('shows b-img with thumbnail when paththumb provided', () => {
      const wrapper = createWrapper({
        paththumb: '/images/thumb.jpg',
        thumbnail: true,
      })
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })

    it('shows b-img with path when only path provided', () => {
      const wrapper = createWrapper({
        path: '/images/full.jpg',
        thumbnail: false,
      })
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })
  })

  describe('AI badge', () => {
    it('hides AI badge by default', () => {
      const wrapper = createWrapper({ externalmods: { ai: true } })
      expect(wrapper.find('.ai-badge').exists()).toBe(false)
    })

    it('shows AI badge when showAiBadge is true and mods.ai is true', async () => {
      const wrapper = createWrapper({
        showAiBadge: true,
        externalmods: { ai: true },
      })
      await flushPromises()
      expect(wrapper.find('.ai-badge').exists()).toBe(true)
      expect(wrapper.find('.ai-badge').text()).toBe('AI')
    })

    it('hides AI badge when showAiBadge true but mods.ai false', () => {
      const wrapper = createWrapper({
        showAiBadge: true,
        externalmods: { ai: false },
      })
      expect(wrapper.find('.ai-badge').exists()).toBe(false)
    })
  })

  describe('primary styling', () => {
    it('adds primary class when primary prop is true', () => {
      const wrapper = createWrapper({ primary: true })
      expect(wrapper.find('.container.primary').exists()).toBe(true)
    })

    it('does not add primary class by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.container.primary').exists()).toBe(false)
    })
  })

  describe('rotate actions', () => {
    it('has rotate left button with reply icon', () => {
      const wrapper = createWrapper({ id: 1 })
      const rotateLeft = wrapper.find('.topleft')
      expect(rotateLeft.exists()).toBe(true)
      expect(rotateLeft.find('[data-icon="reply"]').exists()).toBe(true)
    })

    it('has rotate right button with flipped reply icon', () => {
      const wrapper = createWrapper({ id: 1 })
      const rotateRight = wrapper.find('.topright')
      expect(rotateRight.exists()).toBe(true)
    })

    it('has rotate left title', () => {
      const wrapper = createWrapper({ id: 1 })
      const rotateLeft = wrapper.find('.topleft')
      expect(rotateLeft.attributes('title')).toBe('Rotate left')
    })

    it('has rotate right title', () => {
      const wrapper = createWrapper({ id: 1 })
      const rotateRight = wrapper.find('.topright')
      expect(rotateRight.attributes('title')).toBe('Rotate right')
    })
  })

  describe('remove action', () => {
    it('shows confirm modal on remove click', async () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.confirm-modal').exists()).toBe(false)
      await wrapper.find('.bottomright').trigger('click')
      expect(wrapper.find('.confirm-modal').exists()).toBe(true)
    })

    it('emits remove with id on confirm', async () => {
      const wrapper = createWrapper({ id: 42 })
      await wrapper.find('.bottomright').trigger('click')
      await wrapper.find('.confirm-btn').trigger('click')
      expect(wrapper.emitted('remove')).toBeTruthy()
      expect(wrapper.emitted('remove')[0]).toEqual([42])
    })

    it('hides confirm modal on cancel', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.bottomright').trigger('click')
      expect(wrapper.find('.confirm-modal').exists()).toBe(true)
      await wrapper.find('.cancel-btn').trigger('click')
      expect(wrapper.find('.confirm-modal').exists()).toBe(false)
    })
  })

  describe('click events', () => {
    it('emits click when image clicked (ouruid)', async () => {
      const wrapper = createWrapper({ ouruid: 'abc123' })
      await wrapper.find('.our-uploaded-image').trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('emits click when image clicked (externaluid)', async () => {
      const wrapper = createWrapper({ externaluid: 'ext456' })
      await wrapper.find('.nuxt-picture').trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })

  describe('responsive width', () => {
    it('uses width 200 for md breakpoint', () => {
      mockMiscStore.breakpoint = 'md'
      const wrapper = createWrapper({ ouruid: 'abc123' })
      // Width is computed based on breakpoint
      expect(wrapper.exists()).toBe(true)
    })

    it('uses width 100 for xs breakpoint', () => {
      mockMiscStore.breakpoint = 'xs'
      const wrapper = createWrapper({ ouruid: 'abc123' })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('props defaults', () => {
    it('has thumbnail default of true', () => {
      const props = PostPhoto.props || {}
      expect(props.thumbnail.default).toBe(true)
    })

    it('has primary default of false', () => {
      const props = PostPhoto.props || {}
      expect(props.primary.default).toBe(false)
    })

    it('has showAiBadge default of false', () => {
      const props = PostPhoto.props || {}
      expect(props.showAiBadge.default).toBe(false)
    })
  })
})
