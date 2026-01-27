import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PosterModal from '~/components/PosterModal.vue'

const { mockModal, mockHide } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockModal: ref(null),
    mockHide: vi.fn(),
  }
})

const mockNoticeboardAdd = vi.fn()
const mockNoticeboardEdit = vi.fn()
const mockImagePost = vi.fn()

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: mockHide,
  }),
}))

vi.mock('~/stores/noticeboard', () => ({
  useNoticeboardStore: () => ({
    add: mockNoticeboardAdd,
    edit: mockNoticeboardEdit,
  }),
}))

vi.mock('~/stores/image', () => ({
  useImageStore: () => ({
    post: mockImagePost,
  }),
}))

describe('PosterModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNoticeboardAdd.mockResolvedValue(123)
  })

  function createWrapper() {
    return mount(PosterModal, {
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal"><div class="modal-title">{{ title }}</div><slot /><slot name="footer" /></div>',
            props: [
              'id',
              'scrollable',
              'title',
              'noStacking',
              'visible',
              'size',
            ],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant'],
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'placeholder', 'size', 'maxlength'],
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'rows', 'maxRows', 'placeholder'],
          },
          'b-form-checkbox': {
            template:
              '<label><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" /><slot /></label>',
            props: ['modelValue'],
          },
          'b-row': {
            template: '<div class="b-row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="b-col"><slot /></div>',
          },
          'b-img': {
            template: '<img :src="src" :width="width" />',
            props: ['src', 'width', 'thumbnail'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon', 'size', 'flip'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
          },
          DraggableMap: {
            template: '<div class="draggable-map" />',
            methods: {
              getCenter: () => ({ lat: 51.5074, lng: -0.1278 }),
            },
          },
          OurUploader: {
            template: '<div class="our-uploader" />',
            props: ['modelValue', 'type'],
          },
          OurUploadedImage: {
            template: '<img class="our-uploaded-image" :src="src" />',
            props: ['src', 'modifiers', 'alt', 'width'],
          },
          NuxtPicture: {
            template: '<img class="nuxt-picture" :src="src" />',
            props: [
              'src',
              'fit',
              'format',
              'provider',
              'modifiers',
              'alt',
              'width',
            ],
          },
          SpinButton: {
            template:
              '<button class="spin-button" @click="$emit(\'handle\', () => {})"><slot />{{ label }}</button>',
            props: ['iconName', 'label', 'variant'],
          },
          'client-only': {
            template: '<div><slot /></div>',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders modal container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('renders notice message with instructions', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('drag/zoom the map')
    })

    it('renders name input', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('input[placeholder*="Where is it"]').exists()).toBe(
        true
      )
    })

    it('renders description textarea', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('textarea[placeholder*="Anything else"]').exists()
      ).toBe(true)
    })

    it('renders active checkbox', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('noticeboard is active')
    })
  })

  describe('icons', () => {
    it('renders camera icon for upload button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="camera"]').exists()).toBe(true)
    })
  })

  describe('photo upload', () => {
    it('shows upload button initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Upload photo')
    })

    it('shows OurUploader when uploading is true', async () => {
      const wrapper = createWrapper()
      wrapper.vm.uploading = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.our-uploader').exists()).toBe(true)
    })

    it('hides upload button when uploading', async () => {
      const wrapper = createWrapper()
      wrapper.vm.uploading = true
      await wrapper.vm.$nextTick()
      expect(
        wrapper.findAll('button').some((b) => b.text().includes('Upload'))
      ).toBe(false)
    })
  })

  describe('footer buttons', () => {
    it('renders Cancel button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Cancel')
    })

    it('renders Save details button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Save details')
    })

    it('calls hide when Cancel clicked', async () => {
      const wrapper = createWrapper()
      const cancelBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Cancel'))

      await cancelBtn.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('reactive state', () => {
    it('initializes name as null', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.name).toBeNull()
    })

    it('initializes description as null', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.description).toBeNull()
    })

    it('initializes active as true', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.active).toBe(true)
    })

    it('initializes uploading as false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.uploading).toBe(false)
    })

    it('initializes loaded as false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.loaded).toBe(false)
    })
  })

  describe('shown method', () => {
    it('sets loaded to true', () => {
      const wrapper = createWrapper()
      wrapper.vm.shown()
      expect(wrapper.vm.loaded).toBe(true)
    })
  })

  describe('hidden method', () => {
    it('sets loaded to false', () => {
      const wrapper = createWrapper()
      wrapper.vm.loaded = true
      wrapper.vm.hidden()
      expect(wrapper.vm.loaded).toBe(false)
    })

    it('emits hidden event', () => {
      const wrapper = createWrapper()
      wrapper.vm.hidden()
      expect(wrapper.emitted('hidden')).toBeTruthy()
    })
  })

  describe('photoAdd method', () => {
    it('sets uploading to true', () => {
      const wrapper = createWrapper()
      wrapper.vm.photoAdd()
      expect(wrapper.vm.uploading).toBe(true)
    })
  })

  describe('image rotation', () => {
    it('rotateLeft decrements rotation by 90', async () => {
      const wrapper = createWrapper()
      wrapper.vm.image = { id: 1, imagemods: { rotate: 0 } }

      await wrapper.vm.rotateLeft()

      expect(wrapper.vm.image.imagemods.rotate).toBe(270)
      expect(mockImagePost).toHaveBeenCalledWith({
        id: 1,
        rotate: 270,
        bust: expect.any(Number),
        noticeboard: true,
      })
    })

    it('rotateRight increments rotation by 90', async () => {
      const wrapper = createWrapper()
      wrapper.vm.image = { id: 1, imagemods: { rotate: 0 } }

      await wrapper.vm.rotateRight()

      expect(wrapper.vm.image.imagemods.rotate).toBe(90)
      expect(mockImagePost).toHaveBeenCalledWith({
        id: 1,
        rotate: 90,
        bust: expect.any(Number),
        noticeboard: true,
      })
    })

    it('wraps rotation at 360', async () => {
      const wrapper = createWrapper()
      wrapper.vm.image = { id: 1, imagemods: { rotate: 270 } }

      await wrapper.vm.rotateRight()

      expect(wrapper.vm.image.imagemods.rotate).toBe(0)
    })
  })

  describe('image display', () => {
    it('shows OurUploadedImage when image has ouruid', async () => {
      const wrapper = createWrapper()
      wrapper.vm.image = { id: 1, ouruid: 'abc123', imagemods: {} }
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })

    it('shows NuxtPicture when image has imageuid', async () => {
      const wrapper = createWrapper()
      wrapper.vm.image = { id: 1, imageuid: 'abc123', imagemods: {} }
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)
    })

    it('shows placeholder when no image uid', async () => {
      const wrapper = createWrapper()
      wrapper.vm.image = { id: 1, imagemods: {} }
      await wrapper.vm.$nextTick()
      expect(wrapper.find('img[src="/placeholder.jpg"]').exists()).toBe(true)
    })
  })

  describe('title', () => {
    it('displays Thanks! as title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Thanks!')
    })
  })

  describe('additional info section', () => {
    it('shows Please add more info heading', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Please add more info')
    })
  })
})
