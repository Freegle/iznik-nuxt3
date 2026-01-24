import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import NotificationAboutMe from '~/components/NotificationAboutMe.vue'

const { mockNotification, mockNotificationago } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockNotification: ref({
      id: 1,
      text: null,
    }),
    mockNotificationago: ref('just now'),
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

describe('NotificationAboutMe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotification.value = {
      id: 1,
      text: null,
    }
    mockNotificationago.value = 'just now'
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(NotificationAboutMe, {
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
          'b-button': {
            template:
              '<button class="b-button" :class="variant" :to="to" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'to'],
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

    it('displays tell us about yourself header', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.font-weight-bold').text()).toBe(
        'Tell us about yourself!'
      )
    })

    it('displays notification ago time', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('abbr.small').text()).toBe('just now')
    })
  })

  describe('when text is not set', () => {
    beforeEach(() => {
      mockNotification.value = { id: 1, text: null }
    })

    it('shows introduction message', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('You can introduce to other freeglers')
    })

    it('shows Introduce yourself button', async () => {
      const wrapper = await createWrapper()
      const buttons = wrapper.findAll('.b-button')
      const introduceBtn = buttons.find((b) =>
        b.text().includes('Introduce yourself')
      )
      expect(introduceBtn.exists()).toBe(true)
      expect(introduceBtn.classes()).toContain('primary')
    })

    it('shows Give something button', async () => {
      const wrapper = await createWrapper()
      const giveBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Give something'))
      expect(giveBtn.exists()).toBe(true)
      expect(giveBtn.attributes('to')).toBe('/give')
    })

    it('shows Ask for something button', async () => {
      const wrapper = await createWrapper()
      const askBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Ask for something'))
      expect(askBtn.exists()).toBe(true)
      expect(askBtn.attributes('to')).toBe('/find')
    })
  })

  describe('when text is set', () => {
    beforeEach(() => {
      mockNotification.value = { id: 1, text: 'Already introduced' }
    })

    it('hides introduction message and buttons', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('You can introduce')
      expect(wrapper.findAll('.b-button').length).toBe(0)
    })
  })

  describe('showModal emit', () => {
    it('emits showModal when Introduce yourself button is clicked', async () => {
      mockNotification.value = { id: 1, text: null }
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(NotificationAboutMe)

      const introduceBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Introduce yourself'))
      await introduceBtn.trigger('click')

      expect(component.emitted('showModal')).toBeTruthy()
    })
  })

  describe('props', () => {
    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 7 })
      expect(wrapper.findComponent(NotificationAboutMe).props('id')).toBe(7)
    })
  })
})
