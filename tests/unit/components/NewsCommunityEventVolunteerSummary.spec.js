import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import NewsCommunityEventVolunteerSummary from '~/components/NewsCommunityEventVolunteerSummary.vue'

const { mockForUser, mockVolForUser } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockForUser: ref([1, 2, 3]),
    mockVolForUser: ref([4, 5]),
  }
})

const mockCommunityEventStore = {
  fetchList: vi.fn().mockResolvedValue(undefined),
  fetch: vi.fn().mockResolvedValue({ title: 'Test Event' }),
  get forUser() {
    return mockForUser.value
  },
}

const mockVolunteeringStore = {
  fetchList: vi.fn().mockResolvedValue(undefined),
  fetch: vi.fn().mockResolvedValue({ title: 'Test Volunteering' }),
  get forUser() {
    return mockVolForUser.value
  },
}

vi.mock('~/stores/communityevent', () => ({
  useCommunityEventStore: () => mockCommunityEventStore,
}))

vi.mock('~/stores/volunteering', () => ({
  useVolunteeringStore: () => mockVolunteeringStore,
}))

describe('NewsCommunityEventVolunteerSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockForUser.value = [1, 2, 3]
    mockVolForUser.value = [4, 5]
    mockCommunityEventStore.fetch.mockResolvedValue({ title: 'Test Event' })
    mockVolunteeringStore.fetch.mockResolvedValue({
      title: 'Test Volunteering',
    })
  })

  async function createWrapper() {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(NewsCommunityEventVolunteerSummary),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          NuxtLink: {
            template:
              '<a class="nuxt-link" :href="to" :data-to="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders summary card when data exists', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.summary-card').exists()).toBe(true)
    })

    it('does not render when no events or opportunities', async () => {
      mockForUser.value = []
      mockVolForUser.value = []
      const wrapper = await createWrapper()
      expect(wrapper.find('.summary-card').exists()).toBe(false)
    })

    it('shows calendar icon', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.v-icon[data-icon="calendar-alt"]').exists()).toBe(
        true
      )
    })
  })

  describe('header text', () => {
    it('shows Community Events when events exist', async () => {
      mockVolForUser.value = []
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Community Events')
    })

    it('shows Volunteer Opportunities when opportunities exist', async () => {
      mockForUser.value = []
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Volunteer Opportunities')
    })

    it('shows both with ampersand when both exist', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Community Events')
      expect(wrapper.text()).toContain('&')
      expect(wrapper.text()).toContain('Volunteer Opportunities')
    })
  })

  describe('community events row', () => {
    it('renders link to /communityevents', async () => {
      const wrapper = await createWrapper()
      const link = wrapper.find('a[data-to="/communityevents"]')
      expect(link.exists()).toBe(true)
    })

    it('shows +N more when multiple events', async () => {
      mockForUser.value = [1, 2, 3]
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('+2 more')
    })

    it('does not show +N more for single event', async () => {
      mockForUser.value = [1]
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('+0 more')
    })
  })

  describe('volunteer opportunities row', () => {
    it('renders link to /volunteering', async () => {
      const wrapper = await createWrapper()
      const link = wrapper.find('a[data-to="/volunteering"]')
      expect(link.exists()).toBe(true)
    })

    it('shows +N more when multiple opportunities', async () => {
      mockVolForUser.value = [4, 5]
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('+1 more')
    })
  })

  describe('data fetching', () => {
    it('fetches community event list on mount', async () => {
      await createWrapper()
      expect(mockCommunityEventStore.fetchList).toHaveBeenCalled()
    })

    it('fetches volunteering list on mount', async () => {
      await createWrapper()
      expect(mockVolunteeringStore.fetchList).toHaveBeenCalled()
    })

    it('fetches first event details when events exist', async () => {
      mockForUser.value = [1, 2]
      await createWrapper()
      expect(mockCommunityEventStore.fetch).toHaveBeenCalledWith(1)
    })

    it('fetches first opportunity details when opportunities exist', async () => {
      mockVolForUser.value = [4, 5]
      await createWrapper()
      expect(mockVolunteeringStore.fetch).toHaveBeenCalledWith(4)
    })

    it('does not fetch event details when no events', async () => {
      mockForUser.value = []
      await createWrapper()
      expect(mockCommunityEventStore.fetch).not.toHaveBeenCalled()
    })
  })
})
