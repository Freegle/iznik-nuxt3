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
    it.each([
      ['Native', 'Email/Password'],
      ['Facebook', 'Facebook'],
      ['Yahoo', 'Yahoo'],
      ['Google', 'Google'],
      ['Apple', 'Apple'], // unknown types show as-is
    ])('%s login shows "%s"', (type, expected) => {
      const wrapper = mountModMemberLogins({
        logins: [{ id: 1, type, lastaccess: '2024-01-01' }],
      })
      expect(wrapper.text()).toContain(expected)
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
