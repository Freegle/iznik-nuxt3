import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ModDashboardFreeglersPosting from '~/modtools/components/ModDashboardFreeglersPosting.vue'

// Mock the composable
const mockLoading = ref(false)
const mockUsersPosting = ref(null)

vi.mock('~/modtools/composables/useModDashboard', () => ({
  useModDashboard: () => ({
    loading: mockLoading,
    UsersPosting: mockUsersPosting,
  }),
}))

// Mock pluralise
vi.mock('~/composables/usePlural', () => ({
  usePlural: () => ({
    pluralise: (word, count, include) =>
      include
        ? `${count} ${word}${count !== 1 ? 's' : ''}`
        : `${word}${count !== 1 ? 's' : ''}`,
  }),
}))

describe('ModDashboardFreeglersPosting', () => {
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
      posts: 5,
      profile: { turl: 'https://example.com/avatar1.jpg' },
      systemrole: 'User',
    },
    {
      id: 2,
      displayname: 'User Two',
      posts: 3,
      profile: { turl: 'https://example.com/avatar2.jpg' },
      systemrole: 'Moderator',
    },
  ]

  function mountComponent(props = {}) {
    return mount(ModDashboardFreeglersPosting, {
      props: { ...defaultProps, ...props },
      global: {
        plugins: [createPinia()],
        stubs: {
          'b-card': {
            template: '<div class="card"><slot /></div>',
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
            template: '<img class="profile-image" />',
            props: ['image', 'name', 'isThumbnail', 'size', 'isModerator'],
          },
        },
        mocks: {
          pluralise: (word, count, include) =>
            include
              ? `${count} ${word}${count !== 1 ? 's' : ''}`
              : `${word}${count !== 1 ? 's' : ''}`,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockLoading.value = false
    mockUsersPosting.value = null
  })

  describe('rendering', () => {
    it('shows loading state when loading', async () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Loading')
    })

    it('hides loading state when not loading', async () => {
      mockLoading.value = false
      mockUsersPosting.value = mockUsers
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('Loading')
    })

    it('renders user list when data available', async () => {
      mockUsersPosting.value = mockUsers
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('User One')
      expect(wrapper.text()).toContain('User Two')
    })

    it('renders user ids', async () => {
      mockUsersPosting.value = mockUsers
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('1')
      expect(wrapper.text()).toContain('2')
    })

    it('renders profile images for each user', async () => {
      mockUsersPosting.value = mockUsers
      const wrapper = mountComponent()
      expect(wrapper.findAll('.profile-image')).toHaveLength(2)
    })

    it('does not render when no data and not loading', async () => {
      mockLoading.value = false
      mockUsersPosting.value = []
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('User')
    })
  })

  describe('props', () => {
    it('accepts groupid prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('groupid')).toBe(123)
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
})
