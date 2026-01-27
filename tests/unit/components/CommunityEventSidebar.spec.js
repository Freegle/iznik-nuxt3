import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import CommunityEventSidebar from '~/components/CommunityEventSidebar.vue'

const mockCommunityEventStore = {
  fetchList: vi.fn().mockResolvedValue(undefined),
  forUser: [
    { id: 1, title: 'Event 1' },
    { id: 2, title: 'Event 2' },
    { id: 3, title: 'Event 3' },
  ],
}

vi.mock('~/stores/communityevent', () => ({
  useCommunityEventStore: () => mockCommunityEventStore,
}))

describe('CommunityEventSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCommunityEventStore.forUser = [
      { id: 1, title: 'Event 1' },
      { id: 2, title: 'Event 2' },
      { id: 3, title: 'Event 3' },
    ]
  })

  async function createWrapper() {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(CommunityEventSidebar),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          CommunityFeature: {
            template:
              '<div class="community-feature" :data-title="title"><slot /></div>',
            props: [
              'items',
              'title',
              'link',
              'iconName',
              'addButtonLabel',
              'itemDescription',
              'noItemsMessage',
              'featureComponent',
              'addModalComponent',
              'itemKey',
            ],
          },
          'infinite-loading': {
            template: '<div class="infinite-loading" />',
            props: ['distance'],
            emits: ['infinite'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders aside element', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('aside').exists()).toBe(true)
    })

    it('renders CommunityFeature with correct title', async () => {
      const wrapper = await createWrapper()
      const feature = wrapper.find('.community-feature')
      expect(feature.exists()).toBe(true)
      expect(feature.attributes('data-title')).toBe('Community Events')
    })

    it('renders infinite-loading component', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.infinite-loading').exists()).toBe(true)
    })
  })

  describe('data fetching', () => {
    it('calls fetchList on mount', async () => {
      await createWrapper()
      expect(mockCommunityEventStore.fetchList).toHaveBeenCalled()
    })
  })

  describe('computed events', () => {
    it('shows first event initially', async () => {
      const wrapper = await createWrapper()
      const sidebarComponent = wrapper.findComponent(CommunityEventSidebar)
      expect(sidebarComponent.vm.toShow).toBe(1)
    })

    it('returns sliced forUser based on toShow', async () => {
      const wrapper = await createWrapper()
      const sidebarComponent = wrapper.findComponent(CommunityEventSidebar)
      expect(sidebarComponent.vm.events).toEqual([{ id: 1, title: 'Event 1' }])
    })
  })

  describe('loadMore method', () => {
    it('increments toShow and calls loaded when more events available', async () => {
      const wrapper = await createWrapper()
      const sidebarComponent = wrapper.findComponent(CommunityEventSidebar)

      const mockState = {
        loaded: vi.fn(),
        complete: vi.fn(),
      }

      sidebarComponent.vm.loadMore(mockState)

      expect(sidebarComponent.vm.toShow).toBe(2)
      expect(mockState.loaded).toHaveBeenCalled()
      expect(mockState.complete).not.toHaveBeenCalled()
    })

    it('calls complete when all events are shown', async () => {
      const wrapper = await createWrapper()
      const sidebarComponent = wrapper.findComponent(CommunityEventSidebar)

      const mockState = {
        loaded: vi.fn(),
        complete: vi.fn(),
      }

      sidebarComponent.vm.toShow = 3

      sidebarComponent.vm.loadMore(mockState)

      expect(mockState.complete).toHaveBeenCalled()
      expect(mockState.loaded).not.toHaveBeenCalled()
    })
  })

  describe('empty state', () => {
    it('handles empty forUser array', async () => {
      mockCommunityEventStore.forUser = []
      const wrapper = await createWrapper()
      const sidebarComponent = wrapper.findComponent(CommunityEventSidebar)
      expect(sidebarComponent.vm.events).toEqual([])
    })

    it('handles undefined forUser', async () => {
      mockCommunityEventStore.forUser = undefined
      const wrapper = await createWrapper()
      const sidebarComponent = wrapper.findComponent(CommunityEventSidebar)
      expect(sidebarComponent.vm.events).toBeUndefined()
    })
  })
})
