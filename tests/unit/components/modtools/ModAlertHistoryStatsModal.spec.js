import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createMockAlertStore } from '../../mocks/stores'
import ModAlertHistoryStatsModal from '~/modtools/components/ModAlertHistoryStatsModal.vue'

const mockAlertStore = createMockAlertStore()
const mockHide = vi.fn()
const mockShow = vi.fn()

vi.mock('~/stores/alert', () => ({
  useAlertStore: () => mockAlertStore,
}))

// Mock with proper Vue ref to avoid template ref warnings
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    show: mockShow,
    hide: mockHide,
  }),
}))

// Mock vue-google-charts
vi.mock('vue-google-charts', () => ({
  GChart: {
    template: '<div class="gchart" />',
    props: ['type', 'data', 'options'],
  },
}))

// Mock pluralise helper
vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    pluralise: vi.fn().mockImplementation((word, count) => `${count} ${word}`),
  }
})

describe('ModAlertHistoryStatsModal', () => {
  const defaultAlert = {
    id: 1,
    subject: 'Test Alert Stats',
    complete: '2024-01-01',
    stats: {
      sent: {
        mods: 100,
        modemails: 150,
      },
      responses: {
        groups: [
          { summary: [{ rsp: 'Reached' }] },
          { summary: [{ rsp: 'None' }] },
        ],
        mods: {
          reached: 80,
          none: 20,
        },
      },
    },
  }

  function mountComponent(props = {}) {
    mockAlertStore.get.mockReturnValue(defaultAlert)

    return mount(ModAlertHistoryStatsModal, {
      props: { id: 1, ...props },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="modal"><slot name="title" /><slot /><slot name="footer" /></div>',
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          GChart: {
            template: '<div class="gchart" />',
            props: ['type', 'data', 'options'],
          },
        },
        mocks: {
          pluralise: vi
            .fn()
            .mockImplementation((word, count) => `${count} ${word}`),
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAlertStore.get.mockReturnValue(defaultAlert)
  })

  describe('rendering', () => {
    it('renders the modal', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('displays alert subject as title', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Alert Stats')
    })

    it('has Close button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Close')
    })
  })

  describe('computed properties', () => {
    it('gets alert from store using id prop', () => {
      mountComponent({ id: 456 })
      expect(mockAlertStore.get).toHaveBeenCalledWith(456)
    })

    it('calculates groupData correctly', () => {
      const wrapper = mountComponent()
      const groupData = wrapper.vm.groupData
      expect(groupData).toEqual([
        ['Result', 'Count'],
        ['Responded', 1],
        ['No Response', 1],
      ])
    })

    it('calculates volunteerData correctly', () => {
      const wrapper = mountComponent()
      const volunteerData = wrapper.vm.volunteerData
      expect(volunteerData).toEqual([
        ['Result', 'Count'],
        ['Responded', 80],
        ['No Response', 20],
      ])
    })
  })

  describe('data', () => {
    it('has chartOptions with correct structure', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.chartOptions).toBeDefined()
      expect(wrapper.vm.chartOptions.chartArea).toBeDefined()
      expect(wrapper.vm.chartOptions.slices).toBeDefined()
    })
  })

  describe('props', () => {
    it('accepts id prop', () => {
      const wrapper = mountComponent({ id: 789 })
      expect(wrapper.props('id')).toBe(789)
    })
  })
})
