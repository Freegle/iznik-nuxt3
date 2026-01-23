import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModSystemLogSearch from '~/modtools/components/ModSystemLogSearch.vue'

// Mock the system logs store
const mockSystemLogsStore = {
  timeRange: '24h',
  showPolling: false,
  loading: false,
  setTimeRange: vi.fn(),
  setShowPolling: vi.fn(),
  setIpFilter: vi.fn(),
  setEmailFilter: vi.fn(),
}

vi.mock('~/modtools/stores/systemlogs', () => ({
  useSystemLogsStore: () => mockSystemLogsStore,
}))

vi.mock('../stores/systemlogs', () => ({
  useSystemLogsStore: () => mockSystemLogsStore,
}))

// Mock the user store
const mockUserStore = {
  list: {},
  clear: vi.fn(),
  fetchMT: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('ModSystemLogSearch', () => {
  function mountComponent(props = {}) {
    return mount(ModSystemLogSearch, {
      props: {
        userid: null,
        groupid: null,
        msgid: null,
        ...props,
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols', 'md'],
          },
          'b-input-group': {
            template: '<div class="input-group"><slot /></div>',
          },
          'b-input-group-text': {
            template: '<span class="input-group-text"><slot /></span>',
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" :type="type" :placeholder="placeholder" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup.enter="$emit(\'keyup\', $event)" />',
            props: [
              'modelValue',
              'type',
              'placeholder',
              'disabled',
              'inputmode',
              'pattern',
              'autocapitalize',
              'autocomplete',
            ],
          },
          'b-dropdown': {
            template:
              '<div class="dropdown"><slot /><slot name="button-content" /></div>',
            props: ['variant'],
          },
          'b-dropdown-item': {
            template:
              '<button class="dropdown-item" :class="{ active }" @click="$emit(\'click\')"><slot /></button>',
            props: ['active'],
          },
          'b-button': {
            template:
              '<button :variant="variant" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'disabled'],
          },
          'v-icon': {
            template: '<span class="icon" :class="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockSystemLogsStore.timeRange = '24h'
    mockSystemLogsStore.showPolling = false
    mockSystemLogsStore.loading = false
    mockUserStore.list = {}
    mockUserStore.fetchMT.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders search bar container', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.search-bar').exists()).toBe(true)
    })

    it('renders user ID input', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('input[placeholder="ID"]').exists()).toBe(true)
    })

    it('renders email input', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('input[placeholder="Email"]').exists()).toBe(true)
    })

    it('renders IP input', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('input[placeholder="IP"]').exists()).toBe(true)
    })

    it('renders time range dropdown', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.dropdown').exists()).toBe(true)
    })

    it('renders search button', () => {
      const wrapper = mountComponent()
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(wrapper.text()).toContain('Search Now')
    })

    it('renders expand all button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Expand All')
    })

    it('renders polling checkbox', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Show polling')
    })
  })

  describe('props', () => {
    it('syncs userid prop to userIdInput', async () => {
      const wrapper = mountComponent({ userid: 123 })
      await wrapper.vm.$nextTick()
      // Component stores numeric props as-is (not converted to string)
      expect(wrapper.vm.userIdInput).toBe(123)
    })

    it('syncs groupid prop to groupIdInput', async () => {
      const wrapper = mountComponent({ groupid: 456 })
      await wrapper.vm.$nextTick()
      // Component stores numeric props as-is (not converted to string)
      expect(wrapper.vm.groupIdInput).toBe(456)
    })

    it('syncs msgid prop to msgIdInput', async () => {
      const wrapper = mountComponent({ msgid: 789 })
      await wrapper.vm.$nextTick()
      // Component stores numeric props as-is (not converted to string)
      expect(wrapper.vm.msgIdInput).toBe(789)
    })
  })

  describe('computed properties', () => {
    it('timeRange gets value from store', () => {
      mockSystemLogsStore.timeRange = '7d'
      const wrapper = mountComponent()
      expect(wrapper.vm.timeRange).toBe('7d')
    })

    it('timeRange sets value in store', () => {
      const wrapper = mountComponent()
      wrapper.vm.timeRange = '30d'
      expect(mockSystemLogsStore.setTimeRange).toHaveBeenCalledWith('30d')
    })

    it('showPolling gets value from store', () => {
      mockSystemLogsStore.showPolling = true
      const wrapper = mountComponent()
      expect(wrapper.vm.showPolling).toBe(true)
    })

    it('showPolling sets value in store', () => {
      const wrapper = mountComponent()
      wrapper.vm.showPolling = true
      expect(mockSystemLogsStore.setShowPolling).toHaveBeenCalledWith(true)
    })

    it('loading reflects store loading state', () => {
      mockSystemLogsStore.loading = true
      const wrapper = mountComponent()
      expect(wrapper.vm.loading).toBe(true)
    })

    it('timeRangeLabel returns correct label for 24h', () => {
      mockSystemLogsStore.timeRange = '24h'
      const wrapper = mountComponent()
      expect(wrapper.vm.timeRangeLabel).toBe('Last day')
    })

    it('timeRangeLabel returns correct label for 7d', () => {
      mockSystemLogsStore.timeRange = '7d'
      const wrapper = mountComponent()
      expect(wrapper.vm.timeRangeLabel).toBe('Last week')
    })

    it('timeRangeLabel returns correct label for ever', () => {
      mockSystemLogsStore.timeRange = 'ever'
      const wrapper = mountComponent()
      expect(wrapper.vm.timeRangeLabel).toBe('All time')
    })
  })

  describe('methods', () => {
    it('doSearch emits search event', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.doSearch()
      expect(wrapper.emitted('search')).toBeTruthy()
    })

    it('doSearch emits update:userid with parsed value', async () => {
      const wrapper = mountComponent()
      wrapper.vm.userIdInput = '123'
      await wrapper.vm.doSearch()
      expect(wrapper.emitted('update:userid')[0]).toEqual([123])
    })

    it('doSearch emits update:userid with null when empty', async () => {
      const wrapper = mountComponent()
      wrapper.vm.userIdInput = ''
      await wrapper.vm.doSearch()
      expect(wrapper.emitted('update:userid')[0]).toEqual([null])
    })

    it('doSearch emits update:msgid with parsed value', async () => {
      const wrapper = mountComponent()
      wrapper.vm.msgIdInput = '456'
      await wrapper.vm.doSearch()
      expect(wrapper.emitted('update:msgid')[0]).toEqual([456])
    })

    it('doSearch emits update:groupid with parsed value', async () => {
      const wrapper = mountComponent()
      wrapper.vm.groupIdInput = '789'
      await wrapper.vm.doSearch()
      expect(wrapper.emitted('update:groupid')[0]).toEqual([789])
    })

    it('doSearch sets IP filter when ipInput has value', async () => {
      const wrapper = mountComponent()
      wrapper.vm.ipInput = '192.168.1.1'
      await wrapper.vm.doSearch()
      expect(mockSystemLogsStore.setIpFilter).toHaveBeenCalledWith(
        '192.168.1.1'
      )
    })

    it('doSearch clears IP filter when ipInput is empty', async () => {
      const wrapper = mountComponent()
      wrapper.vm.ipInput = ''
      await wrapper.vm.doSearch()
      expect(mockSystemLogsStore.setIpFilter).toHaveBeenCalledWith(null)
    })

    it('doSearch sets email filter when emailInput has value', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emailInput = 'test@example.com'
      await wrapper.vm.doSearch()
      expect(mockSystemLogsStore.setEmailFilter).toHaveBeenCalledWith(
        'test@example.com'
      )
    })

    it('doSearch clears email filter when emailInput is empty', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emailInput = ''
      await wrapper.vm.doSearch()
      expect(mockSystemLogsStore.setEmailFilter).toHaveBeenCalledWith(null)
    })

    it('setTimeRange updates store and emits search', () => {
      const wrapper = mountComponent()
      wrapper.vm.setTimeRange('7d')
      expect(mockSystemLogsStore.setTimeRange).toHaveBeenCalledWith('7d')
      expect(wrapper.emitted('search')).toBeTruthy()
    })
  })

  describe('email lookup', () => {
    it('lookupEmail sets user ID from found user', async () => {
      mockUserStore.list = { 123: { id: 123 } }
      mockUserStore.fetchMT.mockResolvedValue()

      const wrapper = mountComponent()
      wrapper.vm.emailInput = 'test@example.com'
      await wrapper.vm.lookupEmail()

      expect(wrapper.vm.userIdInput).toBe('123')
    })

    it('lookupEmail sets error when no user found', async () => {
      mockUserStore.list = {}
      mockUserStore.fetchMT.mockResolvedValue()

      const wrapper = mountComponent()
      wrapper.vm.emailInput = 'notfound@example.com'
      await wrapper.vm.lookupEmail()

      expect(wrapper.vm.emailLookupError).toContain('No user found')
    })

    it('lookupEmail handles multiple users', async () => {
      mockUserStore.list = {
        123: { id: 123 },
        456: { id: 456 },
      }
      mockUserStore.fetchMT.mockResolvedValue()

      const wrapper = mountComponent()
      wrapper.vm.emailInput = 'shared@example.com'
      await wrapper.vm.lookupEmail()

      expect(wrapper.vm.emailLookupError).toContain('Found 2 users')
    })

    it('lookupEmail does nothing when email is empty', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emailInput = ''
      await wrapper.vm.lookupEmail()

      expect(mockUserStore.fetchMT).not.toHaveBeenCalled()
    })

    it('lookupEmail handles fetch error', async () => {
      mockUserStore.fetchMT.mockRejectedValue(new Error('Network error'))

      const wrapper = mountComponent()
      wrapper.vm.emailInput = 'test@example.com'
      await wrapper.vm.lookupEmail()

      expect(wrapper.vm.emailLookupError).toContain('Failed to lookup email')
    })

    it('lookupEmail shows spinner during lookup', async () => {
      let resolvePromise
      mockUserStore.fetchMT.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve
        })
      )

      const wrapper = mountComponent()
      wrapper.vm.emailInput = 'test@example.com'
      const lookupPromise = wrapper.vm.lookupEmail()

      expect(wrapper.vm.lookingUpEmail).toBe(true)

      resolvePromise()
      await lookupPromise

      expect(wrapper.vm.lookingUpEmail).toBe(false)
    })
  })

  describe('emits', () => {
    it('emits expand-all when expand all button clicked', async () => {
      const wrapper = mountComponent()
      const expandButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Expand All'))
      await expandButton.trigger('click')
      expect(wrapper.emitted('expand-all')).toBeTruthy()
    })
  })

  describe('time options', () => {
    it('has correct time options', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.timeOptions).toEqual([
        { value: '1h', label: 'Last hour' },
        { value: '24h', label: 'Last day' },
        { value: '7d', label: 'Last week' },
        { value: '30d', label: 'Last month' },
        { value: '365d', label: 'Last year' },
        { value: 'ever', label: 'All time' },
      ])
    })
  })

  describe('search button state', () => {
    it('shows Searching... when loading', () => {
      mockSystemLogsStore.loading = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Searching...')
    })

    it('shows Search Now when not loading', () => {
      mockSystemLogsStore.loading = false
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Search Now')
    })

    it('disables search button when loading', () => {
      mockSystemLogsStore.loading = true
      const wrapper = mountComponent()
      const searchButton = wrapper.find('.search-btn')
      expect(searchButton.attributes('disabled')).toBeDefined()
    })
  })
})
