import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Logs from '~/modtools/pages/logs.vue'

// Mock logs store
const mockLogsStore = {
  setParams: vi.fn(),
  clear: vi.fn(),
}

// Mock mod group store
const mockModGroupStore = {
  getModGroups: vi.fn().mockResolvedValue([]),
}

vi.mock('~/stores/logs', () => ({
  useLogsStore: () => mockLogsStore,
}))

vi.mock('~/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

describe('Logs Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent() {
    return mount(Logs, {
      global: {
        stubs: {
          ScrollToTop: { template: '<div class="scroll-to-top"></div>' },
          'b-tabs': {
            template: '<div class="tabs"><slot /></div>',
            props: ['modelValue'],
          },
          'b-tab': {
            template:
              '<div class="tab" @click="$emit(\'click\')"><slot /><slot name="title" /></div>',
            props: ['to'],
          },
          ModGroupSelect: {
            template:
              '<select class="group-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"></select>',
            props: ['modelValue', 'modonly'],
          },
          'b-input-group': {
            template: '<div class="input-group"><slot /></div>',
          },
          'b-form-input': {
            template:
              '<input class="search-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup.enter="$emit(\'keyup.enter\')" />',
            props: ['modelValue', 'type', 'placeholder', 'autocapitalize'],
          },
          'b-button': {
            template:
              '<button class="search-button" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'disabled'],
          },
          'v-icon': { template: '<i :data-icon="icon"></i>', props: ['icon'] },
          ModLogs: {
            template:
              '<div class="mod-logs" :data-groupid="groupid" @busy="$emit(\'busy\')" @idle="$emit(\'idle\')"></div>',
            props: ['groupid'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders tabs for Messages and Members', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Messages')
      expect(wrapper.text()).toContain('Members')
    })

    it('renders group select for each tab', () => {
      const wrapper = mountComponent()
      const selects = wrapper.findAll('.group-select')
      expect(selects.length).toBe(2)
    })

    it('renders search input in each tab', () => {
      const wrapper = mountComponent()
      const inputs = wrapper.findAll('.search-input')
      expect(inputs.length).toBe(2)
    })

    it('does not render ModLogs when groupid is null', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-logs').exists()).toBe(false)
    })
  })

  describe('mounted lifecycle', () => {
    it('calls getModGroups on mount', async () => {
      mountComponent()
      await flushPromises()
      expect(mockModGroupStore.getModGroups).toHaveBeenCalled()
    })

    it('clears logs store with messages type on mount', async () => {
      mountComponent()
      await flushPromises()
      expect(mockLogsStore.setParams).toHaveBeenCalledWith({
        type: 'messages',
        search: null,
      })
      expect(mockLogsStore.clear).toHaveBeenCalled()
    })
  })

  describe('tab switching', () => {
    it('clears logs and sets type to messages when Messages tab is clicked', async () => {
      const wrapper = mountComponent()
      vi.clearAllMocks()

      const tabs = wrapper.findAll('.tab')
      await tabs[0].trigger('click')

      expect(mockLogsStore.setParams).toHaveBeenCalledWith({
        type: 'messages',
        search: null,
      })
      expect(mockLogsStore.clear).toHaveBeenCalled()
    })

    it('clears logs and sets type to memberships when Members tab is clicked', async () => {
      const wrapper = mountComponent()
      vi.clearAllMocks()

      const tabs = wrapper.findAll('.tab')
      await tabs[1].trigger('click')

      expect(mockLogsStore.setParams).toHaveBeenCalledWith({
        type: 'memberships',
        search: null,
      })
      expect(mockLogsStore.clear).toHaveBeenCalled()
    })
  })

  describe('groupid changes', () => {
    it('renders ModLogs when groupid is set', async () => {
      const wrapper = mountComponent()

      // Set groupid
      wrapper.vm.groupid = 123
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.mod-logs').exists()).toBe(true)
    })

    it('passes groupid to ModLogs', async () => {
      const wrapper = mountComponent()

      wrapper.vm.groupid = 456
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.mod-logs').attributes('data-groupid')).toBe('456')
    })

    it('clears logs when groupid changes', async () => {
      const wrapper = mountComponent()
      vi.clearAllMocks()

      wrapper.vm.groupid = 789
      await wrapper.vm.$nextTick()

      expect(mockLogsStore.setParams).toHaveBeenCalled()
      expect(mockLogsStore.clear).toHaveBeenCalled()
    })
  })

  describe('search functionality', () => {
    it('updates term when typing in search input', async () => {
      const wrapper = mountComponent()
      const input = wrapper.find('.search-input')

      await input.setValue('test search')
      expect(wrapper.vm.term).toBe('test search')
    })

    it('clears logs with search term when search button is clicked', async () => {
      const wrapper = mountComponent()
      wrapper.vm.term = 'search query'
      vi.clearAllMocks()

      const button = wrapper.find('.search-button')
      await button.trigger('click')

      expect(mockLogsStore.setParams).toHaveBeenCalledWith({
        type: 'messages',
        search: 'search query',
      })
      expect(mockLogsStore.clear).toHaveBeenCalled()
    })

    it('trims search term before sending to store', async () => {
      const wrapper = mountComponent()
      wrapper.vm.term = '  spaced search  '
      vi.clearAllMocks()

      await wrapper.vm.search()

      expect(mockLogsStore.setParams).toHaveBeenCalledWith({
        type: 'messages',
        search: 'spaced search',
      })
    })

    it('sends null search when term is empty', async () => {
      const wrapper = mountComponent()
      wrapper.vm.term = null
      vi.clearAllMocks()

      await wrapper.vm.search()

      expect(mockLogsStore.setParams).toHaveBeenCalledWith({
        type: 'messages',
        search: null,
      })
    })
  })

  describe('busy state', () => {
    it('starts with busy as false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.busy).toBe(false)
    })

    it('disables search button when busy', async () => {
      const wrapper = mountComponent()
      wrapper.vm.busy = true
      await wrapper.vm.$nextTick()

      const button = wrapper.find('.search-button')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })
})
