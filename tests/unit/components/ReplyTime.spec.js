import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ReplyTime from '~/components/ReplyTime.vue'

// Mock user store
const mockUserStore = {
  byId: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('ReplyTime', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.byId.mockReturnValue(null)
  })

  function createWrapper(props = {}) {
    return mount(ReplyTime, {
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

    it('shows unknown message when no user data', () => {
      mockUserStore.byId.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("don't know how long")
    })

    it('shows unknown message when user has no reply time', () => {
      mockUserStore.byId.mockReturnValue({ id: 123, info: {} })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("don't know how long")
    })

    it('shows clock icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 456 })
      expect(wrapper.props('id')).toBe(456)
    })

    it('calls userStore.byId with the id', () => {
      createWrapper({ id: 789 })
      expect(mockUserStore.byId).toHaveBeenCalledWith(789)
    })
  })

  describe('reply time formatting', () => {
    it('formats seconds (singular)', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime: 1 },
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('1 second')
      expect(wrapper.text()).not.toContain('1 seconds')
    })

    it('formats seconds (plural)', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime: 30 },
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('30 seconds')
    })

    it('formats minutes (singular)', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime: 60 },
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('1 minute')
      expect(wrapper.text()).not.toContain('1 minutes')
    })

    it('formats minutes (plural)', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime: 1800 }, // 30 minutes
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('30 minutes')
    })

    it('formats hours (singular)', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime: 3600 }, // 1 hour
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('1 hour')
      expect(wrapper.text()).not.toContain('1 hours')
    })

    it('formats hours (plural)', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime: 7200 }, // 2 hours
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('2 hours')
    })

    it('formats days (singular)', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime: 86400 }, // 1 day
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('1 day')
      expect(wrapper.text()).not.toContain('1 days')
    })

    it('formats days (plural)', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime: 259200 }, // 3 days
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('3 days')
    })

    it('shows "Typically replies in" prefix', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime: 3600 },
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Typically replies in')
    })
  })

  describe('edge cases', () => {
    it('rounds seconds correctly', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime: 45.6 },
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('46 seconds')
    })

    it('rounds minutes correctly', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime: 150 }, // 2.5 minutes
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('3 minutes')
    })

    it('handles boundary between seconds and minutes', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime: 59 },
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('59 seconds')
    })

    it('handles boundary between minutes and hours', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime: 59 * 60 },
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('59 minutes')
    })

    it('handles boundary between hours and days', () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime: 23 * 60 * 60 },
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('23 hours')
    })
  })
})
