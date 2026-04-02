import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

import ModPostingHistoryModal from '~/modtools/components/ModPostingHistoryModal.vue'

const mockUser = {
  id: 1,
  displayname: 'Test User',
  messagehistory: [],
}

const mockUserStore = {
  byId: vi.fn().mockReturnValue(mockUser),
  fetch: vi.fn().mockResolvedValue(mockUser),
}

const mockGroupStore = {
  get: vi.fn().mockReturnValue({ namedisplay: 'Freegle London' }),
  fetch: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

const mockModal = ref(null)
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: vi.fn(),
    show: vi.fn(),
  }),
}))

globalThis.datetimeshort = (d) => d

let wrapper

function mountModal(messagehistory = []) {
  mockUserStore.byId.mockReturnValue({
    ...mockUser,
    messagehistory,
  })

  wrapper = mount(ModPostingHistoryModal, {
    props: { userid: 1 },
    global: {
      stubs: {
        'b-modal': { template: '<div><slot /><slot name="footer" /></div>' },
        'b-row': { template: '<div><slot /></div>' },
        'b-col': { template: '<div><slot /></div>' },
        'b-button': { template: '<button><slot /></button>' },
        ModGroupSelect: {
          template: '<div />',
          props: ['modelValue', 'modonly'],
        },
        NoticeMessage: { template: '<div><slot /></div>', props: ['variant'] },
        'v-icon': { template: '<i />' },
      },
    },
  })
  return wrapper
}

describe('ModPostingHistoryModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = null
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  it('shows "rejected" for a message with collection Rejected and no outcome', () => {
    const wrapper = mountModal([
      {
        id: 10,
        subject: 'WANTED: Dog',
        arrival: '2024-01-01T10:00:00Z',
        groupid: 100,
        collection: 'Rejected',
        outcome: null,
        type: 'Wanted',
        repost: false,
        autorepost: false,
      },
    ])

    expect(wrapper.text()).toContain('rejected')
    expect(wrapper.text()).not.toContain('still open')
  })

  it('shows "still open" for an approved message with no outcome', () => {
    const wrapper = mountModal([
      {
        id: 11,
        subject: 'OFFER: Sofa',
        arrival: '2024-01-01T10:00:00Z',
        groupid: 100,
        collection: 'Approved',
        outcome: null,
        type: 'Offer',
        repost: false,
        autorepost: false,
      },
    ])

    expect(wrapper.text()).toContain('still open')
    expect(wrapper.text()).not.toContain('rejected')
  })

  it('shows outcome text when outcome is set', () => {
    const wrapper = mountModal([
      {
        id: 12,
        subject: 'OFFER: Sofa',
        arrival: '2024-01-01T10:00:00Z',
        groupid: 100,
        collection: 'Approved',
        outcome: 'Taken',
        type: 'Offer',
        repost: false,
        autorepost: false,
      },
    ])

    expect(wrapper.text()).toContain('Taken')
    expect(wrapper.text()).not.toContain('still open')
    expect(wrapper.text()).not.toContain('rejected')
  })
})
