import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsEditModal from '~/components/NewsEditModal.vue'

const { mockModal, mockHide } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockModal: ref(null),
    mockHide: vi.fn(),
  }
})

const mockNewsfeedStore = {
  fetch: vi.fn().mockResolvedValue({ id: 1, message: 'Original message' }),
  edit: vi.fn().mockResolvedValue(undefined),
}

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => mockNewsfeedStore,
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: mockHide,
  }),
}))

describe('NewsEditModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNewsfeedStore.fetch.mockResolvedValue({
      id: 1,
      message: 'Original message',
    })
  })

  function createWrapper(props = {}) {
    return mount(NewsEditModal, {
      props: {
        id: 1,
        threadhead: 100,
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal" :id="id" :title="title"><slot /><slot name="footer" /></div>',
            props: ['id', 'title', 'size', 'scrollable', 'noStacking'],
            emits: ['shown'],
          },
          'b-form-textarea': {
            template:
              '<textarea class="b-form-textarea" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :rows="rows" :maxlength="maxlength" :placeholder="placeholder" />',
            props: [
              'modelValue',
              'rows',
              'maxlength',
              'spellcheck',
              'placeholder',
            ],
            emits: ['update:modelValue'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders b-modal with correct id', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').attributes('id')).toBe('newsEdit-1')
    })

    it('renders modal with Edit your post title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-modal').attributes('title')).toBe(
        'Edit your post'
      )
    })

    it('renders textarea with placeholder', () => {
      const wrapper = createWrapper()
      const textarea = wrapper.find('.b-form-textarea')
      expect(textarea.exists()).toBe(true)
      expect(textarea.attributes('placeholder')).toBe('Edit your post...')
    })

    it('renders textarea with 8 rows', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-textarea').attributes('rows')).toBe('8')
    })

    it('renders textarea with maxlength 2048', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-textarea').attributes('maxlength')).toBe(
        '2048'
      )
    })

    it('renders Cancel button', () => {
      const wrapper = createWrapper()
      const cancelBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Cancel'))
      expect(cancelBtn.exists()).toBe(true)
      expect(cancelBtn.classes()).toContain('white')
    })

    it('renders Save button', () => {
      const wrapper = createWrapper()
      const saveBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Save'))
      expect(saveBtn.exists()).toBe(true)
      expect(saveBtn.classes()).toContain('primary')
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 5 })
      expect(wrapper.props('id')).toBe(5)
    })

    it('requires threadhead prop', () => {
      const wrapper = createWrapper({ threadhead: 200 })
      expect(wrapper.props('threadhead')).toBe(200)
    })
  })

  describe('onShow method', () => {
    it('fetches newsfeed and sets message', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.onShow()
      expect(mockNewsfeedStore.fetch).toHaveBeenCalledWith(1, true)
      expect(wrapper.vm.message).toBe('Original message')
    })
  })

  describe('save method', () => {
    it('calls newsfeedStore.edit with correct params', async () => {
      const wrapper = createWrapper({ id: 1, threadhead: 100 })
      wrapper.vm.message = 'Updated message'
      await wrapper.vm.save()
      expect(mockNewsfeedStore.edit).toHaveBeenCalledWith(
        1,
        'Updated message',
        100
      )
    })

    it('hides modal after save', async () => {
      const wrapper = createWrapper()
      wrapper.vm.message = 'Test'
      await wrapper.vm.save()
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('cancel button', () => {
    it('calls hide when Cancel clicked', async () => {
      const wrapper = createWrapper()
      const cancelBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Cancel'))
      await cancelBtn.trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })
})
