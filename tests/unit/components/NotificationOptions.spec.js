import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import NotificationOptions from '~/components/NotificationOptions.vue'

const { mockNotifications } = vi.hoisted(() => {
  return {
    mockNotifications: [
      { id: 1, text: 'Notification 1', seen: false },
      { id: 2, text: 'Notification 2', seen: false },
      { id: 3, text: 'Notification 3', seen: true },
    ],
  }
})

const mockNotificationStore = {
  list: mockNotifications,
  count: ref(2),
  fetchList: vi.fn().mockResolvedValue(undefined),
  allSeen: vi.fn().mockResolvedValue(undefined),
}

vi.mock('~/stores/notification', () => ({
  useNotificationStore: () => mockNotificationStore,
}))

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    storeToRefs: (store) => ({ count: store.count }),
  }
})

describe('NotificationOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotificationStore.list = mockNotifications
    mockNotificationStore.count.value = 2
  })

  function createWrapper(props = {}) {
    return mount(NotificationOptions, {
      props: {
        distance: 100,
        ...props,
      },
      global: {
        stubs: {
          'b-dropdown': {
            template:
              '<div class="b-dropdown" :class="{ show: modelValue }"><slot name="button-content" /><slot /></div>',
            props: [
              'modelValue',
              'variant',
              'toggleClass',
              'menuClass',
              'lazy',
              'right',
              'noCaret',
              'ariaLabel',
            ],
            emits: ['shown', 'update:modelValue'],
          },
          'b-dropdown-item': {
            template: '<div class="b-dropdown-item"><slot /></div>',
            props: ['linkClass'],
          },
          'b-dropdown-divider': {
            template: '<hr class="b-dropdown-divider" />',
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
          },
          'b-badge': {
            template: '<span class="b-badge" :class="variant"><slot /></span>',
            props: ['variant'],
          },
          'b-img': {
            template: '<img class="b-img" :src="src" />',
            props: ['src', 'lazy', 'alt', 'width'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          NotificationOne: {
            template: '<div class="notification-one" :data-id="id" />',
            props: ['id'],
            emits: ['show-modal'],
          },
          InfiniteLoading: {
            template:
              '<div class="infinite-loading"><slot name="spinner" /></div>',
            props: ['distance', 'forceUseInfiniteWrapper'],
            emits: ['infinite'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders dropdown', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-dropdown').exists()).toBe(true)
    })

    it('shows bell icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="bell"]').exists()).toBe(true)
    })

    it('shows unread count badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-badge').exists()).toBe(true)
      expect(wrapper.find('.b-badge').text()).toBe('2')
    })

    it('hides badge when no unread notifications', () => {
      mockNotificationStore.count.value = 0
      const wrapper = createWrapper()
      expect(wrapper.find('.b-badge').exists()).toBe(false)
    })
  })

  describe('notifications text', () => {
    it('shows "Notifications" text on large screens', () => {
      const wrapper = createWrapper({ smallScreen: false })
      expect(wrapper.text()).toContain('Notifications')
    })

    it('hides "Notifications" text on small screens', () => {
      const wrapper = createWrapper({ smallScreen: true })
      expect(wrapper.find('.nav-item__text').exists()).toBe(false)
    })
  })

  describe('notification list', () => {
    it('renders notification items', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.notification-one').length).toBe(3)
    })

    it('shows Mark all read button when notifications exist', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Mark all read')
    })
  })

  describe('mark all read', () => {
    it('calls allSeen on Mark all read click', async () => {
      const wrapper = createWrapper()
      const markAllBtn = wrapper.find('.b-button')
      await markAllBtn.trigger('click')
      expect(mockNotificationStore.allSeen).toHaveBeenCalled()
    })
  })

  describe('infinite loading', () => {
    it('renders infinite loading component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.infinite-loading').exists()).toBe(true)
    })

    it('shows loading spinner', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.spinner-border').exists()).toBe(true)
    })
  })

  describe('events', () => {
    it('emits showAboutMe when notification emits show-modal', async () => {
      const wrapper = createWrapper()
      const notification = wrapper.findComponent('.notification-one')
      await notification.vm.$emit('show-modal')
      expect(wrapper.emitted('showAboutMe')).toBeTruthy()
    })

    it('emits update:unreadNotificationCount on count change', async () => {
      const wrapper = createWrapper()
      mockNotificationStore.count.value = 5
      await flushPromises()
      expect(wrapper.emitted('update:unreadNotificationCount')).toBeTruthy()
    })
  })

  describe('dropdown shown', () => {
    it('fetches list when dropdown shown', async () => {
      const wrapper = createWrapper()
      const dropdown = wrapper.findComponent('.b-dropdown')
      await dropdown.vm.$emit('shown')
      expect(mockNotificationStore.fetchList).toHaveBeenCalled()
    })
  })

  describe('styling', () => {
    it('applies notification-list class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.notification-list').exists()).toBe(true)
    })

    it('applies topstack class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.topstack').exists()).toBe(true)
    })
  })

  describe('empty state', () => {
    it('handles empty notifications list', () => {
      mockNotificationStore.list = []
      const wrapper = createWrapper()
      expect(wrapper.findAll('.notification-one').length).toBe(0)
    })
  })

  describe('props', () => {
    it('passes distance to infinite loading', () => {
      const wrapper = createWrapper({ distance: 200 })
      const infiniteLoading = wrapper.findComponent('.infinite-loading')
      expect(infiniteLoading.props('distance')).toBe(200)
    })

    it('applies transparent variant on small screen', () => {
      const wrapper = createWrapper({ smallScreen: true })
      const dropdown = wrapper.findComponent('.b-dropdown')
      expect(dropdown.props('variant')).toBe('transparent')
    })
  })
})
