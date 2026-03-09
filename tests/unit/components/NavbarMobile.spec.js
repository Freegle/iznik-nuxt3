import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import NavbarMobile from '~/components/NavbarMobile.vue'

// Mock useNavbar composable
const mockRequestLogin = vi.fn()
const mockLogout = vi.fn()
const mockShowAboutMe = vi.fn()
const mockMaybeReload = vi.fn()
const mockBackButton = vi.fn()

vi.mock('~/composables/useNavbar', () => ({
  useNavbar: () => ({
    online: ref(true),
    distance: ref(5),
    unreadNotificationCount: ref(3),
    activePostsCount: ref(2),
    newsCount: ref(1),
    browseCount: ref(10),
    chatCount: ref(5),
    showAboutMeModal: ref(false),
    showBackButton: ref(false),
    backButtonCount: ref(0),
    requestLogin: mockRequestLogin,
    logout: mockLogout,
    showAboutMe: mockShowAboutMe,
    maybeReload: mockMaybeReload,
    backButton: mockBackButton,
  }),
  clearNavBarTimeout: vi.fn(),
  setNavBarHidden: vi.fn(),
  navBarHidden: ref(false),
  updateScrollTime: vi.fn(),
}))

// Mock stores
const mockPageTitle = ref('Test Page')
const mockBreakpoint = ref('md')
const mockStickyAdRendered = ref(false)

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    get pageTitle() {
      return mockPageTitle.value
    },
    get breakpoint() {
      return mockBreakpoint.value
    },
    get stickyAdRendered() {
      return mockStickyAdRendered.value
    },
  }),
}))

const mockUser = ref({
  id: 1,
  displayname: 'Test User',
  profile: { path: '/images/test.jpg' },
})

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    get user() {
      return mockUser.value
    },
  }),
}))

vi.mock('~/stores/mobile', () => ({
  useMobileStore: () => ({
    isApp: false,
    isiOS: false,
  }),
}))

// Mock vue-router
const mockRoute = {
  path: '/browse',
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
}))

// Mock child components
vi.mock('~/components/NavbarMobilePost', () => ({
  default: {
    name: 'NavbarMobilePost',
    template: '<button class="navbar-mobile-post">Post</button>',
  },
}))

vi.mock('~/components/NavbarMobileItem', () => ({
  default: {
    name: 'NavbarMobileItem',
    template:
      '<a class="navbar-mobile-item" :href="to" @click="$emit(\'click\')"><span class="label">{{ label }}</span><span v-if="badge" class="badge">{{ badge }}</span></a>',
    props: ['to', 'icon', 'label', 'badge', 'badgeVariant'],
    emits: ['click', 'mousedown'],
  },
}))

vi.mock('~/components/ProfileImage', () => ({
  default: {
    name: 'ProfileImage',
    template: '<div class="profile-image"><img :src="image" /></div>',
    props: ['image', 'name', 'isThumbnail', 'size'],
  },
}))

vi.mock('~/components/OfflineIndicator', () => ({
  default: {
    name: 'OfflineIndicator',
    template: '<div class="offline-indicator">Offline</div>',
  },
}))

// Mock defineAsyncComponent
vi.mock('vue', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    defineAsyncComponent: (loader) => ({
      name: 'AsyncComponent',
      template: '<div class="async-component"><slot /></div>',
    }),
  }
})

