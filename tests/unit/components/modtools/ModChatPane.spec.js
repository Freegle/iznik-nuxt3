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
    it('renders component and shows appropriate content based on state', async () => {
      /* Test 1: Basic rendering */
      let wrapper = await mountComponent()
      await flushPromises()
      expect(wrapper.find('div').exists()).toBe(true)

      /* Test 2: Shows "Please click on a chat" when id is 0 */
      mockAuthStore.user = { id: 1 }
      wrapper = await mountComponent({ id: 0 })
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
    it('requires id prop as Number', async () => {
      const wrapper = await mountComponent({ id: 456 })
      await flushPromises()
      const pane = getModChatPane(wrapper)
      expect(typeof pane.props('id')).toBe('number')
    })
  })

  describe('computed properties', () => {
    it.each([
      [false, false],
      [true, true],
    ])(
      'stickyAdRendered returns %s when store value is %s',
      async (expected, storeValue) => {
        mockMiscStore.stickyAdRendered = storeValue
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)
        expect(pane.vm.stickyAdRendered).toBe(expected)
      }
    )

    describe('chatmessages', () => {
      it.each([
        ['empty array', [], []],
        ['null', null, []],
      ])(
        'returns empty array when messages is %s',
        async (_desc, storeValue, expected) => {
          mockChatStore.messagesById.mockReturnValue(storeValue)
          const wrapper = await mountComponent()
          await flushPromises()
          const pane = getModChatPane(wrapper)
          expect(pane.vm.chatmessages).toEqual(expected)
        }
      )

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
    })

    it.each([
      ['chat exists in store', { id: 123 }, 123, false],
      ['chat does not exist in store', null, 123, true],
      ['id is 0', null, 0, false],
    ])(
      'notVisible returns correct value when %s',
      async (_desc, chatValue, id, expected) => {
        mockChatStore.byChatId.mockReturnValue(chatValue)
        const wrapper = await mountComponent({ id })
        await flushPromises()
        const pane = getModChatPane(wrapper)
        expect(pane.vm.notVisible).toBe(expected)
      }
    )

    it.each([
      [false, 0],
      [true, 1],
    ])('opacity returns %s when loaded is %s', async (loaded, expected) => {
      const wrapper = await mountComponent()
      await flushPromises()
      const pane = getModChatPane(wrapper)
      pane.vm.loaded = loaded
      await wrapper.vm.$nextTick()
      expect(pane.vm.opacity).toBe(expected)
    })

    it.each([
      [
        { id: 999, displayname: 'Current User' },
        { id: 999, displayname: 'Current User' },
      ],
      [undefined, undefined],
    ])('me returns %s from auth store', async (authUser, expected) => {
      mockAuthStore.user = authUser
      const wrapper = await mountComponent()
      await flushPromises()
      const pane = getModChatPane(wrapper)
      if (expected === undefined) {
        expect(pane.vm.me).toBeUndefined()
      } else {
        expect(pane.vm.me).toEqual(expected)
      }
    })
  })

  describe('methods', () => {
    describe('typing', () => {
      it.each([
        ['xs', true, true],
        ['sm', false, false],
      ])(
        'on %s screen, typing(%s) calls collapse(%s)',
        async (breakpoint, typingState, expectedCollapse) => {
          mockMiscStore.breakpoint = breakpoint
          mockChatStore.byChatId.mockReturnValue({ id: 123, user1id: 456 })
          mockChat.value = { id: 123, user1id: 456 }

          const wrapper = await mountComponent()
          await flushPromises()

          const pane = getModChatPane(wrapper)
          const mockCollapse = vi.fn()
          pane.vm.chatheader = { collapse: mockCollapse }

          pane.vm.typing(typingState)

          expect(mockCollapse).toHaveBeenCalledWith(expectedCollapse)
        }
      )

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
      it('sets topVisible and triggers scroll check based on visibility', async () => {
        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)

        /* Test visibility true - sets topVisible and triggers scroll */
        pane.vm.scrollTimer = null
        pane.vm.topChanged(true)
        expect(pane.vm.topVisible).toBe(true)
        expect(pane.vm.scrollTimer).not.toBeNull()

        /* Test visibility false - only sets topVisible */
        pane.vm.topChanged(false)
        expect(pane.vm.topVisible).toBe(false)
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
      it('increases messagesToShow when top is visible, sets loaded when all shown, and clears timer', async () => {
        /* Test with many messages - increases count */
        mockChatStore.messagesById.mockReturnValue(
          Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }))
        )

        const wrapper = await mountComponent()
        await flushPromises()
        const pane = getModChatPane(wrapper)

        /* Test timer clearing */
        pane.vm.scrollTimer = 123
        pane.vm.topVisible = true
        pane.vm.messagesToShow = 5

        pane.vm.checkScroll()

        /* Should increase by 10 (but not exceed total) */
        expect(pane.vm.messagesToShow).toBe(15)
        /* Timer should have been cleared and reset */
        expect(pane.vm.scrollTimer).not.toBe(123)

        /* Test loaded is set to true when all messages shown */
        pane.vm.messagesToShow = 15
        pane.vm.loaded = false
        pane.vm.scrollTimer = null

        pane.vm.checkScroll()

        expect(pane.vm.loaded).toBe(true)
      })
    })
  })

  describe('empty state', () => {
    it('shows prompt with correct styling when no chat id is provided', async () => {
      mockAuthStore.user = { id: 1 }
      const wrapper = await mountComponent({ id: 0 })
      await flushPromises()

      expect(wrapper.text()).toContain(
        'Please click on a chat in the left pane'
      )

      const prompt = wrapper.find('p.text-center')
      expect(prompt.exists()).toBe(true)
      expect(prompt.classes()).toContain('text-info')
      expect(prompt.classes()).toContain('font-weight-bold')
    })
  })

  describe('chat content rendering', () => {
    it('renders chat content, typing indicator, header and footer when chat is available', async () => {
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

      /* Check all chat content elements */
      expect(wrapper.find('.chatContent').exists()).toBe(true)
      expect(wrapper.find('.typing-indicator').exists()).toBe(true)
      expect(wrapper.find('.chat-header').exists()).toBe(true)
      expect(wrapper.find('.chat-footer').exists()).toBe(true)
    })
  })

  describe('stickyAdRendered class', () => {
    it.each([
      ['empty state (p element)', true, 0, 'p.chatHolder', true],
      ['empty state (p element)', false, 0, 'p.chatHolder', false],
    ])(
      'on %s with ad=%s, stickyAdRendered class presence is %s',
      async (_desc, adRendered, chatId, selector, expectClass) => {
        mockMiscStore.stickyAdRendered = adRendered
        mockAuthStore.user = { id: 1 }

        const wrapper = await mountComponent({ id: chatId })
        await flushPromises()

        const element = wrapper.find(selector)
        expect(element.exists()).toBe(true)
        if (expectClass) {
          expect(element.classes()).toContain('stickyAdRendered')
        } else {
          expect(element.classes()).not.toContain('stickyAdRendered')
        }
      }
    )

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
    it('fetches chats on initialization when id is provided and chat not found', async () => {
      mockChatStore.byChatId.mockReturnValue(null)
      mockChat.value = null

      await mountComponent({ id: 123 })
      await flushPromises()

      /* Should have called listChatsMT since chat was not found */
      expect(mockChatStore.listChatsMT).toHaveBeenCalled()
    })

    it('fetches messages and user when chat is found', async () => {
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

      expect(mockChatStore.fetchMessages).toHaveBeenCalledWith(123)
      expect(mockUserStore.fetch).toHaveBeenCalledWith(789)
    })
  })
})
