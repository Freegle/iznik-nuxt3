import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PostMessage from '~/components/PostMessage.vue'

const mockComposeStore = {
  setType: vi.fn(),
  attachments: vi.fn().mockReturnValue([]),
  setAttachmentsForMessage: vi.fn(),
  message: vi.fn().mockReturnValue({
    availablenow: 1,
    description: '',
  }),
  setAvailableNow: vi.fn(),
  setDescription: vi.fn(),
  removeAttachment: vi.fn(),
  uploading: false,
  setItem: vi.fn(),
}

const mockMiscStore = {
  breakpoint: 'lg',
}

const mockImageStore = {
  rateRecognise: vi.fn(),
}

vi.mock('~/stores/compose', () => ({
  useComposeStore: () => mockComposeStore,
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('~/stores/image', () => ({
  useImageStore: () => mockImageStore,
}))

vi.mock('~/composables/useId', () => ({
  uid: vi.fn((type) => `test-${type}`),
}))

describe('PostMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockComposeStore.attachments.mockReturnValue([])
    mockComposeStore.message.mockReturnValue({
      availablenow: 1,
      description: '',
    })
    mockMiscStore.breakpoint = 'lg'
  })

  function createWrapper(props = {}) {
    return mount(PostMessage, {
      props: {
        id: 1,
        type: 'Offer',
        ...props,
      },
      global: {
        stubs: {
          'b-form-input': {
            template:
              '<input class="b-form-input" :value="modelValue" :disabled="disabled" :size="size" />',
            props: ['modelValue', 'disabled', 'id', 'size'],
          },
          'b-form-textarea': {
            template:
              '<textarea class="b-form-textarea" :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)"><slot /></textarea>',
            props: ['modelValue', 'placeholder', 'id', 'size'],
            emits: ['update:modelValue'],
          },
          'b-button': {
            template:
              '<button class="b-button" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          NumberIncrementDecrement: {
            template:
              '<div class="number-increment"><input :value="modelValue" /></div>',
            props: ['modelValue', 'label', 'appendText', 'size'],
            emits: ['update:modelValue'],
          },
          OurUploader: {
            template: '<div class="our-uploader" />',
            props: ['modelValue', 'type', 'multiple', 'recognise'],
            emits: ['update:modelValue'],
          },
          PostItem: {
            template: '<div class="post-item" />',
            props: ['id', 'type'],
          },
          PostPhoto: {
            template:
              '<div class="post-photo" @click="$emit(\'remove\', id)" />',
            props: [
              'id',
              'path',
              'paththumb',
              'thumbnail',
              'externaluid',
              'ouruid',
              'externalmods',
              'primary',
            ],
            emits: ['remove'],
          },
          draggable: {
            template:
              '<div class="draggable"><slot name="header" /><slot name="item" v-for="el in modelValue" :element="el" :index="0" /></div>',
            props: ['modelValue', 'itemKey', 'animation', 'ghostClass'],
            emits: ['start', 'end', 'update:modelValue'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders post message form', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('shows type input', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-input').exists()).toBe(true)
    })

    it('shows description textarea', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-textarea').exists()).toBe(true)
    })

    it('shows uploader', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.our-uploader').exists()).toBe(true)
    })

    it('shows PostItem component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.post-item').exists()).toBe(true)
    })
  })

  describe('type display', () => {
    it('shows OFFER type', () => {
      const wrapper = createWrapper({ type: 'Offer' })
      expect(wrapper.find('.b-form-input').attributes('value')).toBe('Offer')
    })

    it('shows WANTED type', () => {
      const wrapper = createWrapper({ type: 'Wanted' })
      expect(wrapper.find('.b-form-input').attributes('value')).toBe('Wanted')
    })

    it('type input is disabled', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-input').attributes('disabled')).toBeDefined()
    })
  })

  describe('quantity input', () => {
    it('shows quantity control for Offer type', () => {
      const wrapper = createWrapper({ type: 'Offer' })
      expect(wrapper.find('.number-increment').exists()).toBe(true)
    })

    it('hides quantity control for Wanted type', () => {
      const wrapper = createWrapper({ type: 'Wanted' })
      expect(wrapper.find('.number-increment').exists()).toBe(false)
    })
  })

  describe('description placeholder', () => {
    it('shows Offer placeholder', () => {
      const wrapper = createWrapper({ type: 'Offer' })
      expect(
        wrapper.find('.b-form-textarea').attributes('placeholder')
      ).toContain('colour')
    })

    it('shows Wanted placeholder', () => {
      const wrapper = createWrapper({ type: 'Wanted' })
      expect(
        wrapper.find('.b-form-textarea').attributes('placeholder')
      ).toContain('looking for')
    })
  })

  describe('store initialization', () => {
    it('calls setType on mount', () => {
      createWrapper({ id: 1, type: 'Offer' })
      expect(mockComposeStore.setType).toHaveBeenCalledWith({
        id: 1,
        type: 'Offer',
      })
    })
  })

  describe('attachments', () => {
    it('renders existing attachments', () => {
      mockComposeStore.attachments.mockReturnValue([
        { id: 1, path: '/images/test.jpg' },
      ])
      const wrapper = createWrapper()
      expect(wrapper.find('.post-photo').exists()).toBe(true)
    })

    it('removes attachment on remove event', async () => {
      mockComposeStore.attachments.mockReturnValue([
        { id: 1, path: '/images/test.jpg' },
      ])
      const wrapper = createWrapper()
      const photo = wrapper.find('.post-photo')
      await photo.trigger('click')
      expect(mockComposeStore.removeAttachment).toHaveBeenCalled()
    })
  })

  describe('AI info', () => {
    it('hides AI notice by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })
  })

  describe('responsive sizing', () => {
    it('uses lg size on large screens', () => {
      mockMiscStore.breakpoint = 'lg'
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-input').attributes('size')).toBe('lg')
    })

    it('uses md size on xs screens', () => {
      mockMiscStore.breakpoint = 'xs'
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-input').attributes('size')).toBe('md')
    })
  })

  describe('labels', () => {
    it('shows photos label on desktop', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Please add photos')
    })

    it('shows description label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Please give a few details')
    })
  })

  describe('description updates', () => {
    it('updates description in store', async () => {
      const wrapper = createWrapper()
      const textarea = wrapper.find('.b-form-textarea')
      await textarea.setValue('Test description')
      expect(mockComposeStore.setDescription).toHaveBeenCalled()
    })
  })
})
