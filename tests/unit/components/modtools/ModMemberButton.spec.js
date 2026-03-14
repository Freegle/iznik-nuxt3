import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModMemberButton from '~/modtools/components/ModMemberButton.vue'

// Mock stores
const mockMemberStore = {
  delete: vi.fn(),
  reviewHold: vi.fn(),
  reviewRelease: vi.fn(),
}

const mockSpammerStore = {
  confirm: vi.fn(),
  requestremove: vi.fn(),
  remove: vi.fn(),
  safelist: vi.fn(),
  hold: vi.fn(),
  release: vi.fn(),
}

const mockStdmsgStore = {
  fetch: vi.fn(),
}

vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

vi.mock('~/stores/spammer', () => ({
  useSpammerStore: () => mockSpammerStore,
}))

vi.mock('~/stores/stdmsg', () => ({
  useStdmsgStore: () => mockStdmsgStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myid: { value: 999 },
  }),
}))

describe('ModMemberButton', () => {
  const defaultMember = {
    id: 123,
    userid: 456,
    displayname: 'Test User',
    groupid: 789,
    membershipid: 111,
    spammer: {
      id: 222,
    },
  }

  const defaultProps = {
    member: defaultMember,
    variant: 'primary',
    label: 'Test Button',
    icon: 'check',
  }

  function mountComponent(props = {}) {
    return mount(ModMemberButton, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          SpinButton: {
            template:
              '<button :class="variant" :disabled="disabled" @click="$emit(\'handle\', () => {})"><slot />{{ label }}</button>',
            props: ['variant', 'iconName', 'label', 'spinclass', 'disabled'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon', 'title'],
          },
          ConfirmModal: {
            template: '<div class="confirm-modal" />',
            methods: { show: vi.fn() },
          },
          ModSpammerReport: {
            template: '<div class="spam-report-modal" />',
            props: ['user'],
            methods: { show: vi.fn() },
          },
          ModStdMessageModal: {
            template: '<div class="std-message-modal" />',
            props: ['stdmsg', 'member', 'autosend'],
            methods: { show: vi.fn(), fillin: vi.fn() },
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMemberStore.delete.mockResolvedValue()
    mockMemberStore.reviewHold.mockResolvedValue()
    mockMemberStore.reviewRelease.mockResolvedValue()
    mockSpammerStore.confirm.mockResolvedValue()
    mockSpammerStore.requestremove.mockResolvedValue()
    mockSpammerStore.remove.mockResolvedValue()
    mockSpammerStore.safelist.mockResolvedValue()
    mockSpammerStore.hold.mockResolvedValue()
    mockSpammerStore.release.mockResolvedValue()
    mockStdmsgStore.fetch.mockResolvedValue({ id: 1, title: 'Test Msg' })
  })

  describe('rendering', () => {
    it('renders SpinButton with correct props', () => {
      const wrapper = mountComponent({
        variant: 'danger',
        label: 'Delete',
        icon: 'trash',
      })
      const button = wrapper.find('button')
      expect(button.text()).toContain('Delete')
      expect(button.classes()).toContain('danger')
    })

    it('shows autosend indicator when autosend is true', () => {
      const wrapper = mountComponent({ autosend: true })
      expect(wrapper.find('.autosend').exists()).toBe(true)
    })

    it('hides autosend indicator when autosend is false', () => {
      const wrapper = mountComponent({ autosend: false })
      expect(wrapper.find('.autosend').exists()).toBe(false)
    })

    it('button is disabled when disabled prop is true', () => {
      const wrapper = mountComponent({ disabled: true })
      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })
  })

  describe('spinclass computed', () => {
    it('returns success for primary variant', () => {
      const wrapper = mountComponent({ variant: 'primary' })
      expect(wrapper.vm.spinclass).toBe('success')
    })

    it('returns null for non-primary variant', () => {
      const wrapper = mountComponent({ variant: 'danger' })
      expect(wrapper.vm.spinclass).toBeNull()
    })
  })

  describe('groupid computed', () => {
    it('returns member groupid', () => {
      const wrapper = mountComponent({
        member: { ...defaultMember, groupid: 555 },
      })
      expect(wrapper.vm.groupid).toBe(555)
    })
  })

  describe('delete action', () => {
    it('shows delete modal when delete button clicked', async () => {
      const wrapper = mountComponent({ delete: true })
      await wrapper.find('button').trigger('click')
      expect(wrapper.vm.showDeleteModal).toBe(true)
    })

    it('emits pressed event after delete action', async () => {
      const wrapper = mountComponent({ delete: true })
      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('pressed')).toBeTruthy()
    })
  })

  describe('deleteConfirmed', () => {
    it('calls memberStore.delete with correct params', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.deleteConfirmed()
      expect(mockMemberStore.delete).toHaveBeenCalledWith({
        id: 456,
        groupid: 789,
      })
    })
  })

  describe('spam actions', () => {
    it('shows spam modal when spamreport clicked', async () => {
      const wrapper = mountComponent({ spamreport: true })
      await wrapper.find('button').trigger('click')
      expect(wrapper.vm.showSpamModal).toBe(true)
    })

    it('calls spammerStore.confirm for spamconfirm action', async () => {
      const wrapper = mountComponent({ spamconfirm: true })
      await wrapper.find('button').trigger('click')
      await flushPromises()
      expect(mockSpammerStore.confirm).toHaveBeenCalledWith({
        id: 222,
        userid: 456,
      })
    })

    it('calls spammerStore.requestremove for spamrequestremove action', async () => {
      const wrapper = mountComponent({ spamrequestremove: true })
      await wrapper.find('button').trigger('click')
      await flushPromises()
      expect(mockSpammerStore.requestremove).toHaveBeenCalledWith({
        id: 222,
        userid: 456,
      })
    })

    it('calls spammerStore.remove for spamremove action', async () => {
      const wrapper = mountComponent({ spamremove: true })
      await wrapper.find('button').trigger('click')
      await flushPromises()
      expect(mockSpammerStore.remove).toHaveBeenCalledWith({
        id: 222,
        userid: 456,
      })
    })

    it('calls spammerStore.safelist with myid for spamsafelist action', async () => {
      const wrapper = mountComponent({ spamsafelist: true })
      await wrapper.find('button').trigger('click')
      await flushPromises()
      expect(mockSpammerStore.safelist).toHaveBeenCalledWith({
        id: 222,
        userid: 456,
        myid: 999,
      })
    })

    it('calls spammerStore.hold with myid for spamhold action', async () => {
      const wrapper = mountComponent({ spamhold: true })
      await wrapper.find('button').trigger('click')
      await flushPromises()
      expect(mockSpammerStore.hold).toHaveBeenCalledWith({
        id: 222,
        userid: 456,
        myid: 999,
      })
    })
  })

  describe('release action', () => {
    it('calls spammerStore.release for release action', async () => {
      const wrapper = mountComponent({ release: true })
      await wrapper.find('button').trigger('click')
      await flushPromises()
      expect(mockSpammerStore.release).toHaveBeenCalledWith({
        id: 222,
        userid: 456,
      })
    })
  })

  describe('review actions', () => {
    it('calls memberStore.reviewHold for reviewhold action', async () => {
      const wrapper = mountComponent({ reviewhold: true })
      await wrapper.find('button').trigger('click')
      await flushPromises()
      expect(mockMemberStore.reviewHold).toHaveBeenCalledWith({
        membershipid: 111,
        groupid: 123, // Falls back to member.id when reviewgroupid not set
      })
    })

    it('uses reviewgroupid when provided for reviewhold', async () => {
      const wrapper = mountComponent({ reviewhold: true, reviewgroupid: 333 })
      await wrapper.find('button').trigger('click')
      await flushPromises()
      expect(mockMemberStore.reviewHold).toHaveBeenCalledWith({
        membershipid: 111,
        groupid: 333,
      })
    })

    it('calls memberStore.reviewRelease for reviewrelease action', async () => {
      const wrapper = mountComponent({ reviewrelease: true })
      await wrapper.find('button').trigger('click')
      await flushPromises()
      expect(mockMemberStore.reviewRelease).toHaveBeenCalledWith({
        membershipid: 111,
        groupid: 123,
      })
    })

    it('uses reviewgroupid when provided for reviewrelease', async () => {
      const wrapper = mountComponent({
        reviewrelease: true,
        reviewgroupid: 444,
      })
      await wrapper.find('button').trigger('click')
      await flushPromises()
      expect(mockMemberStore.reviewRelease).toHaveBeenCalledWith({
        membershipid: 111,
        groupid: 444,
      })
    })
  })

  describe('standard message modal', () => {
    it('shows stdmsg modal for leave action', async () => {
      const wrapper = mountComponent({ leave: true })
      await wrapper.find('button').trigger('click')
      await flushPromises()
      expect(wrapper.vm.showStdMsgModal).toBe(true)
      expect(wrapper.vm.stdmsg).toEqual({ action: 'Leave Member' })
    })

    it('fetches stdmsg when stdmsgid provided', async () => {
      const wrapper = mountComponent({ stdmsgid: 555 })
      await wrapper.find('button').trigger('click')
      await flushPromises()
      expect(mockStdmsgStore.fetch).toHaveBeenCalledWith(555)
      expect(wrapper.vm.showStdMsgModal).toBe(true)
    })
  })

  describe('spamignore action', () => {
    it('does nothing for spamignore (not implemented)', async () => {
      const wrapper = mountComponent({ spamignore: true })
      await wrapper.find('button').trigger('click')
      await flushPromises()
      // Should emit pressed but no store calls
      expect(wrapper.emitted('pressed')).toBeTruthy()
      expect(mockSpammerStore.confirm).not.toHaveBeenCalled()
    })
  })

  describe('props', () => {
    it('defaults all action props to false', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('delete')).toBe(false)
      expect(wrapper.props('release')).toBe(false)
      expect(wrapper.props('spamreport')).toBe(false)
      expect(wrapper.props('spamconfirm')).toBe(false)
      expect(wrapper.props('spamrequestremove')).toBe(false)
      expect(wrapper.props('spamremove')).toBe(false)
      expect(wrapper.props('spamsafelist')).toBe(false)
      expect(wrapper.props('spamhold')).toBe(false)
      expect(wrapper.props('spamignore')).toBe(false)
      expect(wrapper.props('reviewhold')).toBe(false)
      expect(wrapper.props('reviewrelease')).toBe(false)
      expect(wrapper.props('leave')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles member without spammer property gracefully', async () => {
      const memberWithoutSpammer = {
        id: 123,
        userid: 456,
        displayname: 'Test User',
        groupid: 789,
        membershipid: 111,
      }
      const wrapper = mountComponent({
        member: memberWithoutSpammer,
        reviewhold: true,
      })
      // reviewhold doesn't need spammer, should work
      await wrapper.find('button').trigger('click')
      await flushPromises()
      expect(mockMemberStore.reviewHold).toHaveBeenCalled()
    })

    it('callback is called after click handler completes', async () => {
      const wrapper = mountComponent({ delete: true })
      const button = wrapper.find('button')
      await button.trigger('click')
      // The callback is called by SpinButton stub in @handle
      expect(wrapper.emitted('pressed')).toBeTruthy()
    })
  })
})
