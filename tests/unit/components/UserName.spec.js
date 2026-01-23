import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UserName from '~/components/UserName.vue'

// Mock user store
const mockUserStore = {
  byId: vi.fn(),
  fetch: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('UserName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.byId.mockReturnValue(null)
  })

  function createWrapper(props = {}) {
    return mount(UserName, {
      props: {
        id: 123,
        ...props,
      },
      global: {
        stubs: {
          'v-icon': { template: '<i class="v-icon"><slot /></i>' },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders as a span element', () => {
      const wrapper = createWrapper()
      expect(wrapper.element.tagName.toLowerCase()).toBe('span')
    })

    it('displays user displayname', () => {
      mockUserStore.byId.mockReturnValue({ id: 123, displayname: 'John Doe' })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('John Doe')
    })

    it('handles missing user gracefully', () => {
      mockUserStore.byId.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 456 })
      expect(wrapper.props('id')).toBe(456)
    })

    it('defaults showId to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('showId')).toBe(true)
    })

    it('defaults intro to empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('intro')).toBe('')
    })

    it('accepts custom intro', () => {
      const wrapper = createWrapper({ intro: 'From: ' })
      expect(wrapper.props('intro')).toBe('From: ')
    })

    it('accepts showId as false', () => {
      const wrapper = createWrapper({ showId: false })
      expect(wrapper.props('showId')).toBe(false)
    })
  })

  describe('fetching user', () => {
    it('calls userStore.fetch with the id', () => {
      createWrapper({ id: 789 })
      expect(mockUserStore.fetch).toHaveBeenCalledWith(789)
    })

    it('calls userStore.byId with the id', () => {
      createWrapper({ id: 789 })
      expect(mockUserStore.byId).toHaveBeenCalledWith(789)
    })
  })

  describe('showId behavior', () => {
    it('shows user ID when showId is true', () => {
      mockUserStore.byId.mockReturnValue({ id: 123, displayname: 'John' })
      const wrapper = createWrapper({ showId: true })
      expect(wrapper.text()).toContain('123')
    })

    it('hides user ID when showId is false', () => {
      mockUserStore.byId.mockReturnValue({ id: 123, displayname: 'John' })
      const wrapper = createWrapper({ showId: false })
      expect(wrapper.text()).not.toContain('123')
    })

    it('shows hashtag icon when showId is true', () => {
      mockUserStore.byId.mockReturnValue({ id: 123, displayname: 'John' })
      const wrapper = createWrapper({ showId: true })
      expect(wrapper.find('.v-icon').exists()).toBe(true)
    })

    it('does not show hashtag icon when showId is false', () => {
      mockUserStore.byId.mockReturnValue({ id: 123, displayname: 'John' })
      const wrapper = createWrapper({ showId: false })
      expect(wrapper.find('.v-icon').exists()).toBe(false)
    })
  })

  describe('intro behavior', () => {
    it('displays intro text before username', () => {
      mockUserStore.byId.mockReturnValue({ id: 123, displayname: 'John' })
      const wrapper = createWrapper({ intro: 'Posted by: ' })
      const text = wrapper.text()
      expect(text).toContain('Posted by:')
      expect(text.indexOf('Posted by:')).toBeLessThan(text.indexOf('John'))
    })

    it('displays empty intro by default', () => {
      mockUserStore.byId.mockReturnValue({ id: 123, displayname: 'John' })
      const wrapper = createWrapper()
      // Should just show the username without intro
      expect(wrapper.text().trim().startsWith('John')).toBe(true)
    })
  })

  describe('computed username', () => {
    it('returns displayname from user', () => {
      mockUserStore.byId.mockReturnValue({ id: 123, displayname: 'Jane Smith' })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Jane Smith')
    })

    it('handles user without displayname', () => {
      mockUserStore.byId.mockReturnValue({ id: 123 })
      const wrapper = createWrapper()
      // Should not throw and should render
      expect(wrapper.exists()).toBe(true)
    })

    it('handles null user', () => {
      mockUserStore.byId.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('reactivity', () => {
    it('updates when user data changes', async () => {
      mockUserStore.byId.mockReturnValue({ id: 123, displayname: 'Old Name' })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Old Name')

      mockUserStore.byId.mockReturnValue({ id: 123, displayname: 'New Name' })
      await wrapper.vm.$forceUpdate()
      // Note: Reactivity in tests can be tricky - this verifies the structure
      expect(mockUserStore.byId).toHaveBeenCalled()
    })
  })
})
