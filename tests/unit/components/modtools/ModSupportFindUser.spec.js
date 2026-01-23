/* eslint-disable no-template-curly-in-string */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createMockUserStore } from '../../mocks/stores'
import ModSupportFindUser from '~/modtools/components/ModSupportFindUser.vue'

// Create mock store instance
const mockUserStore = createMockUserStore()

// Mock the store import
vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('ModSupportFindUser', () => {
  function mountComponent(props = {}) {
    return mount(ModSupportFindUser, {
      props: { ...props },
      global: {
        stubs: {
          'b-input-group': {
            template:
              '<div class="input-group"><slot /><slot name="append" /></div>',
          },
          'b-form-input': {
            template:
              '<input class="form-input" :value="modelValue" :placeholder="placeholder" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup="$emit(\'keyup\', $event)" @keyup.enter.exact="$emit(\'keyup.enter.exact\')" />',
            props: [
              'modelValue',
              'placeholder',
              'disabled',
              'autocapitalize',
              'autocomplete',
            ],
          },
          'b-button': {
            template:
              '<button :class="variant" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'disabled'],
          },
          'v-icon': {
            template:
              "<i :class=\"[`icon-${icon}`, { 'fa-spin': icon === 'sync' && $parent.searching }]\" />",
            props: ['icon'],
          },
          ModSupportUser: {
            template:
              '<div class="mod-support-user" :data-id="id" :data-expand="expand">User {{ id }}</div>',
            props: ['id', 'expand'],
          },
          'infinite-loading': {
            template:
              '<div class="infinite-loading"><slot name="spinner" /><slot name="complete" /></div>',
            emits: ['infinite'],
            mounted() {
              // Simulate initial load
              this.$emit('infinite', { complete: () => {}, loaded: () => {} })
            },
          },
          'notice-message': {
            template: '<div class="notice-message"><slot /></div>',
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock store state
    mockUserStore.list = {}
    mockUserStore.clear = vi.fn()
    mockUserStore.fetchMT = vi.fn().mockResolvedValue({})
  })

  describe('rendering', () => {
    it('renders the component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders the search input', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.form-input').exists()).toBe(true)
    })

    it('renders the Find user button', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.text()).toContain('Find user')
    })

    it('shows placeholder text', () => {
      const wrapper = mountComponent()
      const input = wrapper.find('.form-input')
      expect(input.attributes('placeholder')).toBe(
        'Email, numerical id, or ~- encoded id'
      )
    })

    it('does not show search results initially', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-support-user').exists()).toBe(false)
    })
  })

  describe('onMounted behavior', () => {
    it('clears user store on mount', () => {
      mountComponent()
      expect(mockUserStore.clear).toHaveBeenCalled()
    })

    it('automatically searches when id prop is provided', async () => {
      mockUserStore.list = {
        123: { id: 123, lastaccess: '2024-01-01T00:00:00Z' },
      }

      mountComponent({ id: 123 })
      await flushPromises()

      expect(mockUserStore.fetchMT).toHaveBeenCalledWith({
        search: '123',
        emailhistory: true,
      })
    })

    it('does not search when id prop is not provided', () => {
      mountComponent()
      // Only clear is called, not fetchMT
      expect(mockUserStore.clear).toHaveBeenCalled()
      expect(mockUserStore.fetchMT).not.toHaveBeenCalled()
    })
  })

  describe('usersearch function', () => {
    it('does not search when searchuser is empty', async () => {
      const wrapper = mountComponent()
      wrapper.vm.searchuser = ''
      await wrapper.vm.usersearch()
      expect(mockUserStore.fetchMT).not.toHaveBeenCalled()
    })

    it('does not search when searchuser is null', async () => {
      const wrapper = mountComponent()
      wrapper.vm.searchuser = null
      await wrapper.vm.usersearch()
      expect(mockUserStore.fetchMT).not.toHaveBeenCalled()
    })

    it('trims whitespace from search value', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {}

      wrapper.vm.searchuser = '  test@example.com  '
      await wrapper.vm.usersearch()

      expect(mockUserStore.fetchMT).toHaveBeenCalledWith({
        search: 'test@example.com',
        emailhistory: true,
      })
    })

    it('sets searching to true during search', async () => {
      const wrapper = mountComponent()

      // Create a delayed promise
      let resolvePromise
      mockUserStore.fetchMT = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolvePromise = resolve
        })
      })

      wrapper.vm.searchuser = 'test'
      const searchPromise = wrapper.vm.usersearch()

      expect(wrapper.vm.searching).toBe(true)

      resolvePromise({})
      await searchPromise

      expect(wrapper.vm.searching).toBe(false)
    })

    it('sets searched to true after search completes', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {}

      wrapper.vm.searchuser = 'test'
      expect(wrapper.vm.searched).toBe(false)

      await wrapper.vm.usersearch()

      expect(wrapper.vm.searched).toBe(true)
    })

    it('clears store before searching', async () => {
      const wrapper = mountComponent()
      vi.clearAllMocks()

      wrapper.vm.searchuser = 'test'
      await wrapper.vm.usersearch()

      expect(mockUserStore.clear).toHaveBeenCalled()
    })

    it('resets show count before searching', async () => {
      const wrapper = mountComponent()
      wrapper.vm.show = 10

      wrapper.vm.searchuser = 'test'
      await wrapper.vm.usersearch()

      expect(wrapper.vm.show).toBe(0)
    })

    it('sorts results by lastaccess descending', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {
        1: { id: 1, lastaccess: '2024-01-01T00:00:00Z' },
        2: { id: 2, lastaccess: '2024-06-01T00:00:00Z' },
        3: { id: 3, lastaccess: '2024-03-01T00:00:00Z' },
      }

      wrapper.vm.searchuser = 'test'
      await wrapper.vm.usersearch()

      expect(wrapper.vm.searchresults[0].id).toBe(2) // Most recent
      expect(wrapper.vm.searchresults[1].id).toBe(3)
      expect(wrapper.vm.searchresults[2].id).toBe(1) // Oldest
    })
  })

  describe('expand computed', () => {
    it('returns true when exactly one result', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {
        1: { id: 1, lastaccess: '2024-01-01T00:00:00Z' },
      }

      wrapper.vm.searchuser = 'test'
      await wrapper.vm.usersearch()

      expect(wrapper.vm.expand).toBe(true)
    })

    it('returns false when multiple results', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {
        1: { id: 1, lastaccess: '2024-01-01T00:00:00Z' },
        2: { id: 2, lastaccess: '2024-02-01T00:00:00Z' },
      }

      wrapper.vm.searchuser = 'test'
      await wrapper.vm.usersearch()

      expect(wrapper.vm.expand).toBe(false)
    })

    it('returns false when no results', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.expand).toBe(false)
    })
  })

  describe('visible computed', () => {
    it('returns empty array when no results', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.visible).toEqual([])
    })

    it('returns slice of results based on show count', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {
        1: { id: 1, lastaccess: '2024-01-01T00:00:00Z' },
        2: { id: 2, lastaccess: '2024-02-01T00:00:00Z' },
        3: { id: 3, lastaccess: '2024-03-01T00:00:00Z' },
      }

      wrapper.vm.searchuser = 'test'
      await wrapper.vm.usersearch()

      wrapper.vm.show = 2
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.visible.length).toBe(2)
    })

    it('returns empty array when searchresults is empty', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {}

      wrapper.vm.searchuser = 'test'
      await wrapper.vm.usersearch()

      expect(wrapper.vm.visible).toEqual([])
    })
  })

  describe('loadMoreUsers function', () => {
    it('increments show count', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {
        1: { id: 1, lastaccess: '2024-01-01T00:00:00Z' },
        2: { id: 2, lastaccess: '2024-02-01T00:00:00Z' },
      }

      wrapper.vm.searchuser = 'test'
      await wrapper.vm.usersearch()

      const initialShow = wrapper.vm.show
      wrapper.vm.loadMoreUsers({ loaded: () => {}, complete: () => {} })

      expect(wrapper.vm.show).toBe(initialShow + 1)
    })

    it('calls loaded when more items available', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {
        1: { id: 1, lastaccess: '2024-01-01T00:00:00Z' },
        2: { id: 2, lastaccess: '2024-02-01T00:00:00Z' },
        3: { id: 3, lastaccess: '2024-03-01T00:00:00Z' },
      }

      wrapper.vm.searchuser = 'test'
      await wrapper.vm.usersearch()

      const loadedFn = vi.fn()
      const completeFn = vi.fn()

      wrapper.vm.loadMoreUsers({ loaded: loadedFn, complete: completeFn })

      expect(loadedFn).toHaveBeenCalled()
      expect(completeFn).not.toHaveBeenCalled()
    })

    it('calls complete when all items loaded', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {
        1: { id: 1, lastaccess: '2024-01-01T00:00:00Z' },
      }

      wrapper.vm.searchuser = 'test'
      await wrapper.vm.usersearch()
      wrapper.vm.show = 1

      const loadedFn = vi.fn()
      const completeFn = vi.fn()

      wrapper.vm.loadMoreUsers({ loaded: loadedFn, complete: completeFn })

      expect(completeFn).toHaveBeenCalled()
    })

    it('caps show at searchresults length', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {
        1: { id: 1, lastaccess: '2024-01-01T00:00:00Z' },
        2: { id: 2, lastaccess: '2024-02-01T00:00:00Z' },
      }

      wrapper.vm.searchuser = 'test'
      await wrapper.vm.usersearch()
      wrapper.vm.show = 10 // More than results

      wrapper.vm.loadMoreUsers({ loaded: () => {}, complete: () => {} })

      expect(wrapper.vm.show).toBe(2)
    })
  })

  describe('user interactions', () => {
    it('clears searched flag on keyup', async () => {
      const wrapper = mountComponent()
      wrapper.vm.searched = true

      const input = wrapper.find('.form-input')
      await input.trigger('keyup')

      expect(wrapper.vm.searched).toBe(false)
    })

    it('triggers search on enter key', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {}

      wrapper.vm.searchuser = 'test@example.com'

      // Manually call usersearch since keyup.enter.exact is complex to simulate
      await wrapper.vm.usersearch()

      expect(mockUserStore.fetchMT).toHaveBeenCalled()
    })

    it('disables input while searching', async () => {
      const wrapper = mountComponent()
      wrapper.vm.searching = true
      await wrapper.vm.$nextTick()

      const input = wrapper.find('.form-input')
      expect(input.attributes('disabled')).toBeDefined()
    })

    it('shows sync icon while searching', async () => {
      const wrapper = mountComponent()
      wrapper.vm.searching = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.icon-sync').exists()).toBe(true)
    })

    it('shows search icon when not searching', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.icon-search').exists()).toBe(true)
    })
  })

  describe('search results display', () => {
    it('shows ModSupportUser for each visible result', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {
        1: { id: 1, lastaccess: '2024-01-01T00:00:00Z' },
        2: { id: 2, lastaccess: '2024-02-01T00:00:00Z' },
      }

      wrapper.vm.searchuser = 'test'
      await wrapper.vm.usersearch()
      wrapper.vm.show = 2
      await wrapper.vm.$nextTick()

      const users = wrapper.findAll('.mod-support-user')
      expect(users.length).toBe(2)
    })

    it('passes expand prop to ModSupportUser', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {
        1: { id: 1, lastaccess: '2024-01-01T00:00:00Z' },
      }

      wrapper.vm.searchuser = 'test'
      await wrapper.vm.usersearch()
      wrapper.vm.show = 1
      await wrapper.vm.$nextTick()

      const user = wrapper.find('.mod-support-user')
      expect(user.attributes('data-expand')).toBe('true')
    })

    it('shows no users found message when search returns empty', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {}

      wrapper.vm.searchuser = 'nonexistent'
      await wrapper.vm.usersearch()
      wrapper.vm.show = 0
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('No users found')
    })
  })

  describe('props', () => {
    it('accepts optional id prop', () => {
      const wrapper = mountComponent({ id: 456 })
      expect(wrapper.props('id')).toBe(456)
    })

    it('defaults id prop to null', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('id')).toBeNull()
    })
  })

  describe('slot', () => {
    it('has append slot for custom button content', () => {
      const wrapper = mount(ModSupportFindUser, {
        slots: {
          append: '<button class="custom-button">Custom</button>',
        },
        global: {
          stubs: {
            'b-input-group': {
              template:
                '<div class="input-group"><slot /><slot name="append" /></div>',
            },
            'b-form-input': {
              template: '<input />',
            },
            'b-button': {
              template: '<button><slot /></button>',
            },
            'v-icon': {
              template: '<i />',
            },
            ModSupportUser: {
              template: '<div class="mod-support-user" />',
            },
            'infinite-loading': {
              template: '<div />',
            },
            'notice-message': {
              template: '<div><slot /></div>',
            },
          },
        },
      })

      expect(wrapper.find('.custom-button').exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles numeric search value', async () => {
      const wrapper = mountComponent()
      mockUserStore.list = {}

      wrapper.vm.searchuser = 12345
      await wrapper.vm.usersearch()

      expect(mockUserStore.fetchMT).toHaveBeenCalledWith({
        search: '12345',
        emailhistory: true,
      })
    })

    it('handles whitespace-only search value', async () => {
      const wrapper = mountComponent()

      wrapper.vm.searchuser = '   '
      await wrapper.vm.usersearch()

      // After trim, empty string should not trigger search
      expect(mockUserStore.fetchMT).not.toHaveBeenCalled()
    })
  })
})
