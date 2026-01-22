import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ChatsPage from '~/modtools/pages/chats/[[id]].vue'

// Mock dayjs
vi.mock('dayjs', () => {
  const mockDayjs = (date) => ({
    diff: vi.fn().mockReturnValue(0),
  })
  return { default: mockDayjs }
})

// Mock chat store
const mockChatStore = {
  list: [],
  searchSince: null,
  listChatsMT: vi.fn().mockResolvedValue([]),
  markRead: vi.fn().mockResolvedValue({}),
  clear: vi.fn(),
}

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

// Mock auth store
const mockAuthStore = {
  user: { id: 1, lat: 0, lng: 0 },
}

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Mock route params
const mockRouteParams = ref({ id: undefined })
const mockRouterPush = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: mockRouteParams.value,
  }),
}))

vi.mock('#imports', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

// Make useRouter available globally
globalThis.useRouter = () => ({
  push: mockRouterPush,
})

describe('chats/[[id]].vue page', () => {
  function mountComponent() {
    return mount(ChatsPage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'client-only': {
            template: '<div><slot /></div>',
          },
          'b-row': {
            template: '<div><slot /></div>',
            props: ['class'],
          },
          'b-col': {
            template: '<div><slot /></div>',
            props: ['cols', 'md', 'class'],
          },
          'b-card': {
            template: '<div><slot /></div>',
            props: ['class'],
          },
          'b-card-body': {
            template: '<div><slot /></div>',
            props: ['class'],
          },
          'b-form-input': {
            template: '<input />',
            props: ['modelValue', 'placeholder', 'class'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'class'],
          },
          ChatListEntry: {
            template: '<div class="chat-list-entry" />',
            props: ['id', 'class'],
          },
          ModChatPane: {
            template: '<div class="mod-chat-pane" />',
            props: ['id'],
          },
          'v-icon': {
            template: '<i />',
            props: ['icon', 'class'],
          },
          'infinite-loading': {
            template:
              '<div class="infinite-loading"><slot name="no-results" /><slot name="no-more" /></div>',
            props: ['identifier', 'forceUseInfiniteWrapper', 'distance'],
            emits: ['infinite'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockRouteParams.value = { id: undefined }
    mockChatStore.list = []
    mockChatStore.searchSince = null
  })

  describe('initial state', () => {
    it('initializes with correct data values', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showChats).toBe(20)
      expect(wrapper.vm.search).toBe(null)
      expect(wrapper.vm.searching).toBe(false)
      expect(wrapper.vm.complete).toBe(false)
      expect(wrapper.vm.selectedChatId).toBe(null)
    })

    it('sets selectedChatId from route param', () => {
      mockRouteParams.value = { id: '123' }
      const wrapper = mountComponent()
      expect(wrapper.vm.selectedChatId).toBe(123)
    })

    it('calls listChats on mount', async () => {
      mountComponent()
      await flushPromises()
      expect(mockChatStore.listChatsMT).toHaveBeenCalled()
    })
  })

  describe('computed properties', () => {
    it('chats returns store list', () => {
      mockChatStore.list = [{ id: 1 }, { id: 2 }]
      const wrapper = mountComponent()
      expect(wrapper.vm.chats).toHaveLength(2)
    })

    it('visibleChats slices to showChats limit', () => {
      mockChatStore.list = [
        { id: 1, status: 'Active' },
        { id: 2, status: 'Active' },
        { id: 3, status: 'Active' },
      ]
      const wrapper = mountComponent()
      wrapper.vm.showChats = 2
      wrapper.vm.bump = Date.now()
      expect(wrapper.vm.visibleChats.length).toBeLessThanOrEqual(2)
    })
  })

  describe('methods', () => {
    it('gotoChat navigates to chat page', () => {
      const wrapper = mountComponent()
      wrapper.vm.gotoChat(456)
      expect(mockRouterPush).toHaveBeenCalledWith('/chats/456')
    })

    it('loadMore increments showChats', () => {
      mockChatStore.list = [
        { id: 1, status: 'Active' },
        { id: 2, status: 'Active' },
      ]
      const wrapper = mountComponent()
      wrapper.vm.showChats = 0
      const mockState = { loaded: vi.fn(), complete: vi.fn() }
      wrapper.vm.loadMore(mockState)
      expect(wrapper.vm.showChats).toBe(1)
      expect(mockState.loaded).toHaveBeenCalled()
    })

    it('loadMore completes when all chats shown', () => {
      mockChatStore.list = [{ id: 1, status: 'Active' }]
      const wrapper = mountComponent()
      wrapper.vm.showChats = 1
      const mockState = { loaded: vi.fn(), complete: vi.fn() }
      wrapper.vm.loadMore(mockState)
      expect(mockState.complete).toHaveBeenCalled()
      expect(wrapper.vm.complete).toBe(true)
    })

    it('markAllRead clears store and reloads', async () => {
      mockChatStore.list = [{ id: 1, unseen: 5 }]
      const wrapper = mountComponent()
      await wrapper.vm.markAllRead()
      expect(mockChatStore.markRead).toHaveBeenCalledWith(1)
      expect(mockChatStore.clear).toHaveBeenCalled()
    })

    it('scanChats filters by search', () => {
      const wrapper = mountComponent()
      wrapper.vm.searching = true
      wrapper.vm.search = 'test'
      const chats = [
        { id: 1, name: 'Test Chat', status: 'Active' },
        { id: 2, name: 'Other Chat', status: 'Active' },
      ]
      const filtered = wrapper.vm.scanChats(false, chats)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Test Chat')
    })
  })

  describe('watchers', () => {
    it('bumps when search changes', async () => {
      const wrapper = mountComponent()
      const initialBump = wrapper.vm.bump
      wrapper.vm.search = 'test'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.bump).not.toBe(initialBump)
    })
  })
})
