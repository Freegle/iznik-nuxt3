import { describe, it, expect, vi } from 'vitest'
import { mount, config } from '@vue/test-utils'
import ModMemberLogins from '~/modtools/components/ModMemberLogins.vue'

// Mock the timeago global
config.global.mocks = {
  ...config.global.mocks,
  timeago: vi.fn((date) => '2 days ago'),
}

describe('ModMemberLogins', () => {
  function mountModMemberLogins(memberOverrides = {}) {
    const defaultMember = {
      logins: [],
      ...memberOverrides,
    }
    return mount(ModMemberLogins, {
      props: { member: defaultMember },
      global: {
        stubs: {
          'b-badge': {
            template:
              '<span class="badge" :class="\'badge-\' + variant"><slot /></span>',
            props: ['variant'],
          },
        },
        mocks: {
          timeago: vi.fn((date) => '2 days ago'),
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders a div container', () => {
      const wrapper = mountModMemberLogins()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders no badges when logins is empty', () => {
      const wrapper = mountModMemberLogins({ logins: [] })
      expect(wrapper.findAll('.badge').length).toBe(0)
    })

    it('renders a badge for each login', () => {
      const wrapper = mountModMemberLogins({
        logins: [
          { id: 1, type: 'Native', lastaccess: '2024-01-01' },
          { id: 2, type: 'Google', lastaccess: '2024-01-02' },
        ],
      })
      expect(wrapper.findAll('.badge').length).toBe(2)
    })
  })

  describe('login type display', () => {
    it('shows "Email/Password" for Native login type', () => {
      const wrapper = mountModMemberLogins({
        logins: [{ id: 1, type: 'Native', lastaccess: '2024-01-01' }],
      })
      expect(wrapper.text()).toContain('Email/Password')
    })

    it('shows "Facebook" for Facebook login type', () => {
      const wrapper = mountModMemberLogins({
        logins: [{ id: 1, type: 'Facebook', lastaccess: '2024-01-01' }],
      })
      expect(wrapper.text()).toContain('Facebook')
    })

    it('shows "Yahoo" for Yahoo login type', () => {
      const wrapper = mountModMemberLogins({
        logins: [{ id: 1, type: 'Yahoo', lastaccess: '2024-01-01' }],
      })
      expect(wrapper.text()).toContain('Yahoo')
    })

    it('shows "Google" for Google login type', () => {
      const wrapper = mountModMemberLogins({
        logins: [{ id: 1, type: 'Google', lastaccess: '2024-01-01' }],
      })
      expect(wrapper.text()).toContain('Google')
    })

    it('shows original type for unknown login types', () => {
      const wrapper = mountModMemberLogins({
        logins: [{ id: 1, type: 'Apple', lastaccess: '2024-01-01' }],
      })
      expect(wrapper.text()).toContain('Apple')
    })
  })

  describe('badge styling', () => {
    it('applies info variant to badges', () => {
      const wrapper = mountModMemberLogins({
        logins: [{ id: 1, type: 'Native', lastaccess: '2024-01-01' }],
      })
      expect(wrapper.find('.badge-info').exists()).toBe(true)
    })
  })

  describe('timeago display', () => {
    it('shows timeago for last access', () => {
      const wrapper = mountModMemberLogins({
        logins: [{ id: 1, type: 'Native', lastaccess: '2024-01-01' }],
      })
      expect(wrapper.text()).toContain('login')
    })
  })
})
