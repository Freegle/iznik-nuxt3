import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModVolunteerOpportunity from '~/modtools/components/ModVolunteerOpportunity.vue'

// Mock the store
const mockDelete = vi.fn()
const mockSave = vi.fn()
const mockRemove = vi.fn()

vi.mock('@/stores/volunteering', () => ({
  useVolunteeringStore: () => ({
    delete: mockDelete,
    save: mockSave,
    remove: mockRemove,
  }),
}))

describe('ModVolunteerOpportunity', () => {
  const defaultProps = {
    volunteering: {
      id: 123,
      pending: true,
      groups: [456],
      groupsmt: [{ nameshort: 'TestGroup' }],
      user: {
        id: 789,
        displayname: 'Test User',
      },
    },
  }

  function mountComponent(props = {}) {
    return mount(ModVolunteerOpportunity, {
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
          VolunteerOpportunity: {
            template: '<div class="volunteer-opportunity" />',
            props: ['id', 'item', 'summary'],
          },
          ChatButton: {
            template: '<button class="chat-button" />',
            props: ['userid', 'groupid', 'title', 'variant'],
          },
          VolunteerOpportunityModal: {
            template: '<div class="volunteer-modal" />',
            props: ['id', 'volunteering', 'startEdit'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockDelete.mockResolvedValue()
    mockSave.mockResolvedValue()
    mockRemove.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders when pending', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('does not render when not pending', () => {
      const wrapper = mountComponent({
        volunteering: { ...defaultProps.volunteering, pending: false },
      })
      expect(wrapper.find('.card').exists()).toBe(false)
    })

    it('renders opportunity id', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('123')
    })

    it('shows System added when no user', () => {
      const wrapper = mountComponent({
        volunteering: { ...defaultProps.volunteering, user: null },
      })
      expect(wrapper.text()).toContain('System added')
    })

    it('renders group name from groupsmt', () => {
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

    it('does not render ChatButton when no user', () => {
      const wrapper = mountComponent({
        volunteering: { ...defaultProps.volunteering, user: null },
      })
      expect(wrapper.find('.chat-button').exists()).toBe(false)
    })
  })

  describe('methods', () => {
    it('edit sets modalShown to true', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.modalShown).toBe(false)
      wrapper.vm.edit()
      expect(wrapper.vm.modalShown).toBe(true)
    })

    it('deleteme calls volunteeringStore.delete', () => {
      const wrapper = mountComponent()
      wrapper.vm.deleteme()
      expect(mockDelete).toHaveBeenCalledWith(123)
    })

    it('approve calls save and remove', () => {
      const wrapper = mountComponent()
      wrapper.vm.approve()
      expect(mockSave).toHaveBeenCalledWith({
        id: 123,
        pending: false,
      })
      expect(mockRemove).toHaveBeenCalledWith(123)
    })
  })
})
