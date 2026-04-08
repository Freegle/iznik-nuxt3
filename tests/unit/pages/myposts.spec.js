import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref, computed, defineComponent, Suspense, h, nextTick } from 'vue'

import MyPostsPage from '~/pages/myposts.vue'

// Mock component imports to prevent deep Nuxt import chains
vi.mock('~/components/VisibleWhen', () => ({
  default: { template: '<div><slot /></div>', props: ['at'] },
}))
vi.mock('~/components/SidebarLeft', () => ({
  default: { template: '<div />' },
}))
vi.mock('~/components/SidebarRight', () => ({
  default: { template: '<div />' },
}))
vi.mock('~/components/ExpectedRepliesWarning', () => ({
  default: { template: '<div />', props: ['count', 'chats'] },
}))
vi.mock('~/components/MyPostsPostsList.vue', () => ({
  default: {
    template: '<div class="my-posts-list" />',
    props: ['posts', 'postIds', 'loading', 'defaultExpanded', 'show'],
    emits: ['load-more'],
  },
}))
vi.mock('~/components/MyPostsSearchesList.vue', () => ({
  default: { template: '<div />', props: ['searches'] },
}))
vi.mock('~/components/MyPostsDonationAsk.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('~/components/NewUserInfo.vue', () => ({
  default: { template: '<div />' },
}))

// Mock stores
const mockMessageStore = {
  myPosts: [],
  byUserList: {},
  byId: vi.fn(() => null),
  fetchMyPosts: vi.fn().mockResolvedValue([]),
  fetchByUser: vi.fn().mockResolvedValue([]),
  fetch: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

const mockSearchStore = {
  list: [],
  fetchList: vi.fn().mockResolvedValue([]),
  fetch: vi.fn().mockResolvedValue([]),
}

vi.mock('~/stores/search', () => ({
  useSearchStore: () => mockSearchStore,
}))

vi.mock('~/stores/mobile', () => ({
  useMobileStore: () => ({ isMobile: false, isApp: false, isNative: false }),
}))

vi.mock('~/stores/tryst', () => ({
  useTrystStore: () => ({
    list: [],
    fetch: vi.fn(),
    getByUser: vi.fn(() => null),
  }),
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
    myid: computed(() => mockMe.value?.id ?? null),
    myGroups: ref([]),
  }),
}))

vi.mock('~/composables/useBuildHead', () => ({
  buildHead: () => ({}),
}))

vi.mock('~/composables/useFavoritePage', () => ({
  useFavoritePage: () => ({ isFavorite: ref(false), toggleFavorite: vi.fn() }),
}))

// Mock as sync to avoid async setup
vi.mock('~/composables/useDonationAskModal', () => ({
  useDonationAskModal: () => ({
    showDonationAskModal: ref(false),
    onDonationModalHidden: vi.fn(),
  }),
}))

vi.mock('~/composables/useClientLog', () => ({
  action: vi.fn(),
}))

vi.hoisted(() => {
  vi.resetModules()
})

vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    useRoute: () => ({
      params: {},
      query: {},
      path: '/',
      name: 'myposts',
      fullPath: '/',
      matched: [],
      redirectedFrom: undefined,
      meta: {},
    }),
  }
})

globalThis.__testUseRoute = () => ({
  params: {},
  query: {},
  path: '/',
  name: 'myposts',
  fullPath: '/',
  matched: [],
  redirectedFrom: undefined,
  meta: {},
})

// Nuxt macros
globalThis.definePageMeta = vi.fn()
globalThis.useHead = vi.fn()
globalThis.useRuntimeConfig = () => ({ public: { BUILD_DATE: '2026-01-01' } })
globalThis.defineAsyncComponent = (fn) => ({ template: '<div />' })

describe('myposts.vue loadMore', () => {
  // Wrap in Suspense since myposts has async setup (top-level await)
  function mountComponent() {
    const Wrapper = defineComponent({
      setup() {
        return () => h(Suspense, null, { default: () => h(MyPostsPage) })
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
          'b-tabs': { template: '<div><slot /></div>' },
          'b-tab': { template: '<div><slot /></div>' },
          'b-button': { template: '<button><slot /></button>' },
          'v-icon': { template: '<i />' },
          InfiniteLoading: {
            template: '<div class="infinite-loading" />',
            props: ['identifier', 'distance'],
            emits: ['infinite'],
          },
          GlobalMessage: { template: '<div />' },
          AppUpdateAvailable: { template: '<div />' },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockMe.value = { id: 1, displayname: 'Test User', settings: {} }
    mockMessageStore.myPosts = []
    mockMessageStore.byUserList = {}
    mockMessageStore.byId = vi.fn(() => null)
    mockMessageStore.fetchByUser = vi.fn().mockResolvedValue([])
    mockMessageStore.fetch = vi.fn().mockResolvedValue({})
    mockSearchStore.fetch = vi.fn().mockResolvedValue([])
  })

  it('loadMore calls loaded (not complete) when auth not hydrated', async () => {
    mockMe.value = null
    const wrapper = mountComponent()
    await flushPromises()
    await nextTick()
    const page = wrapper.findComponent(MyPostsPage)
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    page.vm.loadMore(mockState)

    expect(mockState.loaded).toHaveBeenCalled()
    expect(mockState.complete).not.toHaveBeenCalled()
  })

  it('loadMore calls loaded (not complete) when posts array is empty', async () => {
    // byUserList empty → posts computed returns [] → don't call complete() yet
    mockMessageStore.byUserList = {}
    const wrapper = mountComponent()
    await flushPromises()
    await nextTick()
    const page = wrapper.findComponent(MyPostsPage)
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    page.vm.loadMore(mockState)

    expect(mockState.loaded).toHaveBeenCalled()
    expect(mockState.complete).not.toHaveBeenCalled()
  })

  it('loadMore increments shownCount when more posts available', async () => {
    // posts computed uses byUserList[myid.value] — myid is 1 in tests
    mockMessageStore.byUserList = {
      1: [
        { id: 1, type: 'Offer' },
        { id: 2, type: 'Offer' },
      ],
    }
    const wrapper = mountComponent()
    await flushPromises()
    await nextTick()
    const page = wrapper.findComponent(MyPostsPage)
    page.vm.shownCount = 1
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    page.vm.loadMore(mockState)

    expect(page.vm.shownCount).toBe(2)
    expect(mockState.loaded).toHaveBeenCalled()
  })

  it('loadMore calls complete when all posts shown', async () => {
    // One post in byUserList; shownCount starts at 1 → after increment it
    // exceeds list length → complete()
    mockMessageStore.byUserList = { 1: [{ id: 1, type: 'Offer' }] }
    const wrapper = mountComponent()
    await flushPromises()
    await nextTick()
    const page = wrapper.findComponent(MyPostsPage)
    page.vm.shownCount = 1
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    page.vm.loadMore(mockState)

    expect(mockState.complete).toHaveBeenCalled()
  })
})
