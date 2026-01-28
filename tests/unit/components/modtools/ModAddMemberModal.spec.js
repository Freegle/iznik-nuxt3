import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { createMockMemberStore, createMockUserStore } from '../../mocks/stores'
import ModAddMemberModal from '~/modtools/components/ModAddMemberModal.vue'

// Create mock store instances
const mockMemberStore = createMockMemberStore()
const mockUserStore = createMockUserStore()

// Mock the store imports
vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

// Mock the modal composable with proper Vue ref to avoid template ref warnings
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    show: vi.fn(),
    hide: vi.fn(),
  }),
}))

describe('ModAddMemberModal', () => {
  const defaultProps = {
    groupid: 456,
  }

  function mountComponent(props = {}) {
    return mount(ModAddMemberModal, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-modal': {
            template: '<div class="modal"><slot /><slot name="footer" /></div>',
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          NoticeMessage: {
            template: '<div class="notice"><slot /></div>',
          },
          'v-icon': true,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock return values
    mockUserStore.add.mockResolvedValue(123)
  })

  describe('rendering', () => {
    it('renders email input when not added', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('renders Add button when not added', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const addButton = buttons.find((b) => b.text().includes('Add'))
      expect(addButton).toBeDefined()
    })

    it('shows added message after successful add', async () => {
      const wrapper = mountComponent()

      // Set email
      wrapper.vm.email = 'test@example.com'
      await wrapper.vm.$nextTick()

      // Call add method
      await wrapper.vm.add()
      await flushPromises()

      // Should show the added ID message
      expect(wrapper.text()).toContain('123')
    })
  })

  describe('add functionality', () => {
    it('calls userStore.add with the email', async () => {
      const wrapper = mountComponent()

      wrapper.vm.email = 'newuser@example.com'
      await wrapper.vm.$nextTick()

      await wrapper.vm.add()
      await flushPromises()

      expect(mockUserStore.add).toHaveBeenCalledWith({
        email: 'newuser@example.com',
      })
    })

    it('calls memberStore.add with userid and groupid after userStore.add succeeds', async () => {
      const wrapper = mountComponent({ groupid: 789 })

      wrapper.vm.email = 'newuser@example.com'
      await wrapper.vm.$nextTick()

      await wrapper.vm.add()
      await flushPromises()

      expect(mockMemberStore.add).toHaveBeenCalledWith({
        userid: 123, // returned from userStore.add
        groupid: 789,
      })
    })

    it('does not call memberStore.add if userStore.add returns falsy', async () => {
      mockUserStore.add.mockResolvedValue(null)

      const wrapper = mountComponent()

      wrapper.vm.email = 'newuser@example.com'
      await wrapper.vm.$nextTick()

      await wrapper.vm.add()
      await flushPromises()

      expect(mockMemberStore.add).not.toHaveBeenCalled()
    })

    it('sets addedId after successful add', async () => {
      const wrapper = mountComponent()

      wrapper.vm.email = 'newuser@example.com'
      await wrapper.vm.$nextTick()

      await wrapper.vm.add()
      await flushPromises()

      expect(wrapper.vm.addedId).toBe(123)
    })
  })
})
