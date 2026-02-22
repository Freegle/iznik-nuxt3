import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModCommunityEvent from '~/modtools/components/ModCommunityEvent.vue'

// Mock the stores
vi.mock('~/stores/communityevent', () => ({
  useCommunityEventStore: () => ({
    delete: vi.fn(),
    save: vi.fn(),
  }),
}))

const mockGroupStore = {
  get: vi.fn(),
}

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

describe('ModCommunityEvent', () => {
  const defaultProps = {
    event: {
      id: 123,
      pending: true,
      groups: [456],
      user: {
        id: 789,
        displayname: 'Test User',
      },
    },
  }

  const mockGroup = {
    id: 456,
    nameshort: 'TestGroup',
    ourPostingStatus: 'ALLOWED',
  }

  function mountComponent(props = {}) {
    return mount(ModCommunityEvent, {
      props: { ...defaultProps, ...props },
      global: {
        plugins: [createPinia()],
        stubs: {
          'b-card': {
            template: '<div class="card"><slot /></div>',
          },
          'b-card-header': {
            template: '<div class="card-header"><slot /></div>',
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-card-footer': {
            template: '<div class="card-footer"><slot /></div>',
          },
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols', 'md'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<span class="icon" />',
            props: ['icon', 'scale'],
          },
          NoticeMessage: {
            template: '<div class="notice"><slot /></div>',
            props: ['variant'],
          },
          CommunityEvent: {
            template: '<div class="community-event" />',
            props: ['id', 'summary'],
          },
          ChatButton: {
            template: '<button class="chat-button" />',
            props: ['userid', 'groupid', 'title', 'variant'],
          },
          CommunityEventModal: {
            template: '<div class="event-modal" />',
            props: ['id', 'startEdit', 'ismod'],
            methods: {
              show: vi.fn(),
            },
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockGroupStore.get.mockReturnValue(mockGroup)
  })

  describe('rendering', () => {
    it('renders when event is pending', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('does not render when event is not pending', () => {
      const wrapper = mountComponent({
        event: { ...defaultProps.event, pending: false },
      })
      expect(wrapper.find('.card').exists()).toBe(false)
    })

    it('renders event id', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('123')
    })

    it('renders user displayname when user has id', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test User')
    })

    it('renders "Added by the system" when user has no id', () => {
      const wrapper = mountComponent({
        event: {
          ...defaultProps.event,
          user: { id: 0, displayname: '' },
        },
      })
      expect(wrapper.text()).toContain('Added by the system')
    })

    it('renders group name when groups exist', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('TestGroup')
    })

    it('renders Approve button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Approve')
    })

    it('renders Edit button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Edit')
    })

    it('renders Delete button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Delete')
    })

    it('renders ChatButton when groups and user exist', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.chat-button').exists()).toBe(true)
    })

    it('does not render ChatButton when user has no id', () => {
      const wrapper = mountComponent({
        event: {
          ...defaultProps.event,
          user: { id: 0 },
        },
      })
      expect(wrapper.find('.chat-button').exists()).toBe(false)
    })

    it('renders prohibited posting notice when appropriate', () => {
      mockGroupStore.get.mockReturnValue({
        ...mockGroup,
        ourPostingStatus: 'PROHIBITED',
      })
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('not to be able to post')
    })
  })

  describe('computed', () => {
    it('groups returns empty array when no groups', () => {
      const wrapper = mountComponent({
        event: { ...defaultProps.event, groups: [] },
      })
      expect(wrapper.vm.groups).toEqual([])
    })

    it('groups returns group objects from store', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.groups).toHaveLength(1)
      expect(wrapper.vm.groups[0].nameshort).toBe('TestGroup')
    })

    it('groups filters out undefined groups', () => {
      mockGroupStore.get.mockReturnValue(undefined)
      const wrapper = mountComponent()
      expect(wrapper.vm.groups).toHaveLength(0)
    })
  })

  describe('methods', () => {
    it('edit sets showModal to true', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showModal).toBe(false)
      wrapper.vm.edit()
      expect(wrapper.vm.showModal).toBe(true)
    })
  })
})
