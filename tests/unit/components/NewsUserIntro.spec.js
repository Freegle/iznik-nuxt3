import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import NewsUserIntro from '~/components/NewsUserIntro.vue'

const mockMe = ref(null)

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    user: mockMe.value,
  }),
}))

vi.mock('~/composables/useTimeFormat', () => ({
  timeago: vi.fn(() => '5 minutes ago'),
  timeagoShort: vi.fn(() => '5m'),
}))

describe('NewsUserIntro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMe.value = null
  })

  function createWrapper(props = {}) {
    return mount(NewsUserIntro, {
      props: {
        userid: 1,
        newsfeed: {
          id: 1,
          displayname: 'Test User',
          profile: { path: '/profile.jpg' },
          added: new Date().toISOString(),
          showmod: false,
          type: 'AboutMe',
        },
        ...props,
      },
      global: {
        stubs: {
          ProfileImage: {
            template:
              '<div class="profile-image" :data-image="image" :data-is-moderator="isModerator" />',
            props: ['image', 'isThumbnail', 'isModerator', 'size'],
          },
          NewsUserInfo: {
            template: '<div class="news-user-info" :data-id="id" />',
            props: ['id'],
          },
          ProfileModal: {
            template: '<div class="profile-modal" :data-id="id" />',
            props: ['id'],
            emits: ['hidden'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders user display name', () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 1,
          displayname: 'John Doe',
          added: new Date().toISOString(),
        },
      })
      expect(wrapper.text()).toContain('John Doe')
    })

    it('renders profile image', () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 1,
          displayname: 'Test User',
          profile: { path: '/test.jpg' },
          added: new Date().toISOString(),
        },
      })
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('renders NewsUserInfo component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.news-user-info').exists()).toBe(true)
    })

    it('shows timeago on desktop', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.d-none.d-md-inline').text()).toBe('5 minutes ago')
    })

    it('shows short timeago on mobile', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.d-md-none').text()).toBe('5m')
    })

    it('shows append text', () => {
      const wrapper = createWrapper({
        append: ' posted something',
        newsfeed: {
          id: 1,
          displayname: 'Test User',
          added: new Date().toISOString(),
        },
      })
      expect(wrapper.text()).toContain('posted something')
    })

    it('shows appendBold text in quotes', () => {
      const wrapper = createWrapper({
        appendBold: 'My Intro Title',
        newsfeed: {
          id: 1,
          displayname: 'Test User',
          added: new Date().toISOString(),
        },
      })
      expect(wrapper.text()).toContain('"My Intro Title"')
    })

    it('shows moderator indicator when showmod is true', () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 1,
          displayname: 'Test User',
          showmod: true,
          added: new Date().toISOString(),
        },
      })
      expect(
        wrapper.find('.profile-image').attributes('data-is-moderator')
      ).toBe('true')
    })
  })

  describe('mod note', () => {
    beforeEach(() => {
      mockMe.value = { systemrole: 'Moderator' }
    })

    it('shows mod note for AboutMe type', () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 1,
          displayname: 'Test User',
          type: 'AboutMe',
          added: new Date().toISOString(),
        },
      })
      expect(wrapper.text()).toContain('Note to mods')
    })

    it('hides mod note for non-AboutMe type', () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 1,
          displayname: 'Test User',
          type: 'Message',
          added: new Date().toISOString(),
        },
      })
      expect(wrapper.text()).not.toContain('Note to mods')
    })

    it('hides mod note for non-mod users', () => {
      mockMe.value = { systemrole: 'User' }
      const wrapper = createWrapper({
        newsfeed: {
          id: 1,
          displayname: 'Test User',
          type: 'AboutMe',
          added: new Date().toISOString(),
        },
      })
      expect(wrapper.text()).not.toContain('Note to mods')
    })
  })

  describe('profile modal', () => {
    it('does not show modal initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-modal').exists()).toBe(false)
    })

    it('shows modal when clicked', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.clickme').trigger('click')
      expect(wrapper.find('.profile-modal').exists()).toBe(true)
    })

    it('passes correct userid to modal', async () => {
      const wrapper = createWrapper({ userid: 123 })
      await wrapper.find('.clickme').trigger('click')
      expect(wrapper.find('.profile-modal').attributes('data-id')).toBe('123')
    })
  })

  describe('props', () => {
    it('requires userid prop', () => {
      const wrapper = createWrapper({ userid: 5 })
      expect(wrapper.props('userid')).toBe(5)
    })

    it('requires newsfeed prop', () => {
      const newsfeed = {
        id: 10,
        displayname: 'User',
        added: new Date().toISOString(),
      }
      const wrapper = createWrapper({ newsfeed })
      expect(wrapper.props('newsfeed')).toEqual(newsfeed)
    })

    it('has optional append prop', () => {
      const wrapper = createWrapper({ append: 'text' })
      expect(wrapper.props('append')).toBe('text')
    })

    it('has optional appendBold prop', () => {
      const wrapper = createWrapper({ appendBold: 'bold text' })
      expect(wrapper.props('appendBold')).toBe('bold text')
    })
  })
})
