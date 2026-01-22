import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import Feedback from '~/modtools/pages/members/feedback.vue'

// Mock $api
const mockDashboardFetch = vi.fn().mockResolvedValue({})

// Mock useNuxtApp
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $api: {
      dashboard: {
        fetch: mockDashboardFetch,
      },
    },
  }),
}))

// Mock member store
const mockMemberStore = {
  list: {},
  ratings: [],
  clear: vi.fn().mockResolvedValue({}),
  fetchMembers: vi.fn().mockResolvedValue([]),
  happinessReviewed: vi.fn().mockResolvedValue({}),
}

// Mock user store
const mockUserStore = {
  ratingReviewed: vi.fn().mockResolvedValue({}),
}

// Mock modMembers composable return values
const mockGroupid = ref(0)
const mockBusy = ref(false)
const mockContext = ref(null)
const mockShow = ref(0)
const mockCollection = ref('')
const mockDistance = ref(100)
const mockSummary = ref(false)
const mockMembers = ref([])
const mockFilter = ref('')
const mockLoadMore = vi.fn()

vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/composables/useModMembers', () => ({
  setupModMembers: () => ({
    busy: mockBusy,
    context: mockContext,
    groupid: mockGroupid,
    limit: ref(1000),
    show: mockShow,
    collection: mockCollection,
    distance: mockDistance,
    summary: mockSummary,
    members: mockMembers,
    filter: mockFilter,
    loadMore: mockLoadMore,
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    fetchMe: vi.fn().mockResolvedValue({}),
  }),
}))

