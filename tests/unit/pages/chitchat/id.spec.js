import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'

// Mock all component imports BEFORE the page loads to prevent Nuxt internal imports.
vi.mock('~/components/NewsCommunityEventVolunteerSummary', () => ({
  default: { template: '<div />' },
}))
vi.mock('~/components/VisibleWhen', () => ({
  default: { template: '<div><slot /></div>', props: ['at'] },
}))
vi.mock('~/components/GlobalMessage', () => ({
  default: { template: '<div />' },
}))
vi.mock('~/components/NoticeMessage', () => ({
  default: {
    template: '<div><slot /></div>',
    props: ['variant'],
  },
}))
vi.mock('~/components/AutoHeightTextarea', () => ({
  default: { template: '<textarea />', props: ['id', 'modelValue'] },
}))
vi.mock('~/components/InfiniteLoading', () => ({
  default: {
    template: '<div class="infinite-loading" />',
    props: ['identifier', 'forceUseInfiniteWrapper', 'distance'],
    emits: ['infinite'],
  },
}))
vi.mock('~/components/NewsThread.vue', () => ({
  default: { template: '<div />', props: ['id', 'scrollTo', 'duplicateCount'] },
}))
vi.mock('~/components/MessageListUpToDate.vue', () => ({
  default: { template: '<div />' },
}))

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

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
}))

vi.mock('~/stores/location', () => ({
  useLocationStore: () => ({
    fetchv2: vi.fn().mockResolvedValue({ name: 'Test Area' }),
  }),
}))

// Mock useMe
const mockMe = ref({ id: 1, displayname: 'Test User', settings: {} })

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    myGroups: ref([]),
  }),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: {} }),
}))

vi.mock('~/composables/useBuildHead', () => ({
  buildHead: () => ({}),
}))

vi.mock('~/composables/useTwem', () => ({
  untwem: (msg) => msg,
}))

// Nuxt macros
globalThis.definePageMeta = vi.fn()
globalThis.useHead = vi.fn()
globalThis.useRuntimeConfig = () => ({ public: { BUILD_DATE: '2026-01-01' } })
globalThis.defineAsyncComponent = (fn) => ({ template: '<div />' })

import ChitchatPage from '~/pages/chitchat/[[id]].vue'

describe('chitchat/[[id]].vue loadMore', () => {
  let wrapper

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  function mountComponent() {
    wrapper = mount(ChitchatPage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'client-only': { template: '<div><slot /></div>' },
          'b-container': { template: '<div><slot /></div>' },
          'b-row': { template: '<div><slot /></div>' },
          'b-col': { template: '<div><slot /></div>' },
          'b-form-select': { template: '<select />', props: ['modelValue', 'options'] },
          'v-icon': { template: '<i />' },
          OurUploader: { template: '<div />' },
          OurUploadedImage: { template: '<div />' },
          NuxtPicture: { template: '<div />' },
          SidebarLeft: { template: '<div />' },
          SidebarRight: { template: '<div />' },
          ExpectedRepliesWarning: { template: '<div />' },
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
    mountComponent()
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(mockState.loaded).toHaveBeenCalled()
    expect(mockState.complete).not.toHaveBeenCalled()
  })

  it('loadMore calls loaded (not complete) when feed is empty', () => {
    mockNewsfeedStore.feed = []
    mountComponent()
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
    mountComponent()
    wrapper.vm.show = 0
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(wrapper.vm.show).toBe(1)
  })

  it('loadMore calls complete when all items shown', () => {
    mockNewsfeedStore.feed = [{ id: 1, userid: 1 }]
    mountComponent()
    wrapper.vm.show = 1
    const mockState = { loaded: vi.fn(), complete: vi.fn() }

    wrapper.vm.loadMore(mockState)

    expect(mockState.complete).toHaveBeenCalled()
  })
})
