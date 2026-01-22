import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatAvatar from '~/components/ChatAvatar.vue'

describe('ChatAvatar', () => {
  function mountChatAvatar(props = {}) {
    return mount(ChatAvatar, {
      props: {
        name: 'Test User',
        ...props,
      },
      global: {
        stubs: {
          ProfileImage: {
            template:
              '<div class="profile-image-stub" :data-image="image" :data-name="name"></div>',
            props: ['image', 'name', 'isThumbnail', 'size'],
          },
          'v-icon': {
            template: '<i :data-icon="icon"></i>',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders the avatar container', () => {
      const wrapper = mountChatAvatar()
      expect(wrapper.find('.chat-avatar').exists()).toBe(true)
    })

    it('renders ProfileImage component', () => {
      const wrapper = mountChatAvatar()
      expect(wrapper.find('.profile-image-stub').exists()).toBe(true)
    })

    it('passes name prop to ProfileImage', () => {
      const wrapper = mountChatAvatar({ name: 'John Doe' })
      const profileImage = wrapper.find('.profile-image-stub')
      expect(profileImage.attributes('data-name')).toBe('John Doe')
    })

    it('passes icon prop as image to ProfileImage', () => {
      const wrapper = mountChatAvatar({
        name: 'Test User',
        icon: 'http://example.com/avatar.jpg',
      })
      const profileImage = wrapper.find('.profile-image-stub')
      expect(profileImage.attributes('data-image')).toBe(
        'http://example.com/avatar.jpg'
      )
    })

    it('passes null image when icon not provided', () => {
      const wrapper = mountChatAvatar({ name: 'Test User' })
      const profileImage = wrapper.find('.profile-image-stub')
      // When no icon, data-image should be empty/null
      expect(profileImage.attributes('data-image')).toBeFalsy()
    })
  })

  describe('size variants', () => {
    it('does not have large class by default', () => {
      const wrapper = mountChatAvatar()
      expect(wrapper.find('.chat-avatar--large').exists()).toBe(false)
    })

    it('applies large class when large prop is true', () => {
      const wrapper = mountChatAvatar({ large: true })
      expect(wrapper.find('.chat-avatar--large').exists()).toBe(true)
    })

    it('does not apply large class when large prop is false', () => {
      const wrapper = mountChatAvatar({ large: false })
      expect(wrapper.find('.chat-avatar--large').exists()).toBe(false)
    })
  })

  describe('supporter badge', () => {
    it('does not show supporter badge by default', () => {
      const wrapper = mountChatAvatar()
      expect(wrapper.find('.hero-badge').exists()).toBe(false)
    })

    it('shows supporter badge when supporter is true', () => {
      const wrapper = mountChatAvatar({ supporter: true })
      expect(wrapper.find('.hero-badge').exists()).toBe(true)
    })

    it('supporter badge has trophy icon', () => {
      const wrapper = mountChatAvatar({ supporter: true })
      const badge = wrapper.find('.hero-badge')
      const icon = badge.find('i')
      expect(icon.attributes('data-icon')).toBe('trophy')
    })

    it('supporter badge has title attribute for accessibility', () => {
      const wrapper = mountChatAvatar({ supporter: true })
      const badge = wrapper.find('.hero-badge')
      expect(badge.attributes('title')).toBe('Freegle Supporter')
    })

    it('does not show supporter badge when supporter is false', () => {
      const wrapper = mountChatAvatar({ supporter: false })
      expect(wrapper.find('.hero-badge').exists()).toBe(false)
    })
  })

  describe('unread count badge', () => {
    it('does not show unread badge when unreadCount is 0', () => {
      const wrapper = mountChatAvatar({ unreadCount: 0 })
      expect(wrapper.find('.unread-badge').exists()).toBe(false)
    })

    it('does not show unread badge when unreadCount is not provided', () => {
      const wrapper = mountChatAvatar()
      expect(wrapper.find('.unread-badge').exists()).toBe(false)
    })

    it('shows unread badge when unreadCount is greater than 0', () => {
      const wrapper = mountChatAvatar({ unreadCount: 5 })
      expect(wrapper.find('.unread-badge').exists()).toBe(true)
    })

    it('displays exact count when 9 or less', () => {
      const wrapper = mountChatAvatar({ unreadCount: 7 })
      const badge = wrapper.find('.unread-badge')
      expect(badge.text()).toBe('7')
    })

    it('displays "9+" when count is greater than 9', () => {
      const wrapper = mountChatAvatar({ unreadCount: 15 })
      const badge = wrapper.find('.unread-badge')
      expect(badge.text()).toBe('9+')
    })

    it('displays "9+" for exactly 10 unread', () => {
      const wrapper = mountChatAvatar({ unreadCount: 10 })
      const badge = wrapper.find('.unread-badge')
      expect(badge.text()).toBe('9+')
    })

    it('displays 9 when exactly 9 unread', () => {
      const wrapper = mountChatAvatar({ unreadCount: 9 })
      const badge = wrapper.find('.unread-badge')
      expect(badge.text()).toBe('9')
    })

    it('displays 1 when exactly 1 unread', () => {
      const wrapper = mountChatAvatar({ unreadCount: 1 })
      const badge = wrapper.find('.unread-badge')
      expect(badge.text()).toBe('1')
    })
  })

  describe('combined badges', () => {
    it('can show both supporter and unread badges together', () => {
      const wrapper = mountChatAvatar({
        supporter: true,
        unreadCount: 3,
      })
      expect(wrapper.find('.hero-badge').exists()).toBe(true)
      expect(wrapper.find('.unread-badge').exists()).toBe(true)
    })

    it('positions badges correctly with both active', () => {
      const wrapper = mountChatAvatar({
        supporter: true,
        unreadCount: 5,
      })
      const heroBadge = wrapper.find('.hero-badge')
      const unreadBadge = wrapper.find('.unread-badge')
      expect(heroBadge.exists()).toBe(true)
      expect(unreadBadge.exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts required name prop', () => {
      const wrapper = mountChatAvatar({ name: 'Jane Smith' })
      expect(wrapper.props('name')).toBe('Jane Smith')
    })

    it('accepts icon prop with default null', () => {
      const wrapper = mountChatAvatar({ name: 'Test' })
      expect(wrapper.props('icon')).toBeNull()
    })

    it('accepts supporter prop with default false', () => {
      const wrapper = mountChatAvatar({ name: 'Test' })
      expect(wrapper.props('supporter')).toBe(false)
    })

    it('accepts unreadCount prop with default 0', () => {
      const wrapper = mountChatAvatar({ name: 'Test' })
      expect(wrapper.props('unreadCount')).toBe(0)
    })

    it('accepts large prop with default false', () => {
      const wrapper = mountChatAvatar({ name: 'Test' })
      expect(wrapper.props('large')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles empty name string', () => {
      const wrapper = mountChatAvatar({ name: '' })
      const profileImage = wrapper.find('.profile-image-stub')
      expect(profileImage.exists()).toBe(true)
      expect(profileImage.attributes('data-name')).toBe('')
    })

    it('handles very long names', () => {
      const longName = 'A'.repeat(100)
      const wrapper = mountChatAvatar({ name: longName })
      const profileImage = wrapper.find('.profile-image-stub')
      expect(profileImage.attributes('data-name')).toBe(longName)
    })

    it('handles very high unread counts', () => {
      const wrapper = mountChatAvatar({ unreadCount: 999 })
      const badge = wrapper.find('.unread-badge')
      expect(badge.text()).toBe('9+')
    })
  })
})
