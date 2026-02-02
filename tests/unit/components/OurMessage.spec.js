import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import OurMessage from '~/components/OurMessage.vue'

const { mockMessage } = vi.hoisted(() => {
  return {
    mockMessage: {
      id: 1,
      subject: 'OFFER: Sofa',
      type: 'Offer',
      textbody: 'Nice sofa, free to collect.',
      unseen: true,
      successful: false,
      groups: [{ groupid: 100 }],
    },
  }
})

const mockMessageStore = {
  fetch: vi.fn().mockResolvedValue(mockMessage),
  byId: vi.fn().mockReturnValue(mockMessage),
  view: vi.fn().mockResolvedValue(undefined),
}

const mockGroupStore = {
  get: vi.fn().mockReturnValue(null),
  fetch: vi.fn().mockResolvedValue({ id: 100, nameshort: 'TestGroup' }),
}

const mockAuthStore = {
  user: { id: 1 },
}

const mockMiscStore = {
  breakpoint: 'lg',
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('~/composables/useClientLog', () => ({
  action: vi.fn(),
}))

describe('OurMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessageStore.fetch.mockResolvedValue(mockMessage)
    mockMessageStore.byId.mockReturnValue(mockMessage)
    mockAuthStore.user = { id: 1 }
    mockMiscStore.breakpoint = 'lg'
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(OurMessage, { id: 1, recordView: true, ...props }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        directives: {
          'observe-visibility': {},
        },
        stubs: {
          MessageExpanded: {
            template: '<div class="message-expanded" />',
            props: [
              'id',
              'replyable',
              'hideClose',
              'actions',
              'fullscreenOverlay',
            ],
            emits: ['close'],
          },
          MessageSummary: {
            template:
              '<div class="message-summary" @click="$emit(\'expand\')"><slot /></div>',
            props: ['id', 'preload'],
            emits: ['expand'],
          },
          MessageModal: {
            template:
              '<div v-if="showImages !== undefined" class="message-modal" />',
            props: ['id', 'showImages', 'replyable', 'hideClose', 'actions'],
            emits: ['hidden', 'update:showImages'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders message container', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('#msg-1').exists()).toBe(true)
    })

    it('renders schema.org Product markup', async () => {
      const wrapper = await createWrapper()
      expect(
        wrapper.find('[itemtype="http://schema.org/Product"]').exists()
      ).toBe(true)
    })

    it('renders schema.org Offer markup', async () => {
      const wrapper = await createWrapper()
      expect(
        wrapper.find('[itemtype="http://schema.org/Offer"]').exists()
      ).toBe(true)
    })

    it('shows MessageSummary when not startExpanded', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.message-summary').exists()).toBe(true)
    })

    it('shows MessageExpanded when startExpanded is true', async () => {
      const wrapper = await createWrapper({ startExpanded: true })
      expect(wrapper.find('.message-expanded').exists()).toBe(true)
    })
  })

  describe('expand behavior', () => {
    it('expands on desktop (lg breakpoint)', async () => {
      mockMiscStore.breakpoint = 'lg'
      const wrapper = await createWrapper()
      await wrapper.find('.message-summary').trigger('click')
      await flushPromises()
      expect(wrapper.find('.message-modal').exists()).toBe(true)
    })

    it('shows mobile expanded on mobile (xs breakpoint)', async () => {
      mockMiscStore.breakpoint = 'xs'
      const wrapper = await createWrapper()
      await wrapper.find('.message-summary').trigger('click')
      await flushPromises()
      expect(wrapper.findAll('.message-expanded').length).toBeGreaterThan(0)
    })

    it('shows mobile expanded on sm breakpoint', async () => {
      mockMiscStore.breakpoint = 'sm'
      const wrapper = await createWrapper()
      await wrapper.find('.message-summary').trigger('click')
      await flushPromises()
      expect(wrapper.findAll('.message-expanded').length).toBeGreaterThan(0)
    })

    it('shows mobile expanded on md breakpoint', async () => {
      mockMiscStore.breakpoint = 'md'
      const wrapper = await createWrapper()
      await wrapper.find('.message-summary').trigger('click')
      await flushPromises()
      expect(wrapper.findAll('.message-expanded').length).toBeGreaterThan(0)
    })

    it('does not expand when message is successful', async () => {
      mockMessageStore.byId.mockReturnValue({
        ...mockMessage,
        successful: true,
      })
      const wrapper = await createWrapper()
      await wrapper.find('.message-summary').trigger('click')
      await flushPromises()
      expect(wrapper.find('.message-modal').exists()).toBe(false)
    })
  })

  describe('view tracking', () => {
    it('calls view when recordView is true and user logged in', async () => {
      const wrapper = await createWrapper({ recordView: true })
      await wrapper.find('.message-summary').trigger('click')
      await flushPromises()
      expect(mockMessageStore.view).toHaveBeenCalledWith(1)
    })

    it('does not call view when recordView is false', async () => {
      const wrapper = await createWrapper({ recordView: false })
      await wrapper.find('.message-summary').trigger('click')
      await flushPromises()
      expect(mockMessageStore.view).not.toHaveBeenCalled()
    })

    it('does not call view when not logged in', async () => {
      mockAuthStore.user = null
      const wrapper = await createWrapper({ recordView: true })
      await wrapper.find('.message-summary').trigger('click')
      await flushPromises()
      expect(mockMessageStore.view).not.toHaveBeenCalled()
    })
  })

  describe('data fetching', () => {
    it('fetches message on mount', async () => {
      await createWrapper()
      expect(mockMessageStore.fetch).toHaveBeenCalledWith(1)
    })

    it('fetches group data', async () => {
      await createWrapper()
      expect(mockGroupStore.fetch).toHaveBeenCalledWith(100)
    })

    it('emits notFound when message fetch fails', async () => {
      mockMessageStore.fetch.mockRejectedValue(new Error('Not found'))
      const wrapper = await createWrapper()
      const innerComponent = wrapper.findComponent(OurMessage)
      expect(innerComponent.emitted('notFound')).toBeTruthy()
    })

    it('emits notFound when message data is null', async () => {
      mockMessageStore.fetch.mockResolvedValue(null)
      const wrapper = await createWrapper()
      const innerComponent = wrapper.findComponent(OurMessage)
      expect(innerComponent.emitted('notFound')).toBeTruthy()
    })
  })

  describe('props', () => {
    it('passes replyable prop to children', async () => {
      const wrapper = await createWrapper({
        replyable: false,
        startExpanded: true,
      })
      const expanded = wrapper.findComponent('.message-expanded')
      expect(expanded.props('replyable')).toBe(false)
    })

    it('passes hideClose prop to children', async () => {
      const wrapper = await createWrapper({
        hideClose: true,
        startExpanded: true,
      })
      const expanded = wrapper.findComponent('.message-expanded')
      expect(expanded.props('hideClose')).toBe(true)
    })

    it('passes actions prop to children', async () => {
      const wrapper = await createWrapper({
        actions: false,
        startExpanded: true,
      })
      const expanded = wrapper.findComponent('.message-expanded')
      expect(expanded.props('actions')).toBe(false)
    })

    it('passes preload prop to MessageSummary', async () => {
      const wrapper = await createWrapper({ preload: true })
      const summary = wrapper.findComponent('.message-summary')
      expect(summary.props('preload')).toBe(true)
    })
  })

  describe('events', () => {
    it('emits view event when viewed', async () => {
      const wrapper = await createWrapper({ recordView: true })
      await wrapper.find('.message-summary').trigger('click')
      await flushPromises()
      const innerComponent = wrapper.findComponent(OurMessage)
      expect(innerComponent.emitted('view')).toBeTruthy()
    })
  })

  describe('when message not found', () => {
    it('does not render content when message is null', async () => {
      mockMessageStore.byId.mockReturnValue(null)
      mockMessageStore.fetch.mockResolvedValue(null)
      const wrapper = await createWrapper()
      expect(wrapper.find('.message-summary').exists()).toBe(false)
    })
  })
})
