import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ChitchatPage from '~/pages/chitchat/[[id]].vue'

// Mock stores
const mockNewsfeedStore = {
  feed: [],
  count: 0,
  maxSeen: null,
  seenBeforeVisit: null,
  delayedSeenMode: false,
  delayedSeenTimer: null,
  fetchFeed: vi.fn().mockResolvedValue([]),
  fetch: vi.fn().mockResolvedValue({}),
  fetchCount: vi.fn().mockResolvedValue(0),
  reset: vi.fn(),
  send: vi.fn(),
  byId: vi.fn(),
  snapshotSeenBeforeVisit: vi.fn(),
  startDelayedSeen: vi.fn(),
  markAllSeen: vi.fn(),
}

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => mockNewsfeedStore,
}))

const mockAuthStore = {
  user: { id: 1, settings: {} },
  saveAndGet: vi.fn(),
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

const mockLocationStore = {
  fetchv2: vi.fn().mockResolvedValue({ name: 'Test Area' }),
}

vi.mock('~/stores/location', () => ({
  useLocationStore: () => mockLocationStore,
}))

// Mock useMe — start with a logged-in user
const mockMe = ref({ id: 1, displayname: 'Test User', settings: {} })

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    myGroups: ref([]),
  }),
}))

// Mock useRoute
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {},
  }),
}))

// Mock composables
vi.mock('~/composables/useBuildHead', () => ({
  buildHead: () => ({}),
}))

vi.mock('~/composables/useTwem', () => ({
  untwem: (msg) => msg,
}))

// Mock definePageMeta (Nuxt macro)
globalThis.definePageMeta = vi.fn()
globalThis.useHead = vi.fn()
globalThis.useRuntimeConfig = () => ({ public: { BUILD_DATE: '2026-01-01' } })
globalThis.defineAsyncComponent = (fn) => ({
  template: '<div />',
})

describe('chitchat/[[id]].vue loadMore', () => {
  function mountComponent() {
    return mount(ChitchatPage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'client-only': {
            template: '<div><slot /></div>',
          },
          'b-container': { template: '<div><slot /></div>', props: ['fluid'] },
          'b-row': { template: '<div><slot /></div>' },
          'b-col': {
            template: '<div><slot /></div>',
            props: ['cols', 'md', 'lg', 'offset-md', 'offset-lg'],
          },
          'b-form-select': {
            template: '<select />',
            props: ['modelValue', 'options', 'size'],
          },
          'v-icon': { template: '<i />', props: ['icon'] },
          VisibleWhen: { template: '<div><slot /></div>', props: ['at'] },
          GlobalMessage: { template: '<div />' },
          NoticeMessage: {
            template: '<div><slot /></div>',
            props: ['variant'],
          },
          AutoHeightTextarea: {
            template: '<textarea />',
            props: ['id', 'modelValue', 'rows', 'max-rows', 'placeholder'],
          },
          InfiniteLoading: {
            template: '<div class="infinite-loading" />',
            props: ['identifier', 'forceUseInfiniteWrapper', 'distance'],
            emits: ['infinite'],
          },
          NewsThread: {
            template: '<div class="news-thread" />',
            props: ['id', 'scrollTo', 'duplicateCount'],
          },
          MessageListUpToDate: { template: '<div />' },
          NewsCommunityEventVolunteerSummary: { template: '<div />' },
          SidebarLeft: { template: '<div />' },
          SidebarRight: { template: '<div />' },
          ExpectedRepliesWarning: {
            template: '<div />',
            props: ['count', 'chats'],
          },
          OurUploader: { template: '<div />' },
          OurUploadedImage: { template: '<div />' },
          NuxtPicture: { template: '<div />' },
          Suspense: { template: '<div><slot /></div>' },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockMe.value = { id: 1, displayname: 'Test User', settings: {} }
    mockNewsfeedStore.feed = []
  })

  it('loadMore calls loaded (not complete) when auth not hydrated', () => {
    mockMe.value = null
    const wrapper = mountComponent()
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(mockState.loaded).toHaveBeenCalled()
    expect(mockState.complete).not.toHaveBeenCalled()
  })

  it('loadMore calls loaded (not complete) when feed is empty', () => {
    mockNewsfeedStore.feed = []
    const wrapper = mountComponent()
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(mockState.loaded).toHaveBeenCalled()
    expect(mockState.complete).not.toHaveBeenCalled()
  })

  it('loadMore increments show when more items available', () => {
    mockNewsfeedStore.feed = [
      { id: 1, userid: 1 },
      { id: 2, userid: 2 },
    ]
    const wrapper = mountComponent()
    wrapper.vm.show = 0
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(wrapper.vm.show).toBe(1)
  })

  it('loadMore calls complete when all items shown', () => {
    mockNewsfeedStore.feed = [{ id: 1, userid: 1 }]
    const wrapper = mountComponent()
    wrapper.vm.show = 1
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(mockState.complete).toHaveBeenCalled()
  })
})
