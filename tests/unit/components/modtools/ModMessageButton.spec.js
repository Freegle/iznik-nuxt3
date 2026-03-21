import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModMessageButton from '~/modtools/components/ModMessageButton.vue'

// Mock stores and composables before vi.mock calls using vi.hoisted
const { mockMessageStore, mockStdmsgStore, mockCheckWorkDeferGetMessages } =
  vi.hoisted(() => {
    const mockMessageStore = {
      approve: vi.fn().mockResolvedValue(),
      delete: vi.fn().mockResolvedValue(),
      spam: vi.fn().mockResolvedValue(),
      hold: vi.fn().mockResolvedValue(),
      release: vi.fn().mockResolvedValue(),
      approveedits: vi.fn().mockResolvedValue(),
      revertedits: vi.fn().mockResolvedValue(),
      byId: vi.fn(),
      fetch: vi.fn().mockResolvedValue(),
    }

    const mockStdmsgStore = {
      fetch: vi.fn().mockResolvedValue({
        id: 1,
        title: 'Test Standard Message',
        body: 'Test body',
        action: 'Reject',
      }),
    }

    const mockCheckWorkDeferGetMessages = vi.fn()

    return { mockMessageStore, mockStdmsgStore, mockCheckWorkDeferGetMessages }
  })

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/stdmsg', () => ({
  useStdmsgStore: () => mockStdmsgStore,
}))

vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    checkWorkDeferGetMessages: mockCheckWorkDeferGetMessages,
  }),
}))

