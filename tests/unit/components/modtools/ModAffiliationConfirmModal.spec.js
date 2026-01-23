import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { createMockGroupStore } from '../../mocks/stores'
import ModAffiliationConfirmModal from '~/modtools/components/ModAffiliationConfirmModal.vue'

// Create mock store instances
const mockGroupStore = createMockGroupStore()
const mockHide = vi.fn()

// Mock the store imports
vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('@/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

// Mock the composables with proper Vue ref to avoid template ref warnings
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    show: vi.fn(),
    hide: mockHide,
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myGroup: (id) => ({ id, nameshort: 'Test Group' }),
  }),
}))

describe('ModAffiliationConfirmModal', () => {
  const defaultProps = {
    groupid: 123,
  }

  function mountComponent(props = {}) {
    return mount(ModAffiliationConfirmModal, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div v-if="$attrs[\'v-if\'] !== false" class="modal"><slot name="title" /><slot /><slot name="footer" /></div>',
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          ExternalLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the modal when group exists', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('displays group name in title', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Group')
    })

    it('displays affiliation information', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('2016 Freegle AGM')
      expect(wrapper.text()).toContain('affiliated with Freegle')
    })

    it('has Not now and confirm buttons', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(2)
      expect(wrapper.text()).toContain('Not now')
      expect(wrapper.text()).toContain('Yes, we still want to be affiliated')
    })
  })

  describe('computed properties', () => {
    it('gets group from myGroup helper using groupid prop', () => {
      const wrapper = mountComponent({ groupid: 456 })
      expect(wrapper.vm.group).toEqual({ id: 456, nameshort: 'Test Group' })
    })
  })

  describe('actions', () => {
    it('calls groupStore.confirmAffiliation and hides on confirm', async () => {
      mockGroupStore.confirmAffiliation = vi.fn().mockResolvedValue({})

      const wrapper = mountComponent({ groupid: 789 })
      await wrapper.vm.confirm()
      await flushPromises()

      expect(mockGroupStore.confirmAffiliation).toHaveBeenCalledWith({
        id: 789,
      })
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('props', () => {
    it('accepts groupid prop', () => {
      const wrapper = mountComponent({ groupid: 999 })
      expect(wrapper.props('groupid')).toBe(999)
    })
  })
})
