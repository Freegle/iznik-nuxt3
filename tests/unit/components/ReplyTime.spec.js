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
    it('calls userStore.byId with the id', () => {
      createWrapper({ id: 789 })
      expect(mockUserStore.byId).toHaveBeenCalledWith(789)
    })
  })

  describe('reply time formatting', () => {
    it.each([
      [1, '1 second', '1 seconds'],
      [30, '30 seconds', null],
      [60, '1 minute', '1 minutes'],
      [1800, '30 minutes', null],
      [3600, '1 hour', '1 hours'],
      [7200, '2 hours', null],
      [86400, '1 day', '1 days'],
      [259200, '3 days', null],
    ])(
      'formats %i seconds as "%s"',
      (replytime, expected, shouldNotContain) => {
        mockUserStore.byId.mockReturnValue({
          id: 123,
          info: { replytime },
        })
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain(expected)
        if (shouldNotContain) {
          expect(wrapper.text()).not.toContain(shouldNotContain)
        }
      }
    )

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
    it.each([
      [45.6, '46 seconds', 'rounds seconds'],
      [150, '3 minutes', 'rounds minutes (2.5 min → 3)'],
      [59, '59 seconds', 'boundary seconds/minutes'],
      [59 * 60, '59 minutes', 'boundary minutes/hours'],
      [23 * 60 * 60, '23 hours', 'boundary hours/days'],
    ])('handles %s → "%s" (%s)', (replytime, expected) => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        info: { replytime },
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(expected)
    })
  })
})
