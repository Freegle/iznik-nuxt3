import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModDeletedOrForgotten from '~/modtools/components/ModDeletedOrForgotten.vue'

// Mock dateonly composable
vi.mock('~/composables/useDateFormat', () => ({
  useDateFormat: () => ({
    dateonly: vi.fn((date) => `formatted: ${date}`),
  }),
}))

describe('ModDeletedOrForgotten', () => {
  const defaultProps = {
    user: {
      deleted: '2024-01-15',
      forgotten: null,
    },
  }

  function mountComponent(props = {}) {
    return mount(ModDeletedOrForgotten, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          NoticeMessage: {
            template: '<div class="notice"><slot /></div>',
            props: ['variant'],
          },
        },
        mocks: {
          dateonly: (date) => `formatted: ${date}`,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('does not render when user is null', () => {
      const wrapper = mountComponent({ user: null })
      expect(wrapper.find('.notice').exists()).toBe(false)
    })

    it('does not render when user is not deleted', () => {
      const wrapper = mountComponent({
        user: { deleted: null },
      })
      expect(wrapper.find('.notice').exists()).toBe(false)
    })

    it('renders when user is deleted', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.notice').exists()).toBe(true)
    })

    it('shows deleted but not forgotten message', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('deleted their account')
      expect(wrapper.text()).toContain('data has not yet been removed')
    })

    it('shows recovery instructions when not forgotten', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('recover their account')
    })

    it('shows forgotten message when data is removed', () => {
      const wrapper = mountComponent({
        user: {
          deleted: '2024-01-15',
          forgotten: '2024-01-30',
        },
      })
      expect(wrapper.text()).toContain('data was removed')
    })

    it('does not show recovery message when forgotten', () => {
      const wrapper = mountComponent({
        user: {
          deleted: '2024-01-15',
          forgotten: '2024-01-30',
        },
      })
      expect(wrapper.text()).not.toContain('recover their account')
    })
  })

  describe('props', () => {
    it('accepts user prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('user').deleted).toBe('2024-01-15')
    })
  })
})
