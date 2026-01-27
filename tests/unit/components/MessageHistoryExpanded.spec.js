import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MessageHistoryExpanded from '~/components/MessageHistoryExpanded.vue'

const { mockMessage, mockUser, mockGroup } = vi.hoisted(() => {
  return {
    mockMessage: {
      id: 1,
      subject: 'OFFER: Test Item',
      fromuser: 200,
      lat: 51.5,
      lng: -0.1,
      interacted: null,
      groups: [{ groupid: 100, arrival: '2024-01-15T10:00:00Z' }],
    },
    mockUser: {
      id: 200,
      displayname: 'Test User',
      profile: { paththumb: '/profile/200.jpg' },
      supporter: false,
      info: {
        openoffers: 2,
        openwanteds: 1,
      },
    },
    mockGroup: {
      id: 100,
      namedisplay: 'Test Group',
      nameshort: 'testgroup',
    },
  }
})

const mockMessageStore = {
  byId: vi.fn().mockReturnValue(mockMessage),
}

const mockUserStore = {
  fetch: vi.fn().mockResolvedValue(mockUser),
  byId: vi.fn().mockReturnValue(mockUser),
}

const mockGroupStore = {
  get: vi.fn().mockReturnValue(mockGroup),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: { lat: 51.6, lng: -0.2 },
  }),
}))

vi.mock('~/composables/useDistance', () => ({
  milesAway: vi.fn().mockReturnValue(5),
}))

vi.mock('~/composables/useTimeFormat', () => ({
  timeago: vi.fn().mockReturnValue('2 days ago'),
}))

describe('MessageHistoryExpanded', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageStore.byId.mockReturnValue(mockMessage)
    mockUserStore.byId.mockReturnValue(mockUser)
    mockGroupStore.get.mockReturnValue(mockGroup)
  })

  function createWrapper(props = {}) {
    return mount(MessageHistoryExpanded, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          ProfileImage: {
            template:
              '<img class="profile-image" :src="image" @click="$emit(\'click\', $event)" />',
            props: ['image', 'isThumbnail', 'size'],
            emits: ['click'],
          },
          SupporterInfo: {
            template: '<span class="supporter-info" />',
          },
          ProfileModal: {
            template: '<div class="profile-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders user info container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.grey').exists()).toBe(true)
    })

    it('shows user display name', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Test User')
    })

    it('shows profile image', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('shows open offers count', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('open OFFER')
    })

    it('shows open wanteds count', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('open WANTED')
    })
  })

  describe('distance', () => {
    it('shows miles away', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('mile')
      expect(wrapper.text()).toContain('away')
    })
  })

  describe('group info', () => {
    it('shows group name', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Test Group')
    })

    it('shows arrival time', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('2 days ago')
    })

    it('links to group explore page', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('a[href*="/explore/"]')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toContain('testgroup')
    })
  })

  describe('interacted indicator', () => {
    it('shows connected before when interacted', () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        interacted: 123,
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Connected before')
    })

    it('links to chat when interacted', () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        interacted: 123,
      })
      const wrapper = createWrapper()
      const link = wrapper.find('a[href*="/chats/"]')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('/chats/123')
    })

    it('hides connected before when not interacted', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('Connected before')
    })
  })

  describe('supporter info', () => {
    it('shows supporter badge when user is supporter', () => {
      mockUserStore.byId.mockReturnValue({
        ...mockUser,
        supporter: true,
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.supporter-info').exists()).toBe(true)
    })

    it('hides supporter badge when user is not supporter', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.supporter-info').exists()).toBe(false)
    })
  })

  describe('profile modal', () => {
    it('opens profile modal on profile image click', async () => {
      const wrapper = createWrapper()
      // Trigger click with a synthetic event object that has expected properties
      await wrapper
        .find('.profile-image')
        .trigger('click', { shiftKey: false, ctrlKey: false })
      await flushPromises()
      expect(wrapper.find('.profile-modal').exists()).toBe(true)
    })
  })

  describe('no user', () => {
    it('handles missing fromuser gracefully', () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        fromuser: null,
      })
      mockUserStore.byId.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.find('.grey').exists()).toBe(false)
    })
  })

  describe('user fetch', () => {
    it('fetches user data on mount', () => {
      createWrapper()
      expect(mockUserStore.fetch).toHaveBeenCalledWith(200)
    })
  })

  describe('no open posts', () => {
    it('hides counts when no open offers or wanteds', () => {
      mockUserStore.byId.mockReturnValue({
        ...mockUser,
        info: { openoffers: 0, openwanteds: 0 },
      })
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain('open OFFER')
      expect(wrapper.text()).not.toContain('open WANTED')
    })
  })
})
