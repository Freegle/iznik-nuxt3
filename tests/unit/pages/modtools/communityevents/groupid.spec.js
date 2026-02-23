import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CommunityEventsPage from '~/modtools/pages/communityevents/[[groupid]].vue'

// Mock stores
const mockCommunityEventStore = {
  list: {},
  clear: vi.fn(),
  fetchPending: vi.fn(),
}

vi.mock('~/stores/communityevent', () => ({
  useCommunityEventStore: () => mockCommunityEventStore,
}))

const mockAuthStore = {
  work: { pendingevents: 5 },
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

describe('CommunityEventsPage', () => {
  function mountComponent() {
    return mount(CommunityEventsPage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          ModCommunityEvent: {
            template: '<div class="mod-community-event" :data-id="event.id" />',
            props: ['event'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          'infinite-loading': {
            template:
              '<div class="infinite-loading"><slot name="spinner" /></div>',
            props: ['forceUseInfiniteWrapper', 'distance'],
            emits: ['infinite'],
          },
          'b-img': {
            template: '<img />',
            props: ['src', 'alt', 'lazy'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockCommunityEventStore.list = {}
    mockAuthStore.work = { pendingevents: 5 }
    mockCommunityEventStore.fetchPending.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders events from store', async () => {
      mockCommunityEventStore.list = {
        1: { id: 1, title: 'Event 1' },
        2: { id: 2, title: 'Event 2' },
      }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.mod-community-event').length).toBe(2)
    })

    it('filters out null events', async () => {
      mockCommunityEventStore.list = {
        1: { id: 1, title: 'Event 1' },
        2: null,
        3: { id: 3, title: 'Event 3' },
      }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.mod-community-event').length).toBe(2)
    })

    it('shows empty message when no events and not busy', async () => {
      mockCommunityEventStore.list = {}
      const wrapper = mountComponent()
      wrapper.vm.busy = false
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('no community events to review')
    })

    it('hides empty message when busy', async () => {
      mockCommunityEventStore.list = {}
      const wrapper = mountComponent()
      wrapper.vm.busy = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('events returns array of non-null events from store', async () => {
      mockCommunityEventStore.list = {
        1: { id: 1 },
        2: null,
        3: { id: 3 },
      }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.events).toHaveLength(2)
      expect(wrapper.vm.events.map((e) => e.id)).toEqual([1, 3])
    })

    it('work returns pendingevents count from auth store', () => {
      mockAuthStore.work = { pendingevents: 10 }
      const wrapper = mountComponent()
      expect(wrapper.vm.work).toBe(10)
    })

    it('work returns 0 when auth work is null', () => {
      mockAuthStore.work = null
      const wrapper = mountComponent()
      expect(wrapper.vm.work).toBe(0)
    })
  })

  describe('lifecycle', () => {
    it('clears store on mount', () => {
      mountComponent()
      expect(mockCommunityEventStore.clear).toHaveBeenCalled()
    })
  })

  describe('methods', () => {
    it('loadMore fetches pending events', async () => {
      const wrapper = mountComponent()
      const mockState = { complete: vi.fn() }

      await wrapper.vm.loadMore(mockState)

      expect(mockCommunityEventStore.fetchPending).toHaveBeenCalledTimes(1)
      expect(mockState.complete).toHaveBeenCalled()
    })

    it('loadMore sets busy flag during fetch', async () => {
      const wrapper = mountComponent()
      const mockState = { complete: vi.fn() }

      expect(wrapper.vm.busy).toBe(false)
      const loadPromise = wrapper.vm.loadMore(mockState)
      expect(wrapper.vm.busy).toBe(true)
      await loadPromise
      expect(wrapper.vm.busy).toBe(false)
    })

    it('accumulates events across multiple loadMore calls', async () => {
      let callCount = 0
      mockCommunityEventStore.fetchPending.mockImplementation(() => {
        callCount++
        mockCommunityEventStore.list[callCount] = {
          id: callCount,
          title: `Event ${callCount}`,
        }
        return Promise.resolve()
      })

      const wrapper = mountComponent()
      const mockState = { complete: vi.fn() }

      await wrapper.vm.loadMore(mockState)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.events).toHaveLength(1)

      await wrapper.vm.loadMore(mockState)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.events).toHaveLength(2)
      expect(mockCommunityEventStore.fetchPending).toHaveBeenCalledTimes(2)
      expect(mockState.complete).toHaveBeenCalledTimes(2)
    })
  })
})