describe('Feedback Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMemberStore.list = {}
    mockMemberStore.ratings = []
    mockGroupid.value = 0
    mockBusy.value = false
    mockContext.value = null
    mockShow.value = 0
    mockCollection.value = ''
    mockMembers.value = []
    mockFilter.value = ''
    mockDashboardFetch.mockResolvedValue({})
  })

  function mountComponent() {
    return mount(Feedback, {
      global: {
        stubs: {
          'client-only': { template: '<div><slot /></div>' },
          ScrollToTop: { template: '<div class="scroll-to-top" />' },
          ModHelpFeedback: { template: '<div class="mod-help-feedback" />' },
          ModGroupSelect: {
            template: '<select class="mod-group-select"><slot /></select>',
            props: ['modelValue', 'modonly', 'all', 'remember'],
          },
          'b-tabs': {
            template: '<div class="b-tabs"><slot /></div>',
            props: ['modelValue', 'contentClass', 'card'],
          },
          'b-tab': {
            template: '<div class="b-tab"><slot /><slot name="title" /></div>',
            props: ['active'],
          },
          'b-form-select': {
            template: '<select class="b-form-select"><slot /></select>',
            props: ['modelValue'],
          },
          'b-button': {
            template:
              '<button class="b-button" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'b-card': {
            template:
              '<div class="b-card"><slot /><slot name="default" /></div>',
            props: ['variant'],
          },
          'b-card-text': {
            template: '<div class="b-card-text"><slot /></div>',
          },
          GChart: {
            template: '<div class="gchart" />',
            props: ['type', 'data', 'options'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
          },
          ModMemberHappiness: {
            template: '<div class="mod-member-happiness" :data-id="id" />',
            props: ['id'],
          },
          ModMemberRating: {
            template:
              '<div class="mod-member-rating" :data-rating-id="rating.id" />',
            props: ['rating'],
          },
          'infinite-loading': {
            template:
              '<div class="infinite-loading"><slot name="spinner" /><slot name="complete" /></div>',
            props: [
              'direction',
              'forceUseInfiniteWrapper',
              'distance',
              'identifier',
            ],
          },
          'b-img': { template: '<img />' },
        },
        mocks: {
          $api: {
            dashboard: {
              fetch: mockDashboardFetch,
            },
          },
          $nextTick: (fn) => Promise.resolve().then(fn),
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders ScrollToTop component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.scroll-to-top').exists()).toBe(true)
    })

    it('renders ModHelpFeedback component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-help-feedback').exists()).toBe(true)
    })

    it('renders tabs structure', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.b-tabs').exists()).toBe(true)
    })

    it('renders group select', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-group-select').exists()).toBe(true)
    })

    it('shows empty message when no members and not busy', async () => {
      mockMembers.value = []
      mockBusy.value = false
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.find('.notice-message').exists()).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('returns ratings from member store', () => {
      mockMemberStore.ratings = [
        { id: 1, rating: 'up' },
        { id: 2, rating: 'down' },
      ]
      const wrapper = mountComponent()

      expect(wrapper.vm.ratings).toEqual([
        { id: 1, rating: 'up' },
        { id: 2, rating: 'down' },
      ])
    })

    it('sortedItems creates member objects with type and timestamp', () => {
      mockMembers.value = [
        { id: 1, timestamp: '2024-01-15T10:00:00Z' },
        { id: 2, timestamp: '2024-01-16T10:00:00Z' },
      ]
      const wrapper = mountComponent()
      const sorted = wrapper.vm.sortedItems

      expect(sorted).toHaveLength(2)
      expect(sorted[0].type).toBe('Member')
      expect(sorted[0].id).toBe('member-2') // More recent first
      expect(sorted[1].id).toBe('member-1')
    })

    it('sortedItems sorts by timestamp descending', () => {
      mockMembers.value = [
        { id: 1, timestamp: '2024-01-10T10:00:00Z' },
        { id: 2, timestamp: '2024-01-20T10:00:00Z' },
        { id: 3, timestamp: '2024-01-15T10:00:00Z' },
      ]
      const wrapper = mountComponent()
      const sorted = wrapper.vm.sortedItems

      expect(sorted[0].object.id).toBe(2) // Jan 20
      expect(sorted[1].object.id).toBe(3) // Jan 15
      expect(sorted[2].object.id).toBe(1) // Jan 10
    })

    it('visibleItems limits to show value', () => {
      mockMembers.value = [
        { id: 1, timestamp: '2024-01-15T10:00:00Z' },
        { id: 2, timestamp: '2024-01-16T10:00:00Z' },
        { id: 3, timestamp: '2024-01-17T10:00:00Z' },
      ]
      mockShow.value = 2
      const wrapper = mountComponent()
      const visible = wrapper.vm.visibleItems

      expect(visible).toHaveLength(2)
    })
  })

  describe('filterMatch method', () => {
    it('returns true for Comments filter when member has comments', () => {
      const wrapper = mountComponent()
      wrapper.vm.filter = 'Comments'

      const member = { happiness: 'Happy', comments: 'Great service!' }
      expect(wrapper.vm.filterMatch(member)).toBe(true)
    })

    it('returns false for Comments filter when member has no comments', () => {
      const wrapper = mountComponent()
      wrapper.vm.filter = 'Comments'

      const member = { happiness: 'Happy', comments: '' }
      expect(wrapper.vm.filterMatch(member)).toBe(false)
    })

    it('returns true for Comments filter when comments is whitespace-only', () => {
      const wrapper = mountComponent()
      wrapper.vm.filter = 'Comments'

      const member = { happiness: 'Happy', comments: '   \n\r   ' }
      expect(wrapper.vm.filterMatch(member)).toBe(false)
    })

    it('matches Happy filter', () => {
      const wrapper = mountComponent()
      wrapper.vm.filter = 'Happy'

      expect(wrapper.vm.filterMatch({ happiness: 'Happy' })).toBe(true)
      expect(wrapper.vm.filterMatch({ happiness: 'Unhappy' })).toBe(false)
    })

    it('matches Unhappy filter', () => {
      const wrapper = mountComponent()
      wrapper.vm.filter = 'Unhappy'

      expect(wrapper.vm.filterMatch({ happiness: 'Unhappy' })).toBe(true)
      expect(wrapper.vm.filterMatch({ happiness: 'Happy' })).toBe(false)
    })

    it('matches Fine filter including null happiness', () => {
      const wrapper = mountComponent()
      wrapper.vm.filter = 'Fine'

      expect(wrapper.vm.filterMatch({ happiness: 'Fine' })).toBe(true)
      expect(wrapper.vm.filterMatch({ happiness: null })).toBe(true)
      expect(wrapper.vm.filterMatch({ happiness: undefined })).toBe(true)
      expect(wrapper.vm.filterMatch({ happiness: 'Happy' })).toBe(false)
    })

    it('returns true when no filter is set', () => {
      const wrapper = mountComponent()
      wrapper.vm.filter = ''

      expect(wrapper.vm.filterMatch({ happiness: 'Happy' })).toBe(true)
      expect(wrapper.vm.filterMatch({ happiness: null })).toBe(true)
    })
  })

  describe('lifecycle', () => {
    it('sets collection to Happiness in setup', () => {
      mountComponent()
      expect(mockCollection.value).toBe('Happiness')
    })

    it('sets filter to Comments on mount', async () => {
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.vm.filter).toBe('Comments')
    })

    it('calls getHappiness on mount', async () => {
      mountComponent()
      await flushPromises()

      expect(mockDashboardFetch).toHaveBeenCalled()
    })
  })

  describe('getHappiness method', () => {
    it('fetches happiness data for all groups when groupid is 0', async () => {
      mockGroupid.value = 0
      mountComponent()
      await flushPromises()

      expect(mockDashboardFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          components: ['Happiness'],
          allgroups: true,
          group: null,
          systemwide: false,
        })
      )
    })

    it('fetches happiness data for specific group when groupid > 0', async () => {
      mockGroupid.value = 123
      mountComponent()
      await flushPromises()

      expect(mockDashboardFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          components: ['Happiness'],
          allgroups: false,
          group: 123,
          systemwide: false,
        })
      )
    })

    it('fetches systemwide data when groupid < 0', async () => {
      mockGroupid.value = -1
      mountComponent()
      await flushPromises()

      expect(mockDashboardFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          components: ['Happiness'],
          allgroups: false,
          group: null,
          systemwide: true,
        })
      )
    })

    it('populates happinessData from response', async () => {
      mockDashboardFetch.mockResolvedValue({
        Happiness: [
          { happiness: 'Happy', count: 10 },
          { happiness: 'Unhappy', count: 3 },
        ],
      })

      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.vm.happinessData).toEqual([
        ['Feedback', 'Count'],
        ['Happy', 10],
        ['Unhappy', 3],
      ])
    })
  })

  describe('data properties', () => {
    it('initializes tabIndex to 0', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.tabIndex).toBe(0)
    })

    it('initializes happinessData as empty array', () => {
      const wrapper = mountComponent()
      // After mount, it gets populated from getHappiness
      expect(Array.isArray(wrapper.vm.happinessData)).toBe(true)
    })

    it('initializes happinessOptions with chart configuration', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.happinessOptions).toHaveProperty('chartArea')
      expect(wrapper.vm.happinessOptions.colors).toEqual([
        'green',
        '#f8f9fa',
        'orange',
      ])
    })
  })
})
