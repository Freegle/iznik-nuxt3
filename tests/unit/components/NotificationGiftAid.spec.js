import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import NotificationGiftAid from '~/components/NotificationGiftAid.vue'

const mockRouter = {
  push: vi.fn(),
}

const mockNotificationStore = {
  seen: vi.fn(),
}

const { mockNotification, mockNotificationago } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockNotification: ref({
      id: 1,
      text: 'Gift Aid info',
      seen: false,
    }),
    mockNotificationago: ref('2 hours ago'),
  }
})

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

vi.mock('~/composables/useNotification', () => ({
  setupNotification: vi.fn(() =>
    Promise.resolve({
      notification: mockNotification,
      notificationStore: mockNotificationStore,
      notificationago: mockNotificationago,
    })
  ),
}))

describe('NotificationGiftAid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotification.value = {
      id: 1,
      text: 'Gift Aid info',
      seen: false,
    }
    mockNotificationago.value = '2 hours ago'
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(NotificationGiftAid, {
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

    it('renders ProfileImage with icon', async () => {
      const wrapper = await createWrapper()
      const profileImage = wrapper.find('.profile-image')
      expect(profileImage.exists()).toBe(true)
      expect(profileImage.attributes('data-image')).toBe('/icon.png')
    })

    it('displays thank you message', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Thank you for donating to Freegle!')
    })

    it('displays Gift Aid message when text present', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Gift Aid Declaration')
      expect(wrapper.text()).toContain('Please click here')
    })

    it('does not show Gift Aid message when no text', async () => {
      mockNotification.value = {
        id: 1,
        text: null,
        seen: false,
      }
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('Gift Aid Declaration')
    })

    it('displays notification ago time', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('abbr.small').text()).toBe('2 hours ago')
    })
  })

  describe('goto method', () => {
    it('marks notification as seen when not already seen', async () => {
      mockNotification.value.seen = false
      const wrapper = await createWrapper()
      await wrapper.find('.clickme').trigger('click')
      expect(mockNotificationStore.seen).toHaveBeenCalledWith(1)
    })

    it('does not mark as seen when already seen', async () => {
      mockNotification.value.seen = true
      const wrapper = await createWrapper()
      await wrapper.find('.clickme').trigger('click')
      expect(mockNotificationStore.seen).not.toHaveBeenCalled()
    })

    it('navigates to /giftaid page', async () => {
      const wrapper = await createWrapper()
      await wrapper.find('.clickme').trigger('click')
      expect(mockRouter.push).toHaveBeenCalledWith('/giftaid')
    })
  })

  describe('props', () => {
    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 10 })
      expect(wrapper.findComponent(NotificationGiftAid).props('id')).toBe(10)
    })
  })
})
