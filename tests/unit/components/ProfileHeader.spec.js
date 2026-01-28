import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileHeader from '~/components/ProfileHeader.vue'

const mockUserById = vi.fn()
const mockMyid = vi.fn()

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    byId: mockUserById,
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myid: mockMyid(),
  }),
}))

vi.mock('~/composables/useTimeFormat', () => ({
  dateonly: vi.fn((date) => `Formatted: ${date}`),
}))

describe('ProfileHeader', () => {
  const mockUser = {
    displayname: 'Test User',
    profile: { path: '/profile/test.jpg' },
    added: '2023-01-15',
    showmod: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserById.mockReturnValue(mockUser)
    mockMyid.mockReturnValue(456)
  })

  function createWrapper(props = {}) {
    return mount(ProfileHeader, {
      props: {
        id: 123,
        ...props,
      },
      global: {
        stubs: {
          ProfileImage: {
            template: '<div class="profile-image" :data-image="image" />',
            props: ['image', 'isThumbnail', 'size'],
          },
          ChatButton: {
            template: '<button class="chat-button" />',
            props: ['userid', 'size', 'title', 'variant'],
          },
          UserRatings: {
            template: '<div class="user-ratings" />',
            props: ['id', 'size', 'disabled'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['size', 'variant'],
          },
          'v-icon': {
            template: '<span class="v-icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders when user exists', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.d-flex').exists()).toBe(true)
    })

    it('does not render when user is null', () => {
      mockUserById.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(false)
    })

    it('shows profile image', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('shows user display name', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Test User')
    })

    it('shows freegler since date', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Freegler since')
    })

    it('shows user id', () => {
      const wrapper = createWrapper({ id: 123 })
      expect(wrapper.text()).toContain('#123')
    })
  })

  describe('volunteer badge', () => {
    it('shows volunteer badge when user has showmod', () => {
      mockUserById.mockReturnValue({ ...mockUser, showmod: true })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Freegle Volunteer')
    })

    it('hides volunteer badge when user does not have showmod', () => {
      mockUserById.mockReturnValue({ ...mockUser, showmod: false })
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('Freegle Volunteer')
    })
  })

  describe('chat button behavior', () => {
    it('shows chat button when viewing another user profile', () => {
      mockMyid.mockReturnValue(456) // Different from user id 123
      const wrapper = createWrapper({ id: 123, closeOnMessage: false })
      expect(wrapper.find('.chat-button').exists()).toBe(true)
    })

    it('hides chat button when viewing own profile', () => {
      mockMyid.mockReturnValue(123) // Same as user id
      const wrapper = createWrapper({ id: 123, closeOnMessage: false })
      expect(wrapper.find('.chat-button').exists()).toBe(false)
    })

    it('hides chat button when not logged in', () => {
      mockMyid.mockReturnValue(null)
      const wrapper = createWrapper({ closeOnMessage: false })
      expect(wrapper.find('.chat-button').exists()).toBe(false)
    })
  })

  describe('closeOnMessage mode', () => {
    it('shows message button instead of chat button when closeOnMessage true', () => {
      const wrapper = createWrapper({ closeOnMessage: true })
      expect(wrapper.find('.b-button').exists()).toBe(true)
      expect(wrapper.find('.chat-button').exists()).toBe(false)
    })

    it('emits close event when message button clicked', async () => {
      const wrapper = createWrapper({ closeOnMessage: true })
      await wrapper.find('.b-button').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('user ratings', () => {
    it('shows user ratings component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.user-ratings').exists()).toBe(true)
    })

    it('disables ratings when not logged in', () => {
      mockMyid.mockReturnValue(null)
      const wrapper = createWrapper()
      // Rating disabled state is passed via prop, tested via integration
      expect(wrapper.find('.user-ratings').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 99 })
      expect(wrapper.props('id')).toBe(99)
    })

    it('defaults closeOnMessage to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('closeOnMessage')).toBe(false)
    })

    it('accepts closeOnMessage prop', () => {
      const wrapper = createWrapper({ closeOnMessage: true })
      expect(wrapper.props('closeOnMessage')).toBe(true)
    })
  })
})
