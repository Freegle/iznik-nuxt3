import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import MyPostsPage from '~/pages/myposts.vue'

// Mock stores
const mockAuthStore = {
  user: { id: 1, settings: {} },
  forceLogin: false,
}

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

const mockMessageStore = {
  myPosts: [],
  fetchMyPosts: vi.fn().mockResolvedValue([]),
}

vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

const mockSearchStore = {
  list: [],
  fetchList: vi.fn().mockResolvedValue([]),
}

vi.mock('~/stores/search', () => ({
  useSearchStore: () => mockSearchStore,
}))

const mockMobileStore = {
  isMobile: false,
}

vi.mock('~/stores/mobile', () => ({
  useMobileStore: () => mockMobileStore,
}))

const mockTrystStore = {
  list: [],
  fetch: vi.fn(),
  getByUser: vi.fn(() => null),
}

vi.mock('~/stores/tryst', () => ({
  useTrystStore: () => mockTrystStore,
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

vi.mock('~/composables/useFavoritePage', () => ({
  useFavoritePage: () => ({ isFavorite: ref(false), toggleFavorite: vi.fn() }),
}))

vi.mock('~/composables/useDonationAskModal', () => ({
  useDonationAskModal: () => ({
    showDonationAskModal: ref(false),
    onDonationModalHidden: vi.fn(),
  }),
}))

vi.mock('~/composables/useClientLog', () => ({
  action: vi.fn(),
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: {} }),
}))

// Mock Nuxt globals
globalThis.definePageMeta = vi.fn()
globalThis.useHead = vi.fn()
globalThis.useRuntimeConfig = () => ({ public: { BUILD_DATE: '2026-01-01' } })

describe('myposts.vue loadMore', () => {
  function mountComponent() {
    return mount(MyPostsPage, {
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
          'b-button': {
            template: '<button><slot /></button>',
            props: ['variant', 'to'],
          },
          'b-tabs': { template: '<div><slot /></div>' },
          'b-tab': {
            template: '<div><slot /></div>',
            props: ['title', 'active'],
          },
          'v-icon': { template: '<i />', props: ['icon'] },
          VisibleWhen: { template: '<div><slot /></div>', props: ['at'] },
          SidebarLeft: { template: '<div />' },
          SidebarRight: { template: '<div />' },
          ExpectedRepliesWarning: {
            template: '<div />',
            props: ['count', 'chats'],
          },
          MyPostsPostsList: {
            template: '<div class="my-posts-list" />',
            props: [
              'posts',
              'postIds',
              'loading',
              'defaultExpanded',
              'show',
            ],
          },
          MyPostsSearchesList: {
            template: '<div />',
            props: ['searches'],
          },
          MyPostsDonationAsk: { template: '<div />' },
          NewUserInfo: { template: '<div />' },
          InfiniteLoading: {
            template: '<div class="infinite-loading" />',
            props: ['identifier', 'distance'],
            emits: ['infinite'],
          },
          GlobalMessage: { template: '<div />' },
          Suspense: { template: '<div><slot /></div>' },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockMe.value = { id: 1, displayname: 'Test User', settings: {} }
    mockMessageStore.myPosts = []
  })

  it('loadMore calls loaded (not complete) when auth not hydrated', () => {
    mockMe.value = null
    const wrapper = mountComponent()
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(mockState.loaded).toHaveBeenCalled()
    expect(mockState.complete).not.toHaveBeenCalled()
  })

  it('loadMore calls loaded (not complete) when posts array is empty', () => {
    mockMessageStore.myPosts = []
    const wrapper = mountComponent()
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(mockState.loaded).toHaveBeenCalled()
    expect(mockState.complete).not.toHaveBeenCalled()
  })

  it('loadMore increments shownCount when more posts available', () => {
    mockMessageStore.myPosts = [
      { id: 1, type: 'Offer' },
      { id: 2, type: 'Offer' },
    ]
    const wrapper = mountComponent()
    wrapper.vm.shownCount = 1
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(wrapper.vm.shownCount).toBe(2)
    expect(mockState.loaded).toHaveBeenCalled()
  })

  it('loadMore calls complete when all posts shown', () => {
    mockMessageStore.myPosts = [{ id: 1, type: 'Offer' }]
    const wrapper = mountComponent()
    wrapper.vm.shownCount = 1
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(mockState.complete).toHaveBeenCalled()
  })
})
