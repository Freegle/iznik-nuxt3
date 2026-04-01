import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref, computed, defineComponent, Suspense, h } from 'vue'

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
  fetchMyPosts: vi.fn().mockResolvedValue([]),
  fetchByUser: vi.fn().mockResolvedValue([]),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

const mockSearchStore = {
  list: [],
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
    myid: computed(() => mockMe.value?.id || null),
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

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: {} }),
}))

// Nuxt macros
globalThis.definePageMeta = vi.fn()
globalThis.useHead = vi.fn()
globalThis.useRuntimeConfig = () => ({ public: { BUILD_DATE: '2026-01-01' } })
globalThis.defineAsyncComponent = (fn) => ({ template: '<div />' })

import MyPostsPage from '~/pages/myposts.vue'

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
    mockMessageStore.byUserList = {}
  })

  it('loadMore calls loaded (not complete) when auth not hydrated', async () => {
    mockMe.value = null
    const wrapper = mountComponent()
    await flushPromises()
    const page = wrapper.findComponent(MyPostsPage)
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    page.vm.loadMore(mockState)

    expect(mockState.loaded).toHaveBeenCalled()
    expect(mockState.complete).not.toHaveBeenCalled()
  })

  it('loadMore calls loaded (not complete) when posts array is empty', async () => {
    // byUserList[1] = undefined → posts.value = [] (empty)
    mockMessageStore.byUserList = {}
    const wrapper = mountComponent()
    await flushPromises()
    const page = wrapper.findComponent(MyPostsPage)
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    page.vm.loadMore(mockState)

    expect(mockState.loaded).toHaveBeenCalled()
    expect(mockState.complete).not.toHaveBeenCalled()
  })

  it('loadMore increments shownCount when more posts available', async () => {
    mockMessageStore.byUserList = { 1: [{ id: 1, type: 'Offer' }, { id: 2, type: 'Offer' }] }
    const wrapper = mountComponent()
    await flushPromises()
    const page = wrapper.findComponent(MyPostsPage)
    page.vm.shownCount = 1
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    page.vm.loadMore(mockState)

    expect(page.vm.shownCount).toBe(2)
    expect(mockState.loaded).toHaveBeenCalled()
  })

  it('loadMore calls complete when all posts shown', async () => {
    mockMessageStore.byUserList = { 1: [{ id: 1, type: 'Offer' }] }
    const wrapper = mountComponent()
    await flushPromises()
    const page = wrapper.findComponent(MyPostsPage)
    page.vm.shownCount = 1
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    page.vm.loadMore(mockState)

    expect(mockState.complete).toHaveBeenCalled()
  })
})
