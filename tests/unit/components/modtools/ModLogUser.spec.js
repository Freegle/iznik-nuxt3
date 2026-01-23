import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModLogUser from '~/modtools/components/ModLogUser.vue'

describe('ModLogUser', () => {
  function mountModLogUser(userOverrides = {}) {
    const defaultUser = {
      id: 123,
      displayname: 'Test User',
      email: 'test@example.com',
      systemrole: 'User',
      ...userOverrides,
    }
    return mount(ModLogUser, {
      props: { user: defaultUser },
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

  describe('rendering', () => {
    it('renders nothing when user is null', () => {
      const wrapper = mount(ModLogUser, {
        props: { user: null },
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
      expect(wrapper.find('span').exists()).toBe(false)
    })

    it('renders user displayname', () => {
      const wrapper = mountModLogUser({ displayname: 'Alice Smith' })
      expect(wrapper.text()).toContain('Alice Smith')
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
})
