import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import NotificationOpenPosts from '~/components/NotificationOpenPosts.vue'

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
      text: 3,
      seen: false,
    }),
    mockNotificationago: ref('5 hours ago'),
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

vi.mock('pluralize', () => ({
  default: (word, count, inclusive) => {
    if (inclusive) {
      return `${count} ${count === 1 ? word : word + 's'}`
    }
    return count === 1 ? word : word + 's'
  },
}))

describe('NotificationOpenPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotification.value = {
      id: 1,
      text: 3,
      seen: false,
    }
    mockNotificationago.value = '5 hours ago'
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(NotificationOpenPosts, {
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
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon', 'scale'],
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

    it('renders question-circle icon', async () => {
      const wrapper = await createWrapper()
      expect(
        wrapper.find('.v-icon[data-icon="question-circle"]').exists()
      ).toBe(true)
    })

    it('displays count with pluralization', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('3 recent open posts')
    })

    it('displays singular for 1 post', async () => {
      mockNotification.value.text = 1
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('1 recent open post')
    })

    it('displays instruction text', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('What happened?')
      expect(wrapper.text()).toContain('My Posts')
    })

    it('displays help list items', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Mark OFFERs as TAKEN')
      expect(wrapper.text()).toContain('Click Withdraw')
      expect(wrapper.text()).toContain('Click Repost')
    })

    it('displays notification ago time', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('abbr.small').text()).toBe('5 hours ago')
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

    it('navigates to /myposts page', async () => {
      const wrapper = await createWrapper()
      await wrapper.find('.clickme').trigger('click')
      expect(mockRouter.push).toHaveBeenCalledWith('/myposts')
    })
  })

  describe('props', () => {
    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 10 })
      expect(wrapper.findComponent(NotificationOpenPosts).props('id')).toBe(10)
    })
  })
})
