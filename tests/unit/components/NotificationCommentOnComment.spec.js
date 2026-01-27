import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import NotificationCommentOnComment from '~/components/NotificationCommentOnComment.vue'

const mockNewsfeedStore = {
  fetch: vi.fn(),
}

const { mockFromuser, mockNewsfeed, mockNotificationago } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockFromuser: ref({
      id: 2,
      displayname: 'Jane Doe',
      profile: { path: '/profile.jpg' },
    }),
    mockNewsfeed: ref({
      id: 100,
      message: 'This is a great comment!',
    }),
    mockNotificationago: ref('3 hours ago'),
  }
})

vi.mock('~/composables/useNotification', () => ({
  setupNotification: vi.fn(() =>
    Promise.resolve({
      fromuser: mockFromuser,
      newsfeed: mockNewsfeed,
      notificationago: mockNotificationago,
    })
  ),
}))

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => mockNewsfeedStore,
}))

describe('NotificationCommentOnComment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFromuser.value = {
      id: 2,
      displayname: 'Jane Doe',
      profile: { path: '/profile.jpg' },
    }
    mockNewsfeed.value = {
      id: 100,
      message: 'This is a great comment!',
    }
    mockNotificationago.value = '3 hours ago'
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(NotificationCommentOnComment, {
                id: 1,
                ...props,
              }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          ProfileImage: {
            template:
              '<div class="profile-image" :data-image="image" :data-size="size" />',
            props: ['image', 'isThumbnail', 'size'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders container with clickme class when fromuser exists', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.clickme').exists()).toBe(true)
    })

    it('does not render when fromuser is null', async () => {
      mockFromuser.value = null
      const wrapper = await createWrapper()
      expect(wrapper.find('.clickme').exists()).toBe(false)
    })

    it('renders ProfileImage with user profile', async () => {
      const wrapper = await createWrapper()
      const profileImage = wrapper.find('.profile-image')
      expect(profileImage.exists()).toBe(true)
      expect(profileImage.attributes('data-image')).toBe('/profile.jpg')
    })

    it('displays user name', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.font-weight-bold').text()).toBe('Jane Doe')
    })

    it('displays commented text', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('commented:')
    })

    it('displays newsfeed message in quotes', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('"This is a great comment!"')
    })

    it('does not show message when newsfeed has no message', async () => {
      mockNewsfeed.value = { id: 100, message: null }
      const wrapper = await createWrapper()
      expect(wrapper.find('.line-clamp-2').exists()).toBe(false)
    })

    it('displays notification ago time', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('abbr.small').text()).toBe('3 hours ago')
    })
  })

  describe('newsfeed fetch on mount', () => {
    it('fetches newsfeed item when it has id', async () => {
      await createWrapper()
      expect(mockNewsfeedStore.fetch).toHaveBeenCalledWith(100, true)
    })

    it('does not fetch when newsfeed is null', async () => {
      mockNewsfeed.value = null
      await createWrapper()
      expect(mockNewsfeedStore.fetch).not.toHaveBeenCalled()
    })
  })

  describe('click handler', () => {
    it('is clickable', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.clickme').exists()).toBe(true)
      await wrapper.find('.clickme').trigger('click')
    })
  })

  describe('props', () => {
    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 5 })
      expect(
        wrapper.findComponent(NotificationCommentOnComment).props('id')
      ).toBe(5)
    })
  })
})
