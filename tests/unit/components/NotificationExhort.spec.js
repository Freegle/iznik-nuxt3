import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import NotificationExhort from '~/components/NotificationExhort.vue'

const { mockNotification, mockNotificationago } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockNotification: ref({
      id: 1,
      title: 'Test notification title',
      text: 'Test notification text',
    }),
    mockNotificationago: ref('5 minutes ago'),
  }
})

vi.mock('~/composables/useNotification', () => ({
  setupNotification: vi.fn(() =>
    Promise.resolve({
      notification: mockNotification,
      notificationago: mockNotificationago,
    })
  ),
}))

describe('NotificationExhort', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotification.value = {
      id: 1,
      title: 'Test notification title',
      text: 'Test notification text',
    }
    mockNotificationago.value = '5 minutes ago'
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(NotificationExhort, {
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
      expect(profileImage.attributes('data-size')).toBe('lg')
    })

    it('displays notification title', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Test notification title')
    })

    it('displays notification text in quotes when present', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('"Test notification text"')
    })

    it('does not show text section when no text', async () => {
      mockNotification.value = {
        id: 1,
        title: 'Title only',
        text: null,
      }
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Title only')
      expect(wrapper.find('.font-weight-bold').exists()).toBe(false)
    })

    it('displays notification ago time', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('abbr.small').text()).toBe('5 minutes ago')
    })
  })

  describe('props', () => {
    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 5 })
      expect(wrapper.findComponent(NotificationExhort).props('id')).toBe(5)
    })
  })
})
