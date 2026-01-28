import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import StoryShareModal from '~/components/StoryShareModal.vue'

const mockStory = {
  id: 123,
  headline: 'My Freegle Story',
  story: 'This is my amazing freegle experience...',
  url: 'https://www.ilovefreegle.org/story/123',
}

const { mockModal } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockModal: ref(null),
  }
})

const mockHide = vi.fn()

const mockStoryStore = {
  fetch: vi.fn().mockResolvedValue(mockStory),
  byId: vi.fn().mockReturnValue(mockStory),
}

const mockMobileStore = {
  isApp: false,
}

vi.mock('~/stores/stories', () => ({
  useStoryStore: () => mockStoryStore,
}))

vi.mock('@/stores/mobile', () => ({
  useMobileStore: () => mockMobileStore,
}))

vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: mockHide,
  }),
}))

vi.mock('#app', () => ({
  useNuxtApp: () => ({
    vueApp: {
      use: vi.fn(),
    },
  }),
}))

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('vue-social-sharing', () => ({
  default: {},
}))

describe('StoryShareModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStoryStore.byId.mockReturnValue({ ...mockStory })
    mockStoryStore.fetch.mockResolvedValue({ ...mockStory })
    mockMobileStore.isApp = false
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(StoryShareModal, { id: 123, ...props }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="b-modal" :data-title="title"><slot name="default" /><slot name="footer" /></div>',
            props: ['id', 'scrollable', 'title', 'size', 'noStacking'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
          },
          'b-list-group': {
            template: '<div class="b-list-group"><slot /></div>',
            props: ['horizontal'],
          },
          'b-list-group-item': {
            template: '<div class="b-list-group-item"><slot /></div>',
          },
          ShareNetwork: {
            template:
              '<div class="share-network" :data-network="network" @click="$emit(\'open\')"><slot /></div>',
            props: ['network', 'url', 'title', 'description', 'hashtags'],
            emits: ['open'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="iconStr" />',
            props: ['icon'],
            computed: {
              iconStr() {
                return Array.isArray(this.icon)
                  ? this.icon.join('-')
                  : this.icon
              },
            },
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders modal with story headline in title', async () => {
      const wrapper = await createWrapper()
      const modal = wrapper.find('.b-modal')
      expect(modal.attributes('data-title')).toContain('My Freegle Story')
    })

    it('displays story URL', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('https://www.ilovefreegle.org/story/123')
    })

    it('shows sharing instructions', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('You can share using these buttons')
    })
  })

  describe('social sharing buttons (web)', () => {
    it('renders Facebook share button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-network="facebook"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Facebook')
    })

    it('renders Twitter share button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-network="twitter"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('X')
    })

    it('renders WhatsApp share button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-network="whatsapp"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Whatsapp')
    })

    it('renders Email share button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-network="email"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Email')
    })

    it('renders Copy button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Copy')
    })
  })

  describe('app sharing', () => {
    it('shows Share now button when in app', async () => {
      mockMobileStore.isApp = true
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Share now')
    })

    it('hides social buttons when in app', async () => {
      mockMobileStore.isApp = true
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-list-group').exists()).toBe(false)
    })
  })

  describe('copy functionality', () => {
    it('shows clipboard icon initially', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-icon="clipboard"]').exists()).toBe(true)
    })

    it('shows check icon after copy', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      })

      const wrapper = await createWrapper()
      const copyButton = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Copy'))
      await copyButton.trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-icon="check"]').exists()).toBe(true)
    })
  })

  describe('modal footer', () => {
    it('renders Close button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Close')
    })

    it('calls hide on Close click', async () => {
      const wrapper = await createWrapper()
      const closeButton = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Close'))
      await closeButton.trigger('click')
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('data fetching', () => {
    it('fetches story on mount', async () => {
      await createWrapper({ id: 456 })
      expect(mockStoryStore.fetch).toHaveBeenCalledWith(456, true)
    })

    it('hides modal if fetch fails', async () => {
      mockStoryStore.fetch.mockRejectedValue(new Error('Not found'))
      await createWrapper()
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('share network interactions', () => {
    it('increments bump when share network opened', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(StoryShareModal)
      const initialBump = component.vm.bump

      await wrapper.find('[data-network="facebook"]').trigger('click')

      expect(component.vm.bump).toBe(initialBump + 1)
    })
  })

  describe('props', () => {
    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 789 })
      expect(wrapper.findComponent(StoryShareModal).props('id')).toBe(789)
    })
  })
})