describe('ModMessageButton', () => {
  // Helper to create test message data
  const createMessage = (overrides = {}) => ({
    id: 123,
    subject: 'Test Message Subject',
    heldby: null,
    groups: [{ groupid: 456, collection: 'Pending' }],
    ...overrides,
  })

  // Common stubs for child components
  const commonStubs = {
    SpinButton: {
      template:
        '<button class="spin-button" :disabled="disabled" @click="$emit(\'handle\', () => {})"><slot />{{ label }}</button>',
      props: [
        'variant',
        'iconName',
        'label',
        'spinclass',
        'disabled',
        'confirm',
        'flex',
        'iconClass',
      ],
    },
    ConfirmModal: {
      template: '<div class="confirm-modal" v-if="true"><slot /></div>',
      props: ['title'],
      methods: {
        show: vi.fn(),
      },
    },
    ModStdMessageModal: {
      template: '<div class="stdmsg-modal"><slot /></div>',
      props: ['stdmsgid', 'stdmsgaction', 'messageid', 'autosend'],
      methods: {
        show: vi.fn(),
        fillin: vi.fn(),
      },
    },
    'v-icon': {
      template: '<i :class="icon"></i>',
      props: ['icon', 'title'],
    },
  }

  function mountComponent(props = {}, messageOverrides = {}) {
    const messageData = createMessage(messageOverrides)

    // Set up message store mock to return the message by ID
    mockMessageStore.byId.mockImplementation((id) => {
      if (id === messageData.id) return messageData
      return null
    })

    return mount(ModMessageButton, {
      props: {
        messageid: messageData.id,
        variant: 'primary',
        label: 'Test Button',
        icon: 'check',
        ...props,
      },
      global: {
        stubs: commonStubs,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders SpinButton with correct props', () => {
      const wrapper = mountComponent({
        variant: 'warning',
        label: 'Hold',
        icon: 'pause',
      })
      const spinButton = wrapper.find('.spin-button')
      expect(spinButton.exists()).toBe(true)
      expect(spinButton.text()).toContain('Hold')
    })

    it('shows autosend icon when autosend prop is true', () => {
      const wrapper = mountComponent({ autosend: true })
      expect(wrapper.find('.autosend').exists()).toBe(true)
    })

    it('hides autosend icon when autosend prop is false', () => {
      const wrapper = mountComponent({ autosend: false })
      expect(wrapper.find('.autosend').exists()).toBe(false)
    })

    it('passes disabled prop to SpinButton', () => {
      const wrapper = mountComponent({ disabled: true })
      const spinButton = wrapper.find('.spin-button')
      expect(spinButton.attributes('disabled')).toBe('')
    })
  })

  describe('groupid computed', () => {
    it('returns groupid from first group', () => {
      const wrapper = mountComponent(
        {},
        { groups: [{ groupid: 789, collection: 'Pending' }] }
      )
      expect(wrapper.vm.groupid).toBe(789)
    })

    it('returns null when message has no groups', () => {
      const wrapper = mountComponent({}, { groups: [] })
      expect(wrapper.vm.groupid).toBeNull()
    })

    it('returns null when groups is undefined', () => {
      const wrapper = mountComponent({}, { groups: undefined })
      expect(wrapper.vm.groupid).toBeNull()
    })
  })

  describe('spinclass computed', () => {
    it('returns "success" when variant is primary', () => {
      const wrapper = mountComponent({ variant: 'primary' })
      expect(wrapper.vm.spinclass).toBe('success')
    })

    it('returns null when variant is not primary', () => {
      const wrapper = mountComponent({ variant: 'warning' })
      expect(wrapper.vm.spinclass).toBeNull()
    })

    it('returns null when variant is danger', () => {
      const wrapper = mountComponent({ variant: 'danger' })
      expect(wrapper.vm.spinclass).toBeNull()
    })
  })

  describe('confirmButton computed', () => {
    it('returns true when message is held and action is not spam or delete', () => {
      const wrapper = mountComponent({ approve: true }, { heldby: { id: 1 } })
      expect(wrapper.vm.confirmButton).toBe(true)
    })

    it('returns false when message is held but action is spam', () => {
      const wrapper = mountComponent({ spam: true }, { heldby: { id: 1 } })
      expect(wrapper.vm.confirmButton).toBe(false)
    })

    it('returns false when message is held but action is delete', () => {
      const wrapper = mountComponent({ delete: true }, { heldby: { id: 1 } })
      expect(wrapper.vm.confirmButton).toBe(false)
    })

    it('returns falsy when message is not held', () => {
      const wrapper = mountComponent({ approve: true }, { heldby: null })
      expect(wrapper.vm.confirmButton).toBeFalsy()
    })
  })

  describe('approve action', () => {
    it('calls messageStore.approve when approve prop is true', async () => {
      const wrapper = mountComponent(
        { approve: true },
        { id: 111, groups: [{ groupid: 222 }] }
      )
      await wrapper.vm.click()
      expect(mockMessageStore.approve).toHaveBeenCalledWith(111, 222)
    })

    it('calls checkWorkDeferGetMessages after approve', async () => {
      const wrapper = mountComponent({ approve: true })
      await wrapper.vm.click()
      expect(mockCheckWorkDeferGetMessages).toHaveBeenCalled()
    })
  })

  describe('delete action', () => {
    it('sets showDeleteModal to true when delete prop is true', async () => {
      const wrapper = mountComponent({ delete: true })
      await wrapper.vm.click()
      expect(wrapper.vm.showDeleteModal).toBe(true)
    })

    it('calls messageStore.delete when deleteConfirmed is called', async () => {
      const wrapper = mountComponent(
        { delete: true },
        { id: 333, groups: [{ groupid: 444 }] }
      )
      await wrapper.vm.deleteConfirmed()
      expect(mockMessageStore.delete).toHaveBeenCalledWith({
        id: 333,
        groupid: 444,
      })
    })

    it('calls checkWorkDeferGetMessages after delete', async () => {
      const wrapper = mountComponent({ delete: true })
      await wrapper.vm.deleteConfirmed()
      expect(mockCheckWorkDeferGetMessages).toHaveBeenCalled()
    })
  })

  describe('hold action', () => {
    it('calls messageStore.hold when hold prop is true', async () => {
      const wrapper = mountComponent({ hold: true }, { id: 555 })
      await wrapper.vm.click()
      expect(mockMessageStore.hold).toHaveBeenCalledWith({ id: 555 })
    })

    it('calls checkWorkDeferGetMessages after hold', async () => {
      const wrapper = mountComponent({ hold: true })
      await wrapper.vm.click()
      expect(mockCheckWorkDeferGetMessages).toHaveBeenCalled()
    })
  })

  describe('release action', () => {
    it('calls messageStore.release when release prop is true', async () => {
      const wrapper = mountComponent({ release: true }, { id: 666 })
      await wrapper.vm.click()
      expect(mockMessageStore.release).toHaveBeenCalledWith({ id: 666 })
    })

    it('calls checkWorkDeferGetMessages after release', async () => {
      const wrapper = mountComponent({ release: true })
      await wrapper.vm.click()
      expect(mockCheckWorkDeferGetMessages).toHaveBeenCalled()
    })
  })

  describe('spam action', () => {
    it('sets showSpamModal to true when spam prop is true', async () => {
      const wrapper = mountComponent({ spam: true })
      await wrapper.vm.click()
      expect(wrapper.vm.showSpamModal).toBe(true)
    })

    it('calls messageStore.spam when spamConfirmed is called', async () => {
      const wrapper = mountComponent(
        { spam: true },
        { id: 777, groups: [{ groupid: 888 }] }
      )
      await wrapper.vm.spamConfirmed()
      expect(mockMessageStore.spam).toHaveBeenCalledWith({
        id: 777,
        groupid: 888,
      })
    })

    it('calls checkWorkDeferGetMessages after spam', async () => {
      const wrapper = mountComponent({ spam: true })
      await wrapper.vm.spamConfirmed()
      expect(mockCheckWorkDeferGetMessages).toHaveBeenCalled()
    })
  })

  describe('approveedits action', () => {
    it('calls messageStore.approveedits when approveedits prop is true', async () => {
      const wrapper = mountComponent({ approveedits: true }, { id: 999 })
      await wrapper.vm.click()
      expect(mockMessageStore.approveedits).toHaveBeenCalledWith({ id: 999 })
    })

    it('calls checkWorkDeferGetMessages after approveedits', async () => {
      const wrapper = mountComponent({ approveedits: true })
      await wrapper.vm.click()
      expect(mockCheckWorkDeferGetMessages).toHaveBeenCalled()
    })
  })

  describe('revertedits action', () => {
    it('calls messageStore.revertedits when revertedits prop is true', async () => {
      const wrapper = mountComponent({ revertedits: true }, { id: 101 })
      await wrapper.vm.click()
      expect(mockMessageStore.revertedits).toHaveBeenCalledWith({ id: 101 })
    })

    it('calls checkWorkDeferGetMessages after revertedits', async () => {
      const wrapper = mountComponent({ revertedits: true })
      await wrapper.vm.click()
      expect(mockCheckWorkDeferGetMessages).toHaveBeenCalled()
    })
  })

  describe('reject action (standard message modal)', () => {
    it('sets stdmsgAction to Reject when reject prop is true', async () => {
      const wrapper = mountComponent({ reject: true })
      await wrapper.vm.click()
      expect(wrapper.vm.stdmsgAction).toBe('Reject')
    })

    it('shows stdmsg modal when reject prop is true', async () => {
      const wrapper = mountComponent({ reject: true })
      await wrapper.vm.click()
      expect(wrapper.vm.showStdMsgModal).toBe(true)
    })
  })

  describe('leave action (standard message modal)', () => {
    it('sets stdmsgAction to Leave when leave prop is true', async () => {
      const wrapper = mountComponent({ leave: true })
      await wrapper.vm.click()
      expect(wrapper.vm.stdmsgAction).toBe('Leave')
    })

    it('shows stdmsg modal when leave prop is true', async () => {
      const wrapper = mountComponent({ leave: true })
      await wrapper.vm.click()
      expect(wrapper.vm.showStdMsgModal).toBe(true)
    })
  })

  describe('stdmsgid action (fetch standard message)', () => {
    it('fetches standard message when stdmsgid prop is set', async () => {
      const wrapper = mountComponent({ stdmsgid: 42 })
      await wrapper.vm.click()
      await flushPromises()
      expect(mockStdmsgStore.fetch).toHaveBeenCalledWith(42)
    })

    it('sets stdmsgId from prop after fetch', async () => {
      const wrapper = mountComponent({ stdmsgid: 42 })
      await wrapper.vm.click()
      await flushPromises()
      expect(wrapper.vm.stdmsgId).toBe(42)
    })

    it('shows stdmsg modal when stdmsgid is set', async () => {
      const wrapper = mountComponent({ stdmsgid: 42 })
      await wrapper.vm.click()
      await flushPromises()
      expect(wrapper.vm.showStdMsgModal).toBe(true)
    })
  })

  describe('callback handling', () => {
    it('calls callback when provided', async () => {
      const callback = vi.fn()
      const wrapper = mountComponent({ approve: true })
      await wrapper.vm.click(callback)
      expect(callback).toHaveBeenCalled()
    })

    it('does not error when callback is not provided', async () => {
      const wrapper = mountComponent({ approve: true })
      await expect(wrapper.vm.click()).resolves.not.toThrow()
    })
  })

  describe('modal rendering', () => {
    it('renders delete confirm modal when showDeleteModal is true', async () => {
      const wrapper = mountComponent(
        { delete: true },
        { subject: 'Test Subject' }
      )
      await wrapper.vm.click()
      await flushPromises()
      expect(wrapper.find('.confirm-modal').exists()).toBe(true)
    })

    it('renders spam confirm modal when showSpamModal is true', async () => {
      const wrapper = mountComponent(
        { spam: true },
        { subject: 'Test Subject' }
      )
      await wrapper.vm.click()
      await flushPromises()
      expect(wrapper.vm.showSpamModal).toBe(true)
    })

    it('renders stdmsg modal when showStdMsgModal is true', async () => {
      const wrapper = mountComponent({ reject: true })
      await wrapper.vm.click()
      await flushPromises()
      expect(wrapper.find('.stdmsg-modal').exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles message with empty groups array', () => {
      const wrapper = mountComponent({}, { groups: [] })
      expect(wrapper.vm.groupid).toBeNull()
    })

    it('handles message with undefined groups', () => {
      const wrapper = mountComponent({}, { groups: undefined })
      expect(wrapper.vm.groupid).toBeNull()
    })

    it('handles click with no action props set', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.click()
      expect(wrapper.vm.showStdMsgModal).toBe(true)
      expect(wrapper.vm.stdmsgId).toBeNull()
      expect(wrapper.vm.stdmsgAction).toBeNull()
    })
  })
})
