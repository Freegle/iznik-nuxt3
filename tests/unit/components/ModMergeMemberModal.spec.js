import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

import ModMergeMemberModal from '~/modtools/components/ModMergeMemberModal.vue'

const mockMerge = vi.fn().mockResolvedValue(undefined)

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    merge: mockMerge,
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    supportOrAdmin: true,
  }),
}))

const mockModal = ref(null)
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: vi.fn(),
    show: vi.fn(),
  }),
}))

let wrapper

function mountModal() {
  wrapper = mount(ModMergeMemberModal, {
    global: {
      stubs: {
        'b-modal': { template: '<div><slot /><slot name="footer" /></div>' },
        'b-button': {
          template: '<button @click="$emit(\'click\')"><slot /></button>',
        },
        'b-form-input': {
          template:
            '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
          props: ['modelValue', 'type', 'placeholder'],
        },
        OurToggle: {
          template: '<div />',
          props: [
            'modelValue',
            'labels',
            'variant',
            'height',
            'width',
            'fontSize',
            'sync',
          ],
        },
        NoticeMessage: { template: '<div><slot /></div>', props: ['variant'] },
        'v-icon': { template: '<i />' },
      },
    },
  })
  return wrapper
}

describe('ModMergeMemberModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = null
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  it('sends parsed integers to authStore.merge when merging by id', async () => {
    mountModal()

    // Switch to "merge by id" mode (byemail = false)
    wrapper.vm.byemail = false
    await wrapper.vm.$nextTick()

    // Simulate entering IDs as strings (as b-form-input type=number delivers)
    wrapper.vm.id1 = '12345'
    wrapper.vm.id2 = '67890'
    wrapper.vm.reason = 'Test reason'
    await wrapper.vm.$nextTick()

    await wrapper.vm.merge()
    await flushPromises()

    expect(mockMerge).toHaveBeenCalledWith({
      id1: 12345,
      id2: 67890,
      reason: 'Test reason',
    })
    // Confirm they are numbers, not strings
    const call = mockMerge.mock.calls[0][0]
    expect(typeof call.id1).toBe('number')
    expect(typeof call.id2).toBe('number')
  })

  it('sends email strings to authStore.merge when merging by email', async () => {
    mountModal()

    wrapper.vm.byemail = true
    wrapper.vm.email1 = 'user1@example.com'
    wrapper.vm.email2 = 'user2@example.com'
    wrapper.vm.reason = 'Same person'
    await wrapper.vm.$nextTick()

    await wrapper.vm.merge()
    await flushPromises()

    expect(mockMerge).toHaveBeenCalledWith({
      email1: 'user1@example.com',
      email2: 'user2@example.com',
      reason: 'Same person',
    })
  })

  it('disables merge button when reason is missing', async () => {
    mountModal()

    wrapper.vm.byemail = false
    wrapper.vm.id1 = '12345'
    wrapper.vm.id2 = '67890'
    wrapper.vm.reason = null
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.cantMerge).toBe(true)
  })

  it('shows merged confirmation after successful merge', async () => {
    mountModal()

    wrapper.vm.byemail = false
    wrapper.vm.id1 = '12345'
    wrapper.vm.id2 = '67890'
    wrapper.vm.reason = 'Test'
    await wrapper.vm.$nextTick()

    await wrapper.vm.merge()
    await flushPromises()

    expect(wrapper.vm.merged).toBe(true)
    expect(wrapper.text()).toContain("We've merged them.")
  })
})
