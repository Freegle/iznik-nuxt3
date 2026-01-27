import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatAvatar from '~/components/ChatAvatar.vue'

describe('ChatAvatar', () => {
  function createWrapper(props = {}) {
    return mount(ChatAvatar, {
      props: {
        name: 'Test User',
        ...props,
      },
      global: {
        stubs: {
          ProfileImage: {
            template:
              '<div class="profile-image" :data-image="image" :data-name="name" />',
            props: ['image', 'name', 'isThumbnail', 'size'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders chat-avatar container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-avatar').exists()).toBe(true)
    })

    it('renders ProfileImage component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('passes name to ProfileImage', () => {
      const wrapper = createWrapper({ name: 'John Doe' })
      const profileImage = wrapper.find('.profile-image')
      expect(profileImage.attributes('data-name')).toBe('John Doe')
    })

    it('passes icon to ProfileImage as image', () => {
      const wrapper = createWrapper({ icon: 'https://example.com/avatar.jpg' })
      const profileImage = wrapper.find('.profile-image')
      expect(profileImage.attributes('data-image')).toBe(
        'https://example.com/avatar.jpg'
      )
    })
  })

  describe('large variant', () => {
    it('does not have large class by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-avatar').classes()).not.toContain(
        'chat-avatar--large'
      )
    })

    it('adds large class when large prop is true', () => {
      const wrapper = createWrapper({ large: true })
      expect(wrapper.find('.chat-avatar').classes()).toContain(
        'chat-avatar--large'
      )
    })
  })

  describe('supporter badge', () => {
    it('does not show hero badge by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.hero-badge').exists()).toBe(false)
    })

    it('shows hero badge when supporter is true', () => {
      const wrapper = createWrapper({ supporter: true })
      expect(wrapper.find('.hero-badge').exists()).toBe(true)
    })

    it('hero badge has trophy icon', () => {
      const wrapper = createWrapper({ supporter: true })
      const badge = wrapper.find('.hero-badge')
      expect(badge.find('i.trophy').exists()).toBe(true)
    })

    it('hero badge has title attribute', () => {
      const wrapper = createWrapper({ supporter: true })
      const badge = wrapper.find('.hero-badge')
      expect(badge.attributes('title')).toBe('Freegle Supporter')
    })
  })

  describe('unread badge', () => {
    it('does not show unread badge when count is 0', () => {
      const wrapper = createWrapper({ unreadCount: 0 })
      expect(wrapper.find('.unread-badge').exists()).toBe(false)
    })

    it('shows unread badge when count is greater than 0', () => {
      const wrapper = createWrapper({ unreadCount: 5 })
      expect(wrapper.find('.unread-badge').exists()).toBe(true)
    })

    it('displays count directly when 9 or less', () => {
      const wrapper = createWrapper({ unreadCount: 5 })
      expect(wrapper.find('.unread-badge').text()).toBe('5')
    })

    it('displays 9+ when count is greater than 9', () => {
      const wrapper = createWrapper({ unreadCount: 15 })
      expect(wrapper.find('.unread-badge').text()).toBe('9+')
    })

    it('displays 9 when count is exactly 9', () => {
      const wrapper = createWrapper({ unreadCount: 9 })
      expect(wrapper.find('.unread-badge').text()).toBe('9')
    })

    it('displays 9+ when count is 10', () => {
      const wrapper = createWrapper({ unreadCount: 10 })
      expect(wrapper.find('.unread-badge').text()).toBe('9+')
    })
  })

  describe('combined states', () => {
    it('can show both supporter badge and unread badge', () => {
      const wrapper = createWrapper({ supporter: true, unreadCount: 3 })
      expect(wrapper.find('.hero-badge').exists()).toBe(true)
      expect(wrapper.find('.unread-badge').exists()).toBe(true)
    })

    it('can be large with badges', () => {
      const wrapper = createWrapper({
        large: true,
        supporter: true,
        unreadCount: 5,
      })
      expect(wrapper.find('.chat-avatar--large').exists()).toBe(true)
      expect(wrapper.find('.hero-badge').exists()).toBe(true)
      expect(wrapper.find('.unread-badge').exists()).toBe(true)
    })
  })
})
