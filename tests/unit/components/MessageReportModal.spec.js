import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import MessageReportModal from '~/components/MessageReportModal.vue'

const { mockMessage } = vi.hoisted(() => {
  return {
    mockMessage: {
      id: 1,
      subject: 'OFFER: Test Item',
      type: 'Offer',
      groups: [{ groupid: 100 }],
    },
  }
})

const mockModal = ref(null)

const mockMessageStore = {
  byId: vi.fn().mockReturnValue(mockMessage),
}

const mockChatStore = {
  openChatToMods: vi.fn().mockResolvedValue(123),
  send: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: vi.fn(),
  }),
}))

vi.mock('nuxt/app', () => ({
  useRuntimeConfig: () => ({
    public: {
      USER_SITE: 'https://freegle.org',
    },
  }),
}))

describe('MessageReportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageStore.byId.mockReturnValue(mockMessage)
  })

  function createWrapper(props = {}) {
    return mount(MessageReportModal, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal"><slot /><slot name="footer" /></div>',
            props: ['id', 'scrollable', 'title', 'size'],
            emits: ['hidden'],
            methods: {
              show() {},
              hide() {},
            },
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'disabled'],
            emits: ['click'],
          },
          'b-form-radio': {
            template:
              '<label class="b-form-radio"><input type="radio" :checked="modelValue === value" @change="$emit(\'update:modelValue\', value)" /><slot /></label>',
            props: ['modelValue', 'name', 'value'],
            emits: ['update:modelValue'],
          },
          'b-form-textarea': {
            template:
              '<textarea class="b-form-textarea" :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'rows', 'placeholder'],
            emits: ['update:modelValue'],
          },
          'b-spinner': {
            template: '<span class="b-spinner" />',
            props: ['small'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
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

    it('shows report content initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.report-content').exists()).toBe(true)
    })

    it('shows message preview', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.report-item-preview').exists()).toBe(true)
    })

    it('shows message type', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('OFFER')
    })

    it('shows message subject', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Test Item')
    })
  })

  describe('explanation', () => {
    it('shows explanation text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('If something')
      expect(wrapper.text()).toContain('wrong with this post')
    })

    it('mentions local volunteers', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('local volunteers')
    })
  })

  describe('report reasons', () => {
    it('shows reason label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('wrong with this post')
    })

    it('shows inappropriate content option', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Inappropriate content')
    })

    it('shows spam option', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Spam or advertising')
    })

    it('shows scam option', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Possible scam')
    })

    it('shows other option', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Other issue')
    })

    it('has four radio buttons', () => {
      const wrapper = createWrapper()
      const radios = wrapper.findAll('.b-form-radio')
      expect(radios.length).toBe(4)
    })
  })

  describe('additional details', () => {
    it('shows additional details label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Additional details')
    })

    it('shows textarea for details', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-textarea').exists()).toBe(true)
    })

    it('shows placeholder text', () => {
      const wrapper = createWrapper()
      const textarea = wrapper.find('.b-form-textarea')
      expect(textarea.attributes('placeholder')).toContain(
        'additional information'
      )
    })
  })

  describe('footer buttons', () => {
    it('shows cancel button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Cancel')
    })

    it('shows submit button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Submit Report')
    })

    it('submit button is disabled when no reason selected', () => {
      const wrapper = createWrapper()
      const submitBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Submit'))
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('wanted type', () => {
    it('shows WANTED for wanted type messages', () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        type: 'Wanted',
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('WANTED')
    })
  })

  describe('success state', () => {
    it('does not show success state initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.report-success').exists()).toBe(false)
    })
  })
})
