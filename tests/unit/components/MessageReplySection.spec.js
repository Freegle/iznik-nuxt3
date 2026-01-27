import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense, ref } from 'vue'
import MessageReplySection from '~/components/MessageReplySection.vue'

const { mockMessage } = vi.hoisted(() => {
  return {
    mockMessage: {
      id: 1,
      subject: 'OFFER: Sofa',
      type: 'Offer',
      fromuser: 200,
      groups: [{ groupid: 100 }],
      lat: 51.5,
      lng: -0.1,
      deliverypossible: false,
    },
  }
})

const mockMessageStore = {
  fetch: vi.fn().mockResolvedValue(mockMessage),
  byId: vi.fn().mockReturnValue(mockMessage),
}

const mockReplyStateMachine = {
  email: ref(''),
  emailValid: ref(false),
  replyText: ref(''),
  collectText: ref(''),
  error: ref(null),
  canSend: ref(true),
  isProcessing: ref(false),
  isComplete: ref(false),
  showWelcomeModal: ref(false),
  newUserPassword: ref(''),
  state: ref('IDLE'),
  startTyping: vi.fn(),
  submit: vi.fn().mockResolvedValue(undefined),
  retry: vi.fn(),
  setRefs: vi.fn(),
  setReplySource: vi.fn(),
  onLoginSuccess: vi.fn(),
  closeWelcomeModal: vi.fn(),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: ref({ id: 1 }),
    myid: ref(1),
    myGroups: ref({ 100: { id: 100, namedisplay: 'Test Group' } }),
  }),
}))

vi.mock('~/composables/useReplyStateMachine', () => ({
  useReplyStateMachine: () => mockReplyStateMachine,
  ReplyState: {
    IDLE: 'IDLE',
    AUTHENTICATING: 'AUTHENTICATING',
  },
}))

vi.mock('~/composables/useDistance', () => ({
  milesAway: vi.fn().mockReturnValue(5),
}))

vi.mock('~/composables/useClientLog', () => ({
  action: vi.fn(),
}))

vi.mock('~/constants', () => ({
  FAR_AWAY: 20,
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/message/1',
    query: {},
  }),
}))

describe('MessageReplySection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageStore.byId.mockReturnValue(mockMessage)
    mockReplyStateMachine.canSend.value = true
    mockReplyStateMachine.isProcessing.value = false
    mockReplyStateMachine.error.value = null
    mockReplyStateMachine.showWelcomeModal.value = false
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(MessageReplySection, {
                id: 1,
                ...props,
              }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        directives: {
          'b-tooltip': {},
        },
        stubs: {
          'b-form-group': {
            template:
              '<div class="b-form-group"><label>{{ label }}</label><slot /></div>',
            props: ['label', 'labelFor', 'description'],
          },
          'b-badge': {
            template: '<span class="b-badge"><slot /></span>',
            props: ['variant'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'block', 'disabled'],
            emits: ['click'],
          },
          'b-modal': {
            template:
              '<div class="b-modal"><slot /><slot name="title" /></div>',
            props: ['id', 'scrollable', 'okOnly', 'okTitle'],
            emits: ['ok'],
            methods: {
              show() {},
              hide() {},
            },
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          EmailValidator: {
            template: '<div class="email-validator" />',
            props: ['email', 'valid', 'size', 'label'],
            emits: ['update:email', 'update:valid'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          NewUserInfo: {
            template: '<div class="new-user-info" />',
            props: ['password'],
          },
          NewFreegler: {
            template: '<div class="new-freegler" />',
          },
          SpinButton: {
            template:
              '<button class="spin-button" :disabled="disabled" @click="$emit(\'handle\', () => {})"><slot /></button>',
            props: [
              'variant',
              'size',
              'doneIcon',
              'iconName',
              'disabled',
              'iconlast',
            ],
            emits: ['handle'],
          },
          ChatButton: {
            template: '<div class="chat-button" />',
            props: ['userid'],
          },
          MessageDeadline: {
            template: '<div class="message-deadline" />',
            props: ['id'],
          },
          Field: {
            template:
              '<textarea class="field" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
            props: [
              'id',
              'modelValue',
              'name',
              'rules',
              'validateOnMount',
              'validateOnModelUpdate',
              'as',
              'rows',
              'maxRows',
            ],
            emits: ['update:modelValue', 'input'],
          },
          ErrorMessage: {
            template: '<span class="error-message" />',
            props: ['name'],
          },
          VeeForm: {
            template: '<form class="vee-form"><slot /></form>',
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders reply section', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('shows reply label', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Your reply')
    })

    it('shows cancel button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Cancel')
    })

    it('shows send button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Send')
    })
  })

  describe('collect time field', () => {
    it('shows collect field for Offer type', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('When could you collect?')
    })

    it('hides collect field for Wanted type', async () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        type: 'Wanted',
      })
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('When could you collect?')
    })
  })

  describe('delivery badge', () => {
    it('shows delivery badge when delivery possible', async () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        deliverypossible: true,
      })
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Delivery may be possible')
    })

    it('hides delivery badge when no delivery', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-badge').exists()).toBe(false)
    })
  })

  describe('distance warning', () => {
    it('shows far away warning', async () => {
      const { milesAway } = await import('~/composables/useDistance')
      milesAway.mockReturnValue(30)
      const wrapper = await createWrapper()
      expect(wrapper.find('.notice-message.danger').exists()).toBe(true)
    })
  })

  describe('error state', () => {
    it('shows error message when error present', async () => {
      mockReplyStateMachine.error.value = 'Something went wrong'
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Something went wrong')
    })

    it('shows try again button on error', async () => {
      mockReplyStateMachine.error.value = 'Something went wrong'
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Try again')
    })
  })

  describe('send button state', () => {
    it('disables send when canSend is false', async () => {
      mockReplyStateMachine.canSend.value = false
      const wrapper = await createWrapper()
      const sendBtn = wrapper.find('.spin-button')
      expect(sendBtn.attributes('disabled')).toBeDefined()
    })

    it('disables send when processing', async () => {
      mockReplyStateMachine.isProcessing.value = true
      const wrapper = await createWrapper()
      const sendBtn = wrapper.find('.spin-button')
      expect(sendBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('group membership', () => {
    it('displays correctly when user is a member', async () => {
      // The default mock has user as member of group 100
      const wrapper = await createWrapper()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('own message', () => {
    it('hides reply form when viewing own message', async () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        fromuser: 1, // Same as current user
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.grey').exists()).toBe(false)
    })
  })

  describe('logged in user', () => {
    it('renders form for logged in user', async () => {
      // The default mock has a logged in user
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-form-group').exists()).toBe(true)
    })
  })

  describe('events', () => {
    it('emits close on cancel', async () => {
      const wrapper = await createWrapper()
      const cancelBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Cancel'))
      await cancelBtn.trigger('click')
      expect(
        wrapper.findComponent(MessageReplySection).emitted('close')
      ).toBeTruthy()
    })
  })

  describe('state machine integration', () => {
    it('calls setRefs on mount', async () => {
      await createWrapper()
      expect(mockReplyStateMachine.setRefs).toHaveBeenCalled()
    })

    it('calls setReplySource on mount', async () => {
      await createWrapper()
      expect(mockReplyStateMachine.setReplySource).toHaveBeenCalled()
    })
  })

  describe('message deadline', () => {
    it('shows MessageDeadline component', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.message-deadline').exists()).toBe(true)
    })
  })
})
