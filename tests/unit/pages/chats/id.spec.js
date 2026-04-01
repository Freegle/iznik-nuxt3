import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref, computed, defineComponent, h, Suspense } from 'vue'

// Mock dayjs with extend support (needed by transitive imports like useTimeFormat)
vi.mock('dayjs', () => {
  const mockDayjs = (date) => ({
    diff: vi.fn().mockReturnValue(0),
    format: vi.fn().mockReturnValue(''),
    isSameOrBefore: vi.fn().mockReturnValue(false),
    isToday: vi.fn().mockReturnValue(false),
    fromNow: vi.fn().mockReturnValue('just now'),
  })
  mockDayjs.extend = vi.fn()
  return { default: mockDayjs }
})

// Mock dayjs plugins to prevent import errors
vi.mock('dayjs/plugin/advancedFormat', () => ({ default: {} }))
vi.mock('dayjs/plugin/relativeTime', () => ({ default: {} }))
vi.mock('dayjs/plugin/isToday', () => ({ default: {} }))
vi.mock('dayjs/plugin/isSameOrBefore', () => ({ default: {} }))

// Mock component imports to prevent deep Nuxt import chains
vi.mock('~/components/VisibleWhen', () => ({
  default: { template: '<div><slot /></div>', props: ['at'] },
}))
vi.mock('~/components/InfiniteLoading', () => ({
  default: {
    template: '<div class="infinite-loading" />',
    props: ['identifier', 'forceUseInfiniteWrapper', 'distance'],
    emits: ['infinite'],
  },
}))
vi.mock('~/components/SidebarRight', () => ({
  default: { template: '<div />' },
}))
vi.mock('~/components/ChatMobileNavbar.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('~/components/ExternalDa.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('~/components/ChatListEntry.vue', () => ({
  default: { template: '<div />', props: ['id'] },
}))

// Mock stores
const mockChatStore = {
  list: [],
  listMT: [],
  listByChatId: {},
  showContactDetailsAskModal: ref(false),
  fetchChats: vi.fn().mockResolvedValue([]),
  fetchChat: vi.fn().mockResolvedValue({}),
  markRead: vi.fn().mockResolvedValue({}),
  byChatId: vi.fn().mockReturnValue(null),
  clear: vi.fn(),
  unseenCount: 0,
}

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
}))

// Mock useMe
const mockMe = ref({ id: 1, displayname: 'Test User', settings: {} })

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    myid: computed(() => mockMe.value?.id || null),
    myGroups: ref([]),
  }),
}))

vi.mock('~/composables/useBuildHead', () => ({
  buildHead: () => ({}),
}))

vi.mock('pinia', async () => {
  const actual = await vi.importActual('pinia')
  return {
    ...actual,
    storeToRefs: (store) => {
      // Return reactive refs for the store properties tests need
      return {
        showContactDetailsAskModal: mockChatStore.showContactDetailsAskModal,
        list: ref(store?.list || []),
      }
    },
  }
})

// Mock vue-router (for any direct vue-router imports)
const mockRouteParams = ref({})

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: mockRouteParams.value,
    query: {},
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    currentRoute: { value: { path: '/' } },
  }),
}))

// Nuxt macros
globalThis.definePageMeta = vi.fn()
globalThis.useHead = vi.fn()
globalThis.useRuntimeConfig = () => ({ public: { BUILD_DATE: '2026-01-01' } })
globalThis.defineAsyncComponent = (fn) => ({ template: '<div />' })

import ChatsPage from '~/pages/chats/[[id]].vue'

describe('chats/[[id]].vue loadMore', () => {
  // Wrap in Suspense since chats page has async setup (top-level await)
  function mountComponent() {
    const Wrapper = defineComponent({
      setup() {
        return () => h(Suspense, null, { default: () => h(ChatsPage) })
      },
    })

    return mount(Wrapper, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'client-only': { template: '<div><slot /></div>' },
          'b-container': { template: '<div><slot /></div>' },
          'b-row': { template: '<div><slot /></div>' },
          'b-col': { template: '<div><slot /></div>' },
          'b-card': { template: '<div><slot /></div>' },
          'b-card-body': { template: '<div><slot /></div>' },
          'b-form-input': { template: '<input />' },
          'b-button': { template: '<button><slot /></button>' },
          'v-icon': { template: '<i />' },
          ChatPane: { template: '<div />' },
          GlobalMessage: { template: '<div />' },
          ExpectedRepliesWarning: { template: '<div />' },
          'b-badge': { template: '<span><slot /></span>' },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockMe.value = { id: 1, displayname: 'Test User', settings: {} }
    mockChatStore.list = []
    mockChatStore.fetchChats = vi.fn().mockResolvedValue([])
    mockRouteParams.value = {}
  })

  it('loadMore calls loaded (not complete) when auth not hydrated', async () => {
    mockMe.value = null
    const wrapper = mountComponent()
    await flushPromises()
    const page = wrapper.findComponent(ChatsPage)
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    page.vm.loadMore(mockState)

    expect(mockState.loaded).toHaveBeenCalled()
    expect(mockState.complete).not.toHaveBeenCalled()
  })

  it('loadMore calls loaded (not complete) when chat list is empty', async () => {
    mockChatStore.list = []
    const wrapper = mountComponent()
    await flushPromises()
    const page = wrapper.findComponent(ChatsPage)
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    page.vm.loadMore(mockState)

    expect(mockState.loaded).toHaveBeenCalled()
    expect(mockState.complete).not.toHaveBeenCalled()
  })

  it('loadMore increments showChats when more chats available', async () => {
    mockChatStore.list = [
      { id: 1, status: 'Active' },
      { id: 2, status: 'Active' },
      { id: 3, status: 'Active' },
    ]
    const wrapper = mountComponent()
    await flushPromises()
    const page = wrapper.findComponent(ChatsPage)
    page.vm.showChats = 1
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    page.vm.loadMore(mockState)

    expect(page.vm.showChats).toBe(2)
    expect(mockState.loaded).toHaveBeenCalled()
  })

  it('loadMore calls complete when all chats shown', async () => {
    mockChatStore.list = [{ id: 1, status: 'Active' }]
    const wrapper = mountComponent()
    await flushPromises()
    const page = wrapper.findComponent(ChatsPage)
    page.vm.showChats = 1
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    page.vm.loadMore(mockState)

    expect(mockState.complete).toHaveBeenCalled()
  })
})
