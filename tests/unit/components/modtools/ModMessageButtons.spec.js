import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModMessageButtons from '~/modtools/components/ModMessageButtons.vue'

// Mock stores and composables before vi.mock calls using vi.hoisted
const { mockMessageStore } = vi.hoisted(() => {
  const mockMessageStore = {
    updateMT: vi.fn().mockResolvedValue(),
  }
  return { mockMessageStore }
})

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/composables/useStdMsgs', () => ({
  copyStdMsgs: (config) => config.stdmsgs || [],
  icon: (stdmsg) => {
    switch (stdmsg.action) {
      case 'Approve':
        return 'check'
      case 'Reject':
        return 'times'
      case 'Leave':
      case 'Leave Approved Message':
        return 'envelope'
      case 'Delete':
      case 'Delete Approved Message':
        return 'trash-alt'
      case 'Edit':
        return 'pen'
      case 'Hold Message':
        return 'pause'
      default:
        return 'check'
    }
  },
  variant: (stdmsg) => {
    switch (stdmsg.action) {
      case 'Approve':
        return 'primary'
      case 'Reject':
        return 'warning'
      case 'Leave':
      case 'Leave Approved Message':
        return 'primary'
      case 'Delete':
      case 'Delete Approved Message':
        return 'danger'
      case 'Edit':
        return 'primary'
      case 'Hold Message':
        return 'warning'
      default:
        return 'white'
    }
  },
}))

