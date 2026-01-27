import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import StoryAddModal from '~/components/StoryAddModal.vue'

const mockModal = ref(null)

const mockStoryStore = {
  add: vi.fn().mockResolvedValue(undefined),
}

const mockComposeStore = {
  uploading: false,
}

const mockImageStore = {
  post: vi.fn().mockResolvedValue(undefined),
}

vi.mock('~/stores/stories', () => ({
  useStoryStore: () => mockStoryStore,
}))

vi.mock('~/stores/compose', () => ({
  useComposeStore: () => mockComposeStore,
}))

vi.mock('~/stores/image', () => ({
  useImageStore: () => mockImageStore,
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: vi.fn(),
  }),
}))

describe('StoryAddModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockComposeStore.uploading = false
  })

  function createWrapper() {
    return mount(StoryAddModal, {
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal"><slot /><slot name="footer" /></div>',
            props: ['scrollable', 'title', 'size', 'noStacking'],
            emits: ['shown'],
            methods: {
              show() {},
              hide() {},
            },
          },
          'b-row': {
            template: '<div class="b-row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="b-col"><slot /></div>',
            props: ['cols'],
          },
          'b-form-input': {
            template:
              '<input class="b-form-input" :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" :class="{ \'is-invalid\': $attrs.class?.includes(\'is-invalid\') }" />',
            props: ['modelValue', 'spellcheck', 'maxlength', 'placeholder'],
            emits: ['update:modelValue'],
          },
          'b-form-textarea': {
            template:
              '<textarea class="b-form-textarea" :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" :class="{ \'is-invalid\': $attrs.class?.includes(\'is-invalid\') }"></textarea>',
            props: ['modelValue', 'spellcheck', 'rows', 'placeholder'],
            emits: ['update:modelValue'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'disabled'],
            emits: ['click'],
          },
          'b-img': {
            template: '<img class="b-img" :src="src" />',
            props: ['thumbnail', 'width', 'src'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon', 'size', 'flip'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          OurUploader: {
            template: '<div class="our-uploader" />',
            props: ['modelValue', 'type'],
            emits: ['update:modelValue'],
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
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders modal', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('shows headline input', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-input').exists()).toBe(true)
    })

    it('shows story textarea', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-textarea').exists()).toBe(true)
    })

    it('shows add photo button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Add a photo')
    })

    it('shows notice about sharing', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('share your story')
    })
  })

  describe('form labels', () => {
    it('shows summary prompt', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('quick summary')
    })

    it('shows story prompt', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('why you freegle')
    })

    it('shows photo prompt', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Please add a photo')
    })
  })

  describe('footer buttons', () => {
    it('shows cancel button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Cancel')
    })

    it('shows submit button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Add Your Story')
    })
  })

  describe('photo upload', () => {
    it('shows uploader when add photo clicked', async () => {
      const wrapper = createWrapper()
      const addPhotoBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Add a photo'))
      await addPhotoBtn.trigger('click')
      expect(wrapper.find('.our-uploader').exists()).toBe(true)
    })
  })

  describe('validation', () => {
    it('shows error for missing headline on submit', async () => {
      const wrapper = createWrapper()
      // Fill only story, not headline
      const textarea = wrapper.find('.b-form-textarea')
      await textarea.setValue('My story content')

      const submitBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Add Your Story'))
      await submitBtn.trigger('click')
      await flushPromises()

      // Store should not be called without headline
      expect(mockStoryStore.add).not.toHaveBeenCalled()
    })

    it('shows error for missing story on submit', async () => {
      const wrapper = createWrapper()
      // Fill only headline, not story
      const input = wrapper.find('.b-form-input')
      await input.setValue('My headline')

      const submitBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Add Your Story'))
      await submitBtn.trigger('click')
      await flushPromises()

      // Store should not be called without story
      expect(mockStoryStore.add).not.toHaveBeenCalled()
    })
  })

  describe('successful submission', () => {
    it('calls storyStore.add with correct params', async () => {
      const wrapper = createWrapper()

      // Fill headline
      const input = wrapper.find('.b-form-input')
      await input.setValue('Test Headline')

      // Fill story
      const textarea = wrapper.find('.b-form-textarea')
      await textarea.setValue('Test Story Content')

      const submitBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Add Your Story'))
      await submitBtn.trigger('click')
      await flushPromises()

      expect(mockStoryStore.add).toHaveBeenCalledWith(
        'Test Headline',
        'Test Story Content',
        null,
        true
      )
    })

    it('shows thank you message after submission', async () => {
      const wrapper = createWrapper()

      // Fill headline and story
      const input = wrapper.find('.b-form-input')
      await input.setValue('Test Headline')
      const textarea = wrapper.find('.b-form-textarea')
      await textarea.setValue('Test Story Content')

      const submitBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Add Your Story'))
      await submitBtn.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('grateful')
    })
  })

  describe('disabled state', () => {
    it('disables buttons while uploading', () => {
      mockComposeStore.uploading = true
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.b-button')
      const cancelBtn = buttons.find((b) => b.text().includes('Cancel'))
      expect(cancelBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('image handling', () => {
    it('initially has no image displayed', () => {
      const wrapper = createWrapper()
      // No image is shown initially since story.image is null
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(false)
    })
  })

  describe('icons', () => {
    it('shows camera icon on add photo button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="camera"]').exists()).toBe(true)
    })
  })

  describe('placeholders', () => {
    it('shows headline placeholder', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-input').attributes('placeholder')).toContain(
        'summary'
      )
    })

    it('shows story placeholder', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.b-form-textarea').attributes('placeholder')
      ).toContain('given')
    })
  })
})
