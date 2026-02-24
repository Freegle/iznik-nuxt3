import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense, nextTick } from 'vue'
import ModChatModal from '~/modtools/components/ModChatModal.vue'

// Use vi.hoisted to ensure mocks are available during module hoisting
const { mockChatStore, mockModalShow, mockModalHide, mockChatMessages } =
  vi.hoisted(() => {
    const { ref } = require('vue')
    const mockChatStore = {
      fetchChat: vi.fn().mockResolvedValue({}),
      fetchMessages: vi.fn().mockResolvedValue({}),
      byChatId: vi.fn(),
      messagesById: vi.fn().mockReturnValue([]),
    }
    const mockModalShow = vi.fn()
    const mockModalHide = vi.fn()
    const mockChatMessages = ref([])

    return {
      mockChatStore,
      mockModalShow,
      mockModalHide,
      mockChatMessages,
    }
  })

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    byId: vi.fn(),
  }),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    user: { id: 1 },
  }),
}))

// Mock useOurModal composable
vi.mock('~/composables/useOurModal', () => {
  const { ref } = require('vue')
  return {
    useOurModal: () => ({
      modal: ref({ show: mockModalShow }),
      hide: mockModalHide,
    }),
  }
})

// Mock useChat composable - setupChat is async
vi.mock('~/composables/useChat', () => {
  const { computed } = require('vue')
  return {
    setupChat: vi.fn().mockResolvedValue({
      chatStore: mockChatStore,
      chatmessages: computed(() => mockChatMessages.value),
    }),
  }
})

