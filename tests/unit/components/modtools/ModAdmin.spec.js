import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import {
  createMockAdminsStore,
  createMockUserStore,
  createMockGroupStore,
} from '../../mocks/stores'
import ModAdmin from '~/modtools/components/ModAdmin.vue'

// Create mock store instances
const mockAdminsStore = createMockAdminsStore()
const mockUserStore = createMockUserStore()
const mockGroupStore = createMockGroupStore()
const mockCheckWork = vi.fn()

// Mock the store imports
vi.mock('~/stores/admins', () => ({
  useAdminsStore: () => mockAdminsStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

// Mock the composables
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myid: 999,
  }),
}))

vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    checkWork: mockCheckWork,
  }),
}))

// Mock timeago
vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    timeago: vi.fn().mockReturnValue('1 day ago'),
  }
})

describe('ModAdmin', () => {
  const defaultProps = {
    id: 1,
  }

  const defaultAdmin = {
    id: 1,
    subject: 'Test Admin',
    text: 'Test body',
    created: '2024-01-01',
    groupid: 1,
    pending: true,
  }

  function mountComponent(props = {}, adminOverrides = {}) {
    mockAdminsStore.get.mockReturnValue({ ...defaultAdmin, ...adminOverrides })

    return mount(ModAdmin, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-card': {
            template:
              '<div class="card"><slot /><slot name="header" /><slot name="body" /><slot name="footer" /></div>',
          },
          'b-card-header': {
            template:
              '<div class="card-header" @click="$emit(\'click\', $event)"><slot /></div>',
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-card-footer': {
            template: '<div class="card-footer"><slot /></div>',
          },
          'b-row': { template: '<div class="row"><slot /></div>' },
          'b-col': { template: '<div class="col"><slot /></div>' },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          'b-form-group': {
            template: '<div class="form-group"><slot /></div>',
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
          },
          NoticeMessage: { template: '<div class="notice"><slot /></div>' },
          ConfirmModal: {
            template: '<div class="confirm-modal"><slot /></div>',
          },
          ExternalLink: { template: '<a><slot /></a>' },
          'v-icon': true,
        },
        mocks: {
          timeago: vi.fn().mockReturnValue('1 day ago'),
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAdminsStore.get.mockReturnValue({ ...defaultAdmin })
  })

  describe('rendering', () => {
    it('renders the card', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('displays admin subject', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Admin')
    })

    it('displays admin ID', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('1')
    })

    it('displays group name', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Group')
    })
  })

  describe('expand/collapse', () => {
    it('starts collapsed by default', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.expanded).toBe(false)
    })

    it('starts expanded when open prop is true', () => {
      const wrapper = mountComponent({ open: true })
      expect(wrapper.vm.expanded).toBe(true)
    })

    it('toggles expanded state', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.expanded).toBe(false)

      // Directly toggle the expanded state as the component does
      wrapper.vm.expanded = !wrapper.vm.expanded
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.expanded).toBe(true)

      wrapper.vm.expanded = !wrapper.vm.expanded
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.expanded).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('gets admin from store using id prop', () => {
      mountComponent({ id: 123 })
      expect(mockAdminsStore.get).toHaveBeenCalledWith(123)
    })

    it('gets group name from group store', () => {
      mountComponent()
      expect(mockGroupStore.get).toHaveBeenCalledWith(1)
    })

    it('returns holder when admin has heldby', () => {
      const mockHolder = { displayname: 'Test User' }
      mockUserStore.byId.mockReturnValue(mockHolder)

      const wrapper = mountComponent({}, { heldby: 456 })
      expect(wrapper.vm.holder).toEqual(mockHolder)
    })

    it('returns null for holder when no heldby', () => {
      const wrapper = mountComponent({}, { heldby: null })
      expect(wrapper.vm.holder).toBeNull()
    })
  })

  describe('actions', () => {
    it('shows confirm modal on deleteIt', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showConfirmModal).toBe(false)

      wrapper.vm.deleteIt()
      expect(wrapper.vm.showConfirmModal).toBe(true)
    })

    it('emits copy event with admin on copyIt', () => {
      const wrapper = mountComponent()
      wrapper.vm.copyIt()

      expect(wrapper.emitted('copy')).toBeTruthy()
      expect(wrapper.emitted('copy')[0][0]).toEqual(defaultAdmin)
    })

    it('calls adminsStore.delete on deleteConfirmed', () => {
      const wrapper = mountComponent({ id: 42 })
      wrapper.vm.deleteConfirmed()

      expect(mockAdminsStore.delete).toHaveBeenCalledWith({ id: 42 })
      expect(mockCheckWork).toHaveBeenCalledWith(true)
    })

    it('calls adminsStore.edit on save', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.save()

      expect(mockAdminsStore.edit).toHaveBeenCalledWith({
        id: 1,
        subject: 'Test Admin',
        text: 'Test body',
        pending: 1,
      })
    })

    it('sets saving state during save', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.saving).toBe(false)

      const savePromise = wrapper.vm.save()
      // saving should be true during the operation
      expect(wrapper.vm.saving).toBe(true)

      await savePromise
      expect(wrapper.vm.saving).toBe(false)
    })

    it('calls adminsStore.hold on hold', () => {
      const wrapper = mountComponent()
      wrapper.vm.hold()

      expect(mockAdminsStore.hold).toHaveBeenCalledWith({ id: 1 })
      expect(mockCheckWork).toHaveBeenCalledWith(true)
    })

    it('calls adminsStore.release on release', () => {
      const wrapper = mountComponent()
      wrapper.vm.release()

      expect(mockAdminsStore.release).toHaveBeenCalledWith({ id: 1 })
      expect(mockCheckWork).toHaveBeenCalledWith(true)
    })

    it('calls save then approve on approve', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.approve()

      expect(mockAdminsStore.edit).toHaveBeenCalled()
      expect(mockAdminsStore.approve).toHaveBeenCalledWith({ id: 1 })
      expect(mockCheckWork).toHaveBeenCalledWith(true)
    })
  })

  describe('mounted lifecycle', () => {
    it('fetches holder when admin has heldby', () => {
      mountComponent({}, { heldby: 789 })
      expect(mockUserStore.fetch).toHaveBeenCalledWith(789)
    })

    it('does not fetch holder when admin has no heldby', () => {
      mountComponent({}, { heldby: null })
      expect(mockUserStore.fetch).not.toHaveBeenCalled()
    })
  })
})
