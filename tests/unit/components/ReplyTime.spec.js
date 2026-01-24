import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ReplyTime from '~/components/ReplyTime.vue'

const mockByIdFn = vi.fn()

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    byId: mockByIdFn,
  }),
}))

describe('ReplyTime', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockByIdFn.mockReturnValue(null)
  })

  function createWrapper(props = {}) {
    return mount(ReplyTime, {
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
    it('renders container div', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders clock icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon').attributes('data-icon')).toBe('clock')
    })

    it('renders paragraph element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('p').exists()).toBe(true)
    })
  })

  describe('when no reply time available', () => {
    it('shows unknown message when user has no replytime', () => {
      mockByIdFn.mockReturnValue({ info: {} })
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain(
        "We don't know how long they typically take to reply"
      )
    })

    it('shows unknown message when user has no info', () => {
      mockByIdFn.mockReturnValue({})
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain(
        "We don't know how long they typically take to reply"
      )
    })

    it('shows unknown message when user is null', () => {
      mockByIdFn.mockReturnValue(null)
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain(
        "We don't know how long they typically take to reply"
      )
    })
  })

  describe('time formatting', () => {
    it('formats seconds', () => {
      mockByIdFn.mockReturnValue({ info: { replytime: 30 } })
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Typically replies in 30 seconds')
    })

    it('formats 1 second singular', () => {
      mockByIdFn.mockReturnValue({ info: { replytime: 1 } })
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Typically replies in 1 second.')
    })

    it('formats minutes', () => {
      mockByIdFn.mockReturnValue({ info: { replytime: 300 } })
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Typically replies in 5 minutes')
    })

    it('formats 1 minute singular', () => {
      mockByIdFn.mockReturnValue({ info: { replytime: 60 } })
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Typically replies in 1 minute.')
    })

    it('formats hours', () => {
      mockByIdFn.mockReturnValue({ info: { replytime: 7200 } })
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Typically replies in 2 hours')
    })

    it('formats 1 hour singular', () => {
      mockByIdFn.mockReturnValue({ info: { replytime: 3600 } })
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Typically replies in 1 hour.')
    })

    it('formats days', () => {
      mockByIdFn.mockReturnValue({ info: { replytime: 259200 } })
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Typically replies in 3 days')
    })

    it('formats 1 day singular', () => {
      mockByIdFn.mockReturnValue({ info: { replytime: 86400 } })
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Typically replies in 1 day.')
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 456 })
      expect(wrapper.props('id')).toBe(456)
    })
  })

  describe('user store interaction', () => {
    it('calls userStore.byId with the id prop', () => {
      createWrapper({ id: 789 })

      expect(mockByIdFn).toHaveBeenCalledWith(789)
    })
  })

  describe('computed replytime', () => {
    it('returns null when user has no replytime info', () => {
      mockByIdFn.mockReturnValue({ info: {} })
      const wrapper = createWrapper()

      expect(wrapper.vm.replytime).toBeNull()
    })

    it('returns formatted string when replytime exists', () => {
      mockByIdFn.mockReturnValue({ info: { replytime: 120 } })
      const wrapper = createWrapper()

      expect(wrapper.vm.replytime).toBe('2 minutes')
    })
  })
})
