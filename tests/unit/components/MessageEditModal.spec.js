import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import MessageEditModal from '~/components/MessageEditModal.vue'

const mockMessageStore = {
  byId: vi.fn(() => ({
    id: 1,
    subject: 'Test Subject',
    textbody: 'Test description',
    type: 'Offer',
    availablenow: 1,
    deadline: null,
    location: { name: 'AB1 2CD' },
    item: { name: 'Test Item' },
    attachments: [],
    groups: [{ groupid: 1 }],
  })),
  patch: vi.fn().mockResolvedValue({}),
}

const mockComposeStore = {
  uploading: false,
}

const mockGroupStore = {
  get: vi.fn(() => ({
    id: 1,
    settings: {
      keywords: {
        offer: 'OFFER',
        wanted: 'WANTED',
      },
    },
  })),
}

const mockModal = ref(null)

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/compose', () => ({
  useComposeStore: () => mockComposeStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: vi.fn(),
  }),
}))

vi.mock('~/composables/useId', () => ({
  uid: (prefix) => `${prefix}test-123`,
}))

vi.mock('~/constants', () => ({
  MESSAGE_EXPIRE_TIME: 31,
}))

describe('MessageEditModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageStore.byId.mockReturnValue({
      id: 1,
      subject: 'Test Subject',
      textbody: 'Test description',
      type: 'Offer',
      availablenow: 1,
      deadline: null,
      location: { name: 'AB1 2CD' },
      item: { name: 'Test Item' },
      attachments: [],
      groups: [{ groupid: 1 }],
    })
    mockComposeStore.uploading = false
  })

  function createWrapper(props = {}) {
    return mount(MessageEditModal, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal"><slot name="title" /><slot /><slot name="footer" /></div>',
            props: ['scrollable', 'size', 'titleClass'],
            emits: ['hidden'],
          },
          PostPhoto: {
            template: '<div class="post-photo" />',
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
          OurUploader: {
            template: '<div class="our-uploader" />',
            props: ['modelValue', 'type', 'multiple'],
          },
          PostItem: {
            template:
              '<div class="post-item"><input :value="edititem" @blur="$emit(\'update:edititem\', \'Updated Item\')" /></div>',
            props: ['id', 'type', 'edit', 'edititem'],
            emits: ['update:edititem'],
          },
          PostCode: {
            template: '<div class="post-code" />',
            props: ['label', 'find', 'size', 'value'],
            emits: ['selected', 'cleared'],
          },
          NumberIncrementDecrement: {
            template:
              '<div class="number-increment" :data-value="modelValue" />',
            props: ['modelValue', 'label', 'appendText', 'size', 'min'],
            emits: ['update:modelValue'],
          },
          'b-form-select': {
            template:
              '<select class="b-form-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.text }}</option></select>',
            props: ['id', 'modelValue', 'options', 'size'],
            emits: ['update:modelValue'],
          },
          'b-form-textarea': {
            template:
              '<textarea class="b-form-textarea" :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'placeholder', 'rows', 'state'],
            emits: ['update:modelValue'],
          },
          'b-input': {
            template:
              '<input class="b-input" :value="modelValue" type="date" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['id', 'modelValue', 'type', 'min', 'max'],
            emits: ['update:modelValue'],
          },
          'b-form-input': {
            template:
              '<input class="b-form-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
          'b-button': {
            template:
              '<button class="b-button" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'disabled'],
            emits: ['click'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" :disabled="disabled" @click="$emit(\'handle\')"><slot /></button>',
            props: ['variant', 'disabled', 'iconName', 'label'],
            emits: ['handle'],
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

    it('renders form labels', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('What is it?')
    })

    it('renders photo uploader', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.our-uploader').exists()).toBe(true)
    })

    it('renders edit form when location exists', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.edit-form').exists()).toBe(true)
    })

    it('renders type select', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-select').exists()).toBe(true)
    })

    it('renders post item component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.post-item').exists()).toBe(true)
    })

    it('renders postcode component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.post-code').exists()).toBe(true)
    })

    it('renders description textarea', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-textarea').exists()).toBe(true)
    })

    it('renders deadline input', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-input').exists()).toBe(true)
    })

    it('renders cancel button', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.b-button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('renders save button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.spin-button').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('has required id prop', () => {
      const props = MessageEditModal.props || {}
      expect(props.id.required).toBe(true)
      expect(props.id.type).toBe(Number)
    })
  })

  describe('emits', () => {
    it('defines hidden emit', () => {
      const emits = MessageEditModal.emits || []
      expect(emits).toContain('hidden')
    })
  })

  describe('Offer vs Wanted type', () => {
    it('shows quantity control for Offer type', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.number-increment').exists()).toBe(true)
    })

    it('hides quantity control for Wanted type', () => {
      mockMessageStore.byId.mockReturnValue({
        id: 1,
        subject: 'Wanted Item',
        textbody: 'Looking for something',
        type: 'Wanted',
        availablenow: 1,
        deadline: null,
        location: { name: 'AB1 2CD' },
        item: { name: 'Test Item' },
        attachments: [],
        groups: [{ groupid: 1 }],
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.number-increment').exists()).toBe(false)
    })

    it('shows offer placeholder for Offer type', () => {
      const wrapper = createWrapper()
      const textarea = wrapper.find('.b-form-textarea')
      expect(textarea.attributes('placeholder')).toContain(
        'colour, condition, size'
      )
    })

    it('shows wanted placeholder for Wanted type', () => {
      mockMessageStore.byId.mockReturnValue({
        id: 1,
        subject: 'Wanted Item',
        textbody: 'Looking for something',
        type: 'Wanted',
        availablenow: 1,
        deadline: null,
        location: { name: 'AB1 2CD' },
        item: { name: 'Test Item' },
        attachments: [],
        groups: [{ groupid: 1 }],
      })
      const wrapper = createWrapper()
      const textarea = wrapper.find('.b-form-textarea')
      expect(textarea.attributes('placeholder')).toContain(
        "what you're looking"
      )
    })
  })

  describe('store integration', () => {
    it('fetches message by id from store', () => {
      createWrapper({ id: 42 })
      expect(mockMessageStore.byId).toHaveBeenCalledWith(42)
    })

    it('fetches group from store', () => {
      createWrapper()
      expect(mockGroupStore.get).toHaveBeenCalled()
    })
  })

  describe('save button state', () => {
    it('save button enabled when description exists', () => {
      const wrapper = createWrapper()
      const saveBtn = wrapper.find('.spin-button')
      expect(saveBtn.attributes('disabled')).toBeUndefined()
    })

    it('save button enabled when attachments exist', () => {
      mockMessageStore.byId.mockReturnValue({
        id: 1,
        subject: 'Test Subject',
        textbody: '',
        type: 'Offer',
        availablenow: 1,
        deadline: null,
        location: { name: 'AB1 2CD' },
        item: { name: 'Test Item' },
        attachments: [{ id: 1, path: '/test.jpg' }],
        groups: [{ groupid: 1 }],
      })
      const wrapper = createWrapper()
      const saveBtn = wrapper.find('.spin-button')
      expect(saveBtn.attributes('disabled')).toBeUndefined()
    })
  })

  describe('uploading state', () => {
    it('disables buttons when uploading photo', async () => {
      mockComposeStore.uploading = true
      const wrapper = createWrapper()
      await flushPromises()
      const cancelBtn = wrapper.find('.b-button')
      expect(cancelBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('message without location', () => {
    it('shows simple subject input when no location', () => {
      mockMessageStore.byId.mockReturnValue({
        id: 1,
        subject: 'Test Subject',
        textbody: 'Test description',
        type: 'Offer',
        availablenow: 1,
        deadline: null,
        location: null,
        item: null,
        attachments: [],
        groups: [],
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.edit-form').exists()).toBe(false)
      expect(wrapper.find('.b-form-input').exists()).toBe(true)
    })
  })

  describe('type options', () => {
    it('gets offer keyword from group settings', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('OFFER')
    })

    it('gets wanted keyword from group settings', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('WANTED')
    })
  })

  describe('attachments', () => {
    it('shows PostPhoto components when attachments exist', () => {
      mockMessageStore.byId.mockReturnValue({
        id: 1,
        subject: 'Test Subject',
        textbody: 'Test description',
        type: 'Offer',
        availablenow: 1,
        deadline: null,
        location: { name: 'AB1 2CD' },
        item: { name: 'Test Item' },
        attachments: [
          { id: 1, path: '/test1.jpg' },
          { id: 2, path: '/test2.jpg' },
        ],
        groups: [{ groupid: 1 }],
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.photo-grid').exists()).toBe(true)
      expect(wrapper.findAll('.post-photo').length).toBe(2)
    })

    it('shows empty photo grid when no attachments', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.photo-grid').exists()).toBe(true)
      expect(wrapper.findAll('.post-photo').length).toBe(0)
    })
  })
})
