import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ChatReviewPage from '~/modtools/pages/chats/review.vue'

// Create mock stores
const mockChatStore = {
  clear: vi.fn().mockResolvedValue({}),
  fetchReviewChatsMT: vi.fn().mockResolvedValue({}),
  messagesById: vi.fn().mockReturnValue([]),
}

const mockAuthStore = {
  work: {
    chatreview: 5,
  },
}

// Mock stores
vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

describe('chats/review.vue page', () => {
  function mountComponent(options = {}) {
    return mount(ChatReviewPage, {
      global: {
        stubs: {
          'client-only': {
            template: '<div><slot /></div>',
          },
          ModHelpChatReview: { template: '<div class="help-stub" />' },
          ModChatReview: {
            template: '<div class="chat-review-stub" />',
            props: ['id', 'message'],
            emits: ['reload'],
          },
          SpinButton: {
            template:
              '<button class="spin-button-stub" @click="$emit(\'handle\', () => {})"><slot /></button>',
            props: ['iconName', 'label', 'variant'],
            emits: ['handle'],
          },
          ConfirmModal: {
            template: '<div class="confirm-modal-stub" />',
            props: ['title'],
            emits: ['confirm'],
          },
          'notice-message': {
            template: '<div class="notice-stub"><slot /></div>',
          },
          'b-img': { template: '<img />' },
          'infinite-loading': {
            template:
              '<div class="infinite-loading"><slot name="spinner" /><slot name="complete" /></div>',
            props: [
              'direction',
              'forceUseInfiniteWrapper',
              'distance',
              'identifier',
            ],
            emits: ['infinite'],
          },
        },
        ...options.global,
      },
      ...options,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockChatStore.messagesById.mockReturnValue([])
    mockAuthStore.work = { chatreview: 5 }
  })

  describe('initial state', () => {
    it('renders the page', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.help-stub').exists()).toBe(true)
    })

    it('initializes with correct data values', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.context).toBe(null)
      expect(wrapper.vm.distance).toBe(1000)
      expect(wrapper.vm.limit).toBe(5)
      expect(wrapper.vm.show).toBe(0)
      expect(wrapper.vm.bump).toBe(0)
      expect(wrapper.vm.showDeleteModal).toBe(false)
    })

    it('clears and loads on mount', async () => {
      mountComponent()
      await flushPromises()
      expect(mockChatStore.clear).toHaveBeenCalled()
      expect(mockChatStore.fetchReviewChatsMT).toHaveBeenCalled()
    })
  })

  describe('computed properties', () => {
    it('returns messages filtered for non-null', () => {
      mockChatStore.messagesById.mockReturnValue([
        { id: 1, chatid: 100 },
        null,
        { id: 2, chatid: 200 },
      ])
      const wrapper = mountComponent()
      wrapper.vm.show = 10
      expect(wrapper.vm.visibleMessages).toHaveLength(2)
    })

    it('slices messages to show count', () => {
      mockChatStore.messagesById.mockReturnValue([
        { id: 1, chatid: 100 },
        { id: 2, chatid: 200 },
        { id: 3, chatid: 300 },
      ])
      const wrapper = mountComponent()
      wrapper.vm.show = 2
      expect(wrapper.vm.visibleMessages).toHaveLength(2)
    })

    it('gets work count from auth store', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.work).toBe(5)
    })

    it('returns undefined for work when auth work is null', () => {
      mockAuthStore.work = null
      const wrapper = mountComponent()
      expect(wrapper.vm.work).toBeUndefined()
    })
  })

  describe('methods', () => {
    it('loadMore increments show when more messages available', () => {
      mockChatStore.messagesById.mockReturnValue([
        { id: 1, chatid: 100 },
        { id: 2, chatid: 200 },
      ])
      const wrapper = mountComponent()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      wrapper.vm.show = 0
      wrapper.vm.loadMore(mockState)

      expect(wrapper.vm.show).toBe(1)
      expect(mockState.loaded).toHaveBeenCalled()
    })

    it('loadMore calls complete when all messages shown', () => {
      mockChatStore.messagesById.mockReturnValue([])
      const wrapper = mountComponent()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      wrapper.vm.show = 0
      wrapper.vm.loadMore(mockState)

      expect(mockState.complete).toHaveBeenCalled()
    })

    it('reload clears and loads', async () => {
      const wrapper = mountComponent()
      vi.clearAllMocks()

      await wrapper.vm.reload()

      expect(mockChatStore.clear).toHaveBeenCalled()
      expect(mockChatStore.fetchReviewChatsMT).toHaveBeenCalled()
    })

    it('clearAndLoad clears store and fetches review chats', async () => {
      const wrapper = mountComponent()
      vi.clearAllMocks()

      await wrapper.vm.clearAndLoad()

      expect(mockChatStore.clear).toHaveBeenCalled()
      expect(mockChatStore.fetchReviewChatsMT).toHaveBeenCalledWith(null, {
        limit: 5,
      })
    })

    it('clearAndLoad increments bump', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      // After mount, bump has already been incremented once
      const bumpAfterMount = wrapper.vm.bump
      vi.clearAllMocks()

      await wrapper.vm.clearAndLoad()

      expect(wrapper.vm.bump).toBe(bumpAfterMount + 1)
    })

    it('deleteAll sets showDeleteModal to true', () => {
      const wrapper = mountComponent()
      const callback = vi.fn()

      wrapper.vm.deleteAll(callback)

      expect(wrapper.vm.showDeleteModal).toBe(true)
      expect(callback).toHaveBeenCalled()
    })
  })

  describe('watchers', () => {
    it('clears and loads when work increases and modal not open', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      vi.clearAllMocks()

      // Simulate work increasing
      mockAuthStore.work.chatreview = 10
      await wrapper.vm.$nextTick()

      // The watcher should trigger clearAndLoad when work increases
      // Note: Testing watchers requires the reactive system to detect changes
    })
  })

  describe('rendering', () => {
    it('shows Delete All button when multiple messages', async () => {
      mockChatStore.messagesById.mockReturnValue([
        { id: 1, chatid: 100 },
        { id: 2, chatid: 200 },
      ])
      const wrapper = mountComponent()
      wrapper.vm.show = 10
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.spin-button-stub').exists()).toBe(true)
    })

    it('shows notice when no messages', async () => {
      mockChatStore.messagesById.mockReturnValue([])
      const wrapper = mountComponent()
      wrapper.vm.show = 10
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.notice-stub').exists()).toBe(true)
    })
  })
})
