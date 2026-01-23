import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, defineComponent, h, Suspense, nextTick } from 'vue'

/* Import the component AFTER mocks are set up */
import ModChatPane from '~/modtools/components/ModChatPane.vue'

/*
 * Note: We don't mock #imports here. The vitest.config.mts already aliases
 * #imports to tests/unit/mocks/nuxt-app.js which exports Vue composition API
 * functions (ref, computed, watch, etc.) needed by the component.
 */

/* Mock the setupChatMT composable - must be before component import */
const mockChat = ref(null)

vi.mock('~/modtools/composables/useChatMT', () => ({
  setupChatMT: vi.fn(() => ({
    chat: mockChat,
  })),
}))

/* Mock stores */
const mockChatStore = {
  byChatId: vi.fn(),
  messagesById: vi.fn().mockReturnValue([]),
  fetchChats: vi.fn().mockResolvedValue({}),
  fetchMessages: vi.fn().mockResolvedValue({}),
  listChatsMT: vi.fn().mockResolvedValue({}),
  searchSince: null,
}

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

const mockUserStore = {
  fetch: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

const mockMiscStore = {
  stickyAdRendered: false,
  breakpoint: 'lg',
}

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

const mockAuthStore = {
  user: { id: 1, displayname: 'Test User' },
}

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/composables/useNavbar', () => ({
  navBarHidden: ref(false),
}))

