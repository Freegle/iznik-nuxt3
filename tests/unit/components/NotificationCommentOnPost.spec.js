import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import NotificationCommentOnPost from '~/components/NotificationCommentOnPost.vue'

const mockRouter = {
  push: vi.fn(),
}

const mockNewsfeedStore = {
  fetch: vi.fn(),
}

const { mockFromuser, mockNewsfeed, mockNotificationago } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockFromuser: ref({
      id: 2,
      displayname: 'John Smith',
      profile: { path: '/john.jpg' },
    }),
    mockNewsfeed: ref({
      id: 200,
      message: 'Great post!',
    }),
    mockNotificationago: ref('1 day ago'),
  }
})

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

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

describe('NotificationCommentOnPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFromuser.value = {
      id: 2,
      displayname: 'John Smith',
      profile: { path: '/john.jpg' },
    }
    mockNewsfeed.value = {
      id: 200,
      message: 'Great post!',
    }
    mockNotificationago.value = '1 day ago'
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(NotificationCommentOnPost, {
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
      expect(profileImage.attributes('data-image')).toBe('/john.jpg')
    })

    it('displays user name in bold', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.font-weight-bold').text()).toBe('John Smith')
    })

    it('displays commented text', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('commented:')
    })

    it('displays newsfeed message in quotes', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('"Great post!"')
    })

    it('does not show message when newsfeed has no message', async () => {
      mockNewsfeed.value = { id: 200, message: null }
      const wrapper = await createWrapper()
      expect(wrapper.find('.line-clamp-2').exists()).toBe(false)
    })

    it('displays notification ago time', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('abbr.small').text()).toBe('1 day ago')
    })
  })

  describe('click handler', () => {
    it('fetches newsfeed and navigates to chitchat', async () => {
      const wrapper = await createWrapper()
      await wrapper.find('.clickme').trigger('click')
      expect(mockNewsfeedStore.fetch).toHaveBeenCalledWith(200, true)
      expect(mockRouter.push).toHaveBeenCalledWith('/chitchat/200')
    })

    it('does nothing when newsfeed has no id', async () => {
      mockNewsfeed.value = null
      const wrapper = await createWrapper()
      await wrapper.find('.clickme').trigger('click')
      expect(mockNewsfeedStore.fetch).not.toHaveBeenCalled()
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  describe('props', () => {
    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 15 })
      expect(wrapper.findComponent(NotificationCommentOnPost).props('id')).toBe(
        15
      )
    })
  })
})
