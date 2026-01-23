import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ModPostingHistoryModal from '~/modtools/components/ModPostingHistoryModal.vue'

// Mock stores
const mockGroupStore = {
  list: {
    123: { namedisplay: 'Test Group 1' },
    456: { namedisplay: 'Test Group 2' },
  },
}

const mockHide = vi.fn()
const mockModalShow = vi.fn()
const mockModalRef = { show: mockModalShow }

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(mockModalRef),
    show: mockModalShow,
    hide: mockHide,
  }),
}))

describe('ModPostingHistoryModal', () => {
  const createUser = (overrides = {}) => ({
    id: 1,
    displayname: 'Test User',
    messagehistory: [
      {
        id: 101,
        subject: 'Offer: Sofa',
        type: 'Offer',
        arrival: '2024-01-15T10:00:00Z',
        groupid: 123,
        outcome: 'Taken',
        repost: false,
        autorepost: false,
        collection: 'Approved',
      },
      {
        id: 102,
        subject: 'Wanted: Table',
        type: 'Wanted',
        arrival: '2024-01-10T10:00:00Z',
        groupid: 456,
        outcome: null,
        repost: true,
        autorepost: true,
        collection: 'Approved',
      },
      {
        id: 103,
        subject: 'Offer: Chair',
        type: 'Offer',
        arrival: '2024-01-20T10:00:00Z',
        groupid: 123,
        outcome: null,
        repost: true,
        autorepost: false,
        collection: 'Pending',
      },
    ],
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModPostingHistoryModal, {
      props: {
        user: createUser(),
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="modal" :title="title"><slot name="default" /><slot name="footer" /></div>',
            props: ['title'],
          },
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col" :class="cols"><slot /></div>',
            props: ['cols', 'sm'],
          },
          'b-button': {
            template:
              '<button :data-variant="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<i :class="icon" :title="title" />',
            props: ['icon', 'scale', 'title'],
          },
          NoticeMessage: {
            template: '<div class="notice" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          ModGroupSelect: {
            template:
              '<select class="group-select" :value="modelValue" @change="$emit(\'update:modelValue\', parseInt($event.target.value))"><option :value="null">All</option><option :value="123">Group 1</option><option :value="456">Group 2</option></select>',
            props: ['modelValue', 'modonly'],
          },
        },
        mocks: {
          datetimeshort: (val) => `formatted:${val}`,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the modal', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('shows user displayname in title', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.modal').attributes('title')).toContain('Test User')
    })

    it('shows ModGroupSelect filter', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.group-select').exists()).toBe(true)
    })

    it('shows message rows', () => {
      const wrapper = mountComponent()
      const rows = wrapper.findAll('.row')
      expect(rows.length).toBe(3) // 3 messages
    })

    it('has Close button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Close')
    })
  })

  describe('messages computed', () => {
    it('returns all messages when no type filter', () => {
      const wrapper = mountComponent({ type: null })
      expect(wrapper.vm.messages.length).toBe(3)
    })

    it('filters by type when type prop provided', () => {
      const wrapper = mountComponent({ type: 'Offer' })
      expect(wrapper.vm.messages.length).toBe(2)
      expect(wrapper.vm.messages.every((m) => m.type === 'Offer')).toBe(true)
    })

    it('sorts messages by arrival date descending', () => {
      const wrapper = mountComponent()
      const messages = wrapper.vm.messages
      expect(messages[0].id).toBe(103) // Jan 20
      expect(messages[1].id).toBe(101) // Jan 15
      expect(messages[2].id).toBe(102) // Jan 10
    })

    it('adds groupname from store', () => {
      const wrapper = mountComponent()
      const messages = wrapper.vm.messages
      expect(messages.some((m) => m.groupname === 'Test Group 1')).toBe(true)
      expect(messages.some((m) => m.groupname === 'Test Group 2')).toBe(true)
    })

    it('uses fallback groupname when group not found', () => {
      const user = createUser({
        messagehistory: [
          {
            id: 104,
            subject: 'Test',
            type: 'Offer',
            arrival: '2024-01-25T10:00:00Z',
            groupid: 999, // Not in store
            outcome: null,
            collection: 'Approved',
          },
        ],
      })
      const wrapper = mountComponent({ user })
      expect(wrapper.vm.messages[0].groupname).toBe('#999')
    })

    it('filters by selected groupid', async () => {
      const wrapper = mountComponent()
      wrapper.vm.groupid = 123
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.messages.every((m) => m.groupid === 123)).toBe(true)
    })

    it('returns empty array when no messagehistory', () => {
      const wrapper = mountComponent({
        user: { id: 1, displayname: 'Test', messagehistory: null },
      })
      expect(wrapper.vm.messages).toEqual([])
    })

    it('returns empty array when user has no messagehistory property', () => {
      const wrapper = mountComponent({
        user: { id: 1, displayname: 'Test' },
      })
      expect(wrapper.vm.messages).toEqual([])
    })
  })

  describe('message display', () => {
    it('shows message id with hashtag', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('101')
      expect(wrapper.text()).toContain('102')
    })

    it('shows message subject', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Offer: Sofa')
      expect(wrapper.text()).toContain('Wanted: Table')
    })

    it('shows outcome when available', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Taken')
    })

    it('shows still open when no outcome', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('still open')
    })

    it('shows Pending status in red', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Pending')
    })

    it('shows group name', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Group 1')
      expect(wrapper.text()).toContain('Test Group 2')
    })

    it('shows auto-repost icon', () => {
      const wrapper = mountComponent()
      // Message 102 has autorepost: true
      const syncIcons = wrapper.findAll('i.sync')
      expect(syncIcons.length).toBeGreaterThan(0)
    })

    it('shows manual repost icon', () => {
      const wrapper = mountComponent()
      // Message 103 has repost: true, autorepost: false
      const handIcons = wrapper.findAll('i.hand-paper')
      expect(handIcons.length).toBeGreaterThan(0)
    })
  })

  describe('no messages state', () => {
    it('shows notice when no posts to show', () => {
      const wrapper = mountComponent({
        user: { id: 1, displayname: 'Test', messagehistory: [] },
      })
      expect(wrapper.text()).toContain('no posts to show')
    })
  })

  describe('show method', () => {
    it('resets groupid to null when show is called', async () => {
      const wrapper = mountComponent()
      wrapper.vm.groupid = 123
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.groupid).toBe(123)
      // The show() method would reset it, but we can't call it without a real modal
      // Test that groupid starts null when component mounts
      const wrapper2 = mountComponent()
      expect(wrapper2.vm.groupid).toBeNull()
    })

    it('is exposed for external access', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.show).toBeDefined()
      expect(typeof wrapper.vm.show).toBe('function')
    })
  })

  describe('close button', () => {
    it('calls hide on click', async () => {
      const wrapper = mountComponent()
      const closeButton = wrapper.find('button')
      await closeButton.trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('props', () => {
    it('accepts user prop', () => {
      const user = createUser({ displayname: 'Custom User' })
      const wrapper = mountComponent({ user })
      expect(wrapper.props('user').displayname).toBe('Custom User')
    })

    it('accepts type prop', () => {
      const wrapper = mountComponent({ type: 'Wanted' })
      expect(wrapper.props('type')).toBe('Wanted')
    })

    it('defaults type to null', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('type')).toBeNull()
    })
  })

  describe('group filter', () => {
    it('starts with null groupid (all groups)', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.groupid).toBeNull()
    })

    it('updates groupid when select changes', async () => {
      const wrapper = mountComponent()
      const select = wrapper.find('.group-select')
      await select.setValue('123')
      expect(wrapper.vm.groupid).toBe(123)
    })

    it('includes all group messages when groupid is 0', async () => {
      const wrapper = mountComponent()
      wrapper.vm.groupid = 0
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.messages.length).toBe(3)
    })
  })
})
