import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import JobsSidebar from '~/components/JobsSidebar.vue'

const { mockBlocked, mockJobList } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockBlocked: ref(false),
    mockJobList: ref([]),
  }
})

const mockJobStore = {
  get blocked() {
    return mockBlocked.value
  },
  get list() {
    return mockJobList.value
  },
  fetch: vi.fn().mockResolvedValue(undefined),
}

const mockAuthStore = {
  user: {
    id: 1,
    lat: 51.5074,
    lng: -0.1278,
    settings: {
      mylocation: { name: 'London' },
    },
  },
}

vi.mock('~/stores/job', () => ({
  useJobStore: () => mockJobStore,
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    storeToRefs: () => ({
      list: mockJobList,
      blocked: mockBlocked,
    }),
  }
})

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    defineAsyncComponent: (loader) => ({
      template: '<div class="async-component"><slot /></div>',
    }),
  }
})

describe('JobsSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBlocked.value = false
    mockJobList.value = []
    mockAuthStore.user = {
      id: 1,
      lat: 51.5074,
      lng: -0.1278,
      settings: {
        mylocation: { name: 'London' },
      },
    }
  })

  async function createWrapper() {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(JobsSidebar),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          JobOne: {
            template:
              '<div class="job-one" :data-id="id" :data-summary="summary" />',
            props: [
              'id',
              'summary',
              'bgColour',
              'position',
              'listLength',
              'context',
            ],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          DonationButton: {
            template: '<button class="donation-button">Donate</button>',
          },
          'nuxt-link': {
            template: '<a class="nuxt-link" :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          InfiniteLoading: {
            template:
              '<div class="infinite-loading"><slot name="no-results" /><slot name="no-more" /><slot name="spinner" /></div>',
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering when no location', () => {
    it('does not render when user has no location', async () => {
      mockAuthStore.user.settings.mylocation = null
      const wrapper = await createWrapper()

      expect(wrapper.find('.jobs-sidebar').exists()).toBe(false)
    })

    it('does not render when user is null', async () => {
      mockAuthStore.user = null
      const wrapper = await createWrapper()

      expect(wrapper.find('.jobs-sidebar').exists()).toBe(false)
    })
  })

  describe('rendering with location and jobs', () => {
    beforeEach(() => {
      mockJobList.value = [
        { id: 1, job_reference: 'ref-1' },
        { id: 2, job_reference: 'ref-2' },
        { id: 3, job_reference: 'ref-3' },
      ]
    })

    it('renders jobs-sidebar container', async () => {
      const wrapper = await createWrapper()

      expect(wrapper.find('.jobs-sidebar').exists()).toBe(true)
    })

    it('renders header with link to /jobs', async () => {
      const wrapper = await createWrapper()

      const link = wrapper.find('.jobs-sidebar-title-link')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('/jobs')
    })

    it('renders briefcase icon', async () => {
      const wrapper = await createWrapper()

      expect(wrapper.find('.v-icon[data-icon="briefcase"]').exists()).toBe(true)
    })

    it('renders "Jobs near you" title', async () => {
      const wrapper = await createWrapper()

      expect(wrapper.text()).toContain('Jobs near you')
    })

    it('renders info text about affiliate earnings', async () => {
      const wrapper = await createWrapper()

      expect(wrapper.text()).toContain(
        'Freegle gets a small amount if you click'
      )
    })

    it('renders view all jobs link in footer', async () => {
      const wrapper = await createWrapper()

      const link = wrapper.find('.jobs-sidebar-more')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('/jobs')
      expect(link.text()).toContain('View all jobs')
    })

    it('renders infinite loading component', async () => {
      const wrapper = await createWrapper()

      expect(wrapper.find('.infinite-loading').exists()).toBe(true)
    })
  })

  describe('when blocked', () => {
    it('renders notice message when blocked', async () => {
      mockBlocked.value = true
      mockJobList.value = [{ id: 1, job_reference: 'ref-1' }]
      const wrapper = await createWrapper()

      expect(wrapper.find('.notice-message').exists()).toBe(true)
    })
  })

  describe('when no jobs', () => {
    it('does not render when list is empty', async () => {
      mockJobList.value = []
      const wrapper = await createWrapper()

      expect(wrapper.find('.jobs-sidebar').exists()).toBe(false)
    })
  })

  describe('data fetching', () => {
    it('fetches jobs on mount when user has location', async () => {
      mockJobList.value = [{ id: 1, job_reference: 'ref-1' }]
      await createWrapper()

      expect(mockJobStore.fetch).toHaveBeenCalledWith(51.5074, -0.1278)
    })

    it('does not fetch when user has no lat/lng', async () => {
      mockAuthStore.user.lat = null
      mockAuthStore.user.lng = null
      await createWrapper()

      expect(mockJobStore.fetch).not.toHaveBeenCalled()
    })
  })

  describe('visibleJobs computed', () => {
    it('uses SSR mode to return all jobs by default', async () => {
      mockJobList.value = [
        { id: 1, job_reference: 'ref-1' },
        { id: 2, job_reference: 'ref-2' },
        { id: 3, job_reference: 'ref-3' },
        { id: 4, job_reference: 'ref-4' },
        { id: 5, job_reference: 'ref-5' },
      ]
      const wrapper = await createWrapper()

      // In SSR mode (process.client is false in tests), all jobs are returned
      const component = wrapper.findComponent(JobsSidebar)
      expect(component.vm.visibleJobs.length).toBe(5)
    })
  })
})
