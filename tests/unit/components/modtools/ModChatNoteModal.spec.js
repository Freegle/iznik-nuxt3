import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ModChatNoteModal from '~/modtools/components/ModChatNoteModal.vue'

const mockHide = vi.fn()
const mockChatStore = {
  byChatId: vi.fn().mockReturnValue({
    user1: { displayname: 'User One', id: 1 },
    user2: { displayname: 'User Two', id: 2 },
  }),
}
const mockMyGroup = vi.fn().mockReturnValue({
  namedisplay: 'Test Group',
})
const mockSendMT = vi.fn().mockResolvedValue({})

vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $api: {
      chat: {
        sendMT: mockSendMT,
      },
    },
  }),
}))

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: { value: null },
    hide: mockHide,
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myGroup: mockMyGroup,
  }),
}))

vi.mock('~/composables/useTwem', () => ({
  untwem: (text) => text,
}))

describe('ModChatNoteModal', () => {
  const defaultProps = {
    chatid: 123,
  }

  function mountComponent(props = {}) {
    return mount(ModChatNoteModal, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="modal" @hidden="$emit(\'hidden\')"><slot name="title" /><slot /><slot name="footer" /></div>',
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          'b-form-textarea': {
            template: '<textarea v-model="modelValue" />',
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
          ModGroupSelect: {
            template:
              '<select v-model="modelValue"><option value="1">Group</option></select>',
            props: ['modelValue', 'modonly'],
            emits: ['update:modelValue'],
          },
        },
        mocks: {
          $api: {
            chat: {
              sendMT: mockSendMT,
            },
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockChatStore.byChatId.mockReturnValue({
      user1: { displayname: 'User One', id: 1 },
      user2: { displayname: 'User Two', id: 2 },
    })
  })

  describe('rendering', () => {
    it('renders the modal', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('has Close button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Close')
    })

    it('has Add Mod Message button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Add Mod Message')
    })

    it('displays instructions about mod notes', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'This will add a note from the moderators'
      )
    })
  })

  describe('computed properties', () => {
    it('returns null for user1 when chat is not loaded', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.user1).toBe(null)
    })

    it('returns user1 from chat when loaded', () => {
      const wrapper = mountComponent()
      wrapper.vm.show()
      expect(wrapper.vm.user1).toEqual({ displayname: 'User One', id: 1 })
    })

    it('returns user2 from chat when loaded', () => {
      const wrapper = mountComponent()
      wrapper.vm.show()
      expect(wrapper.vm.user2).toEqual({ displayname: 'User Two', id: 2 })
    })
  })

  describe('methods', () => {
    it('show loads chat from store', () => {
      const wrapper = mountComponent()
      wrapper.vm.show()
      expect(mockChatStore.byChatId).toHaveBeenCalledWith(123)
    })

    it('onHide emits hidden event', async () => {
      const wrapper = mountComponent()
      wrapper.vm.onHide()
      expect(wrapper.emitted('hidden')).toBeTruthy()
    })
  })

  describe('modal functionality', () => {
    it('exposes show and hide methods', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.show).toBeDefined()
      expect(wrapper.vm.hide).toBeDefined()
    })
  })

  describe('props', () => {
    it('accepts chatid prop', () => {
      const wrapper = mountComponent({ chatid: 456 })
      expect(wrapper.props('chatid')).toBe(456)
    })
  })
})
