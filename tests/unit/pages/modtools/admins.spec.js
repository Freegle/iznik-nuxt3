import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import AdminsPage from '~/modtools/pages/admins.vue'

// Create mock stores
const mockAdminsStore = {
  list: [],
  clear: vi.fn().mockResolvedValue({}),
  fetch: vi.fn().mockResolvedValue({}),
  add: vi.fn().mockResolvedValue({}),
}

const mockModGroupStore = {
  get: vi.fn().mockReturnValue({
    id: 1,
    type: 'Freegle',
    role: 'Moderator',
    work: { pendingadmins: 3 },
  }),
}

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/admins',
    params: {},
    query: {},
  }),
}))

// Mock stores
vi.mock('~/stores/admins', () => ({
  useAdminsStore: () => mockAdminsStore,
}))

vi.mock('@/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

// Mock composables
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myGroups: ref([
      { id: 1, role: 'Moderator' },
      { id: 2, role: 'Moderator' },
    ]),
    supportOrAdmin: ref(false),
  }),
}))

vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    checkWork: vi.fn(),
  }),
}))

describe('admins.vue page', () => {
  function mountComponent(options = {}) {
    return mount(AdminsPage, {
      global: {
        stubs: {
          ModHelpAdmins: { template: '<div class="help-stub" />' },
          ModGroupSelect: {
            template: '<div class="group-select-stub" />',
            props: ['modelValue', 'all', 'modonly', 'work', 'systemwide'],
          },
          ModAdmin: {
            template: '<div class="admin-stub" />',
            props: ['id', 'open'],
            emits: ['copy'],
          },
          NoticeMessage: {
            template: '<div class="notice-stub"><slot /></div>',
          },
          OurToggle: {
            template: '<div class="toggle-stub" />',
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
          VeeForm: {
            template: '<form class="vee-form-stub" ref="form"><slot /></form>',
          },
          Field: {
            template:
              '<input class="field-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: [
              'modelValue',
              'name',
              'type',
              'rules',
              'as',
              'placeholder',
              'id',
              'rows',
              'maxRows',
              'spellcheck',
            ],
          },
          ErrorMessage: { template: '<span class="error-stub" />' },
          'b-tabs': {
            template: '<div class="tabs"><slot /></div>',
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
          'b-tab': {
            template: '<div class="tab"><slot /><slot name="title" /></div>',
            props: ['active'],
          },
          'b-badge': { template: '<span class="badge"><slot /></span>' },
          'b-button': {
            template:
              '<button class="btn" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'disabled'],
          },
          'b-form-group': {
            template: '<div class="form-group"><slot /></div>',
          },
          'b-form-input': {
            template:
              '<input class="form-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'id'],
          },
          'v-icon': { template: '<span class="icon-stub" />' },
        },
        ...options.global,
      },
      ...options,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAdminsStore.list = []
  })

  describe('initial state', () => {
    it('fetches admins on mount', async () => {
      vi.clearAllMocks()
      mountComponent()
      // Wait for async operations
      await flushPromises()
      expect(mockAdminsStore.clear).toHaveBeenCalled()
      expect(mockAdminsStore.fetch).toHaveBeenCalledWith({ groupid: null })
    })
  })

  describe('computed properties', () => {
    it('calculates pendingcount from groups with pending admins', () => {
      vi.clearAllMocks()
      const wrapper = mountComponent()
      // 2 groups, each with 3 pending admins from mock = 6
      expect(wrapper.vm.pendingcount).toBe(6)
    })

    it('filters pending admins from list', () => {
      mockAdminsStore.list = [
        { id: 1, pending: true, created: '2024-01-01' },
        { id: 2, pending: false, created: '2024-01-02' },
        { id: 3, pending: true, created: '2024-01-03' },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.pending).toHaveLength(2)
      expect(wrapper.vm.pending[0].id).toBe(3) // Sorted by date desc
    })

    it('filters previous (non-pending) admins from list', () => {
      mockAdminsStore.list = [
        { id: 1, pending: true, created: '2024-01-01' },
        { id: 2, pending: false, created: '2024-01-02' },
        { id: 3, pending: false, created: '2024-01-03' },
      ]
      const wrapper = mountComponent()
      expect(wrapper.vm.previous).toHaveLength(2)
      expect(wrapper.vm.previous[0].id).toBe(3) // Sorted by date desc
    })
  })

  describe('methods', () => {
    it('validateSubject returns error for empty value', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.validateSubject('')).toBe('Please enter a subject.')
      expect(wrapper.vm.validateSubject(null)).toBe('Please enter a subject.')
    })

    it('validateSubject returns error if includes ADMIN', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.validateSubject('ADMIN notice')).toBe(
        'Do not include ADMIN in your subject.'
      )
      expect(wrapper.vm.validateSubject('admin notice')).toBe(
        'Do not include ADMIN in your subject.'
      )
    })

    it('validateSubject returns true for valid subject', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.validateSubject('Notice about group')).toBe(true)
    })

    it('validateBody returns error for empty value', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.validateBody('')).toBe('Please add the message.')
      expect(wrapper.vm.validateBody(null)).toBe('Please add the message.')
    })

    it('validateBody returns true for valid body', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.validateBody('Message body content')).toBe(true)
    })

    it('copyAdmin copies admin data to form fields', () => {
      const wrapper = mountComponent()
      const admin = {
        essential: 1,
        groupid: 5,
        subject: 'Test Subject',
        text: 'Test Body',
        ctatext: 'Click me',
        ctalink: 'https://example.com',
      }

      wrapper.vm.copyAdmin(admin)

      expect(wrapper.vm.essential).toBe(true)
      expect(wrapper.vm.groupidcreate).toBe(5)
      expect(wrapper.vm.subject).toBe('Test Subject')
      expect(wrapper.vm.body).toBe('Test Body')
      expect(wrapper.vm.ctatext).toBe('Click me')
      expect(wrapper.vm.ctalink).toBe('https://example.com')
      expect(wrapper.vm.tabIndex).toBe(1)
    })

    it('copyAdmin handles essential=0', () => {
      const wrapper = mountComponent()
      const admin = {
        essential: 0,
        groupid: 5,
        subject: 'Test',
        text: 'Body',
      }

      wrapper.vm.copyAdmin(admin)

      expect(wrapper.vm.essential).toBe(false)
    })

    it('fetchAdmins clears and fetches admins', async () => {
      const wrapper = mountComponent()
      vi.clearAllMocks()

      await wrapper.vm.fetchAdmins(123)

      expect(mockAdminsStore.clear).toHaveBeenCalled()
      expect(mockAdminsStore.fetch).toHaveBeenCalledWith({ groupid: 123 })
    })

    it('fetchPending calls fetch with groupidshow', async () => {
      const wrapper = mountComponent()
      wrapper.vm.groupidshow = 456
      vi.clearAllMocks()

      await wrapper.vm.fetchPending()

      expect(mockAdminsStore.fetch).toHaveBeenCalledWith({ groupid: 456 })
    })

    it('fetchPrevious calls fetch with groupidprevious', async () => {
      const wrapper = mountComponent()
      wrapper.vm.groupidprevious = 789
      vi.clearAllMocks()

      await wrapper.vm.fetchPrevious()

      expect(mockAdminsStore.fetch).toHaveBeenCalledWith({ groupid: 789 })
    })
  })

  describe('watchers', () => {
    it('fetches when groupidshow changes', async () => {
      const wrapper = mountComponent()
      vi.clearAllMocks()

      wrapper.vm.groupidshow = 100
      await wrapper.vm.$nextTick()

      expect(mockAdminsStore.fetch).toHaveBeenCalledWith({ groupid: 100 })
    })

    it('fetches when groupidprevious changes', async () => {
      const wrapper = mountComponent()
      vi.clearAllMocks()

      wrapper.vm.groupidprevious = 200
      await wrapper.vm.$nextTick()

      expect(mockAdminsStore.fetch).toHaveBeenCalledWith({ groupid: 200 })
    })
  })

  describe('tab rendering', () => {
    it('renders tabs', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.tabs').exists()).toBe(true)
    })

    it('renders group select in Pending tab', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.group-select-stub').exists()).toBe(true)
    })
  })
})
