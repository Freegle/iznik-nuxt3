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

  describe('computed properties by collection type', () => {
    it.each([
      ['Spammer', 'danger', 'Confirmed Spammer'],
      ['Safelisted', 'primary', 'Safelisted'],
      ['PendingAdd', 'warning', 'Unconfirmed Spammer'],
      ['PendingRemove', 'warning', 'Disputed Spammer'],
      ['Unknown', 'warning', 'Unknown'],
      ['CustomType', 'warning', 'CustomType'],
    ])(
      '%s collection → variant=%s, collname="%s"',
      (collection, expectedVariant, expectedCollname) => {
        const user = createUser({ spammer: { collection } })
        const wrapper = mountComponent({ user })
        expect(wrapper.vm.variant).toBe(expectedVariant)
        expect(wrapper.vm.collname).toBe(expectedCollname)
      }
    )
  })

  describe('PendingAdd specific behavior', () => {
    it.each([
      ['PendingAdd', 'Reported by'],
      ['Spammer', 'Added by'],
    ])('%s collection shows "%s" text', (collection, expectedText) => {
      const user = createUser({ spammer: { collection } })
      const wrapper = mountComponent({ user })
      expect(wrapper.text()).toContain(expectedText)
    })
  })

  describe('sameip array', () => {
    it.each([
      [null, false, 'null'],
      [[], false, 'empty array'],
      [[123, 456], true, 'populated array'],
    ])('sameip=%s shows warning=%s (%s)', (sameip, shouldShowWarning) => {
      const wrapper = mountComponent({ sameip })
      if (shouldShowWarning) {
        expect(wrapper.text()).toContain('Recently active on the same IP')
      } else {
        expect(wrapper.text()).not.toContain('Recently active on the same IP')
      }
    })

    it('renders support links for each userid in sameip', () => {
      const wrapper = mountComponent({ sameip: [123, 456, 789] })
      const links = wrapper.findAll('a[href*="/support/"]')
      expect(links.length).toBe(3)
      expect(wrapper.find('a[href="/support/123"]').exists()).toBe(true)
      expect(wrapper.text()).toContain(
        'These may not be the same actual person'
      )
    })
  })

  describe('props and byuser handling', () => {
    it('passes props correctly and displays byuser info', () => {
      const sameip = [100, 200]
      const wrapper = mountComponent({ sameip })
      expect(wrapper.props('user')).toEqual(baseUser)
      expect(wrapper.props('sameip')).toEqual(sameip)
      expect(wrapper.text()).toContain('Mod Person')
      expect(wrapper.text()).toContain('mod@example.com')
    })

    it('defaults sameip to null and handles missing byuser', () => {
      const user = createUser({ spammer: { byuser: null } })
      const wrapper = mountComponent({ user })
      expect(wrapper.props('sameip')).toBeNull()
      expect(wrapper.text()).toContain('Test User')
    })
  })

  describe('notice styling by collection', () => {
    it.each([
      ['Spammer', 'notice-danger'],
      ['Safelisted', 'notice-primary'],
      ['PendingAdd', 'notice-warning'],
    ])('%s collection applies %s class', (collection, cssClass) => {
      const user = createUser({ spammer: { collection } })
      const wrapper = mountComponent({ user })
      expect(wrapper.find(`.${cssClass}`).exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles minimal spammer data and empty reason', () => {
      const user = {
        displayname: 'Minimal User',
        spammer: {
          reason: '',
          collection: 'Spammer',
          added: null,
          byuserid: null,
          byuser: null,
        },
      }
      const wrapper = mountComponent({ user })
      expect(wrapper.text()).toContain('Minimal User')
      expect(wrapper.text()).toContain('Confirmed Spammer')
    })
  })
})
