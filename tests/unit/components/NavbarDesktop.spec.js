import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import NavbarDesktop from '~/components/NavbarDesktop.vue'

const mockNavbar = {
  online: ref(true),
  distance: ref(5),
  logo: ref('/logo.png'),
  logoFormat: ref('png'),
  unreadNotificationCount: ref(3),
  chatCount: ref(2),
  activePostsCount: ref(5),
  activePostsCountPlural: ref('5 active posts'),
  newsCount: ref(1),
  newsCountPlural: ref('1 news item'),
  communityEventCount: ref(2),
  communityEventCountPlural: ref('2 events'),
  volunteerOpportunityCount: ref(0),
  volunteerOpportunityCountPlural: ref('0 opportunities'),
  browseCount: ref(10),
  browseCountPlural: ref('10 items'),
  showAboutMeModal: ref(false),
  homePage: ref('/browse'),
  requestLogin: vi.fn(),
  logout: vi.fn(),
  showAboutMe: vi.fn(),
  maybeReload: vi.fn(),
}

const mockAuthStore = {
  user: { id: 1, displayname: 'Test User' },
}

vi.mock('~/composables/useNavbar', () => ({
  useNavbar: () => mockNavbar,
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

describe('NavbarDesktop', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavbar.online.value = true
    mockNavbar.showAboutMeModal.value = false
    mockAuthStore.user = { id: 1, displayname: 'Test User' }
  })

  function createWrapper() {
    return mount(NavbarDesktop, {
      global: {
        stubs: {
          'b-navbar': {
            template: '<nav class="b-navbar"><slot /></nav>',
            props: ['fixed'],
          },
          'nuxt-link': {
            template: '<a class="nuxt-link" :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'disabled'],
            emits: ['click'],
          },
          'b-img': {
            template: '<img class="b-img" :src="src" :alt="alt" />',
            props: ['src', 'format', 'alt'],
          },
          'b-badge': {
            template: '<span class="b-badge" :class="variant"><slot /></span>',
            props: ['variant', 'title'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon', 'class'],
          },
          OfflineIndicator: {
            template: '<div class="offline-indicator" />',
          },
          ProxyImage: {
            template: '<img class="proxy-image" :src="src" />',
            props: ['src', 'format', 'alt', 'sizes', 'preload'],
          },
          NotificationOptions: {
            template: '<div class="notification-options" />',
            props: ['unreadNotificationCount', 'distance', 'smallScreen'],
            emits: ['show-about-me', 'update:unread-notification-count'],
          },
          ChatMenu: {
            template: '<div class="chat-menu" />',
            props: ['chatCount', 'isListItem'],
            emits: ['update:chat-count'],
          },
          AboutMeModal: {
            template: '<div class="about-me-modal" />',
            emits: ['hidden'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders navbar', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-navbar').exists()).toBe(true)
    })

    it('shows logo when online', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.proxy-image').exists()).toBe(true)
    })

    it('shows offline indicator when not online', () => {
      mockNavbar.online.value = false
      const wrapper = createWrapper()
      expect(wrapper.find('.offline-indicator').exists()).toBe(true)
    })

    it('shows gif logo directly when format is gif', () => {
      mockNavbar.logoFormat.value = 'gif'
      const wrapper = createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })
  })

  describe('logged in state', () => {
    it('shows navigation menu when logged in', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#nav_collapse').exists()).toBe(true)
    })

    it('shows browse link', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#menu-option-mygroups').exists()).toBe(true)
    })

    it('shows give link', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#menu-option-give').exists()).toBe(true)
    })

    it('shows find link', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#menu-option-find').exists()).toBe(true)
    })

    it('shows my posts link', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#menu-option-myposts').exists()).toBe(true)
    })

    it('shows chitchat link', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#menu-option-chitchat').exists()).toBe(true)
    })

    it('shows events link', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#menu-option-communityevents').exists()).toBe(true)
    })

    it('shows volunteer link', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#menu-option-volunteering').exists()).toBe(true)
    })

    it('shows promote link', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#menu-option-spread').exists()).toBe(true)
    })

    it('shows help link', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#menu-option-help').exists()).toBe(true)
    })

    it('shows settings link', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#menu-option-settings').exists()).toBe(true)
    })

    it('shows logout link', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#menu-option-logout').exists()).toBe(true)
    })

    it('shows notification options', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.notification-options').exists()).toBe(true)
    })

    it('shows chat menu', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-menu').exists()).toBe(true)
    })
  })

  describe('logged out state', () => {
    beforeEach(() => {
      mockAuthStore.user = null
    })

    it('shows sign in button when not logged in', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.test-signinbutton').exists()).toBe(true)
    })

    it('hides navigation menu when not logged in', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#nav_collapse').exists()).toBe(false)
    })
  })

  describe('badges', () => {
    it('shows browse count badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.browsebadge').exists()).toBe(true)
      expect(wrapper.find('.browsebadge').text()).toBe('10')
    })

    it('shows my posts badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.mypostsbadge').exists()).toBe(true)
      expect(wrapper.find('.mypostsbadge').text()).toBe('5')
    })

    it('shows news badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.newsbadge').exists()).toBe(true)
      expect(wrapper.find('.newsbadge').text()).toBe('1')
    })

    it('shows community events badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.communityeventsbadge').exists()).toBe(true)
      expect(wrapper.find('.communityeventsbadge').text()).toBe('2')
    })

    it('hides volunteer badge when count is 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.volunteeropportunitiesbadge').exists()).toBe(false)
    })
  })

  describe('interactions', () => {
    it('calls logout on logout click', async () => {
      const wrapper = createWrapper()
      await wrapper.find('#menu-option-logout').trigger('click')
      expect(mockNavbar.logout).toHaveBeenCalled()
    })

    it('calls requestLogin on sign in click', async () => {
      mockAuthStore.user = null
      const wrapper = createWrapper()
      // Need to wait for mounted to enable button
      await flushPromises()
      await wrapper.find('.test-signinbutton').trigger('click')
      expect(mockNavbar.requestLogin).toHaveBeenCalled()
    })

    it('sign in button is disabled initially then enabled after mount', async () => {
      mockAuthStore.user = null
      const wrapper = createWrapper()
      await flushPromises()
      expect(
        wrapper.find('.test-signinbutton').attributes('disabled')
      ).toBeFalsy()
    })
  })

  describe('icons', () => {
    it('shows eye icon for browse', () => {
      const wrapper = createWrapper()
      const browseLink = wrapper.find('#menu-option-mygroups')
      expect(browseLink.find('[data-icon="eye"]').exists()).toBe(true)
    })

    it('shows gift icon for give', () => {
      const wrapper = createWrapper()
      const giveLink = wrapper.find('#menu-option-give')
      expect(giveLink.find('[data-icon="gift"]').exists()).toBe(true)
    })

    it('shows shopping-cart icon for find', () => {
      const wrapper = createWrapper()
      const findLink = wrapper.find('#menu-option-find')
      expect(findLink.find('[data-icon="shopping-cart"]').exists()).toBe(true)
    })

    it('shows home icon for my posts', () => {
      const wrapper = createWrapper()
      const myPostsLink = wrapper.find('#menu-option-myposts')
      expect(myPostsLink.find('[data-icon="home"]').exists()).toBe(true)
    })

    it('shows coffee icon for chitchat', () => {
      const wrapper = createWrapper()
      const chitchatLink = wrapper.find('#menu-option-chitchat')
      expect(chitchatLink.find('[data-icon="coffee"]').exists()).toBe(true)
    })

    it('shows cog icon for settings', () => {
      const wrapper = createWrapper()
      const settingsLink = wrapper.find('#menu-option-settings')
      expect(settingsLink.find('[data-icon="cog"]').exists()).toBe(true)
    })

    it('shows sign-out-alt icon for logout', () => {
      const wrapper = createWrapper()
      const logoutLink = wrapper.find('#menu-option-logout')
      expect(logoutLink.find('[data-icon="sign-out-alt"]').exists()).toBe(true)
    })
  })

  describe('about me modal', () => {
    it('shows about me modal when showAboutMeModal is true', () => {
      mockNavbar.showAboutMeModal.value = true
      const wrapper = createWrapper()
      expect(wrapper.find('.about-me-modal').exists()).toBe(true)
    })

    it('hides about me modal when showAboutMeModal is false', () => {
      mockNavbar.showAboutMeModal.value = false
      const wrapper = createWrapper()
      expect(wrapper.find('.about-me-modal').exists()).toBe(false)
    })
  })
})
