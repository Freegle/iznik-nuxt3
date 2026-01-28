import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createMockMemberStore } from '../../mocks/stores'
import ModBanMemberModal from '~/modtools/components/ModBanMemberModal.vue'

const mockMemberStore = createMockMemberStore()
const mockHide = vi.fn()
const mockShow = vi.fn()

vi.mock('~/modtools/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

vi.mock('@/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

// Mock with proper Vue ref to avoid template ref warnings
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    show: mockShow,
    hide: mockHide,
  }),
}))

describe('ModBanMemberModal', () => {
  const defaultProps = {
    groupid: 456,
  }

  function mountComponent(props = {}) {
    return mount(ModBanMemberModal, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="modal"><slot name="title" /><slot /><slot name="footer" /></div>',
          },
          'b-form-input': {
            template: '<input type="number" v-model="modelValue" />',
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
  })

  describe('rendering', () => {
    it('displays userid input', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('input[type="number"]').exists()).toBe(true)
    })

    it('has Ban button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Ban')
    })

    it('displays responsible use notice', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Please be responsible')
    })
  })

  describe('ban method', () => {
    it('calls memberStore.ban with userid and groupid', async () => {
      const wrapper = mountComponent({ groupid: 123 })
      wrapper.vm.userid = 999
      await wrapper.vm.ban()
      expect(mockMemberStore.ban).toHaveBeenCalledWith(999, 123)
    })

    it('calls hide after banning', async () => {
      const wrapper = mountComponent()
      wrapper.vm.userid = 999
      await wrapper.vm.ban()
      expect(mockHide).toHaveBeenCalled()
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
