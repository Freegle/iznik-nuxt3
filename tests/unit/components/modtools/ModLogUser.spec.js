import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModLogUser from '~/modtools/components/ModLogUser.vue'

// Mock user store
const mockUserStore = {
  byId: vi.fn(),
  fetch: vi.fn().mockResolvedValue(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('ModLogUser', () => {
  function mountModLogUser(userOverrides = {}) {
    const defaultUser = {
      id: 123,
      displayname: 'Test User',
      email: 'test@example.com',
      systemrole: 'User',
      ...userOverrides,
    }

    mockUserStore.byId.mockImplementation((id) => {
      if (id === defaultUser.id) return defaultUser
      return null
    })

    return mount(ModLogUser, {
      props: { userid: defaultUser.id },
      global: {
        stubs: {
          'v-icon': {
            template: '<i :data-icon="icon" :title="title"></i>',
            props: ['icon', 'title'],
          },
          ExternalLink: {
            template: '<a :href="href"><slot /></a>',
            props: ['href'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.byId.mockReturnValue(null)
  })

  describe('rendering', () => {
    it('renders fallback when userid is null', () => {
      const wrapper = mount(ModLogUser, {
        props: { userid: null },
        global: {
          stubs: {
            'v-icon': {
              template: '<i :data-icon="icon" :title="title"></i>',
              props: ['icon', 'title'],
            },
            ExternalLink: {
              template: '<a :href="href"><slot /></a>',
              props: ['href'],
            },
          },
        },
      })
      // With null userid, user computed is null, and the v-else-if="userid" is also false
      expect(wrapper.find('span').exists()).toBe(false)
    })

    it('renders user email with mailto link', () => {
      const wrapper = mountModLogUser({ email: 'alice@test.com' })
      expect(wrapper.text()).toContain('alice@test.com')
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe('mailto:alice@test.com')
    })

    it('renders user id with hashtag icon', () => {
      const wrapper = mountModLogUser({ id: 456 })
      expect(wrapper.text()).toContain('456')
    })
  })

  describe('systemrole icons', () => {
    it('shows crown icon for non-User systemrole', () => {
      const wrapper = mountModLogUser({ systemrole: 'Moderator' })
      const crownIcon = wrapper.find('i[data-icon="crown"]')
      expect(crownIcon.exists()).toBe(true)
    })

    it('shows user icon for User systemrole', () => {
      const wrapper = mountModLogUser({ systemrole: 'User' })
      const userIcon = wrapper.find('i[data-icon="user"]')
      expect(userIcon.exists()).toBe(true)
    })

    it('shows crown icon for Admin systemrole', () => {
      const wrapper = mountModLogUser({ systemrole: 'Admin' })
      const crownIcon = wrapper.find('i[data-icon="crown"]')
      expect(crownIcon.exists()).toBe(true)
    })
  })

  describe('email display', () => {
    it('shows email when present', () => {
      const wrapper = mountModLogUser({ email: 'user@domain.com' })
      expect(wrapper.text()).toContain('user@domain.com')
    })

    it('hides email section when email is missing', () => {
      const wrapper = mountModLogUser({ email: null })
      expect(wrapper.find('a[href^="mailto:"]').exists()).toBe(false)
    })
  })

  describe('userid fallback display', () => {
    it('shows userid when user not found in store', () => {
      mockUserStore.byId.mockReturnValue(null)
      const wrapper = mount(ModLogUser, {
        props: { userid: 777 },
        global: {
          stubs: {
            'v-icon': {
              template: '<i :data-icon="icon" :title="title"></i>',
              props: ['icon', 'title'],
            },
            ExternalLink: {
              template: '<a :href="href"><slot /></a>',
              props: ['href'],
            },
          },
        },
      })
      expect(wrapper.text()).toContain('#777')
    })
  })
})
