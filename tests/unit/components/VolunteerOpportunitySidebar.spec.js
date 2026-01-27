import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import VolunteerOpportunitySidebar from '~/components/VolunteerOpportunitySidebar.vue'

const mockVolunteeringStore = {
  fetchList: vi.fn().mockResolvedValue(undefined),
  forUser: [
    { id: 1, title: 'Opportunity 1' },
    { id: 2, title: 'Opportunity 2' },
    { id: 3, title: 'Opportunity 3' },
  ],
}

vi.mock('~/stores/volunteering', () => ({
  useVolunteeringStore: () => mockVolunteeringStore,
}))

describe('VolunteerOpportunitySidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockVolunteeringStore.forUser = [
      { id: 1, title: 'Opportunity 1' },
      { id: 2, title: 'Opportunity 2' },
      { id: 3, title: 'Opportunity 3' },
    ]
  })

  async function createWrapper() {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(VolunteerOpportunitySidebar),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          CommunityFeature: {
            template:
              '<div class="community-feature" :data-title="title" :data-link="link"><slot /></div>',
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
      expect(feature.attributes('data-title')).toBe('Volunteer Opportunities')
    })

    it('renders CommunityFeature with correct link', async () => {
      const wrapper = await createWrapper()
      const feature = wrapper.find('.community-feature')
      expect(feature.attributes('data-link')).toBe('/volunteerings')
    })

    it('renders infinite-loading component', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.infinite-loading').exists()).toBe(true)
    })
  })

  describe('data fetching', () => {
    it('calls fetchList on mount', async () => {
      await createWrapper()
      expect(mockVolunteeringStore.fetchList).toHaveBeenCalled()
    })
  })

  describe('computed opportunities', () => {
    it('shows first opportunity initially', async () => {
      const wrapper = await createWrapper()
      const sidebarComponent = wrapper.findComponent(
        VolunteerOpportunitySidebar
      )
      expect(sidebarComponent.vm.toShow).toBe(1)
    })

    it('returns sliced forUser based on toShow', async () => {
      const wrapper = await createWrapper()
      const sidebarComponent = wrapper.findComponent(
        VolunteerOpportunitySidebar
      )
      expect(sidebarComponent.vm.opportunities).toEqual([
        { id: 1, title: 'Opportunity 1' },
      ])
    })
  })

  describe('loadMore method', () => {
    it('increments toShow and calls loaded when more opportunities available', async () => {
      const wrapper = await createWrapper()
      const sidebarComponent = wrapper.findComponent(
        VolunteerOpportunitySidebar
      )

      const mockState = {
        loaded: vi.fn(),
        complete: vi.fn(),
      }

      sidebarComponent.vm.loadMore(mockState)

      expect(sidebarComponent.vm.toShow).toBe(2)
      expect(mockState.loaded).toHaveBeenCalled()
      expect(mockState.complete).not.toHaveBeenCalled()
    })

    it('calls complete when all opportunities are shown', async () => {
      const wrapper = await createWrapper()
      const sidebarComponent = wrapper.findComponent(
        VolunteerOpportunitySidebar
      )

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
      mockVolunteeringStore.forUser = []
      const wrapper = await createWrapper()
      const sidebarComponent = wrapper.findComponent(
        VolunteerOpportunitySidebar
      )
      expect(sidebarComponent.vm.opportunities).toEqual([])
    })

    it('handles undefined forUser', async () => {
      mockVolunteeringStore.forUser = undefined
      const wrapper = await createWrapper()
      const sidebarComponent = wrapper.findComponent(
        VolunteerOpportunitySidebar
      )
      expect(sidebarComponent.vm.opportunities).toBeUndefined()
    })
  })
})
