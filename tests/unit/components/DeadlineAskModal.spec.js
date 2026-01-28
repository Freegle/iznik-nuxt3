import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import DeadlineAskModal from '~/components/DeadlineAskModal.vue'

const mockPatch = vi.fn()
const mockHide = vi.fn()

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    patch: mockPatch,
  }),
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

const mockBanditChosen = vi.fn()
const mockBanditShown = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    bandit: {
      chosen: mockBanditChosen,
      shown: mockBanditShown,
    },
  }),
}))

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({}),
}))

vi.mock('~/constants', () => ({
  MESSAGE_EXPIRE_TIME: 30,
}))

describe('DeadlineAskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPatch.mockResolvedValue({})
    mockBanditChosen.mockResolvedValue({})
  })

  function createWrapper(props = {}) {
    return mount(DeadlineAskModal, {
      props: {
        ids: [1],
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template: `<div class="b-modal">
              <slot name="title"></slot>
              <slot name="default"></slot>
              <slot name="footer"></slot>
            </div>`,
            props: ['scrollable', 'noStacking'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'b-input': {
            template:
              '<input class="b-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'type', 'min', 'max', 'placeholder'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<span class="v-icon" />',
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

    it('shows "Is there a deadline?" title by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Is there a deadline?')
    })

    it('shows "Set a deadline" title when set prop provided', () => {
      const wrapper = createWrapper({ set: new Date() })
      expect(wrapper.text()).toContain('Set a deadline')
    })

    it('shows explanation text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(
        "We'll show your post to other freeglers"
      )
    })
  })

  describe('initial state', () => {
    it('shows yes/no buttons initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Yes, set a deadline')
      expect(wrapper.text()).toContain('No deadline')
    })

    it('shows date input when set prop provided', () => {
      const wrapper = createWrapper({ set: new Date() })
      expect(wrapper.find('.b-input').exists()).toBe(true)
    })

    it('hides date input initially when no set prop', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-input').exists()).toBe(false)
    })
  })

  describe('showing date input', () => {
    it('shows date input when Yes clicked', async () => {
      const wrapper = createWrapper()
      const yesButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Yes, set a deadline'))

      await yesButton.trigger('click')

      expect(wrapper.find('.b-input').exists()).toBe(true)
    })

    it('shows save and cancel buttons after Yes clicked', async () => {
      const wrapper = createWrapper()
      const yesButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Yes, set a deadline'))

      await yesButton.trigger('click')

      expect(wrapper.text()).toContain('Cancel')
      expect(wrapper.text()).toContain('Save deadline')
    })
  })

  describe('no deadline action', () => {
    it('emits hide on no deadline', async () => {
      const wrapper = createWrapper()
      const noButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('No deadline'))

      await noButton.trigger('click')
      await vi.waitFor(() => expect(wrapper.emitted('hide')).toBeTruthy())
    })

    it('calls modal hide on no deadline', async () => {
      const wrapper = createWrapper()
      const noButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('No deadline'))

      await noButton.trigger('click')
      await vi.waitFor(() => expect(mockHide).toHaveBeenCalled())
    })

    it('tracks bandit variant on no deadline', async () => {
      const wrapper = createWrapper()
      const noButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('No deadline'))

      await noButton.trigger('click')
      await vi.waitFor(() => {
        expect(mockBanditChosen).toHaveBeenCalledWith({
          uid: 'deadline',
          variant: 'no',
        })
      })
    })
  })

  describe('set deadline action', () => {
    it('emits hide after setting deadline', async () => {
      const wrapper = createWrapper({ set: new Date() })
      const saveButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Save deadline'))

      await saveButton.trigger('click')
      await vi.waitFor(() => expect(wrapper.emitted('hide')).toBeTruthy())
    })

    it('patches messages with deadline', async () => {
      const wrapper = createWrapper({ ids: [1, 2], set: new Date() })
      const saveButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Save deadline'))

      await saveButton.trigger('click')
      await vi.waitFor(() => expect(mockPatch).toHaveBeenCalled())
    })
  })

  describe('cancel action', () => {
    it('emits hide on cancel', async () => {
      const wrapper = createWrapper({ set: new Date() })
      const cancelButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Cancel'))

      await cancelButton.trigger('click')
      await vi.waitFor(() => expect(wrapper.emitted('hide')).toBeTruthy())
    })
  })

  describe('props', () => {
    it('requires ids prop', () => {
      const wrapper = createWrapper({ ids: [5, 10] })
      expect(wrapper.props('ids')).toEqual([5, 10])
    })

    it('defaults set prop to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('set')).toBe(null)
    })
  })
})
