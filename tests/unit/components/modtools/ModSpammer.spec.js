import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, config } from '@vue/test-utils'
import { ref } from 'vue'
import ModSpammer from '~/modtools/components/ModSpammer.vue'

vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    hasPermissionSpamAdmin: ref(false),
  }),
}))

config.global.mocks = {
  ...config.global.mocks,
  timeago: vi.fn(() => '3 days ago'),
}

describe('ModSpammer', () => {
  const baseUser = {
    displayname: 'Test User',
    spammer: {
      reason: 'Posting spam links',
      collection: 'Spammer',
      added: '2024-01-01T12:00:00Z',
      byuserid: 100,
      byuser: {
        displayname: 'Mod Person',
        email: 'mod@example.com',
      },
    },
  }

  function createUser(overrides = {}) {
    return {
      ...baseUser,
      spammer: { ...baseUser.spammer, ...overrides.spammer },
      ...overrides,
    }
  }

  function mountComponent(props = {}) {
    return mount(ModSpammer, {
      props: { user: baseUser, ...props },
      global: {
        mocks: {
          timeago: vi.fn(() => '3 days ago'),
        },
        stubs: {
          NoticeMessage: {
            template:
              '<div class="notice" :class="\'notice-\' + variant"><slot /></div>',
            props: ['variant'],
          },
          'notice-message': {
            template:
              '<div class="notice" :class="\'notice-\' + variant"><slot /></div>',
            props: ['variant'],
          },
          ExternalLink: {
            template: '<a :href="href"><slot /></a>',
            props: ['href'],
          },
          ModClipboard: {
            template: '<span class="clipboard" />',
            props: ['value'],
          },
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
          'v-icon': {
            template: '<span class="icon" />',
            props: ['icon', 'scale'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('displays user displayname', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test User')
    })

    it('displays spammer reason', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Posting spam links')
    })

    it('displays byuser displayname', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Mod Person')
    })

    it('displays byuser email', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('mod@example.com')
    })

    it('displays byuserid', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('100')
    })

    it('creates mailto link with byuser email', () => {
      const wrapper = mountComponent()
      const link = wrapper.find('a[href*="mailto:"]')
      expect(link.attributes('href')).toContain('mailto:mod@example.com')
    })
  })

  describe('variant computed property', () => {
    it('returns danger for Spammer collection', () => {
      const user = createUser({ spammer: { collection: 'Spammer' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.vm.variant).toBe('danger')
    })

    it('returns primary for Safelisted collection', () => {
      const user = createUser({ spammer: { collection: 'Safelisted' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.vm.variant).toBe('primary')
    })

    it('returns warning for PendingAdd collection', () => {
      const user = createUser({ spammer: { collection: 'PendingAdd' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.vm.variant).toBe('warning')
    })

    it('returns warning for PendingRemove collection', () => {
      const user = createUser({ spammer: { collection: 'PendingRemove' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.vm.variant).toBe('warning')
    })

    it('returns warning for unknown collection types', () => {
      const user = createUser({ spammer: { collection: 'Unknown' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.vm.variant).toBe('warning')
    })
  })

  describe('collname computed property', () => {
    it('returns "Confirmed Spammer" for Spammer collection', () => {
      const user = createUser({ spammer: { collection: 'Spammer' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.vm.collname).toBe('Confirmed Spammer')
    })

    it('returns "Safelisted" for Safelisted collection', () => {
      const user = createUser({ spammer: { collection: 'Safelisted' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.vm.collname).toBe('Safelisted')
    })

    it('returns "Unconfirmed Spammer" for PendingAdd collection', () => {
      const user = createUser({ spammer: { collection: 'PendingAdd' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.vm.collname).toBe('Unconfirmed Spammer')
    })

    it('returns "Disputed Spammer" for PendingRemove collection', () => {
      const user = createUser({ spammer: { collection: 'PendingRemove' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.vm.collname).toBe('Disputed Spammer')
    })

    it('returns raw collection name for unknown types', () => {
      const user = createUser({ spammer: { collection: 'CustomType' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.vm.collname).toBe('CustomType')
    })
  })

  describe('collname display in template', () => {
    it('shows Confirmed Spammer text', () => {
      const user = createUser({ spammer: { collection: 'Spammer' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.text()).toContain('Confirmed Spammer')
    })

    it('shows Unconfirmed Spammer text', () => {
      const user = createUser({ spammer: { collection: 'PendingAdd' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.text()).toContain('Unconfirmed Spammer')
    })
  })

  describe('PendingAdd specific behavior', () => {
    it('shows "Reported by" text for PendingAdd', () => {
      const user = createUser({ spammer: { collection: 'PendingAdd' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.text()).toContain('Reported by')
    })

    it('shows "Added by" text for non-PendingAdd collections', () => {
      const user = createUser({ spammer: { collection: 'Spammer' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.text()).toContain('Added by')
    })
  })

  describe('sameip array', () => {
    it('does not show warning when sameip is null', () => {
      const wrapper = mountComponent({ sameip: null })
      expect(wrapper.text()).not.toContain('Recently active on the same IP')
    })

    it('does not show warning when sameip is empty array', () => {
      const wrapper = mountComponent({ sameip: [] })
      expect(wrapper.text()).not.toContain('Recently active on the same IP')
    })

    it('shows warning when sameip has entries', () => {
      const wrapper = mountComponent({ sameip: [123, 456] })
      expect(wrapper.text()).toContain('Recently active on the same IP')
    })

    it('renders links for each userid in sameip', () => {
      const wrapper = mountComponent({ sameip: [123, 456, 789] })
      const links = wrapper.findAll('a[href*="/support/"]')
      expect(links.length).toBe(3)
    })

    it('creates correct support links for sameip userids', () => {
      const wrapper = mountComponent({ sameip: [123] })
      const link = wrapper.find('a[href="/support/123"]')
      expect(link.exists()).toBe(true)
    })

    it('shows explanation text for sameip', () => {
      const wrapper = mountComponent({ sameip: [123] })
      expect(wrapper.text()).toContain(
        'These may not be the same actual person'
      )
    })
  })

  describe('props', () => {
    it('accepts required user prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('user')).toEqual(baseUser)
    })

    it('accepts optional sameip prop', () => {
      const sameip = [100, 200]
      const wrapper = mountComponent({ sameip })
      expect(wrapper.props('sameip')).toEqual(sameip)
    })

    it('has default null for sameip', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('sameip')).toBeNull()
    })
  })

  describe('byuser handling', () => {
    it('displays byuser info when present', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Mod Person')
      expect(wrapper.text()).toContain('mod@example.com')
    })

    it('handles missing byuser gracefully', () => {
      const user = createUser({ spammer: { byuser: null } })
      const wrapper = mountComponent({ user })
      expect(wrapper.text()).toContain('Test User')
    })
  })

  describe('notice styling', () => {
    it('applies danger class for Spammer', () => {
      const user = createUser({ spammer: { collection: 'Spammer' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.find('.notice-danger').exists()).toBe(true)
    })

    it('applies primary class for Safelisted', () => {
      const user = createUser({ spammer: { collection: 'Safelisted' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.find('.notice-primary').exists()).toBe(true)
    })

    it('applies warning class for PendingAdd', () => {
      const user = createUser({ spammer: { collection: 'PendingAdd' } })
      const wrapper = mountComponent({ user })
      expect(wrapper.find('.notice-warning').exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles user with minimal spammer data', () => {
      const user = {
        displayname: 'Minimal User',
        spammer: {
          reason: 'Test',
          collection: 'Spammer',
          added: null,
          byuserid: null,
          byuser: null,
        },
      }
      const wrapper = mountComponent({ user })
      expect(wrapper.text()).toContain('Minimal User')
      expect(wrapper.text()).toContain('Test')
    })

    it('handles empty reason', () => {
      const user = createUser({
        spammer: { reason: '', collection: 'Spammer' },
      })
      const wrapper = mountComponent({ user })
      expect(wrapper.text()).toContain('Confirmed Spammer')
    })
  })
})
