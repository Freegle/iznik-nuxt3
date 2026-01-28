import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import NotificationLovedPost from '~/components/NotificationLovedPost.vue'

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
      displayname: 'Jane Doe',
      profile: { path: '/jane.jpg' },
    }),
    mockNewsfeed: ref({
      id: 100,
      type: 'Story',
      message: 'My amazing story',
    }),
    mockNotificationago: ref('2 days ago'),
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

describe('NotificationLovedPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFromuser.value = {
      id: 2,
      displayname: 'Jane Doe',
      profile: { path: '/jane.jpg' },
    }
    mockNewsfeed.value = {
      id: 100,
      type: 'Story',
      message: 'My amazing story',
    }
    mockNotificationago.value = '2 days ago'
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(NotificationLovedPost, {
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
    it('renders container with clickme class', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.clickme').exists()).toBe(true)
    })

    it('renders ProfileImage with user profile', async () => {
      const wrapper = await createWrapper()
      const profileImage = wrapper.find('.profile-image')
      expect(profileImage.exists()).toBe(true)
      expect(profileImage.attributes('data-image')).toBe('/jane.jpg')
    })

    it('displays user name in bold', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.font-weight-bold').text()).toBe('Jane Doe')
    })

    it('displays loves your post text for non-noticeboard', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('loves your post')
    })

    it('displays loves your poster text for noticeboard', async () => {
      mockNewsfeed.value = {
        id: 100,
        type: 'Noticeboard',
        message: JSON.stringify({ name: 'Community Notice' }),
      }
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('loves your poster')
    })

    it('displays newsfeed message in quotes', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('"My amazing story"')
    })

    it('displays noticeboard name in quotes', async () => {
      mockNewsfeed.value = {
        id: 100,
        type: 'Noticeboard',
        message: JSON.stringify({ name: 'Community Notice' }),
      }
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('"Community Notice"')
    })

    it('does not show message when newsfeed has no message', async () => {
      mockNewsfeed.value = { id: 100, type: 'Story', message: null }
      const wrapper = await createWrapper()
      expect(wrapper.find('.line-clamp-2').exists()).toBe(false)
    })

    it('displays notification ago time', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('abbr.small').text()).toBe('2 days ago')
    })
  })

  describe('click handler', () => {
    it('fetches newsfeed and navigates to chitchat', async () => {
      const wrapper = await createWrapper()
      await wrapper.find('.clickme').trigger('click')
      expect(mockNewsfeedStore.fetch).toHaveBeenCalledWith(100, true)
      expect(mockRouter.push).toHaveBeenCalledWith('/chitchat/100')
    })

    it('does nothing when newsfeed has no id', async () => {
      mockNewsfeed.value = null
      const wrapper = await createWrapper()
      await wrapper.find('.clickme').trigger('click')
      expect(mockNewsfeedStore.fetch).not.toHaveBeenCalled()
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  describe('computed noticeboardname', () => {
    it('returns null for non-noticeboard posts', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(NotificationLovedPost)
      expect(component.vm.noticeboardname).toBe(null)
    })

    it('parses name from noticeboard message JSON', async () => {
      mockNewsfeed.value = {
        id: 100,
        type: 'Noticeboard',
        message: JSON.stringify({ name: 'Test Notice' }),
      }
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(NotificationLovedPost)
      expect(component.vm.noticeboardname).toBe('Test Notice')
    })

    it('returns null for invalid JSON', async () => {
      mockNewsfeed.value = {
        id: 100,
        type: 'Noticeboard',
        message: 'invalid json',
      }
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(NotificationLovedPost)
      expect(component.vm.noticeboardname).toBe(null)
    })
  })

  describe('props', () => {
    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 20 })
      expect(wrapper.findComponent(NotificationLovedPost).props('id')).toBe(20)
    })
  })
})
