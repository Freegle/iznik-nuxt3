import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createMockUserStore } from '../../mocks/stores'
import ModBanMemberConfirmModal from '~/modtools/components/ModBanMemberConfirmModal.vue'

const mockUserStore = createMockUserStore()
const mockModGroupStore = {
  get: vi.fn().mockReturnValue({
    id: 1,
    name: 'Test Group',
    poly: null,
    polyofficial: null,
  }),
}
const mockHide = vi.fn()
const mockShow = vi.fn()

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/modtools/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

vi.mock('@/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

// Mock with proper Vue ref to avoid template ref warnings
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    show: mockShow,
    hide: mockHide,
  }),
}))

// Mock wicket library
vi.mock('wicket', () => ({
  default: {
    Wkt: vi.fn().mockImplementation(() => ({
      read: vi.fn(),
      toObject: vi.fn().mockReturnValue({
        getBounds: vi.fn().mockReturnValue({
          contains: vi.fn().mockReturnValue(false),
        }),
      }),
    })),
  },
}))

describe('ModBanMemberConfirmModal', () => {
  const defaultProps = {
    userid: 123,
    groupid: 456,
  }

  function mountComponent(props = {}) {
    mockUserStore.byId.mockReturnValue({
      id: 123,
      settings: { mylocation: { lat: 52.0, lng: -1.0 } },
      memberof: [{ id: 456 }, { id: 789 }],
    })

    return mount(ModBanMemberConfirmModal, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="modal"><slot name="title" /><slot /><slot name="footer" /></div>',
          },
          'b-form-input': {
            template: '<input type="text" v-model="modelValue" />',
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          NoticeMessage: {
            template: '<div class="notice"><slot /></div>',
            props: ['variant'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockModGroupStore.get.mockReturnValue({
      id: 456,
      name: 'Test Group',
      poly: null,
      polyofficial: null,
    })
    mockUserStore.byId.mockReturnValue({
      id: 123,
      settings: { mylocation: { lat: 52.0, lng: -1.0 } },
      memberof: [{ id: 456 }, { id: 789 }],
    })
  })

  describe('rendering', () => {
    it('renders the modal', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('displays reason input', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    })

    it('has Close button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Close')
    })

    it('has Ban button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Ban')
    })

    it('displays responsible use notice when not home group', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Please be responsible')
    })
  })

  describe('computed properties', () => {
    it('gets group from modGroupStore using groupid prop', () => {
      mountComponent({ groupid: 789 })
      expect(mockModGroupStore.get).toHaveBeenCalledWith(789)
    })

    it('gets user from userStore using userid prop', () => {
      const wrapper = mountComponent({ userid: 999 })
      // Access the user computed to ensure byId is called
      const user = wrapper.vm.user
      expect(user).toBeDefined()
      expect(mockUserStore.byId).toHaveBeenCalled()
    })
  })

  describe('ban method', () => {
    it('emits confirm event with reason when reason is set', async () => {
      const wrapper = mountComponent()
      wrapper.vm.reason = 'Spamming'
      await wrapper.vm.ban()
      expect(wrapper.emitted('confirm')).toBeTruthy()
      expect(wrapper.emitted('confirm')[0]).toEqual(['Spamming'])
    })

    it('calls hide after emitting', async () => {
      const wrapper = mountComponent()
      wrapper.vm.reason = 'Test reason'
      await wrapper.vm.ban()
      expect(mockHide).toHaveBeenCalled()
    })

    it('does not emit when reason is empty', async () => {
      const wrapper = mountComponent()
      wrapper.vm.reason = null
      await wrapper.vm.ban()
      expect(wrapper.emitted('confirm')).toBeFalsy()
    })
  })

  describe('props', () => {
    it('accepts userid prop', () => {
      const wrapper = mountComponent({ userid: 111 })
      expect(wrapper.props('userid')).toBe(111)
    })

    it('accepts groupid prop', () => {
      const wrapper = mountComponent({ groupid: 222 })
      expect(wrapper.props('groupid')).toBe(222)
    })
  })

  describe('modal functionality', () => {
    it('exposes show and hide from composable', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.show).toBeDefined()
      expect(wrapper.vm.hide).toBeDefined()
    })
  })
})
