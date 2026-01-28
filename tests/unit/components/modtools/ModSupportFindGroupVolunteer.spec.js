/* eslint-disable no-template-curly-in-string */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModSupportFindGroupVolunteer from '~/modtools/components/ModSupportFindGroupVolunteer.vue'

describe('ModSupportFindGroupVolunteer', () => {
  const createVolunteer = (overrides = {}) => ({
    userid: 123,
    displayname: 'Test Volunteer',
    email: 'volunteer@example.com',
    role: 'Moderator',
    lastmoderated: '2024-01-15T10:00:00Z',
    settings: {
      active: true,
    },
    ...overrides,
  })

  const defaultProps = {
    volunteer: createVolunteer(),
    groupid: 456,
  }

  function mountComponent(props = {}) {
    return mount(ModSupportFindGroupVolunteer, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template:
              '<div class="col" :class="[`order-${order}`, `order-md-${orderMd || order}`]"><slot /></div>',
            props: ['cols', 'md', 'order', 'orderMd'],
          },
          'v-icon': {
            template: '<i :class="`icon-${icon}`" />',
            props: ['icon', 'scale'],
          },
          ModClipboard: {
            template: '<span class="mod-clipboard" :data-value="value" />',
            props: ['value'],
          },
          ExternalLink: {
            template: '<a :href="href" class="external-link"><slot /></a>',
            props: ['href'],
          },
          ModRole: {
            template:
              '<div class="mod-role" :data-userid="userid" :data-groupid="groupid" :data-role="role" />',
            props: ['userid', 'groupid', 'role'],
          },
        },
        mocks: {
          timeago: (val) => `${val} ago`,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('displays the volunteer userid with hashtag icon', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({ userid: 789 }),
      })
      expect(wrapper.text()).toContain('789')
      expect(wrapper.find('.icon-hashtag').exists()).toBe(true)
    })

    it('displays the volunteer display name', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({ displayname: 'John Doe' }),
      })
      expect(wrapper.text()).toContain('John Doe')
    })

    it('displays the volunteer email', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({ email: 'test@example.org' }),
      })
      expect(wrapper.text()).toContain('test@example.org')
    })

    it('renders ModClipboard with email value', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({ email: 'copy@test.com' }),
      })
      const clipboard = wrapper.find('.mod-clipboard')
      expect(clipboard.exists()).toBe(true)
      expect(clipboard.attributes('data-value')).toBe('copy@test.com')
    })

    it('renders ExternalLink with mailto href', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({ email: 'mailto@test.com' }),
      })
      const link = wrapper.find('.external-link')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('mailto:mailto@test.com')
    })

    it('renders ModRole with correct props', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({ userid: 111, role: 'Owner' }),
        groupid: 222,
      })
      const modRole = wrapper.find('.mod-role')
      expect(modRole.exists()).toBe(true)
      expect(modRole.attributes('data-userid')).toBe('111')
      expect(modRole.attributes('data-groupid')).toBe('222')
      expect(modRole.attributes('data-role')).toBe('Owner')
    })
  })

  describe('active computed property', () => {
    it('returns true when volunteer.settings.active is true', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({
          settings: { active: true },
        }),
      })
      expect(wrapper.vm.active).toBe(true)
    })

    it('returns true when active key is missing from settings (default active)', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({
          settings: {},
        }),
      })
      expect(wrapper.vm.active).toBe(true)
    })

    it('returns false when volunteer.settings.active is false', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({
          settings: { active: false },
        }),
      })
      expect(wrapper.vm.active).toBe(false)
    })

    it('returns false when volunteer.settings is null', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({
          settings: null,
        }),
      })
      expect(wrapper.vm.active).toBe(false)
    })

    // Note: Passing null for a required Object prop would trigger a Vue warning,
    // so we skip this edge case - the component requires a valid volunteer object
  })

  describe('active/backup display', () => {
    it('shows (Active) when volunteer is active', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({
          settings: { active: true },
        }),
      })
      expect(wrapper.text()).toContain('(Active)')
      expect(wrapper.text()).not.toContain('(Backup)')
    })

    it('shows (Backup) when volunteer is not active', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({
          settings: { active: false },
        }),
      })
      expect(wrapper.text()).toContain('(Backup)')
      expect(wrapper.text()).not.toContain('(Active)')
    })

    it('applies font-weight-bold class to Active text', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({
          settings: { active: true },
        }),
      })
      expect(wrapper.find('.font-weight-bold').exists()).toBe(true)
      expect(wrapper.find('.font-weight-bold').text()).toContain('(Active)')
    })

    it('applies text-muted class to Backup text', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({
          settings: { active: false },
        }),
      })
      // The text-muted class is on a span within the component
      const textMutedElements = wrapper.findAll('.text-muted')
      // Should find at least one text-muted element with (Backup)
      const backupEl = textMutedElements.find((el) =>
        el.text().includes('(Backup)')
      )
      expect(backupEl).toBeDefined()
    })
  })

  describe('lastmoderated display', () => {
    it('shows lastmoderated time when available', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({
          lastmoderated: '2024-06-01T12:00:00Z',
        }),
      })
      expect(wrapper.text()).toContain('2024-06-01T12:00:00Z ago')
    })

    it('does not show time when lastmoderated is null', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({
          lastmoderated: null,
        }),
      })
      // The span with timeago should not be rendered
      // Check that the wrapper doesn't contain "ago" pattern
      expect(wrapper.text()).not.toContain('ago')
    })

    it('does not show time when lastmoderated is undefined', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({
          lastmoderated: undefined,
        }),
      })
      expect(wrapper.text()).not.toContain('ago')
    })
  })

  describe('props validation', () => {
    it('accepts volunteer and groupid props', () => {
      const volunteer = createVolunteer({ userid: 999 })
      const wrapper = mountComponent({
        volunteer,
        groupid: 888,
      })
      expect(wrapper.props('volunteer')).toEqual(volunteer)
      expect(wrapper.props('groupid')).toBe(888)
    })

    it('passes correct groupid to ModRole', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer(),
        groupid: 12345,
      })
      const modRole = wrapper.find('.mod-role')
      expect(modRole.attributes('data-groupid')).toBe('12345')
    })
  })

  describe('edge cases', () => {
    it('handles volunteer with minimal data', () => {
      const wrapper = mountComponent({
        volunteer: {
          userid: 1,
          displayname: '',
          email: '',
          role: 'Member',
          lastmoderated: null,
          settings: null,
        },
        groupid: 1,
      })
      expect(wrapper.find('.row').exists()).toBe(true)
      expect(wrapper.vm.active).toBe(false)
    })

    it('handles empty settings object', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({
          settings: {},
        }),
      })
      // When active key is missing, should default to active
      expect(wrapper.vm.active).toBe(true)
    })

    it('handles settings with only other properties', () => {
      const wrapper = mountComponent({
        volunteer: createVolunteer({
          settings: { notifications: true, theme: 'dark' },
        }),
      })
      // active is not in settings, so should default to true
      expect(wrapper.vm.active).toBe(true)
    })
  })
})
