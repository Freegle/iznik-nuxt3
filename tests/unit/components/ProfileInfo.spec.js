import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense, ref } from 'vue'
import ProfileInfo from '~/components/ProfileInfo.vue'

// Mock composables
const mockMe = ref({
  id: 1,
  lat: 51.5,
  lng: -0.1,
})
const mockMyid = ref(1)
const mockMod = ref(false)

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    myid: mockMyid,
    mod: mockMod,
  }),
}))

// Mock useDistance
vi.mock('~/composables/useDistance', () => ({
  milesAway: vi.fn((lat1, lng1, lat2, lng2) => {
    if (lat1 && lng1 && lat2 && lng2) return 5
    return null
  }),
}))

// Mock useTwem
vi.mock('~/composables/useTwem', () => ({
  twem: (text) => text,
}))

// Mock useTimeFormat
vi.mock('~/composables/useTimeFormat', () => ({
  dateonly: (date) => 'January 2020',
}))

// Mock pluralize
vi.mock('pluralize', () => ({
  default: (word, count, includeCount) =>
    includeCount ? `${count} ${word}${count !== 1 ? 's' : ''}` : word,
}))

// Mock stores
const mockUserById = vi.fn()
const mockPublicLocationById = vi.fn()
const mockFetchPublicLocation = vi.fn()
const mockFetchByUser = vi.fn()
const mockMessageFetch = vi.fn()

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    byId: mockUserById,
    publicLocationById: mockPublicLocationById,
    fetchPublicLocation: mockFetchPublicLocation,
  }),
}))

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    fetchByUser: mockFetchByUser,
    fetch: mockMessageFetch,
  }),
}))

// Mock child components
vi.mock('~/components/ProfileImage', () => ({
  default: {
    name: 'ProfileImage',
    template: '<div class="profile-image"><img :src="image" /></div>',
    props: ['image', 'name', 'isThumbnail', 'size'],
  },
}))

vi.mock('~/components/UserRatings', () => ({
  default: {
    name: 'UserRatings',
    template: '<div class="user-ratings"></div>',
    props: ['id', 'size', 'disabled'],
  },
}))

vi.mock('~/components/ChatButton', () => ({
  default: {
    name: 'ChatButton',
    template: '<button class="chat-button">Message</button>',
    props: ['userid', 'size', 'title', 'variant'],
  },
}))

// Mock defineAsyncComponent for MessageList
vi.mock('vue', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    defineAsyncComponent: (loader) => ({
      name: 'MessageList',
      template: '<div class="message-list"><slot /></div>',
      props: ['messagesForList', 'selectedType', 'jobs'],
    }),
  }
})

