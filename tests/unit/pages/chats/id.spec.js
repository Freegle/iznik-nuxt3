import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ChatsPage from '~/pages/chats/[[id]].vue'

// Mock dayjs
vi.mock('dayjs', () => {
  const mockDayjs = () => ({
    diff: vi.fn().mockReturnValue(0),
  })
  return { default: mockDayjs }
})

// Mock stores
const mockChatStore = {
  list: [],
  fetchChats: vi.fn().mockResolvedValue([]),
  fetchChat: vi.fn().mockResolvedValue({}),
  markRead: vi.fn().mockResolvedValue({}),
  clear: vi.fn(),
  unseenCount: 0,
}

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

const mockAuthStore = {
  user: { id: 1, settings: {} },
  forceLogin: false,
}

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

const mockMiscStore = {
  get: vi.fn(),
  set: vi.fn(),
}

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

// Mock useMe
const mockMe = ref({ id: 1, displayname: 'Test User', settings: {} })

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    myGroups: ref([]),
  }),
}))

vi.mock('~/composables/useBuildHead', () => ({
  buildHead: () => ({}),
}))

// Mock pinia storeToRefs
vi.mock('pinia', async () => {
  const actual = await vi.importActual('pinia')
  return {
    ...actual,
    storeToRefs: () => ({
      list: ref([]),
    }),
  }
})

// Mock vue-router
const mockRouteParams = ref({})
const mockRouterPush = vi.fn()

vi.mock('#imports', () => ({
  ref,
  useRoute: () => ({
    params: mockRouteParams.value,
  }),
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: mockRouteParams.value,
  }),
}))

// Mock Nuxt globals
globalThis.definePageMeta = vi.fn()
globalThis.useHead = vi.fn()
globalThis.useRuntimeConfig = () => ({ public: { BUILD_DATE: '2026-01-01' } })

describe('chats/[[id]].vue loadMore', () => {
  function mountComponent() {
    return mount(ChatsPage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'client-only': { template: '<div><slot /></div>' },
          'b-container': { template: '<div><slot /></div>', props: ['fluid'] },
          'b-row': { template: '<div><slot /></div>' },
          'b-col': {
            template: '<div><slot /></div>',
            props: ['cols', 'md', 'lg', 'offset-md', 'offset-lg'],
          },
          'b-card': { template: '<div><slot /></div>' },
          'b-card-body': { template: '<div><slot /></div>' },
          'b-form-input': { template: '<input />', props: ['modelValue'] },
          'b-button': {
            template: '<button><slot /></button>',
            props: ['variant'],
          },
          'v-icon': { template: '<i />', props: ['icon'] },
          VisibleWhen: { template: '<div><slot /></div>', props: ['at'] },
          SidebarRight: { template: '<div />' },
          ChatListEntry: {
            template: '<div class="chat-entry" />',
            props: ['id'],
          },
          ChatPane: { template: '<div />', props: ['id'] },
          ChatMobileNavbar: { template: '<div />' },
          ExternalDa: { template: '<div />' },
          InfiniteLoading: {
            template: '<div class="infinite-loading" />',
            props: ['identifier', 'forceUseInfiniteWrapper', 'distance'],
            emits: ['infinite'],
          },
          GlobalMessage: { template: '<div />' },
          ExpectedRepliesWarning: {
            template: '<div />',
            props: ['count', 'chats'],
          },
          Suspense: { template: '<div><slot /></div>' },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockMe.value = { id: 1, displayname: 'Test User', settings: {} }
    mockChatStore.list = []
    mockRouteParams.value = {}
  })

  it('loadMore calls loaded (not complete) when auth not hydrated', () => {
    mockMe.value = null
    const wrapper = mountComponent()
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(mockState.loaded).toHaveBeenCalled()
    expect(mockState.complete).not.toHaveBeenCalled()
  })

  it('loadMore calls loaded (not complete) when chat list is empty', () => {
    mockChatStore.list = []
    const wrapper = mountComponent()
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(mockState.loaded).toHaveBeenCalled()
    expect(mockState.complete).not.toHaveBeenCalled()
  })

  it('loadMore increments showChats when more chats available', () => {
    mockChatStore.list = [
      { id: 1, status: 'Active' },
      { id: 2, status: 'Active' },
      { id: 3, status: 'Active' },
    ]
    const wrapper = mountComponent()
    wrapper.vm.showChats = 1
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(wrapper.vm.showChats).toBe(2)
    expect(mockState.loaded).toHaveBeenCalled()
  })

  it('loadMore calls complete when all chats shown', () => {
    mockChatStore.list = [{ id: 1, status: 'Active' }]
    const wrapper = mountComponent()
    wrapper.vm.showChats = 1
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(mockState.complete).toHaveBeenCalled()
  })
})