describe('ModMessageButtons', () => {
  // Helper to create test message data
  const createMessage = (overrides = {}) => ({
    id: 123,
    subject: 'Test Message Subject',
    type: 'Offer',
    heldby: null,
    groups: [{ groupid: 456, collection: 'Pending' }],
    outcomes: [],
    ...overrides,
  })

  // Helper to create test modconfig
  const createModConfig = (overrides = {}) => ({
    id: 1,
    stdmsgs: [
      { id: 1, title: 'Approve Message', action: 'Approve', rarelyused: 0 },
      { id: 2, title: 'Reject Message', action: 'Reject', rarelyused: 0 },
      { id: 3, title: 'Delete Message', action: 'Delete', rarelyused: 1 },
      { id: 4, title: 'Edit Message', action: 'Edit', rarelyused: 0 },
    ],
    messageorder: null,
    ...overrides,
  })

  // Common stubs for child components
  const commonStubs = {
    ModMessageButton: {
      template: `<button
        class="mod-message-button"
        :class="{
          [variant]: true,
          approve: approve === '' || approve === true,
          reject: reject === '' || reject === true,
          delete: $props.delete === '' || $props.delete === true,
          hold: hold === '' || hold === true,
          release: release === '' || release === true,
          spam: spam === '' || spam === true,
          approveedits: approveedits === '' || approveedits === true,
          revertedits: revertedits === '' || revertedits === true,
          leave: leave === '' || leave === true
        }"><slot />{{ label }}</button>`,
      props: [
        'message',
        'variant',
        'icon',
        'label',
        'stdmsgid',
        'autosend',
        'approve',
        'reject',
        'delete',
        'hold',
        'release',
        'spam',
        'approveedits',
        'revertedits',
        'leave',
      ],
    },
    SpinButton: {
      template:
        '<button class="spin-button" @click="$emit(\'handle\', () => {})"><slot />{{ label }}</button>',
      props: ['variant', 'iconName', 'label', 'confirm', 'flex'],
    },
    OurToggle: {
      template: '<div class="our-toggle">{{ labels.checked }}</div>',
      props: [
        'modelValue',
        'height',
        'width',
        'fontSize',
        'sync',
        'labels',
        'variant',
      ],
    },
    'b-button': {
      template:
        '<button class="b-button" @click="$emit(\'click\')"><slot /></button>',
      props: ['variant'],
    },
    'v-icon': {
      template: '<i :class="icon"></i>',
      props: ['icon'],
    },
    'client-only': {
      template: '<div><slot /></div>',
    },
  }

  function mountComponent(props = {}) {
    return mount(ModMessageButtons, {
      props: {
        message: createMessage(),
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
    it('renders the component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders OurToggle for autosend control', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.our-toggle').exists()).toBe(true)
      expect(wrapper.find('.our-toggle').text()).toContain('Allow autosend')
    })
  })

  describe('props', () => {
    it('requires message prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('message')).toBeDefined()
    })

    it('defaults modconfig to null', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('modconfig')).toBeNull()
    })

    it('defaults editreview to false', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('editreview')).toBe(false)
    })

    it('defaults cantpost to false', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('cantpost')).toBe(false)
    })
  })

  describe('pending message buttons', () => {
    it('shows approve button for pending messages', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
      })
      expect(wrapper.find('.mod-message-button.approve').exists()).toBe(true)
    })

    it('shows reject button for pending messages', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
      })
      expect(wrapper.find('.mod-message-button.reject').exists()).toBe(true)
    })

    it('shows delete button for pending messages', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
      })
      expect(wrapper.find('.mod-message-button.delete').exists()).toBe(true)
    })

    it('shows hold button for pending messages without heldby', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
          heldby: null,
        }),
      })
      expect(wrapper.find('.mod-message-button.hold').exists()).toBe(true)
    })

    it('hides hold button when message is held', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
          heldby: { id: 1 },
        }),
      })
      expect(wrapper.find('.mod-message-button.hold').exists()).toBe(false)
    })

    it('shows spam button for pending messages', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
      })
      expect(wrapper.find('.mod-message-button.spam').exists()).toBe(true)
    })

    it('hides approve button when cantpost is true', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
        cantpost: true,
      })
      expect(wrapper.find('.mod-message-button.approve').exists()).toBe(false)
    })
  })

  describe('approved message buttons', () => {
    it('shows leave (blank reply) button for approved messages', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Approved' }],
        }),
      })
      expect(wrapper.find('.mod-message-button.leave').exists()).toBe(true)
    })

    it('shows delete button for approved messages', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Approved' }],
        }),
      })
      expect(wrapper.find('.mod-message-button.delete').exists()).toBe(true)
    })

    it('shows spam button for approved messages', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Approved' }],
        }),
      })
      expect(wrapper.find('.mod-message-button.spam').exists()).toBe(true)
    })

    it('shows Mark as TAKEN button for Offer without outcomes', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Approved' }],
          type: 'Offer',
          outcomes: [],
        }),
      })
      const spinButtons = wrapper.findAll('.spin-button')
      const takenButton = spinButtons.find((btn) =>
        btn.text().includes('Mark as TAKEN')
      )
      expect(takenButton).toBeDefined()
    })

    it('shows Mark as RECEIVED button for Wanted without outcomes', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Approved' }],
          type: 'Wanted',
          outcomes: [],
        }),
      })
      const spinButtons = wrapper.findAll('.spin-button')
      const receivedButton = spinButtons.find((btn) =>
        btn.text().includes('Mark as RECEIVED')
      )
      expect(receivedButton).toBeDefined()
    })

    it('shows Mark as Withdrawn button for messages without outcomes', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Approved' }],
          outcomes: [],
        }),
      })
      const spinButtons = wrapper.findAll('.spin-button')
      const withdrawnButton = spinButtons.find((btn) =>
        btn.text().includes('Mark as Withdrawn')
      )
      expect(withdrawnButton).toBeDefined()
    })

    it('hides TAKEN button when message has outcomes', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Approved' }],
          type: 'Offer',
          outcomes: [{ id: 1, outcome: 'Taken' }],
        }),
      })
      const spinButtons = wrapper.findAll('.spin-button')
      const takenButton = spinButtons.find((btn) =>
        btn.text().includes('Mark as TAKEN')
      )
      expect(takenButton).toBeUndefined()
    })
  })

  describe('editreview buttons', () => {
    it('shows accept edit button when editreview is true', () => {
      const wrapper = mountComponent({
        editreview: true,
      })
      expect(wrapper.find('.mod-message-button.approveedits').exists()).toBe(
        true
      )
    })

    it('shows reject edit button when editreview is true', () => {
      const wrapper = mountComponent({
        editreview: true,
      })
      expect(wrapper.find('.mod-message-button.revertedits').exists()).toBe(
        true
      )
    })

    it('shows blank reply button when editreview is true', () => {
      const wrapper = mountComponent({
        editreview: true,
      })
      expect(wrapper.find('.mod-message-button.leave').exists()).toBe(true)
    })

    it('hides pending buttons when editreview is true', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
        editreview: true,
      })
      // Should not show the normal pending buttons like approve
      expect(wrapper.find('.mod-message-button.approve').exists()).toBe(false)
    })
  })

  describe('hasCollection helper', () => {
    it('returns true when message has Pending collection', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
      })
      expect(wrapper.vm.pending).toBe(true)
      expect(wrapper.vm.approved).toBe(false)
    })

    it('returns true when message has Approved collection', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Approved' }],
        }),
      })
      expect(wrapper.vm.pending).toBe(false)
      expect(wrapper.vm.approved).toBe(true)
    })

    it('returns false when message has no matching collection', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Other' }],
        }),
      })
      expect(wrapper.vm.pending).toBe(false)
      expect(wrapper.vm.approved).toBe(false)
    })
  })

  describe('validActions computed', () => {
    it('returns pending actions for pending messages', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
      })
      expect(wrapper.vm.validActions).toContain('Reject')
      expect(wrapper.vm.validActions).toContain('Leave')
      expect(wrapper.vm.validActions).toContain('Delete')
      expect(wrapper.vm.validActions).toContain('Edit')
      expect(wrapper.vm.validActions).toContain('Hold Message')
      expect(wrapper.vm.validActions).toContain('Approve')
    })

    it('excludes Approve when cantpost is true', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
        cantpost: true,
      })
      expect(wrapper.vm.validActions).not.toContain('Approve')
    })

    it('returns approved actions for approved messages', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Approved' }],
        }),
      })
      expect(wrapper.vm.validActions).toContain('Leave Approved Message')
      expect(wrapper.vm.validActions).toContain('Delete Approved Message')
      expect(wrapper.vm.validActions).toContain('Edit')
    })

    it('returns empty array for other collections', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Other' }],
        }),
      })
      expect(wrapper.vm.validActions).toEqual([])
    })
  })

  describe('filtered computed', () => {
    it('returns empty array when modconfig is null', () => {
      const wrapper = mountComponent({ modconfig: null })
      expect(wrapper.vm.filtered).toEqual([])
    })

    it('filters standard messages by valid actions', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
        modconfig: createModConfig({
          stdmsgs: [
            { id: 1, title: 'Approve', action: 'Approve', rarelyused: 0 },
            { id: 2, title: 'Other', action: 'SomeOtherAction', rarelyused: 0 },
          ],
        }),
      })
      expect(wrapper.vm.filtered.length).toBe(1)
      expect(wrapper.vm.filtered[0].action).toBe('Approve')
    })

    it('excludes rarely used messages by default', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
        modconfig: createModConfig({
          stdmsgs: [
            { id: 1, title: 'Common', action: 'Approve', rarelyused: 0 },
            { id: 2, title: 'Rare', action: 'Reject', rarelyused: 1 },
          ],
        }),
      })
      expect(wrapper.vm.filtered.length).toBe(1)
      expect(wrapper.vm.filtered[0].title).toBe('Common')
    })
  })

  describe('rareToShow computed', () => {
    it('returns count of rarely used messages not shown', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
        modconfig: createModConfig({
          stdmsgs: [
            { id: 1, title: 'Common', action: 'Approve', rarelyused: 0 },
            { id: 2, title: 'Rare1', action: 'Reject', rarelyused: 1 },
            { id: 3, title: 'Rare2', action: 'Delete', rarelyused: 1 },
          ],
        }),
      })
      expect(wrapper.vm.rareToShow).toBe(2)
    })

    it('returns 0 when no rarely used messages', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
        modconfig: createModConfig({
          stdmsgs: [
            { id: 1, title: 'Common1', action: 'Approve', rarelyused: 0 },
            { id: 2, title: 'Common2', action: 'Reject', rarelyused: 0 },
          ],
        }),
      })
      expect(wrapper.vm.rareToShow).toBe(0)
    })
  })

  describe('showRare toggle', () => {
    it('shows button to reveal rare messages when there are some', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
        modconfig: createModConfig({
          stdmsgs: [
            { id: 1, title: 'Common', action: 'Approve', rarelyused: 0 },
            { id: 2, title: 'Rare', action: 'Reject', rarelyused: 1 },
          ],
        }),
      })
      expect(wrapper.text()).toContain('+1...')
    })

    it('hides rare button when no rare messages exist', () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
        modconfig: createModConfig({
          stdmsgs: [
            { id: 1, title: 'Common', action: 'Approve', rarelyused: 0 },
          ],
        }),
      })
      expect(wrapper.text()).not.toContain('+')
    })

    it('shows all messages when showRare is toggled', async () => {
      const wrapper = mountComponent({
        message: createMessage({
          groups: [{ groupid: 456, collection: 'Pending' }],
        }),
        modconfig: createModConfig({
          stdmsgs: [
            { id: 1, title: 'Common', action: 'Approve', rarelyused: 0 },
            { id: 2, title: 'Rare', action: 'Reject', rarelyused: 1 },
          ],
        }),
      })
      // Initially should have 1 filtered
      expect(wrapper.vm.filtered.length).toBe(1)

      // Toggle showRare
      wrapper.vm.showRare = true
      await wrapper.vm.$nextTick()

      // Now should have 2 filtered
      expect(wrapper.vm.filtered.length).toBe(2)
    })
  })

  describe('outcome method', () => {
    it('calls messageStore.updateMT with Taken outcome', () => {
      const wrapper = mountComponent({
        message: createMessage({ id: 999 }),
      })
      const callback = vi.fn()
      wrapper.vm.outcome(callback, 'Taken')
      expect(mockMessageStore.updateMT).toHaveBeenCalledWith({
        action: 'Outcome',
        id: 999,
        outcome: 'Taken',
      })
      expect(callback).toHaveBeenCalled()
    })

    it('calls messageStore.updateMT with Received outcome', () => {
      const wrapper = mountComponent({
        message: createMessage({ id: 888 }),
      })
      wrapper.vm.outcome(null, 'Received')
      expect(mockMessageStore.updateMT).toHaveBeenCalledWith({
        action: 'Outcome',
        id: 888,
        outcome: 'Received',
      })
    })

    it('calls messageStore.updateMT with Withdrawn outcome', () => {
      const wrapper = mountComponent({
        message: createMessage({ id: 777 }),
      })
      wrapper.vm.outcome(null, 'Withdrawn')
      expect(mockMessageStore.updateMT).toHaveBeenCalledWith({
        action: 'Outcome',
        id: 777,
        outcome: 'Withdrawn',
      })
    })
  })

  describe('allowAutoSend state', () => {
    it('defaults to true', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.allowAutoSend).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles message with no groups', () => {
      const wrapper = mountComponent({
        message: createMessage({ groups: undefined }),
      })
      expect(wrapper.vm.pending).toBe(false)
      expect(wrapper.vm.approved).toBe(false)
    })

    it('handles message with empty groups array', () => {
      const wrapper = mountComponent({
        message: createMessage({ groups: [] }),
      })
      expect(wrapper.vm.pending).toBe(false)
      expect(wrapper.vm.approved).toBe(false)
    })

    it('handles modconfig with empty stdmsgs', () => {
      const wrapper = mountComponent({
        modconfig: createModConfig({ stdmsgs: [] }),
      })
      expect(wrapper.vm.filtered).toEqual([])
    })
  })
})
