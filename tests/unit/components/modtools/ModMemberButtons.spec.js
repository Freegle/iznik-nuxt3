import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import ModMemberButtons from '~/modtools/components/ModMemberButtons.vue'

// Mock useModMe composable
vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    hasPermissionSpamAdmin: { value: true },
  }),
}))

// Mock child components that have deep dependency chains
vi.mock('~/modtools/components/ModMemberButton', () => ({
  default: defineComponent({
    name: 'ModMemberButton',
    props: [
      'member',
      'variant',
      'icon',
      'label',
      'stdmsgid',
      'autosend',
      'spamignore',
      'spamconfirm',
      'spamremove',
      'spamsafelist',
      'spamrequestremove',
      'spamhold',
      'leave',
    ],
    setup(props) {
      return () =>
        h('button', { class: [props.variant, props.label] }, props.label)
    },
  }),
}))

vi.mock('~/modtools/components/ModMemberActions', () => ({
  default: defineComponent({
    name: 'ModMemberActions',
    props: ['userid', 'groupid', 'banned', 'spam'],
    setup(props) {
      return () =>
        h('div', {
          class: 'mod-member-actions',
          'data-userid': props.userid,
          'data-groupid': props.groupid,
        })
    },
  }),
}))

describe('ModMemberButtons', () => {
  const createMember = (overrides = {}) => ({
    id: 123,
    userid: 456,
    displayname: 'Test User',
    groupid: 789,
    membershipid: 111,
    bandate: null,
    memberof: [],
    spammer: null,
    suspectreason: null,
    heldby: null,
    ...overrides,
  })

  const createModConfig = (stdmsgs = []) => ({
    stdmsgs,
  })

  function mountComponent(props = {}) {
    return mount(ModMemberButtons, {
      props: {
        member: createMember(),
        ...props,
      },
      global: {
        stubs: {
          ModMemberButton: {
            template:
              '<button :class="[variant, label]" :data-icon="icon" :data-stdmsgid="stdmsgid"><slot />{{ label }}</button>',
            props: [
              'member',
              'variant',
              'icon',
              'label',
              'stdmsgid',
              'autosend',
              'spamignore',
              'spamconfirm',
              'spamremove',
              'spamsafelist',
              'spamrequestremove',
              'spamhold',
              'leave',
            ],
          },
          ModMemberActions: {
            template:
              '<div class="mod-member-actions" :data-userid="userid" :data-groupid="groupid" />',
            props: ['userid', 'groupid', 'banned', 'spam'],
          },
          'b-button': {
            template:
              '<button :data-variant="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
          },
          OurToggle: {
            template:
              '<div class="our-toggle" :data-checked="modelValue" @click="$emit(\'update:modelValue\', !modelValue)" />',
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
          ModCommentAddModal: {
            template: '<div class="comment-add-modal" />',
            props: ['user'],
          },
          'client-only': {
            template: '<div><slot /></div>',
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders OurToggle for autosend control', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.our-toggle').exists()).toBe(true)
    })
  })

  describe('spam member view', () => {
    it('shows spam buttons when member is a spammer', () => {
      const wrapper = mountComponent({
        member: createMember({
          spammer: { id: 222, collection: 'PendingAdd' },
        }),
      })
      expect(wrapper.text()).toContain('Confirm add to spammer list')
    })

    it('shows spamignore button when spamignore prop is true', () => {
      const wrapper = mountComponent({
        member: createMember({
          spammer: { id: 222, collection: 'PendingAdd' },
        }),
        spamignore: true,
      })
      expect(wrapper.text()).toContain('Ignore')
    })

    it('shows ModMemberActions when actions prop is true and groupid exists', () => {
      const wrapper = mountComponent({
        member: createMember({
          spammer: { id: 222, collection: 'PendingAdd' },
          groupid: 789,
        }),
        actions: true,
      })
      expect(wrapper.find('.mod-member-actions').exists()).toBe(true)
    })

    it('shows Add note button for PendingAdd spammers', () => {
      const wrapper = mountComponent({
        member: createMember({
          spammer: { id: 222, collection: 'PendingAdd' },
        }),
      })
      expect(wrapper.text()).toContain('Add note')
    })

    it('shows Hold button when not held', () => {
      const wrapper = mountComponent({
        member: createMember({
          spammer: { id: 222, collection: 'PendingAdd' },
          heldby: null,
        }),
      })
      expect(wrapper.text()).toContain('Hold')
    })

    it('hides spam admin buttons when member is held', () => {
      const wrapper = mountComponent({
        member: createMember({
          spammer: { id: 222, collection: 'PendingAdd' },
          heldby: 999,
        }),
      })
      expect(wrapper.text()).not.toContain('Confirm add to spammer list')
      expect(wrapper.text()).not.toContain('Hold')
    })

    it('shows remove button for Approved spammers', () => {
      const wrapper = mountComponent({
        member: createMember({
          spammer: { id: 222, collection: 'Approved' },
        }),
      })
      expect(wrapper.text()).toContain('Remove from spammer list')
    })
  })

  describe('approved member view', () => {
    it('shows Mail button for approved members', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [{ id: 789, collection: 'Approved' }],
          groupid: 789,
        }),
      })
      expect(wrapper.text()).toContain('Mail')
    })

    it('shows spamignore button for approved members with suspectreason', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [{ id: 789, collection: 'Approved' }],
          groupid: 789,
          suspectreason: 'Test reason',
        }),
        spamignore: true,
      })
      expect(wrapper.text()).toContain('Ignore')
    })

    it('hides spamignore when no suspectreason', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [{ id: 789, collection: 'Approved' }],
          groupid: 789,
          suspectreason: null,
        }),
        spamignore: true,
      })
      // Should only have Mail button, not Ignore
      const buttons = wrapper.findAll('button')
      const buttonTexts = buttons.map((b) => b.text())
      expect(buttonTexts.filter((t) => t.includes('Ignore')).length).toBe(0)
    })
  })

  describe('hasCollection function', () => {
    it('returns true when member is in collection', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [
            { id: 789, collection: 'Approved' },
            { id: 999, collection: 'Pending' },
          ],
          groupid: 789,
        }),
      })
      expect(wrapper.vm.approved).toBe(true)
    })

    it('returns false when member not in collection', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [{ id: 789, collection: 'Pending' }],
          groupid: 789,
        }),
      })
      expect(wrapper.vm.approved).toBe(false)
    })

    it('returns false when memberof is undefined', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: undefined,
          groupid: 789,
        }),
      })
      expect(wrapper.vm.approved).toBe(false)
    })
  })

  describe('validActions computed', () => {
    it('returns approved member actions when approved', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [{ id: 789, collection: 'Approved' }],
          groupid: 789,
        }),
      })
      expect(wrapper.vm.validActions).toEqual([
        'Leave Approved Member',
        'Delete Approved Member',
      ])
    })

    it('returns empty array when not approved', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [],
          groupid: 789,
        }),
      })
      expect(wrapper.vm.validActions).toEqual([])
    })
  })

  describe('standard message filtering', () => {
    it('filters stdmsgs by valid actions', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [{ id: 789, collection: 'Approved' }],
          groupid: 789,
        }),
        modconfig: createModConfig([
          {
            id: 1,
            title: 'Leave',
            action: 'Leave Approved Member',
            rarelyused: 0,
          },
          {
            id: 2,
            title: 'Delete',
            action: 'Delete Approved Member',
            rarelyused: 0,
          },
          {
            id: 3,
            title: 'Invalid',
            action: 'Some Other Action',
            rarelyused: 0,
          },
        ]),
      })
      expect(wrapper.vm.filterByAction.length).toBe(2)
    })

    it('hides rarely used messages by default', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [{ id: 789, collection: 'Approved' }],
          groupid: 789,
        }),
        modconfig: createModConfig([
          {
            id: 1,
            title: 'Common',
            action: 'Leave Approved Member',
            rarelyused: 0,
          },
          {
            id: 2,
            title: 'Rare',
            action: 'Delete Approved Member',
            rarelyused: 1,
          },
        ]),
      })
      expect(wrapper.vm.filtered.length).toBe(1)
      expect(wrapper.vm.filtered[0].title).toBe('Common')
    })

    it('shows rarely used messages when showRare is true', async () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [{ id: 789, collection: 'Approved' }],
          groupid: 789,
        }),
        modconfig: createModConfig([
          {
            id: 1,
            title: 'Common',
            action: 'Leave Approved Member',
            rarelyused: 0,
          },
          {
            id: 2,
            title: 'Rare',
            action: 'Delete Approved Member',
            rarelyused: 1,
          },
        ]),
      })
      wrapper.vm.showRare = true
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.filtered.length).toBe(2)
    })

    it('calculates rareToShow count correctly', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [{ id: 789, collection: 'Approved' }],
          groupid: 789,
        }),
        modconfig: createModConfig([
          {
            id: 1,
            title: 'Common',
            action: 'Leave Approved Member',
            rarelyused: 0,
          },
          {
            id: 2,
            title: 'Rare1',
            action: 'Delete Approved Member',
            rarelyused: 1,
          },
          {
            id: 3,
            title: 'Rare2',
            action: 'Leave Approved Member',
            rarelyused: '1',
          },
        ]),
      })
      expect(wrapper.vm.rareToShow).toBe(2)
    })

    it('shows expand button when rare messages exist', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [{ id: 789, collection: 'Approved' }],
          groupid: 789,
        }),
        modconfig: createModConfig([
          {
            id: 1,
            title: 'Common',
            action: 'Leave Approved Member',
            rarelyused: 0,
          },
          {
            id: 2,
            title: 'Rare',
            action: 'Delete Approved Member',
            rarelyused: 1,
          },
        ]),
      })
      expect(wrapper.text()).toContain('+1...')
    })
  })

  describe('icon function', () => {
    it('returns correct icon for Approve Member', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.icon({ action: 'Approve Member' })).toBe('check')
    })

    it('returns correct icon for Reject Member', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.icon({ action: 'Reject Member' })).toBe('times')
    })

    it('returns correct icon for Leave Member', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.icon({ action: 'Leave Member' })).toBe('envelope')
    })

    it('returns correct icon for Leave Approved Member', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.icon({ action: 'Leave Approved Member' })).toBe(
        'envelope'
      )
    })

    it('returns correct icon for Delete Approved Member', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.icon({ action: 'Delete Approved Member' })).toBe(
        'trash-alt'
      )
    })

    it('returns correct icon for Edit', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.icon({ action: 'Edit' })).toBe('pen')
    })

    it('returns default icon for unknown action', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.icon({ action: 'Unknown' })).toBe('check')
    })
  })

  describe('variant function', () => {
    it('returns correct variant for Approve Member', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.variant({ action: 'Approve Member' })).toBe('primary')
    })

    it('returns correct variant for Reject Member', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.variant({ action: 'Reject Member' })).toBe('warning')
    })

    it('returns correct variant for Leave Member', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.variant({ action: 'Leave Member' })).toBe('primary')
    })

    it('returns correct variant for Leave Approved Member', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.variant({ action: 'Leave Approved Member' })).toBe(
        'primary'
      )
    })

    it('returns correct variant for Delete Approved Member', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.variant({ action: 'Delete Approved Member' })).toBe(
        'danger'
      )
    })

    it('returns correct variant for Edit', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.variant({ action: 'Edit' })).toBe('primary')
    })

    it('returns default variant for unknown action', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.variant({ action: 'Unknown' })).toBe('white')
    })
  })

  describe('allowAutoSend toggle', () => {
    it('starts with allowAutoSend true', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.allowAutoSend).toBe(true)
    })

    it('can toggle allowAutoSend', async () => {
      const wrapper = mountComponent()
      wrapper.vm.allowAutoSend = false
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.allowAutoSend).toBe(false)
    })
  })

  describe('addAComment', () => {
    it('sets showAddCommentModal to true', () => {
      const wrapper = mountComponent({
        member: createMember({
          spammer: { id: 222, collection: 'PendingAdd' },
        }),
      })
      expect(wrapper.vm.showAddCommentModal).toBe(false)
      wrapper.vm.addAComment()
      expect(wrapper.vm.showAddCommentModal).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles empty modconfig stdmsgs', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [{ id: 789, collection: 'Approved' }],
          groupid: 789,
        }),
        modconfig: createModConfig([]),
      })
      expect(wrapper.vm.filtered.length).toBe(0)
    })

    it('handles null modconfig', () => {
      const wrapper = mountComponent({
        member: createMember({
          memberof: [{ id: 789, collection: 'Approved' }],
          groupid: 789,
        }),
        modconfig: null,
      })
      expect(wrapper.vm.filtered.length).toBe(0)
      expect(wrapper.vm.filterByAction.length).toBe(0)
    })
  })
})