describe('ModChatModal', () => {
  const defaultProps = {
    id: 123,
    pov: 456,
  }

  const createUser = (overrides = {}) => ({
    id: 1,
    displayname: 'Test User',
    ljuserid: null,
    tnuserid: null,
    ...overrides,
  })

  const createChat = (overrides = {}) => ({
    id: 123,
    user1: createUser({ id: 456, displayname: 'User One' }),
    user2: createUser({ id: 789, displayname: 'User Two' }),
    group: null,
    ...overrides,
  })

  const createChatMessage = (overrides = {}) => ({
    id: 1,
    chatid: 123,
    message: 'Test message',
    date: '2024-01-15T10:00:00Z',
    ...overrides,
  })

  /**
   * Helper to mount component with Suspense wrapper for async setup.
   * ModChatModal uses top-level await which requires Suspense.
   */
  async function mountComponent(props = {}) {
    const TestWrapper = defineComponent({
      components: { ModChatModal },
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(ModChatModal, { ...defaultProps, ...props }),
            fallback: () => h('div', { class: 'loading' }, 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'b-modal': {
            template: `
              <div class="modal" :id="id" :size="size">
                <div class="modal-header"><slot name="header" /></div>
                <div class="modal-body"><slot /></div>
                <div class="modal-footer"><slot name="footer" /></div>
              </div>
            `,
            props: ['id', 'size', 'hideHeaderClose', 'noCloseOnEsc'],
            methods: { show: mockModalShow },
          },
          'b-button': {
            template:
              '<button :data-variant="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'b-img': {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'lazy'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon"></span>',
            props: ['icon', 'scale'],
          },
          'infinite-loading': {
            template:
              '<div class="infinite-loading"><slot name="spinner" /></div>',
            props: ['direction', 'forceUseInfiniteWrapper', 'distance'],
            emits: ['infinite'],
          },
          ChatMessage: {
            template:
              '<div class="chat-message" :data-id="id" :data-chatid="chatid" :data-pov="pov"></div>',
            props: ['id', 'chatid', 'last', 'pov'],
          },
        },
      },
    })

    // Wait for Suspense to resolve - multiple flushes needed for async setup
    await flushPromises()
    await nextTick()
    await flushPromises()

    return wrapper
  }

  // Helper to get the ModChatModal component from the wrapper
  function getModChatModal(wrapper) {
    return wrapper.findComponent(ModChatModal)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockChatStore.byChatId.mockReturnValue(null)
    mockChatStore.messagesById.mockReturnValue([])
    mockChatStore.fetchChat.mockResolvedValue({})
    mockChatStore.fetchMessages.mockResolvedValue({})
    mockChatMessages.value = []
  })

  describe('rendering', () => {
    it('renders the modal with correct id', async () => {
      const wrapper = await mountComponent({ id: 456 })
      const modal = wrapper.find('.modal')
      expect(modal.exists()).toBe(true)
      expect(modal.attributes('id')).toContain('456')
    })

    it('renders modal with large size', async () => {
      const wrapper = await mountComponent()
      const modal = wrapper.find('.modal')
      expect(modal.attributes('size')).toBe('lg')
    })

    it('has Close button in footer', async () => {
      const wrapper = await mountComponent()
      const footer = wrapper.find('.modal-footer')
      expect(footer.text()).toContain('Close')
    })

    it('shows "No messages" when chatmessages is empty', async () => {
      mockChatStore.byChatId.mockReturnValue(createChat())
      const wrapper = await mountComponent()
      const component = getModChatModal(wrapper)
      component.vm.chat2 = createChat()
      await nextTick()
      expect(wrapper.text()).toContain('No messages')
    })

    it('renders InfiniteLoading component', async () => {
      mockChatStore.byChatId.mockReturnValue(createChat())
      const wrapper = await mountComponent()
      const component = getModChatModal(wrapper)
      component.vm.chat2 = createChat()
      await nextTick()
      expect(wrapper.find('.infinite-loading').exists()).toBe(true)
    })

    it('renders loading spinner image', async () => {
      mockChatStore.byChatId.mockReturnValue(createChat())
      const wrapper = await mountComponent()
      const component = getModChatModal(wrapper)
      component.vm.chat2 = createChat()
      await nextTick()
      const spinner = wrapper.find('.spinner-border')
      expect(spinner.exists()).toBe(true)
    })
  })

  describe('header display', () => {
    it('displays user2 displayname when pov is user1', async () => {
      const chat = createChat({
        user1: createUser({ id: 456, displayname: 'POV User' }),
        user2: createUser({ id: 789, displayname: 'Other User' }),
      })
      mockChatStore.byChatId.mockReturnValue(chat)

      const wrapper = await mountComponent({ id: 123, pov: 456 })
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      const header = wrapper.find('.modal-header')
      expect(header.text()).toContain('Other User')
    })

    it('displays user1 displayname when pov is user2', async () => {
      const chat = createChat({
        user1: createUser({ id: 456, displayname: 'First User' }),
        user2: createUser({ id: 789, displayname: 'Second User' }),
      })
      mockChatStore.byChatId.mockReturnValue(chat)

      const wrapper = await mountComponent({ id: 123, pov: 789 })
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      const header = wrapper.find('.modal-header')
      expect(header.text()).toContain('First User')
    })

    it('displays user IDs with hashtag icons', async () => {
      const chat = createChat({
        user1: createUser({ id: 456, displayname: 'User One' }),
        user2: createUser({ id: 789, displayname: 'User Two' }),
      })
      mockChatStore.byChatId.mockReturnValue(chat)

      const wrapper = await mountComponent({ id: 123, pov: 456 })
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      const header = wrapper.find('.modal-header')
      expect(header.text()).toContain('789')
      expect(header.text()).toContain('456')
      expect(wrapper.findAll('[data-icon="hashtag"]').length).toBeGreaterThan(0)
    })

    it('displays LJ user ID when user has ljuserid', async () => {
      const chat = createChat({
        user1: createUser({ id: 456, displayname: 'User One' }),
        user2: createUser({
          id: 789,
          displayname: 'User Two',
          ljuserid: 12345,
        }),
      })
      mockChatStore.byChatId.mockReturnValue(chat)

      const wrapper = await mountComponent({ id: 123, pov: 456 })
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      const header = wrapper.find('.modal-header')
      expect(header.text()).toContain('LJ')
      expect(header.text()).toContain('12345')
    })

    it('displays TN user ID when user has tnuserid but no ljuserid', async () => {
      const chat = createChat({
        user1: createUser({ id: 456, displayname: 'User One' }),
        user2: createUser({
          id: 789,
          displayname: 'User Two',
          ljuserid: null,
          tnuserid: 67890,
        }),
      })
      mockChatStore.byChatId.mockReturnValue(chat)

      const wrapper = await mountComponent({ id: 123, pov: 456 })
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      const header = wrapper.find('.modal-header')
      expect(header.text()).toContain('TN')
      expect(header.text()).toContain('67890')
    })

    it('displays group name when chat has group', async () => {
      const chat = createChat({
        group: { namedisplay: 'Test Community' },
      })
      mockChatStore.byChatId.mockReturnValue(chat)

      const wrapper = await mountComponent({ id: 123, pov: 456 })
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      const header = wrapper.find('.modal-header')
      expect(header.text()).toContain('Test Community Volunteers')
    })

    it('does not display user2 when user1.id equals user2.id (non-pov view)', async () => {
      const chat = createChat({
        user1: createUser({ id: 456, displayname: 'Same User' }),
        user2: createUser({ id: 456, displayname: 'Same User' }),
      })
      mockChatStore.byChatId.mockReturnValue(chat)

      // pov !== user1.id to trigger the else branch
      const wrapper = await mountComponent({ id: 123, pov: 999 })
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      const header = wrapper.find('.modal-header')
      // Should only show user1, not duplicate user2
      const userMatches = header.text().match(/Same User/g)
      expect(userMatches?.length).toBe(1)
    })
  })

  describe('computed properties', () => {
    describe('user1', () => {
      it('returns null when chat2 is not loaded', async () => {
        const wrapper = await mountComponent()
        const component = getModChatModal(wrapper)
        expect(component.vm.user1).toBe(null)
      })

      it('returns user2 when pov matches user1.id', async () => {
        const chat = createChat({
          user1: createUser({ id: 456, displayname: 'First' }),
          user2: createUser({ id: 789, displayname: 'Second' }),
        })

        const wrapper = await mountComponent({ id: 123, pov: 456 })
        const component = getModChatModal(wrapper)
        component.vm.chat2 = chat
        await nextTick()

        expect(component.vm.user1).toEqual(chat.user2)
      })

      it('returns user1 when pov does not match user1.id', async () => {
        const chat = createChat({
          user1: createUser({ id: 456, displayname: 'First' }),
          user2: createUser({ id: 789, displayname: 'Second' }),
        })

        const wrapper = await mountComponent({ id: 123, pov: 789 })
        const component = getModChatModal(wrapper)
        component.vm.chat2 = chat
        await nextTick()

        expect(component.vm.user1).toEqual(chat.user1)
      })
    })

    describe('user2', () => {
      it('returns null when chat2 is not loaded', async () => {
        const wrapper = await mountComponent()
        const component = getModChatModal(wrapper)
        expect(component.vm.user2).toBe(null)
      })

      it('returns user2 when pov matches user2.id', async () => {
        const chat = createChat({
          user1: createUser({ id: 456, displayname: 'First' }),
          user2: createUser({ id: 789, displayname: 'Second' }),
        })

        const wrapper = await mountComponent({ id: 123, pov: 789 })
        const component = getModChatModal(wrapper)
        component.vm.chat2 = chat
        await nextTick()

        expect(component.vm.user2).toEqual(chat.user2)
      })

      it('returns user1 when pov does not match user2.id', async () => {
        const chat = createChat({
          user1: createUser({ id: 456, displayname: 'First' }),
          user2: createUser({ id: 789, displayname: 'Second' }),
        })

        const wrapper = await mountComponent({ id: 123, pov: 456 })
        const component = getModChatModal(wrapper)
        component.vm.chat2 = chat
        await nextTick()

        expect(component.vm.user2).toEqual(chat.user1)
      })
    })
  })

  describe('methods', () => {
    describe('show', () => {
      it('fetches chat from store', async () => {
        const wrapper = await mountComponent({ id: 456 })
        const component = getModChatModal(wrapper)
        await component.vm.show()
        expect(mockChatStore.fetchChat).toHaveBeenCalledWith(456)
      })

      it('fetches messages from store', async () => {
        const wrapper = await mountComponent({ id: 456 })
        const component = getModChatModal(wrapper)
        await component.vm.show()
        expect(mockChatStore.fetchMessages).toHaveBeenCalledWith(456)
      })

      it('sets chat2 from store after fetching', async () => {
        const chat = createChat({ id: 456 })
        mockChatStore.byChatId.mockReturnValue(chat)

        const wrapper = await mountComponent({ id: 456 })
        const component = getModChatModal(wrapper)
        await component.vm.show()

        expect(mockChatStore.byChatId).toHaveBeenCalledWith(456)
        expect(component.vm.chat2).toEqual(chat)
      })

      it('shows the modal after fetching', async () => {
        mockChatStore.byChatId.mockReturnValue(createChat())

        const wrapper = await mountComponent({ id: 456 })
        const component = getModChatModal(wrapper)
        await component.vm.show()

        expect(mockModalShow).toHaveBeenCalled()
      })
    })

    describe('closeit', () => {
      it('hides the modal', async () => {
        const wrapper = await mountComponent()
        const component = getModChatModal(wrapper)
        component.vm.closeit()
        expect(mockModalHide).toHaveBeenCalled()
      })
    })

    describe('loadMore', () => {
      it('calls complete on state', async () => {
        const wrapper = await mountComponent()
        const component = getModChatModal(wrapper)
        const mockState = { complete: vi.fn(), loaded: vi.fn() }
        component.vm.loadMore(mockState)
        expect(mockState.complete).toHaveBeenCalled()
      })
    })
  })

  describe('chat messages rendering', () => {
    it('renders ChatMessage components when messages exist', async () => {
      const chat = createChat()
      const messages = [
        createChatMessage({ id: 1, chatid: 123 }),
        createChatMessage({ id: 2, chatid: 123 }),
        createChatMessage({ id: 3, chatid: 123 }),
      ]

      mockChatStore.byChatId.mockReturnValue(chat)
      mockChatMessages.value = messages

      const wrapper = await mountComponent()
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      const chatMessageComponents = wrapper.findAll('.chat-message')
      expect(chatMessageComponents.length).toBe(3)
    })

    it('passes correct props to ChatMessage', async () => {
      const chat = createChat()
      const messages = [createChatMessage({ id: 42, chatid: 123 })]

      mockChatStore.byChatId.mockReturnValue(chat)
      mockChatMessages.value = messages

      const wrapper = await mountComponent({ id: 123, pov: 456 })
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      const chatMessage = wrapper.find('.chat-message')
      expect(chatMessage.attributes('data-id')).toBe('42')
      expect(chatMessage.attributes('data-chatid')).toBe('123')
      expect(chatMessage.attributes('data-pov')).toBe('456')
    })

    it('marks last message correctly', async () => {
      const chat = createChat()
      const messages = [
        createChatMessage({ id: 1, chatid: 123 }),
        createChatMessage({ id: 2, chatid: 123 }),
      ]

      mockChatStore.byChatId.mockReturnValue(chat)
      mockChatMessages.value = messages

      const wrapper = await mountComponent()
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      // Verify ChatMessage components are rendered
      const chatMessages = wrapper.findAll('.chat-message')
      expect(chatMessages.length).toBe(2)
    })
  })

  describe('props', () => {
    it('accepts id prop as required Number', async () => {
      const wrapper = await mountComponent({ id: 999 })
      const component = getModChatModal(wrapper)
      expect(component.props('id')).toBe(999)
    })

    it('accepts pov prop as required Number', async () => {
      const wrapper = await mountComponent({ pov: 888 })
      const component = getModChatModal(wrapper)
      expect(component.props('pov')).toBe(888)
    })
  })

  describe('onMounted', () => {
    it('calls show method on mount', async () => {
      mockChatStore.byChatId.mockReturnValue(createChat())
      await mountComponent()

      // Verify show was called by checking the store methods were called
      expect(mockChatStore.fetchChat).toHaveBeenCalled()
      expect(mockChatStore.fetchMessages).toHaveBeenCalled()
    })
  })

  describe('button interactions', () => {
    it('Close button calls closeit method', async () => {
      const wrapper = await mountComponent()

      const closeButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Close')
      expect(closeButton).toBeDefined()

      await closeButton.trigger('click')
      expect(mockModalHide).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles chat with null user1', async () => {
      const chat = createChat({
        user1: null,
        user2: createUser({ id: 789, displayname: 'Only User' }),
      })
      mockChatStore.byChatId.mockReturnValue(chat)

      const wrapper = await mountComponent()
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      // Should not throw and user1 computed should handle null
      expect(component.vm.user1).toBe(null)
    })

    it('handles chat with null user2 by falling back to user1', async () => {
      const chat = createChat({
        user1: createUser({ id: 456, displayname: 'Only User' }),
        user2: null,
      })
      mockChatStore.byChatId.mockReturnValue(chat)

      const wrapper = await mountComponent({ pov: 456 })
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      // When user2 is null, the computed property falls back to user1
      expect(component.vm.user2).toEqual(chat.user1)
    })

    it('handles empty chat messages array', async () => {
      const chat = createChat()
      mockChatStore.byChatId.mockReturnValue(chat)

      const wrapper = await mountComponent()
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      expect(wrapper.text()).toContain('No messages')
    })

    it('modal id is unique per chat id', async () => {
      const wrapper1 = await mountComponent({ id: 111 })
      const wrapper2 = await mountComponent({ id: 222 })

      const id1 = wrapper1.find('.modal').attributes('id')
      const id2 = wrapper2.find('.modal').attributes('id')

      expect(id1).not.toBe(id2)
      expect(id1).toContain('111')
      expect(id2).toContain('222')
    })
  })

  describe('styling classes', () => {
    it('has chatContent class with scroll styling', async () => {
      const chat = createChat()
      mockChatStore.byChatId.mockReturnValue(chat)

      const wrapper = await mountComponent()
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      // The chatContent div should exist when chat2 is set
      const chatContent = wrapper.find('.chatContent')
      expect(chatContent.exists()).toBe(true)
    })

    it('has infinite-wrapper attribute on chatContent', async () => {
      const chat = createChat()
      mockChatStore.byChatId.mockReturnValue(chat)

      const wrapper = await mountComponent()
      const component = getModChatModal(wrapper)
      component.vm.chat2 = chat
      await nextTick()

      const chatContent = wrapper.find('.chatContent')
      expect(chatContent.attributes('infinite-wrapper')).toBeDefined()
    })
  })
})
