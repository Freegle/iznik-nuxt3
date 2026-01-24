import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import ProfileModal from '~/components/ProfileModal.vue'

const { mockModal, mockHide } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockModal: ref(null),
    mockHide: vi.fn(),
  }
})

const mockUserStore = {
  fetch: vi.fn().mockResolvedValue({ id: 1, displayname: 'Test User' }),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: mockHide,
  }),
}))

vi.stubGlobal('defineAsyncComponent', (fn) => ({
  name: 'MockedAsyncComponent',
  template: '<div class="mocked-async-component" />',
}))

describe('ProfileModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(ProfileModal, {
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
          'b-modal': {
            template:
              '<div class="b-modal" :size="size" :scrollable="scrollable"><slot /><slot name="footer" /></div>',
            props: [
              'size',
              'scrollable',
              'hideHeader',
              'bodyClass',
              'contentClass',
            ],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant'],
          },
          ProfileInfo: {
            template: '<div class="profile-info" :data-id="id" />',
            props: ['id'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders b-modal', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('renders modal with large size', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-modal').attributes('size')).toBe('lg')
    })

    it('renders ProfileInfo component with id', async () => {
      const wrapper = await createWrapper({ id: 5 })
      const profileInfo = wrapper.find('.profile-info')
      expect(profileInfo.exists()).toBe(true)
      expect(profileInfo.attributes('data-id')).toBe('5')
    })

    it('renders Close button in footer', async () => {
      const wrapper = await createWrapper()
      const closeBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Close'))
      expect(closeBtn.exists()).toBe(true)
      expect(closeBtn.classes()).toContain('primary')
    })
  })

  describe('props', () => {
    it('has default id of 0', async () => {
      // Don't pass id prop to test the default
      const TestWrapper = defineComponent({
        setup() {
          return () =>
            h(Suspense, null, {
              default: () => h(ProfileModal),
              fallback: () => h('div', 'Loading...'),
            })
        },
      })

      const wrapper = mount(TestWrapper, {
        global: {
          stubs: {
            'b-modal': {
              template:
                '<div class="b-modal"><slot /><slot name="footer" /></div>',
              props: [
                'size',
                'scrollable',
                'hideHeader',
                'bodyClass',
                'contentClass',
              ],
            },
            'b-button': {
              template: '<button class="b-button"><slot /></button>',
              props: ['variant'],
            },
            ProfileInfo: {
              template: '<div class="profile-info" :data-id="id" />',
              props: ['id'],
            },
          },
        },
      })

      await flushPromises()
      const component = wrapper.findComponent(ProfileModal)
      expect(component.props('id')).toBe(0)
    })

    it('accepts id prop', async () => {
      const wrapper = await createWrapper({ id: 42 })
      const component = wrapper.findComponent(ProfileModal)
      expect(component.props('id')).toBe(42)
    })

    it('has default closeOnMessage of false', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(ProfileModal)
      expect(component.props('closeOnMessage')).toBe(false)
    })

    it('accepts closeOnMessage prop', async () => {
      const wrapper = await createWrapper({ closeOnMessage: true })
      const component = wrapper.findComponent(ProfileModal)
      expect(component.props('closeOnMessage')).toBe(true)
    })
  })

  describe('user fetching', () => {
    it('fetches user on mount', async () => {
      await createWrapper({ id: 10 })
      expect(mockUserStore.fetch).toHaveBeenCalledWith(10)
    })
  })

  describe('modal hide', () => {
    it('calls hide when Close button clicked', async () => {
      const wrapper = await createWrapper()
      const closeBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Close'))
      await closeBtn.trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })
})