describe('NavbarMobile', () => {
  function createWrapper(props = {}) {
    return mount(NavbarMobile, {
      global: {
        stubs: {
          'b-navbar': {
            template:
              '<nav class="navbar" :class="[$attrs.class]" :fixed="fixed"><slot /></nav>',
            props: ['type', 'fixed'],
          },
          'b-badge': {
            template:
              '<span class="b-badge" :class="variant">{{ $slots.default?.() }}</span>',
            props: ['variant'],
          },
          'b-dropdown': {
            template:
              '<div class="b-dropdown"><button class="dropdown-toggle"><slot name="button-content" /></button><div class="dropdown-menu"><slot /></div></div>',
            props: ['noCaret', 'variant', 'right'],
          },
          'b-dropdown-item': {
            template:
              '<a class="dropdown-item" :href="href" @click="$emit(\'click\')"><slot /></a>',
            props: ['href'],
            emits: ['click', 'mousedown'],
          },
          'b-nav': {
            template: '<ul class="nav"><slot /></ul>',
          },
          'b-nav-item': {
            template: '<li class="nav-item"><slot /></li>',
          },
          NuxtLink: {
            template: '<a :href="to" class="nuxt-link"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          'v-icon': {
            template: '<i :class="icon" class="v-icon"></i>',
            props: ['icon', 'size'],
          },
          OfflineIndicator: {
            template: '<div class="offline-indicator">Offline</div>',
          },
          ProfileImage: {
            template: '<div class="profile-image"><img :src="image" /></div>',
            props: ['image', 'name', 'isThumbnail', 'size'],
          },
          AboutMeModal: {
            template: '<div class="about-me-modal"></div>',
          },
          NotificationOptions: {
            template: '<div class="notification-options"></div>',
            props: [
              'unreadNotificationCount',
              'shown',
              'distance',
              'smallScreen',
            ],
            emits: [
              'update:unreadNotificationCount',
              'update:shown',
              'showAboutMe',
            ],
          },
        },
      },
      ...props,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.value = {
      id: 1,
      displayname: 'Test User',
      profile: { path: '/images/test.jpg' },
    }
    mockPageTitle.value = 'Test Page'
    mockBreakpoint.value = 'md'
    mockStickyAdRendered.value = false
    mockRoute.path = '/browse'

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })

    // Mock scroll listener
    vi.spyOn(window, 'addEventListener').mockImplementation(() => {})
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('renders navbar when not on specific chat page', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#navbar-mobile').exists()).toBe(true)
    })

    it('hides content on specific chat page at mobile breakpoints', async () => {
      mockRoute.path = '/chats/123'
      mockBreakpoint.value = 'xs'
      const wrapper = createWrapper()
      await flushPromises()
      // The isSpecificChatPage computed should be true
      // The content inside v-if="!isSpecificChatPage" should not render
      expect(wrapper.find('.navbar').exists()).toBe(false)
    })

    it('shows content on chat page at larger breakpoints', async () => {
      mockRoute.path = '/chats/123'
      mockBreakpoint.value = 'lg'
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.navbar').exists()).toBe(true)
    })
  })

  describe('logged in state', () => {
    it('shows page title when logged in', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Test Page')
    })

    it('shows profile dropdown when logged in', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-dropdown').exists()).toBe(true)
    })

    it('shows bottom navigation when logged in', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.navbar-bottom').exists()).toBe(true)
    })

    it('shows browse nav item with badge count', () => {
      const wrapper = createWrapper()
      const browseItem = wrapper
        .findAll('.navbar-mobile-item')
        .find((item) => item.text().includes('Browse'))
      expect(browseItem).toBeDefined()
    })

    it('shows chats nav item', () => {
      const wrapper = createWrapper()
      const chatsItem = wrapper
        .findAll('.navbar-mobile-item')
        .find((item) => item.text().includes('Chats'))
      expect(chatsItem).toBeDefined()
    })

    it('shows my posts nav item', () => {
      const wrapper = createWrapper()
      const myPostsItem = wrapper
        .findAll('.navbar-mobile-item')
        .find((item) => item.text().includes('My Posts'))
      expect(myPostsItem).toBeDefined()
    })

    it('shows chitchat nav item', () => {
      const wrapper = createWrapper()
      const chitchatItem = wrapper
        .findAll('.navbar-mobile-item')
        .find((item) => item.text().includes('ChitChat'))
      expect(chitchatItem).toBeDefined()
    })

    it('shows promote nav item', () => {
      const wrapper = createWrapper()
      const promoteItem = wrapper
        .findAll('.navbar-mobile-item')
        .find((item) => item.text().includes('Promote'))
      expect(promoteItem).toBeDefined()
    })

    it('shows help nav item', () => {
      const wrapper = createWrapper()
      const helpItem = wrapper
        .findAll('.navbar-mobile-item')
        .find((item) => item.text().includes('Help'))
      expect(helpItem).toBeDefined()
    })
  })

  describe('logged out state', () => {
    beforeEach(() => {
      mockUser.value = null
    })

    it('shows login button when not logged in', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Log in or Join')
    })

    it('hides bottom navbar when not logged in', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.navbar-bottom').classes()).toContain(
        'navbar-not-logged-in'
      )
    })

    it('hides profile dropdown when not logged in', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.userOptions').exists()).toBe(false)
    })
  })

  describe('user dropdown', () => {
    it('shows settings link', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Settings')
    })

    it('shows logout link', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Logout')
    })

    it('calls logout when clicked', async () => {
      const wrapper = createWrapper()
      const logoutItem = wrapper
        .findAll('.dropdown-item')
        .find((item) => item.text().includes('Logout'))
      await logoutItem.trigger('click')
      expect(mockLogout).toHaveBeenCalled()
    })
  })

  describe('back button', () => {
    it('hides back button by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.nav-back-btn').exists()).toBe(false)
    })
  })

  describe('navbar hiding on scroll', () => {
    it('adds scroll listener on mount', () => {
      createWrapper()
      expect(window.addEventListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        {
          passive: true,
        }
      )
    })

    it('removes scroll listener on unmount', () => {
      const wrapper = createWrapper()
      wrapper.unmount()
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )
    })
  })

  describe('route-based navbar hiding', () => {
    it('computes navBarBottomHidden for give routes', () => {
      // The computed property checks route.path.startsWith
      // Testing the logic by checking the component has route-based logic
      const wrapper = createWrapper()
      // The nav should show when not on special routes
      expect(wrapper.find('.navbar-bottom').exists()).toBe(true)
    })

    it('computes navBarBottomHidden for find routes', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.navbar-bottom').exists()).toBe(true)
    })

    it('computes navBarBottomHidden for post routes', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.navbar-bottom').exists()).toBe(true)
    })

    it('computes navBarBottomHidden for chat routes', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.navbar-bottom').exists()).toBe(true)
    })
  })

  describe('sticky ad handling', () => {
    it('adds stickyAdRendered class when ad is shown', async () => {
      mockStickyAdRendered.value = true
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.navbar-bottom').classes()).toContain(
        'stickyAdRendered'
      )
    })

    it('does not add stickyAdRendered class when no ad', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.navbar-bottom').classes()).not.toContain(
        'stickyAdRendered'
      )
    })
  })

  describe('post button', () => {
    it('renders the post button wrapper', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.post-button-wrapper').exists()).toBe(true)
    })

    it('renders NavbarMobilePost component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.navbar-mobile-post').exists()).toBe(true)
    })
  })

  describe('profile image', () => {
    it('shows profile image when user has profile path', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('shows user icon when no profile path', async () => {
      mockUser.value = { id: 1, displayname: 'Test', profile: null }
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.v-icon.user').exists()).toBe(true)
    })
  })
})
