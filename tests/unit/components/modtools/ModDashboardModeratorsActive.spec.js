import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ModDashboardModeratorsActive from '~/modtools/components/ModDashboardModeratorsActive.vue'

// Mock the composable
const mockLoading = ref(false)
const mockModeratorsActive = ref(null)

vi.mock('~/modtools/composables/useModDashboard', () => ({
  useModDashboard: () => ({
    loading: mockLoading,
    ModeratorsActive: mockModeratorsActive,
  }),
}))

// Mock timeago function
vi.mock('~/composables/useTimeFormat', () => ({
  timeago: (date) => `timeago: ${date}`,
}))

describe('ModDashboardModeratorsActive', () => {
  const defaultProps = {
    groupid: 123,
    groupName: 'Test Group',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
  }

  // Generate more than 10 mock moderators for testing expansion
  function generateMockModerators(count) {
    const mods = []
    for (let i = 1; i <= count; i++) {
      mods.push({
        id: i,
        displayname: `Mod ${i}`,
        lastactive: `2024-01-${String(i).padStart(2, '0')}T12:00:00Z`,
        profile: { turl: `https://example.com/avatar${i}.jpg` },
        systemrole:
          i % 3 === 0 ? 'Moderator' : i % 3 === 1 ? 'Support' : 'Admin',
      })
    }
    return mods
  }

  const mockModerators = generateMockModerators(5)
  const mockModeratorsLarge = generateMockModerators(15)

  function mountComponent(props = {}) {
    return mount(ModDashboardModeratorsActive, {
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
            props: ['cols'],
          },
          'b-button': {
            template:
              '<button class="btn" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
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
          timeago: (date) => `timeago: ${date}`,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockLoading.value = false
    mockModeratorsActive.value = null
  })

  describe('rendering', () => {
    it('renders heading with group name', () => {
      mockModeratorsActive.value = mockModerators
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Active Volunteers')
      expect(wrapper.text()).toContain('Test Group')
    })

    it('shows message when no groupid provided', () => {
      const wrapper = mountComponent({ groupid: null })
      expect(wrapper.text()).toContain('Select a community')
      expect(wrapper.text()).toContain('Update')
    })

    it('shows loading state when loading with groupid', () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Loading')
    })

    it('renders description text when data available', () => {
      mockModeratorsActive.value = mockModerators
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'This shows when the volunteers on this community last moderated'
      )
    })

    it('renders moderator list when data available', () => {
      mockModeratorsActive.value = mockModerators
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Mod 1')
      expect(wrapper.text()).toContain('Mod 2')
    })

    it('renders moderator ids', () => {
      mockModeratorsActive.value = mockModerators
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('1')
      expect(wrapper.text()).toContain('2')
    })

    it('renders profile images for each moderator', () => {
      mockModeratorsActive.value = mockModerators
      const wrapper = mountComponent()
      expect(wrapper.findAll('.profile-image')).toHaveLength(5)
    })

    it('renders timeago for each moderator', () => {
      mockModeratorsActive.value = mockModerators
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('timeago:')
    })
  })

  describe('moderator role detection', () => {
    it('marks Moderator role users as moderators', () => {
      mockModeratorsActive.value = [
        {
          id: 1,
          displayname: 'Test Mod',
          lastactive: '2024-01-15T12:00:00Z',
          profile: { turl: 'https://example.com/avatar.jpg' },
          systemrole: 'Moderator',
        },
      ]
      const wrapper = mountComponent()
      const profileImage = wrapper.find('.profile-image')
      expect(profileImage.attributes('data-is-moderator')).toBe('true')
    })

    it('marks Support role users as moderators', () => {
      mockModeratorsActive.value = [
        {
          id: 1,
          displayname: 'Support User',
          lastactive: '2024-01-15T12:00:00Z',
          profile: { turl: 'https://example.com/avatar.jpg' },
          systemrole: 'Support',
        },
      ]
      const wrapper = mountComponent()
      const profileImage = wrapper.find('.profile-image')
      expect(profileImage.attributes('data-is-moderator')).toBe('true')
    })

    it('marks Admin role users as moderators', () => {
      mockModeratorsActive.value = [
        {
          id: 1,
          displayname: 'Admin User',
          lastactive: '2024-01-15T12:00:00Z',
          profile: { turl: 'https://example.com/avatar.jpg' },
          systemrole: 'Admin',
        },
      ]
      const wrapper = mountComponent()
      const profileImage = wrapper.find('.profile-image')
      expect(profileImage.attributes('data-is-moderator')).toBe('true')
    })

    it('does not mark regular users as moderators', () => {
      mockModeratorsActive.value = [
        {
          id: 1,
          displayname: 'Regular User',
          lastactive: '2024-01-15T12:00:00Z',
          profile: { turl: 'https://example.com/avatar.jpg' },
          systemrole: 'User',
        },
      ]
      const wrapper = mountComponent()
      const profileImage = wrapper.find('.profile-image')
      expect(profileImage.attributes('data-is-moderator')).toBe('false')
    })
  })

  describe('expand/collapse functionality', () => {
    it('shows only 10 moderators initially when more than 10', () => {
      mockModeratorsActive.value = mockModeratorsLarge
      const wrapper = mountComponent()
      const profileImages = wrapper.findAll('.profile-image')
      expect(profileImages).toHaveLength(10)
    })

    it('shows "Show more" button when more than 10 moderators', () => {
      mockModeratorsActive.value = mockModeratorsLarge
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Show more')
    })

    it('does not show "Show more" button when 10 or fewer moderators', () => {
      mockModeratorsActive.value = mockModerators
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('Show more')
    })

    it('shows all moderators when "Show more" is clicked', async () => {
      mockModeratorsActive.value = mockModeratorsLarge
      const wrapper = mountComponent()

      const showMoreBtn = wrapper
        .findAll('.btn')
        .find((b) => b.text().includes('Show more'))
      await showMoreBtn.trigger('click')

      const profileImages = wrapper.findAll('.profile-image')
      expect(profileImages).toHaveLength(15)
    })

    it('shows "Show fewer" button after expanding', async () => {
      mockModeratorsActive.value = mockModeratorsLarge
      const wrapper = mountComponent()

      const showMoreBtn = wrapper
        .findAll('.btn')
        .find((b) => b.text().includes('Show more'))
      await showMoreBtn.trigger('click')

      expect(wrapper.text()).toContain('Show fewer')
    })

    it('collapses back to 10 when "Show fewer" is clicked', async () => {
      mockModeratorsActive.value = mockModeratorsLarge
      const wrapper = mountComponent()

      // Expand
      const showMoreBtn = wrapper
        .findAll('.btn')
        .find((b) => b.text().includes('Show more'))
      await showMoreBtn.trigger('click')

      // Collapse
      const showFewerBtn = wrapper
        .findAll('.btn')
        .find((b) => b.text().includes('Show fewer'))
      await showFewerBtn.trigger('click')

      const profileImages = wrapper.findAll('.profile-image')
      expect(profileImages).toHaveLength(10)
    })

    it('shows "Show more" button again after collapsing', async () => {
      mockModeratorsActive.value = mockModeratorsLarge
      const wrapper = mountComponent()

      // Expand
      const showMoreBtn = wrapper
        .findAll('.btn')
        .find((b) => b.text().includes('Show more'))
      await showMoreBtn.trigger('click')

      // Collapse
      const showFewerBtn = wrapper
        .findAll('.btn')
        .find((b) => b.text().includes('Show fewer'))
      await showFewerBtn.trigger('click')

      expect(wrapper.text()).toContain('Show more')
    })
  })

  describe('props', () => {
    it('accepts null groupid (default)', () => {
      const wrapper = mountComponent({ groupid: null })
      expect(wrapper.props('groupid')).toBeNull()
    })

    it('displays different group name', () => {
      mockModeratorsActive.value = mockModerators
      const wrapper = mountComponent({ groupName: 'Another Group' })
      expect(wrapper.text()).toContain('Another Group')
    })
  })

  describe('edge cases', () => {
    it('handles empty moderators array', () => {
      mockModeratorsActive.value = []
      const wrapper = mountComponent()
      expect(wrapper.findAll('.profile-image')).toHaveLength(0)
    })

    it('handles exactly 10 moderators', () => {
      mockModeratorsActive.value = generateMockModerators(10)
      const wrapper = mountComponent()
      const profileImages = wrapper.findAll('.profile-image')
      expect(profileImages).toHaveLength(10)
      expect(wrapper.text()).not.toContain('Show more')
    })

    it('handles 11 moderators (just over limit)', () => {
      mockModeratorsActive.value = generateMockModerators(11)
      const wrapper = mountComponent()
      const profileImages = wrapper.findAll('.profile-image')
      expect(profileImages).toHaveLength(10)
      expect(wrapper.text()).toContain('Show more')
    })
  })

  describe('no groupid state', () => {
    it('shows instruction message when groupid is null', () => {
      const wrapper = mountComponent({ groupid: null })
      expect(wrapper.text()).toContain('Select a community')
    })

    it('does not show loading state when groupid is null', () => {
      mockLoading.value = true
      const wrapper = mountComponent({ groupid: null })
      expect(wrapper.find('.pulsate').exists()).toBe(false)
    })

    it('does not show moderator list when groupid is null', () => {
      mockModeratorsActive.value = mockModerators
      const wrapper = mountComponent({ groupid: null })
      expect(wrapper.text()).not.toContain('Mod 1')
    })
  })

  describe('loading and data transitions', () => {
    it('shows data when loading completes', async () => {
      mockLoading.value = true
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Loading')

      mockLoading.value = false
      mockModeratorsActive.value = mockModerators
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Mod 1')
    })
  })
})
