import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModAlertHistory from '~/modtools/components/ModAlertHistory.vue'

// Mock datetimeshort helper
vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    datetimeshort: vi.fn().mockReturnValue('2024-01-01 12:00'),
  }
})

describe('ModAlertHistory', () => {
  const defaultAlert = {
    id: 1,
    created: '2024-01-01T10:00:00',
    complete: '2024-01-01T12:00:00',
    subject: 'Test Alert',
    group: {
      nameshort: 'Test Group',
    },
  }

  function mountComponent(props = {}) {
    return mount(ModAlertHistory, {
      props: { alert: defaultAlert, ...props },
      global: {
        stubs: {
          'b-row': { template: '<div class="row"><slot /></div>' },
          'b-col': { template: '<div class="col"><slot /></div>' },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          ModAlertHistoryDetailsModal: {
            template: '<div class="details-modal" />',
            methods: { show: vi.fn() },
          },
          ModAlertHistoryStatsModal: {
            template: '<div class="stats-modal" />',
            methods: { show: vi.fn() },
          },
        },
        mocks: {
          datetimeshort: vi.fn().mockReturnValue('2024-01-01 12:00'),
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('displays alert subject', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Alert')
    })

    it('displays group name', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Group')
    })

    it('has Show Stats and Show Details buttons', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Show Stats')
      expect(wrapper.text()).toContain('Show Details')
    })
  })

  describe('data', () => {
    it('starts with showDetails false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showDetails).toBe(false)
    })

    it('starts with showStats false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showStats).toBe(false)
    })
  })

  describe('methods', () => {
    it('sets showDetails to true on details()', () => {
      const wrapper = mountComponent()
      wrapper.vm.details()
      expect(wrapper.vm.showDetails).toBe(true)
    })

    it('sets showStats to true on stats()', () => {
      const wrapper = mountComponent()
      wrapper.vm.stats()
      expect(wrapper.vm.showStats).toBe(true)
    })
  })
})
