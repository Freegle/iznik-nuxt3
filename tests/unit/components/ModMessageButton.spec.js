import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

import ModMessageButton from '~/modtools/components/ModMessageButton.vue'

const mockMessage = {
  id: 42,
  subject: 'WANTED: Dog',
  fromuser: 99,
  heldby: null,
  groups: [{ groupid: 10, collection: 'Pending' }],
}

const mockMessageStore = {
  byId: vi.fn().mockReturnValue(mockMessage),
  fetch: vi.fn().mockResolvedValue(mockMessage),
  approve: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue({}),
  spam: vi.fn().mockResolvedValue({}),
  hold: vi.fn().mockResolvedValue({}),
  release: vi.fn().mockResolvedValue({}),
  approveedits: vi.fn().mockResolvedValue({}),
  revertedits: vi.fn().mockResolvedValue({}),
}

const mockUserStore = {
  fetch: vi.fn().mockResolvedValue({}),
  byId: vi.fn(),
}

const mockStdmsgStore = {
  fetch: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/stdmsg', () => ({
  useStdmsgStore: () => mockStdmsgStore,
}))

vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    checkWorkDeferGetMessages: vi.fn(),
  }),
}))

function mountButton(props = {}) {
  return mount(ModMessageButton, {
    props: {
      messageid: 42,
      variant: 'primary',
      label: 'Approve',
      icon: 'check',
      approve: true,
      ...props,
    },
    global: {
      stubs: {
        SpinButton: {
          template: '<button @click="$emit(\'handle\')"><slot /></button>',
          emits: ['handle'],
        },
        ConfirmModal: { template: '<div />' },
        ModStdMessageModal: { template: '<div />' },
        'v-icon': { template: '<i />' },
      },
    },
  })
}

describe('ModMessageButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageStore.byId.mockReturnValue(mockMessage)
  })

  it('calls userStore.fetch with fromuser id after approve', async () => {
    const wrapper = mountButton({ approve: true })

    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(mockMessageStore.approve).toHaveBeenCalledWith(42, 10)
    expect(mockUserStore.fetch).toHaveBeenCalledWith(99, true)
  })

  it('does not call userStore.fetch if message has no fromuser', async () => {
    mockMessageStore.byId.mockReturnValue({ ...mockMessage, fromuser: null })
    const wrapper = mountButton({ approve: true })

    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(mockUserStore.fetch).not.toHaveBeenCalled()
  })
})