describe('ProfileInfo', () => {
  const mockUser = {
    id: 42,
    displayname: 'Test User',
    supporter: false,
    showmod: false,
    added: '2020-01-15T10:00:00Z',
    lat: 51.6,
    lng: -0.2,
    aboutme: { text: 'Hello, I love freecycling!' },
    expectedreplies: 0,
    info: {
      offers: 15,
      wanteds: 5,
      collected: 20,
      replytime: 3600, // 1 hour in seconds
    },
    profile: {
      path: '/images/profile.jpg',
    },
  }

  const mockMessages = [
    { id: 1, type: 'Offer', successful: false },
    { id: 2, type: 'Wanted', successful: false },
    { id: 3, type: 'Offer', successful: true }, // Should be excluded
  ]

  function createWrapper(props = {}, userData = mockUser) {
    mockUserById.mockReturnValue(userData)
    mockPublicLocationById.mockReturnValue({ location: 'Test Town' })
    mockFetchByUser.mockResolvedValue(mockMessages)
    mockFetchPublicLocation.mockResolvedValue()

    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(
            Suspense,
            {},
            {
              default: () =>
                h(ProfileInfo, {
                  id: 42,
                  ...props,
                }),
              fallback: () => h('div', 'Loading...'),
            }
          )
      },
    })

    return mount(TestWrapper, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to" class="nuxt-link"><slot /></a>',
            props: ['to'],
          },
          'v-icon': {
            template: '<i :class="icon"></i>',
            props: ['icon'],
          },
          MessageList: {
            template: '<div class="message-list"></div>',
            props: ['messagesForList', 'selectedType', 'jobs'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMe.value = { id: 1, lat: 51.5, lng: -0.1 }
    mockMyid.value = 1
    mockMod.value = false
  })

  describe('rendering', () => {
    it('renders user profile when user exists', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.profile-mobile').exists()).toBe(true)
    })

    it('does not render when user is null', async () => {
      mockUserById.mockReturnValue(null)
      const wrapper = createWrapper({}, null)
      await flushPromises()
      expect(wrapper.find('.profile-mobile').exists()).toBe(false)
    })

    it('displays user display name', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Test User')
    })

    it('displays member since date', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Freegler since')
      expect(wrapper.text()).toContain('January 2020')
    })
  })

  describe('supporter badge', () => {
    it('shows supporter badge when user is supporter', async () => {
      const supporterUser = { ...mockUser, supporter: true }
      const wrapper = createWrapper({}, supporterUser)
      await flushPromises()
      expect(wrapper.find('.supporter-badge').exists()).toBe(true)
    })

    it('hides supporter badge when user is not supporter', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.supporter-badge').exists()).toBe(false)
    })

    it('shows supporter notice for supporters', async () => {
      const supporterUser = { ...mockUser, supporter: true }
      const wrapper = createWrapper({}, supporterUser)
      await flushPromises()
      expect(wrapper.find('.supporter-notice').exists()).toBe(true)
    })
  })

  describe('volunteer badge', () => {
    it('shows volunteer badge when showmod is true', async () => {
      const modUser = { ...mockUser, showmod: true }
      const wrapper = createWrapper({}, modUser)
      await flushPromises()
      expect(wrapper.find('.volunteer-badge').exists()).toBe(true)
      expect(wrapper.text()).toContain('Volunteer')
    })

    it('hides volunteer badge when showmod is false', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.volunteer-badge').exists()).toBe(false)
    })
  })

  describe('stats display', () => {
    it('displays offers count', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('15')
      expect(wrapper.text()).toContain('OFFERs')
    })

    it('displays wanteds count', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('5')
      expect(wrapper.text()).toContain('WANTEDs')
    })

    it('displays collected count', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('20')
      expect(wrapper.text()).toContain('Collected')
    })

    it('shows 0 for missing stats', async () => {
      const userNoStats = { ...mockUser, info: null }
      const wrapper = createWrapper({}, userNoStats)
      await flushPromises()
      const statValues = wrapper.findAll('.stat-value')
      expect(statValues[0].text()).toBe('0')
    })
  })

  describe('about me section', () => {
    it('displays about me text', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Hello, I love freecycling!')
    })

    it('hides about me section when empty', async () => {
      const userNoAbout = { ...mockUser, aboutme: null }
      const wrapper = createWrapper({}, userNoAbout)
      await flushPromises()
      expect(wrapper.find('.about-section').exists()).toBe(false)
    })
  })

  describe('location display', () => {
    it('displays location from public location', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Test Town')
    })

    it('hides location when not available', async () => {
      mockPublicLocationById.mockReturnValue(null)
      mockUserById.mockReturnValue(mockUser)
      mockFetchByUser.mockResolvedValue(mockMessages)
      mockFetchPublicLocation.mockResolvedValue()

      const TestWrapper = defineComponent({
        setup() {
          return () =>
            h(
              Suspense,
              {},
              {
                default: () => h(ProfileInfo, { id: 42 }),
                fallback: () => h('div', 'Loading...'),
              }
            )
        },
      })

      const wrapper = mount(TestWrapper, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :href="to" class="nuxt-link"><slot /></a>',
              props: ['to'],
            },
            'v-icon': {
              template: '<i :class="icon"></i>',
              props: ['icon'],
            },
            MessageList: {
              template: '<div class="message-list"></div>',
              props: ['messagesForList', 'selectedType', 'jobs'],
            },
          },
        },
      })
      await flushPromises()
      expect(wrapper.find('.location-line').exists()).toBe(false)
    })
  })

  describe('distance display', () => {
    it('displays miles away when distance available', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('5 miles')
    })
  })

  describe('reply time display', () => {
    it('displays reply time in hours', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Replies ~1h')
    })

    it('displays reply time in minutes for short times', async () => {
      const quickUser = {
        ...mockUser,
        info: { ...mockUser.info, replytime: 300 },
      }
      const wrapper = createWrapper({}, quickUser)
      await flushPromises()
      expect(wrapper.text()).toContain('Replies ~5m')
    })

    it('displays reply time in days for long times', async () => {
      const slowUser = {
        ...mockUser,
        info: { ...mockUser.info, replytime: 172800 },
      } // 2 days
      const wrapper = createWrapper({}, slowUser)
      await flushPromises()
      expect(wrapper.text()).toContain('Replies ~2d')
    })

    it('hides reply time when not available', async () => {
      const noReplyUser = {
        ...mockUser,
        info: { ...mockUser.info, replytime: null },
      }
      const wrapper = createWrapper({}, noReplyUser)
      await flushPromises()
      expect(wrapper.text()).not.toContain('Replies ~')
    })
  })

  describe('expected replies warning', () => {
    it('shows warning when user has expected replies', async () => {
      const userWithReplies = { ...mockUser, expectedreplies: 3 }
      const wrapper = createWrapper({}, userWithReplies)
      await flushPromises()
      expect(wrapper.find('.expected-replies-warning').exists()).toBe(true)
      expect(wrapper.text()).toContain('waiting for a reply')
    })

    it('hides warning when no expected replies', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.expected-replies-warning').exists()).toBe(false)
    })
  })

  describe('action buttons', () => {
    it('renders user ratings', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.user-ratings').exists()).toBe(true)
    })

    it('shows chat button when viewing other user profile', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.chat-button').exists()).toBe(true)
    })

    it('hides chat button when viewing own profile', async () => {
      mockMyid.value = 42 // Same as profile id
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.chat-button').exists()).toBe(false)
    })

    it('hides chat button when not logged in', async () => {
      mockMyid.value = null
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.chat-button').exists()).toBe(false)
    })
  })

  describe('moderator link', () => {
    it('shows member ID link for moderators', async () => {
      mockMod.value = true
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.member-id').exists()).toBe(true)
      expect(wrapper.find('.member-id').text()).toContain('#42')
    })

    it('hides member ID link for non-moderators', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.member-id').exists()).toBe(false)
    })
  })

  describe('active posts', () => {
    it('displays active offers count', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('1 active OFFER')
    })

    it('displays active wanteds count', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('1 active WANTED')
    })

    it('shows "None at the moment" for empty posts', async () => {
      mockFetchByUser.mockResolvedValue([])
      mockUserById.mockReturnValue(mockUser)
      mockPublicLocationById.mockReturnValue({ location: 'Test Town' })
      mockFetchPublicLocation.mockResolvedValue()

      const TestWrapper = defineComponent({
        setup() {
          return () =>
            h(
              Suspense,
              {},
              {
                default: () => h(ProfileInfo, { id: 42 }),
                fallback: () => h('div', 'Loading...'),
              }
            )
        },
      })

      const wrapper = mount(TestWrapper, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :href="to" class="nuxt-link"><slot /></a>',
              props: ['to'],
            },
            'v-icon': {
              template: '<i :class="icon"></i>',
              props: ['icon'],
            },
            MessageList: {
              template: '<div class="message-list"></div>',
              props: ['messagesForList', 'selectedType', 'jobs'],
            },
          },
        },
      })
      await flushPromises()
      expect(wrapper.text()).toContain('None at the moment')
    })
  })

  describe('props', () => {
    it('requires id prop', async () => {
      createWrapper({ id: 99 })
      await flushPromises()
      // The id passed in createWrapper is 42, but we override with 99 in props
      // However createWrapper passes id:42 first, so check the store was called
      expect(mockUserById).toHaveBeenCalled()
    })
  })
})
