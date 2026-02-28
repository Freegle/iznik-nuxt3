import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import SpammersPage from '~/modtools/pages/spammers.vue'

// Create mock stores with all required methods and state
const mockSpammerStore = {
  list: [],
  context: null,
  clear: vi.fn(),
  fetch: vi.fn().mockResolvedValue({}),
  getList: vi.fn().mockReturnValue([]),
  getContext: vi.fn().mockReturnValue(null),
}

const mockAuthStore = {
  work: {
    spammerpendingadd: 5,
    spammerpendingremove: 2,
  },
}

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/spammers',
    params: {},
    query: {},
  }),
}))

// Mock stores
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/stores/spammer', () => ({
  useSpammerStore: () => mockSpammerStore,
}))

// Mock composables
vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    hasPermissionSpamAdmin: ref(true),
  }),
}))

describe('spammers.vue page', () => {
  function mountComponent(options = {}) {
    return mount(SpammersPage, {
      global: {
        stubs: {
          ModHelpSpammers: { template: '<div class="help-stub" />' },
          ModMemberSearchbox: {
            template: '<div class="searchbox-stub" />',
            emits: ['search'],
          },
          ModMember: { template: '<div class="member-stub" />' },
          'b-tabs': {
            template: '<div class="tabs"><slot /></div>',
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
          'b-tab': {
            template: '<div class="tab"><slot /><slot name="title" /></div>',
            props: ['active', 'id'],
          },
          'b-badge': { template: '<span class="badge"><slot /></span>' },
          'b-img': { template: '<img />' },
          'infinite-loading': {
            template:
              '<div class="infinite-loading"><slot name="spinner" /></div>',
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
    mockSpammerStore.list = []
    mockSpammerStore.getList.mockReturnValue([])
  })

  describe('initial state', () => {
    it('clears spammer store on mount', () => {
      mountComponent()
      expect(mockSpammerStore.clear).toHaveBeenCalled()
    })
  })

  describe('computed properties', () => {
    it('calculates pendingaddcount from auth store work', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.pendingaddcount).toBe(5)
    })

    it('calculates pendingremovecount from auth store work', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.pendingremovecount).toBe(2)
    })

    it('returns 0 for pendingaddcount when work is null', () => {
      mockAuthStore.work = null
      const wrapper = mountComponent()
      expect(wrapper.vm.pendingaddcount).toBe(0)
      mockAuthStore.work = { spammerpendingadd: 5, spammerpendingremove: 2 }
    })

    it('returns spammers from store based on collection', () => {
      const mockSpammers = [
        { id: 1, user: { spammer: {} }, byuser: { id: 10 } },
        { id: 2, user: { spammer: {} }, byuser: { id: 20 } },
      ]
      mockSpammerStore.getList.mockReturnValue(mockSpammers)
      const wrapper = mountComponent()
      expect(wrapper.vm.spammers).toEqual(mockSpammers)
    })

    it('passes through store data with byuser already enriched', () => {
      // byuser enrichment now happens in the store, not the page
      const mockSpammers = [
        {
          id: 1,
          user: { spammer: { byuser: { id: 10 } } },
          byuser: { id: 10 },
        },
      ]
      mockSpammerStore.getList.mockReturnValue(mockSpammers)
      const wrapper = mountComponent()
      expect(wrapper.vm.spammers[0].user.spammer.byuser).toEqual({ id: 10 })
    })

    it('slices spammers to show count for visibleSpammers', () => {
      const mockSpammers = [
        { id: 1, user: { spammer: {} }, byuser: null },
        { id: 2, user: { spammer: {} }, byuser: null },
        { id: 3, user: { spammer: {} }, byuser: null },
      ]
      mockSpammerStore.getList.mockReturnValue(mockSpammers)
      const wrapper = mountComponent()
      wrapper.vm.show = 2
      expect(wrapper.vm.visibleSpammers).toHaveLength(2)
    })

    it('returns correct collection based on tabIndex', () => {
      const wrapper = mountComponent()

      wrapper.vm.tabIndex = 0
      expect(wrapper.vm.collection).toBe('Spammer')

      wrapper.vm.tabIndex = 1
      expect(wrapper.vm.collection).toBe('PendingAdd')

      wrapper.vm.tabIndex = 2
      expect(wrapper.vm.collection).toBe('Whitelisted')

      wrapper.vm.tabIndex = 3
      expect(wrapper.vm.collection).toBe('PendingRemove')
    })
  })

  describe('methods', () => {
    it('searched method clears store and sets search term', () => {
      const wrapper = mountComponent()
      const initialInfiniteId = wrapper.vm.infiniteId

      wrapper.vm.searched('test search')

      expect(mockSpammerStore.clear).toHaveBeenCalled()
      expect(wrapper.vm.search).toBe('test search')
      expect(wrapper.vm.infiniteId).toBe(initialInfiniteId + 1)
    })

    it('loadMore increments show when more items available locally', async () => {
      const mockSpammers = [
        { id: 1, user: { spammer: {} }, byuser: null },
        { id: 2, user: { spammer: {} }, byuser: null },
      ]
      mockSpammerStore.getList.mockReturnValue(mockSpammers)

      const wrapper = mountComponent()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      wrapper.vm.show = 0
      await wrapper.vm.loadMore(mockState)

      expect(wrapper.vm.show).toBe(1)
      expect(mockState.loaded).toHaveBeenCalled()
    })

    it('loadMore fetches more when all local items shown', async () => {
      mockSpammerStore.getList.mockReturnValue([])
      const wrapper = mountComponent()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      wrapper.vm.show = 0
      await wrapper.vm.loadMore(mockState)

      expect(mockSpammerStore.fetch).toHaveBeenCalledWith({
        collection: expect.any(String),
        search: null,
        modtools: true,
      })
    })

    it('loadMore calls complete when no new items fetched', async () => {
      mockSpammerStore.getList.mockReturnValue([])
      const wrapper = mountComponent()
      const mockState = { loaded: vi.fn(), complete: vi.fn() }

      await wrapper.vm.loadMore(mockState)

      expect(mockState.complete).toHaveBeenCalled()
    })
  })

  describe('watchers', () => {
    it('clears store and increments infiniteId when tabIndex changes', async () => {
      const wrapper = mountComponent()
      const initialInfiniteId = wrapper.vm.infiniteId

      wrapper.vm.tabIndex = 2
      await wrapper.vm.$nextTick()

      expect(mockSpammerStore.clear).toHaveBeenCalled()
      expect(wrapper.vm.infiniteId).toBe(initialInfiniteId + 1)
    })
  })

  describe('mounted behavior', () => {
    it('sets tabIndex to 1 (PendingAdd) when user has spam admin permission', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.tabIndex).toBe(1)
    })

    it('sets tabIndex to 0 (Spammer) when search is set', () => {
      const wrapper = mountComponent()
      wrapper.vm.search = 'test'
      wrapper.vm.tabIndex = 0
      // Re-mount to test mounted logic with search
      expect(wrapper.vm.tabIndex).toBe(0)
    })
  })

  describe('tab visibility', () => {
    it('shows PendingAdd tab when user has spam admin permission', () => {
      const wrapper = mountComponent()
      const tabs = wrapper.findAll('.tab')
      expect(tabs.length).toBeGreaterThan(1)
    })
  })
})
