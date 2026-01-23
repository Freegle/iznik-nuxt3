import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ModDashboardFreeglersReplying from '~/modtools/components/ModDashboardFreeglersReplying.vue'

// Mock the composable
const mockLoading = ref(false)
const mockUsersReplying = ref(null)

vi.mock('~/modtools/composables/useModDashboard', () => ({
  useModDashboard: () => ({
    loading: mockLoading,
    UsersReplying: mockUsersReplying,
  }),
}))

// Mock pluralise
vi.mock('~/composables/usePlural', () => ({
  usePlural: () => ({
    pluralise: (word, count, include) => {
      if (Array.isArray(word)) {
        const singular = word[0]
        const plural = word[1]
        return include
          ? `${count} ${count === 1 ? singular : plural}`
          : count === 1
          ? singular
          : plural
      }
      return include
        ? `${count} ${word}${count !== 1 ? 's' : ''}`
        : `${word}${count !== 1 ? 's' : ''}`
    },
  }),
}))

describe('ModDashboardFreeglersReplying', () => {
  const defaultProps = {
    groupid: 123,
    groupName: 'Test Group',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
  }

  const mockUsers = [
    {
      id: 1,
      displayname: 'User One',
      replies: 5,
      profile: { turl: 'https://example.com/avatar1.jpg' },
      systemrole: 'User',
    },
    {
      id: 2,
      displayname: 'User Two',
      replies: 3,
      profile: { turl: 'https://example.com/avatar2.jpg' },
      systemrole: 'Moderator',
    },
    {
      id: 3,
      displayname: 'Admin User',
      replies: 10,
      profile: { turl: 'https://example.com/avatar3.jpg' },
      systemrole: 'Admin',
    },
    {
      id: 4,
      displayname: 'Support User',
      replies: 1,
      profile: { turl: 'https://example.com/avatar4.jpg' },
      systemrole: 'Support',
    },
  ]

  function mountComponent(props = {}) {
    return mount(ModDashboardFreeglersReplying, {
      props: { ...defaultProps, ...props },
      global: {
        plugins: [createPinia()],
        stubs: {
          'b-card': {
            template: '<div class="card"><slot /></div>',
            props: ['noBody'],
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols', 'md'],
          },
          'v-icon': {
            template: '<span class="icon" />',
            props: ['icon', 'scale'],
          },
          ProfileImage: {
            template:
              '<img class="profile-image" :data-is-moderator="isModerator" />',
            props: ['image', 'name', 'isThumbnail', 'size', 'isModerator'],
          },
        },
        mocks: {
          pluralise: (word, count, include) => {
            if (Array.isArray(word)) {
              const singular = word[0]
              const plural = word[1]
              return include
                ? `${count} ${count === 1 ? singular : plural}`
                : count === 1
                ? singular
                : plural
            }
            return include
              ? `${count} ${word}${count !== 1 ? 's' : ''}`
              : `${word}${count !== 1 ? 's' : ''}`
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockLoading.value = false
    mockUsersReplying.value = null
  })

  describe('rendering', () => {
    it('shows loading state when loading', () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Loading')
    })

    it('shows pulsate class when loading', () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.find('.pulsate').exists()).toBe(true)
    })

    it('shows text-faded class when loading', () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.find('.text-faded').exists()).toBe(true)
    })

    it('hides loading state when not loading', () => {
      mockLoading.value = false
      mockUsersReplying.value = mockUsers
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('Loading')
    })

    it('renders user list when data available', () => {
      mockUsersReplying.value = mockUsers
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('User One')
      expect(wrapper.text()).toContain('User Two')
    })

    it('renders user ids', () => {
      mockUsersReplying.value = mockUsers
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('1')
      expect(wrapper.text()).toContain('2')
    })

    it('renders hashtag icons for user ids', () => {
      mockUsersReplying.value = mockUsers
      const wrapper = mountComponent()
      const icons = wrapper.findAll('.icon')
      expect(icons.length).toBeGreaterThanOrEqual(mockUsers.length)
    })

    it('renders profile images for each user', () => {
      mockUsersReplying.value = mockUsers
      const wrapper = mountComponent()
      expect(wrapper.findAll('.profile-image')).toHaveLength(mockUsers.length)
    })

    it('does not render when no data and not loading', () => {
      mockLoading.value = false
      mockUsersReplying.value = []
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('User One')
    })

    it('does not render when UsersReplying is null and not loading', () => {
      mockLoading.value = false
      mockUsersReplying.value = null
      const wrapper = mountComponent()
      expect(wrapper.findAll('.profile-image')).toHaveLength(0)
    })
  })

  describe('moderator detection', () => {
    it('marks Moderator role users as moderators', () => {
      mockUsersReplying.value = mockUsers
      const wrapper = mountComponent()
      const profileImages = wrapper.findAll('.profile-image')
      const moderatorImage = profileImages[1] // User Two is Moderator
      expect(moderatorImage.attributes('data-is-moderator')).toBe('true')
    })

    it('marks Support role users as moderators', () => {
      mockUsersReplying.value = mockUsers
      const wrapper = mountComponent()
      const profileImages = wrapper.findAll('.profile-image')
      const supportImage = profileImages[3] // Support User
      expect(supportImage.attributes('data-is-moderator')).toBe('true')
    })

    it('marks Admin role users as moderators', () => {
      mockUsersReplying.value = mockUsers
      const wrapper = mountComponent()
      const profileImages = wrapper.findAll('.profile-image')
      const adminImage = profileImages[2] // Admin User
      expect(adminImage.attributes('data-is-moderator')).toBe('true')
    })

    it('does not mark regular users as moderators', () => {
      mockUsersReplying.value = mockUsers
      const wrapper = mountComponent()
      const profileImages = wrapper.findAll('.profile-image')
      const regularImage = profileImages[0] // User One is regular User
      expect(regularImage.attributes('data-is-moderator')).toBe('false')
    })
  })

  describe('reply counts', () => {
    it('displays reply counts for users', () => {
      mockUsersReplying.value = mockUsers
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('5 replies')
      expect(wrapper.text()).toContain('3 replies')
      expect(wrapper.text()).toContain('10 replies')
    })

    it('displays singular form for 1 reply', () => {
      mockUsersReplying.value = mockUsers
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('1 reply')
      expect(wrapper.text()).not.toContain('1 replies')
    })
  })

  describe('props', () => {
    it('accepts groupid prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('groupid')).toBe(123)
    })

    it('accepts null groupid (default)', () => {
      const wrapper = mountComponent({ groupid: null })
      expect(wrapper.props('groupid')).toBeNull()
    })

    it('accepts groupName prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('groupName')).toBe('Test Group')
    })

    it('accepts start date prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('start')).toEqual(new Date('2024-01-01'))
    })

    it('accepts end date prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('end')).toEqual(new Date('2024-01-31'))
    })
  })

  describe('edge cases', () => {
    it('handles empty users array', () => {
      mockUsersReplying.value = []
      const wrapper = mountComponent()
      expect(wrapper.findAll('.profile-image')).toHaveLength(0)
    })

    it('handles user with zero replies', () => {
      mockUsersReplying.value = [
        {
          id: 1,
          displayname: 'Zero Reply User',
          replies: 0,
          profile: { turl: 'https://example.com/avatar.jpg' },
          systemrole: 'User',
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('0 replies')
    })

    it('handles user with large reply count', () => {
      mockUsersReplying.value = [
        {
          id: 1,
          displayname: 'Power User',
          replies: 10000,
          profile: { turl: 'https://example.com/avatar.jpg' },
          systemrole: 'User',
        },
      ]
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('10000 replies')
    })
  })

  describe('loading and data transitions', () => {
    it('shows loading when loading with data', () => {
      mockLoading.value = true
      mockUsersReplying.value = mockUsers
      const wrapper = mountComponent()
      expect(wrapper.find('.pulsate').exists()).toBe(true)
    })

    it('shows data when loading completes', async () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Loading')

      mockLoading.value = false
      mockUsersReplying.value = mockUsers
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('User One')
    })
  })
})
