import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UserName from '~/components/UserName.vue'

const mockByIdFn = vi.fn()
const mockFetchFn = vi.fn()

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    byId: mockByIdFn,
    fetch: mockFetchFn,
  }),
}))

describe('UserName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockByIdFn.mockReturnValue(null)
    mockFetchFn.mockResolvedValue({})
  })

  function createWrapper(props = {}) {
    return mount(UserName, {
      props: {
        id: 123,
        ...props,
      },
      global: {
        stubs: {
          'v-icon': {
            template:
              '<span class="v-icon" :data-icon="icon" :class="$attrs.class" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders span container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('span').exists()).toBe(true)
    })

    it('displays username when user exists', () => {
      mockByIdFn.mockReturnValue({ displayname: 'John Doe' })
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('John Doe')
    })

    it('displays empty when user has no displayname', () => {
      mockByIdFn.mockReturnValue({})
      const wrapper = createWrapper()

      // Username is empty but ID is shown (hashtag icon + id number)
      expect(wrapper.text()).toContain('123')
      expect(wrapper.find('.v-icon').attributes('data-icon')).toBe('hashtag')
    })
  })

  describe('showId prop', () => {
    it('shows id by default', () => {
      mockByIdFn.mockReturnValue({ displayname: 'Jane' })
      const wrapper = createWrapper()

      // Hashtag is an icon, not text - check for the ID number and icon
      expect(wrapper.text()).toContain('123')
      expect(wrapper.find('.v-icon').exists()).toBe(true)
    })

    it('shows id with hashtag icon', () => {
      mockByIdFn.mockReturnValue({ displayname: 'Jane' })
      const wrapper = createWrapper()

      expect(wrapper.find('.v-icon').attributes('data-icon')).toBe('hashtag')
    })

    it('hides id when showId is false', () => {
      mockByIdFn.mockReturnValue({ displayname: 'Jane' })
      const wrapper = createWrapper({ showId: false })

      expect(wrapper.text()).not.toContain('#')
      expect(wrapper.text()).not.toContain('123')
    })

    it('does not render hashtag icon when showId is false', () => {
      mockByIdFn.mockReturnValue({ displayname: 'Jane' })
      const wrapper = createWrapper({ showId: false })

      expect(wrapper.find('.v-icon').exists()).toBe(false)
    })
  })

  describe('intro prop', () => {
    it('shows intro text before username', () => {
      mockByIdFn.mockReturnValue({ displayname: 'Bob' })
      const wrapper = createWrapper({ intro: 'Sent by' })

      expect(wrapper.text()).toContain('Sent by')
      expect(wrapper.text()).toContain('Bob')
    })

    it('defaults to empty intro', () => {
      const wrapper = createWrapper()

      expect(wrapper.props('intro')).toBe('')
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 456 })
      expect(wrapper.props('id')).toBe(456)
    })

    it('has showId prop defaulting to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('showId')).toBe(true)
    })

    it('has intro prop defaulting to empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('intro')).toBe('')
    })
  })

  describe('user store interaction', () => {
    it('calls userStore.fetch with the id prop', () => {
      createWrapper({ id: 789 })

      expect(mockFetchFn).toHaveBeenCalledWith(789)
    })

    it('calls userStore.byId with the id prop', () => {
      createWrapper({ id: 789 })

      expect(mockByIdFn).toHaveBeenCalledWith(789)
    })
  })

  describe('computed username', () => {
    it('returns displayname from user', () => {
      mockByIdFn.mockReturnValue({ displayname: 'Alice' })
      const wrapper = createWrapper()

      expect(wrapper.vm.username).toBe('Alice')
    })

    it('returns undefined when user has no displayname', () => {
      mockByIdFn.mockReturnValue({})
      const wrapper = createWrapper()

      expect(wrapper.vm.username).toBeUndefined()
    })

    it('returns undefined when user is null', () => {
      mockByIdFn.mockReturnValue(null)
      const wrapper = createWrapper()

      expect(wrapper.vm.username).toBeUndefined()
    })
  })

  describe('error handling', () => {
    it('handles fetch errors gracefully', () => {
      mockFetchFn.mockImplementation(() => {
        throw new Error('Fetch failed')
      })

      // Should not throw
      expect(() => createWrapper()).not.toThrow()
    })
  })
})