describe('ModChatPane', () => {
  const defaultProps = {
    id: 123,
  }

  /* Store original window.innerHeight */
  let originalInnerHeight

  beforeEach(() => {
    vi.clearAllMocks()

    /* Store original and set default */
    originalInnerHeight = window.innerHeight
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
      configurable: true,
    })

    /* Reset mock store state */
    mockChatStore.byChatId.mockReturnValue(null)
    mockChatStore.messagesById.mockReturnValue([])
    mockMiscStore.stickyAdRendered = false
    mockMiscStore.breakpoint = 'lg'
    mockAuthStore.user = { id: 1, displayname: 'Test User' }
    mockChat.value = null
  })

  afterEach(() => {
    /* Restore original window.innerHeight */
    Object.defineProperty(window, 'innerHeight', {
      value: originalInnerHeight,
      writable: true,
      configurable: true,
    })
  })

  /*
   * Helper to mount component with Suspense wrapper for async setup.
   * ModChatPane uses top-level await which requires Suspense.
   */
  async function mountComponent(props = {}) {
    const TestWrapper = defineComponent({
      components: { ModChatPane },
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(ModChatPane, { ...defaultProps, ...props }),
            fallback: () => h('div', { class: 'loading' }, 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'client-only': {
            template: '<div><slot /></div>',
          },
          ChatNotVisible: {
            template: '<div class="chat-not-visible">Chat not visible</div>',
          },
          ModChatHeader: {
            template: '<div class="chat-header" />',
            methods: {
              collapse: vi.fn(),
            },
          },
          ModChatFooter: {
            template:
              '<div class="chat-footer" @typing="$emit(\'typing\', $event)" @scrollbottom="$emit(\'scrollbottom\')" />',
            emits: ['typing', 'scrollbottom'],
          },
          ChatTypingIndicator: {
            template: '<div class="typing-indicator" />',
            props: ['chatid', 'icon'],
          },
          ChatMessage: {
            template: '<div class="chat-message" />',
            props: ['id', 'chatid', 'pov', 'last', 'prevmessage'],
          },
          'b-img': {
            template: '<img :src="src" :width="width" />',
            props: ['src', 'width'],
          },
        },
        directives: {
          'observe-visibility': {
            mounted: () => {},
            updated: () => {},
          },
        },
      },
    })

    /* Wait for Suspense to resolve - multiple flushes needed for async setup */
    await flushPromises()
    await nextTick()
    await flushPromises()

    return wrapper
  }

  /* Helper to get the ModChatPane component from the wrapper */
  function getModChatPane(wrapper) {
    return wrapper.findComponent(ModChatPane)
  }

  describe('rendering', () => {
    it('renders component inside Suspense wrapper', async () => {
      const wrapper = await mountComponent()
      await flushPromises()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('shows "Please click on a chat" when id is 0', async () => {
      mockAuthStore.user = { id: 1 }
      const wrapper = await mountComponent({ id: 0 })
      await flushPromises()
      expect(wrapper.text()).toContain(
        'Please click on a chat in the left pane'
      )
    })

    it('renders chat holder when user is logged in and chat id provided', async () => {
      mockChatStore.byChatId.mockReturnValue({
        id: 123,
        user1id: 456,
        icon: '/icon.png',
      })
      mockChat.value = {
        id: 123,
        user1id: 456,
        icon: '/icon.png',
      }

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('.chatHolder').exists()).toBe(true)
    })

    it('shows ChatNotVisible when chat is not accessible', async () => {
      mockChatStore.byChatId.mockReturnValue(null)
      mockChat.value = { id: 123 }

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('.chat-not-visible').exists()).toBe(true)
    })

    it('shows loader when chat is busy and no messages', async () => {
      mockChatStore.byChatId.mockReturnValue({
        id: 123,
        user1id: 456,
      })
      mockChat.value = {
        id: 123,
        user1id: 456,
      }
      mockChatStore.messagesById.mockReturnValue([])

      const wrapper = await mountComponent()
      await flushPromises()

      /* Set chatBusy to true on the component */
      const pane = getModChatPane(wrapper)
      pane.vm.chatBusy = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('img[src="/loader.gif"]').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts id prop', async () => {
      const wrapper = await mountComponent({ id: 789 })
      await flushPromises()
      const pane = getModChatPane(wrapper)
      expect(pane.props('id')).toBe(789)
    })

    it('requires id prop as Number', async () => {
      const wrapper = await mountComponent({ id: 456 })
      await flushPromises()
      const pane = getModChatPane(wrapper)
      expect(typeof pane.props('id')).toBe('number')
    })
  })

  describe('computed properties', () => {
    describe('stickyAdRendered', () => {
      it('returns false when no sticky ad', async () => {
        mockMiscStore.stickyAdRendered = false
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)
        expect(pane.vm.stickyAdRendered).toBe(false)
      })

      it('returns true when sticky ad is rendered', async () => {
        mockMiscStore.stickyAdRendered = true
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)
        expect(pane.vm.stickyAdRendered).toBe(true)
      })
    })

    describe('chatmessages', () => {
      it('returns empty array when no messages', async () => {
        mockChatStore.messagesById.mockReturnValue([])
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)
        expect(pane.vm.chatmessages).toEqual([])
      })

      it('returns reversed messages from store', async () => {
        const messages = [
          { id: 1, message: 'First' },
          { id: 2, message: 'Second' },
          { id: 3, message: 'Third' },
        ]
        mockChatStore.messagesById.mockReturnValue(messages)

        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)

        expect(pane.vm.chatmessages).toEqual([
          { id: 3, message: 'Third' },
          { id: 2, message: 'Second' },
          { id: 1, message: 'First' },
        ])
      })

      it('returns empty array when messages is null', async () => {
        mockChatStore.messagesById.mockReturnValue(null)
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)
        expect(pane.vm.chatmessages).toEqual([])
      })
    })

    describe('notVisible', () => {
      it('returns false when chat exists in store', async () => {
        mockChatStore.byChatId.mockReturnValue({ id: 123 })
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)
        expect(pane.vm.notVisible).toBe(false)
      })

      it('returns true when chat does not exist in store', async () => {
        mockChatStore.byChatId.mockReturnValue(null)
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)
        expect(pane.vm.notVisible).toBe(true)
      })

      it('returns false when id is 0', async () => {
        const wrapper = await mountComponent({ id: 0 })
        await flushPromises()
        const pane = getModChatPane(wrapper)
        expect(pane.vm.notVisible).toBe(false)
      })
    })

    describe('opacity', () => {
      it('returns 0 when not loaded', async () => {
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)
        pane.vm.loaded = false
        await wrapper.vm.$nextTick()
        expect(pane.vm.opacity).toBe(0)
      })

      it('returns 1 when loaded', async () => {
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)
        pane.vm.loaded = true
        await wrapper.vm.$nextTick()
        expect(pane.vm.opacity).toBe(1)
      })
    })

    describe('me', () => {
      it('returns user from auth store', async () => {
        mockAuthStore.user = { id: 999, displayname: 'Current User' }
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)
        expect(pane.vm.me).toEqual({ id: 999, displayname: 'Current User' })
      })

      it('returns undefined when user is not logged in', async () => {
        mockAuthStore.user = undefined
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)
        expect(pane.vm.me).toBeUndefined()
      })
    })
  })

  describe('methods', () => {
    describe('typing', () => {
      it('collapses header on small screens when typing starts', async () => {
        mockMiscStore.breakpoint = 'xs'
        mockChatStore.byChatId.mockReturnValue({ id: 123, user1id: 456 })
        mockChat.value = { id: 123, user1id: 456 }

        const wrapper = await mountComponent()
        await flushPromises()

        /* Create a mock ref for chatheader */
        const pane = getModChatPane(wrapper)
        const mockCollapse = vi.fn()
        pane.vm.chatheader = { collapse: mockCollapse }

        pane.vm.typing(true)

        expect(mockCollapse).toHaveBeenCalledWith(true)
      })

      it('expands header when typing stops on small screens', async () => {
        mockMiscStore.breakpoint = 'sm'
        mockChatStore.byChatId.mockReturnValue({ id: 123, user1id: 456 })
        mockChat.value = { id: 123, user1id: 456 }

        const wrapper = await mountComponent()
        await flushPromises()

        const pane = getModChatPane(wrapper)
        const mockCollapse = vi.fn()
        pane.vm.chatheader = { collapse: mockCollapse }

        pane.vm.typing(false)

        expect(mockCollapse).toHaveBeenCalledWith(false)
      })

      it('does not collapse header on large screens', async () => {
        mockMiscStore.breakpoint = 'lg'
        mockChatStore.byChatId.mockReturnValue({ id: 123, user1id: 456 })
        mockChat.value = { id: 123, user1id: 456 }

        const wrapper = await mountComponent()
        await flushPromises()

        const pane = getModChatPane(wrapper)
        const mockCollapse = vi.fn()
        pane.vm.chatheader = { collapse: mockCollapse }

        pane.vm.typing(true)

        expect(mockCollapse).not.toHaveBeenCalled()
      })

      it('handles missing chatheader gracefully', async () => {
        mockMiscStore.breakpoint = 'xs'
        mockChatStore.byChatId.mockReturnValue({ id: 123, user1id: 456 })
        mockChat.value = { id: 123, user1id: 456 }

        const wrapper = await mountComponent()
        await flushPromises()

        const pane = getModChatPane(wrapper)
        pane.vm.chatheader = null

        /* Should not throw */
        expect(() => pane.vm.typing(true)).not.toThrow()
      })
    })

    describe('topChanged', () => {
      it('sets topVisible when visibility changes', async () => {
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)

        pane.vm.topChanged(true)
        expect(pane.vm.topVisible).toBe(true)

        pane.vm.topChanged(false)
        expect(pane.vm.topVisible).toBe(false)
      })

      it('triggers scroll check when top becomes visible', async () => {
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)

        pane.vm.scrollTimer = null
        pane.vm.topChanged(true)

        /* Should have set a timer */
        expect(pane.vm.scrollTimer).not.toBeNull()
      })

      it('does not trigger scroll check if timer already exists', async () => {
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)

        const existingTimer = setTimeout(() => {}, 1000)
        pane.vm.scrollTimer = existingTimer
        const timerBefore = pane.vm.scrollTimer
        pane.vm.topChanged(true)

        /* Timer should remain unchanged - compare the internal ID */
        expect(pane.vm.scrollTimer).toEqual(timerBefore)
        clearTimeout(existingTimer)
      })
    })

    describe('resize', () => {
      it('updates windowHeight on resize', async () => {
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)

        Object.defineProperty(window, 'innerHeight', {
          value: 600,
          writable: true,
          configurable: true,
        })

        pane.vm.resize()

        expect(pane.vm.windowHeight).toBe(600)
      })
    })

    describe('checkScroll', () => {
      it('increases messagesToShow when top is visible', async () => {
        mockChatStore.messagesById.mockReturnValue([
          { id: 1 },
          { id: 2 },
          { id: 3 },
          { id: 4 },
          { id: 5 },
          { id: 6 },
          { id: 7 },
          { id: 8 },
          { id: 9 },
          { id: 10 },
          { id: 11 },
          { id: 12 },
          { id: 13 },
          { id: 14 },
          { id: 15 },
        ])

        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)

        pane.vm.topVisible = true
        pane.vm.messagesToShow = 5
        pane.vm.scrollTimer = null

        pane.vm.checkScroll()

        /* Should increase by 10 (but not exceed total) */
        expect(pane.vm.messagesToShow).toBe(15)
      })

      it('sets loaded to true when all messages shown', async () => {
        mockChatStore.messagesById.mockReturnValue([{ id: 1 }, { id: 2 }])

        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)

        pane.vm.topVisible = true
        pane.vm.messagesToShow = 2
        pane.vm.loaded = false
        pane.vm.scrollTimer = null

        pane.vm.checkScroll()

        expect(pane.vm.loaded).toBe(true)
      })

      it('clears scroll timer', async () => {
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)

        pane.vm.scrollTimer = 123

        pane.vm.checkScroll()

        /* The function sets scrollTimer to null at the start */
        /* Then may set a new one if needed */
        /* But it should have cleared the old value */
        expect(pane.vm.scrollTimer).not.toBe(123)
      })
    })
  })

  describe('empty state', () => {
    it('shows prompt when no chat id is provided', async () => {
      mockAuthStore.user = { id: 1 }
      const wrapper = await mountComponent({ id: 0 })
      await flushPromises()

      expect(wrapper.text()).toContain(
        'Please click on a chat in the left pane'
      )
    })

    it('has correct classes for empty state', async () => {
      mockAuthStore.user = { id: 1 }
      const wrapper = await mountComponent({ id: 0 })
      await flushPromises()

      const prompt = wrapper.find('p.text-center')
      expect(prompt.exists()).toBe(true)
      expect(prompt.classes()).toContain('text-info')
      expect(prompt.classes()).toContain('font-weight-bold')
    })
  })

  describe('chat content rendering', () => {
    it('renders chat messages when available', async () => {
      const messages = [
        { id: 1, chatid: 123, message: 'Hello' },
        { id: 2, chatid: 123, message: 'World' },
      ]
      mockChatStore.messagesById.mockReturnValue(messages)
      mockChatStore.byChatId.mockReturnValue({
        id: 123,
        user1id: 456,
        icon: '/icon.png',
      })
      mockChat.value = {
        id: 123,
        user1id: 456,
        icon: '/icon.png',
      }

      const wrapper = await mountComponent()
      await flushPromises()
      const pane = getModChatPane(wrapper)

      /* Set messagesToShow to display messages */
      pane.vm.messagesToShow = 2
      pane.vm.loaded = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.chatContent').exists()).toBe(true)
    })

    it('renders ChatTypingIndicator with chat', async () => {
      mockChatStore.messagesById.mockReturnValue([{ id: 1, chatid: 123 }])
      mockChatStore.byChatId.mockReturnValue({
        id: 123,
        user1id: 456,
        icon: '/test-icon.png',
      })
      mockChat.value = {
        id: 123,
        user1id: 456,
        icon: '/test-icon.png',
      }

      const wrapper = await mountComponent()
      await flushPromises()
      const pane = getModChatPane(wrapper)

      pane.vm.messagesToShow = 1
      await wrapper.vm.$nextTick()

      const typingIndicator = wrapper.find('.typing-indicator')
      expect(typingIndicator.exists()).toBe(true)
    })

    it('renders ModChatHeader and ModChatFooter', async () => {
      mockChatStore.byChatId.mockReturnValue({
        id: 123,
        user1id: 456,
      })
      mockChat.value = { id: 123, user1id: 456 }

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('.chat-header').exists()).toBe(true)
      expect(wrapper.find('.chat-footer').exists()).toBe(true)
    })
  })

  describe('stickyAdRendered class', () => {
    it('adds stickyAdRendered class when ad is shown on empty state', async () => {
      mockMiscStore.stickyAdRendered = true
      mockAuthStore.user = { id: 1 }

      const wrapper = await mountComponent({ id: 0 })
      await flushPromises()

      const prompt = wrapper.find('p.chatHolder')
      expect(prompt.exists()).toBe(true)
      expect(prompt.classes()).toContain('stickyAdRendered')
    })

    it('does not add stickyAdRendered class when no ad on empty state', async () => {
      mockMiscStore.stickyAdRendered = false
      mockAuthStore.user = { id: 1 }

      const wrapper = await mountComponent({ id: 0 })
      await flushPromises()

      const prompt = wrapper.find('p.chatHolder')
      expect(prompt.exists()).toBe(true)
      expect(prompt.classes()).not.toContain('stickyAdRendered')
    })

    it('adds stickyAdRendered class to chatHolder div when ad is shown', async () => {
      mockMiscStore.stickyAdRendered = true
      mockChatStore.byChatId.mockReturnValue({
        id: 123,
        user1id: 456,
      })
      mockChat.value = { id: 123, user1id: 456 }

      const wrapper = await mountComponent()
      await flushPromises()

      const chatHolder = wrapper.find('div.chatHolder')
      expect(chatHolder.exists()).toBe(true)
      expect(chatHolder.classes()).toContain('stickyAdRendered')
    })
  })

  describe('lifecycle hooks', () => {
    it('sets up scroll timer on mount', async () => {
      const wrapper = await mountComponent()
      await flushPromises()
      const pane = getModChatPane(wrapper)

      expect(pane.vm.scrollTimer).not.toBeNull()
    })
  })

  describe('store interactions', () => {
    it('fetches chats on initialization when id is provided', async () => {
      mockChatStore.byChatId.mockReturnValue(null)
      mockChat.value = null

      await mountComponent({ id: 123 })
      await flushPromises()

      /* Should have called listChatsMT since chat was not found */
      expect(mockChatStore.listChatsMT).toHaveBeenCalled()
    })

    it('fetches messages when chat is found', async () => {
      mockChatStore.byChatId.mockReturnValue({
        id: 123,
        user1id: 456,
      })
      mockChat.value = {
        id: 123,
        user1id: 456,
      }

      await mountComponent({ id: 123 })
      await flushPromises()

      expect(mockChatStore.fetchMessages).toHaveBeenCalledWith(123)
    })

    it('fetches user when chat has user1id', async () => {
      mockChatStore.byChatId.mockReturnValue({
        id: 123,
        user1id: 789,
      })
      mockChat.value = {
        id: 123,
        user1id: 789,
      }

      await mountComponent({ id: 123 })
      await flushPromises()

      expect(mockUserStore.fetch).toHaveBeenCalledWith(789)
    })
  })
})
