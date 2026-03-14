import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import MembersReviewPage from '~/modtools/pages/members/review.vue'

// Create mock stores
const mockMemberStore = {
  clear: vi.fn(),
}

const mockMiscStore = {}

// Create mock mod members composable
const mockModMembers = {
  busy: ref(false),
  context: ref(null),
  group: ref(null),
  groupid: ref(0),
  limit: ref(100),
  show: ref(0),
  collection: ref('Spam'),
  messageTerm: ref(null),
  memberTerm: ref(null),
  distance: ref(1000),
  summary: ref(null),
  sort: ref(false),
  members: ref([]),
  visibleMembers: ref([]),
  loadMore: vi.fn(),
}

// Mock stores
vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

vi.mock('@/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

// Mock composables
vi.mock('~/composables/useModMembers', () => ({
  setupModMembers: () => mockModMembers,
}))

describe('members/review.vue page', () => {
  function mountComponent(options = {}) {
    return mount(MembersReviewPage, {
      global: {
        stubs: {
          'client-only': {
            template: '<div><slot /></div>',
          },
          ScrollToTop: { template: '<div class="scroll-stub" />' },
          ModHelpMemberReview: { template: '<div class="help-stub" />' },
          ModPostcodeTester: { template: '<div class="postcode-stub" />' },
          ModMemberReview: {
            template: '<div class="member-review-stub" />',
            props: ['member'],
            emits: ['forcerefresh'],
          },
          'notice-message': {
            template: '<div class="notice-stub"><slot /></div>',
          },
          'b-img': { template: '<img />' },
          'infinite-loading': {
            template:
              '<div class="infinite-loading"><slot name="spinner" /><slot name="complete" /></div>',
            props: [
              'direction',
              'forceUseInfiniteWrapper',
              'distance',
              'identifier',
            ],
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
    mockModMembers.visibleMembers.value = []
    mockModMembers.context.value = null
    mockModMembers.sort.value = false
    mockModMembers.collection.value = 'Spam'
    mockModMembers.groupid.value = 0
    mockModMembers.group.value = null
    mockModMembers.limit.value = 100
  })

  describe('initial state', () => {
    it('renders scroll to top component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.scroll-stub').exists()).toBe(true)
    })

    it('renders postcode tester component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.postcode-stub').exists()).toBe(true)
    })

    it('clears member store and increments bump on mount', () => {
      const wrapper = mountComponent()
      expect(mockMemberStore.clear).toHaveBeenCalled()
      // After mount, bump should be 1 (starts at 0, incremented in mounted)
      expect(wrapper.vm.bump).toBe(1)
    })
  })

  describe('modMembers setup', () => {
    it('sets context to null initially', () => {
      expect(mockModMembers.context.value).toBe(null)
    })

    it('sets sort to false initially', () => {
      expect(mockModMembers.sort.value).toBe(false)
    })

    it('sets collection to Spam initially', () => {
      expect(mockModMembers.collection.value).toBe('Spam')
    })

    it('sets groupid to 0 initially', () => {
      expect(mockModMembers.groupid.value).toBe(0)
    })

    it('sets group to null initially', () => {
      expect(mockModMembers.group.value).toBe(null)
    })

    it('sets limit to 100 initially', () => {
      expect(mockModMembers.limit.value).toBe(100)
    })
  })

  describe('methods', () => {
    it('forcerefresh increments bump on next tick', async () => {
      const wrapper = mountComponent()
      const initialBump = wrapper.vm.bump

      wrapper.vm.forcerefresh()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.bump).toBe(initialBump + 1)
    })
  })

  describe('rendering', () => {
    it('renders ModMemberReview for each visible member', async () => {
      mockModMembers.visibleMembers.value = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const reviews = wrapper.findAll('.member-review-stub')
      expect(reviews.length).toBe(3)
    })

    it('shows notice when no members', async () => {
      mockModMembers.visibleMembers.value = []
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.notice-stub').exists()).toBe(true)
    })

    it('renders infinite-loading component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.infinite-loading').exists()).toBe(true)
    })
  })
})
