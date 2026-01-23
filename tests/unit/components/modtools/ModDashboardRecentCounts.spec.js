import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ModDashboardRecentCounts from '~/modtools/components/ModDashboardRecentCounts.vue'

// Mock the composable
const mockLoading = ref(false)
const mockRecentCounts = ref(null)

vi.mock('~/modtools/composables/useModDashboard', () => ({
  useModDashboard: () => ({
    loading: mockLoading,
    RecentCounts: mockRecentCounts,
  }),
}))

// Mock pluralise composable
vi.mock('~/modtools/composables/usePluralise', () => ({
  pluralise: (word, count, withNumber) => {
    const num = withNumber ? `${count} ` : ''
    if (Array.isArray(word)) {
      return num + (count === 1 ? word[0] : word[1])
    }
    return num + (count === 1 ? word : word + 's')
  },
}))

describe('ModDashboardRecentCounts', () => {
  const defaultProps = {
    groupid: 123,
    groupName: 'Test Group',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
  }

  function mountComponent(props = {}) {
    return mount(ModDashboardRecentCounts, {
      props: { ...defaultProps, ...props },
      global: {
        plugins: [createPinia()],
        mocks: {
          pluralise: (word, count, withNumber) => {
            const num = withNumber ? `${count} ` : ''
            if (Array.isArray(word)) {
              return num + (count === 1 ? word[0] : word[1])
            }
            return num + (count === 1 ? word : word + 's')
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockLoading.value = false
    mockRecentCounts.value = null
  })

  describe('rendering', () => {
    it('does not render when RecentCounts is null', () => {
      mockRecentCounts.value = null
      const wrapper = mountComponent()
      expect(wrapper.find('div').exists()).toBe(false)
    })

    it('does not render when RecentCounts is undefined', () => {
      mockRecentCounts.value = undefined
      const wrapper = mountComponent()
      expect(wrapper.find('div').exists()).toBe(false)
    })

    it('renders when RecentCounts is available', () => {
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const wrapper = mountComponent()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders paragraph with count information', () => {
      mockRecentCounts.value = { newmessages: 10, newmembers: 5 }
      const wrapper = mountComponent()
      expect(wrapper.find('p').exists()).toBe(true)
    })

    it('contains introductory text', () => {
      mockRecentCounts.value = { newmessages: 10, newmembers: 5 }
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('During this time there have been')
    })
  })

  describe('loading state', () => {
    it('shows loading state when loading is true', () => {
      mockLoading.value = true
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Loading')
    })

    it('shows pulsate class when loading', () => {
      mockLoading.value = true
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const wrapper = mountComponent()
      const loadingElement = wrapper.find('.pulsate')
      expect(loadingElement.exists()).toBe(true)
    })

    it('shows text-faded class when loading', () => {
      mockLoading.value = true
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const wrapper = mountComponent()
      const loadingElement = wrapper.find('.text-faded')
      expect(loadingElement.exists()).toBe(true)
    })

    it('hides loading state when not loading', () => {
      mockLoading.value = false
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('Loading')
    })

    it('shows counts when not loading', () => {
      mockLoading.value = false
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('new post')
      expect(wrapper.text()).toContain('new member')
    })
  })

  describe('count display with pluralization', () => {
    it('displays new posts count with proper pluralization for multiple posts', () => {
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('5 new posts')
    })

    it('displays new members count with proper pluralization for multiple members', () => {
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('3 new members')
    })

    it('displays singular form for 1 post', () => {
      mockRecentCounts.value = { newmessages: 1, newmembers: 3 }
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('1 new post')
      expect(wrapper.text()).not.toContain('1 new posts')
    })

    it('displays singular form for 1 member', () => {
      mockRecentCounts.value = { newmessages: 5, newmembers: 1 }
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('1 new member')
      expect(wrapper.text()).not.toContain('1 new members')
    })

    it('displays zero counts properly', () => {
      mockRecentCounts.value = { newmessages: 0, newmembers: 0 }
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('0 new posts')
      expect(wrapper.text()).toContain('0 new members')
    })

    it('displays counts in strong tags', () => {
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const wrapper = mountComponent()
      const strongElements = wrapper.findAll('strong')
      expect(strongElements.length).toBe(2)
    })
  })

  describe('props handling', () => {
    it('accepts groupid prop', () => {
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const wrapper = mountComponent({ groupid: 456 })
      expect(wrapper.props('groupid')).toBe(456)
    })

    it('accepts null groupid prop (default)', () => {
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const wrapper = mountComponent({ groupid: null })
      expect(wrapper.props('groupid')).toBeNull()
    })

    it('accepts groupName prop', () => {
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const wrapper = mountComponent({ groupName: 'Another Group' })
      expect(wrapper.props('groupName')).toBe('Another Group')
    })

    it('accepts start date prop', () => {
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const startDate = new Date('2024-06-01')
      const wrapper = mountComponent({ start: startDate })
      expect(wrapper.props('start')).toEqual(startDate)
    })

    it('accepts end date prop', () => {
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const endDate = new Date('2024-06-30')
      const wrapper = mountComponent({ end: endDate })
      expect(wrapper.props('end')).toEqual(endDate)
    })
  })

  describe('edge cases', () => {
    it('handles large numbers', () => {
      mockRecentCounts.value = { newmessages: 10000, newmembers: 5000 }
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('10000 new posts')
      expect(wrapper.text()).toContain('5000 new members')
    })

    it('handles RecentCounts with missing newmessages', () => {
      mockRecentCounts.value = { newmembers: 5 }
      const wrapper = mountComponent()
      // Component should still render with undefined count
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('handles RecentCounts with missing newmembers', () => {
      mockRecentCounts.value = { newmessages: 10 }
      const wrapper = mountComponent()
      // Component should still render with undefined count
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders correctly with empty RecentCounts object', () => {
      mockRecentCounts.value = {}
      const wrapper = mountComponent()
      expect(wrapper.find('div').exists()).toBe(true)
    })
  })

  describe('loading and data transitions', () => {
    it('shows loading when loading with data', () => {
      mockLoading.value = true
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const wrapper = mountComponent()
      expect(wrapper.find('.pulsate').exists()).toBe(true)
    })

    it('shows data when loading completes', async () => {
      mockLoading.value = true
      mockRecentCounts.value = { newmessages: 5, newmembers: 3 }
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Loading')

      mockLoading.value = false
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('5 new posts')
    })
  })
})
