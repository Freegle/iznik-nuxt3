import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import JobsDaSlot from '~/components/JobsDaSlot.vue'

const { mockJobList } = vi.hoisted(() => {
  return {
    mockJobList: [
      { id: 1, job_reference: 'ref-1' },
      { id: 2, job_reference: 'ref-2' },
      { id: 3, job_reference: 'ref-3' },
    ],
  }
})

const mockJobStore = {
  blocked: false,
  get list() {
    return mockJobList
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

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    defineAsyncComponent: (loader) => ({
      template: '<div class="async-component"><slot /></div>',
    }),
  }
})

describe('JobsDaSlot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockJobStore.blocked = false
    mockJobList.length = 0
    mockJobList.push(
      { id: 1, job_reference: 'ref-1' },
      { id: 2, job_reference: 'ref-2' },
      { id: 3, job_reference: 'ref-3' }
    )
    mockAuthStore.user = {
      id: 1,
      lat: 51.5074,
      lng: -0.1278,
      settings: {
        mylocation: { name: 'London' },
      },
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(JobsDaSlot, props),
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
            props: ['to'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
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

      expect(wrapper.find('.jobs-slot').exists()).toBe(false)
    })
  })

  describe('rendering with location and jobs', () => {
    it('renders jobs-slot container', async () => {
      const wrapper = await createWrapper()

      expect(wrapper.find('.jobs-slot').exists()).toBe(true)
    })

    it('renders header by default', async () => {
      const wrapper = await createWrapper()

      expect(wrapper.find('.jobs-slot-header').exists()).toBe(true)
    })

    it('renders briefcase icon', async () => {
      const wrapper = await createWrapper()

      expect(wrapper.find('.v-icon[data-icon="briefcase"]').exists()).toBe(true)
    })

    it('renders "Jobs near you" text', async () => {
      const wrapper = await createWrapper()

      expect(wrapper.text()).toContain('Jobs near you')
    })

    it('renders see all link to /jobs', async () => {
      const wrapper = await createWrapper()

      const link = wrapper.find('.jobs-slot-more')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('/jobs')
    })

    it('renders job items', async () => {
      const wrapper = await createWrapper()

      const jobs = wrapper.findAll('.job-one')
      expect(jobs.length).toBeGreaterThan(0)
    })
  })

  describe('hideHeader prop', () => {
    it('hides header when hideHeader is true', async () => {
      const wrapper = await createWrapper({ hideHeader: true })

      expect(wrapper.find('.jobs-slot-header').exists()).toBe(false)
    })
  })

  describe('dimension props', () => {
    it('applies minWidth style', async () => {
      const wrapper = await createWrapper({ minWidth: '200px' })

      const slot = wrapper.find('.jobs-slot')
      expect(slot.attributes('style')).toContain('min-width: 200px')
    })

    it('applies maxWidth style', async () => {
      const wrapper = await createWrapper({ maxWidth: '400px' })

      const slot = wrapper.find('.jobs-slot')
      expect(slot.attributes('style')).toContain('max-width: 400px')
    })

    it('applies minHeight style', async () => {
      const wrapper = await createWrapper({ minHeight: '100px' })

      const slot = wrapper.find('.jobs-slot')
      expect(slot.attributes('style')).toContain('min-height: 100px')
    })

    it('applies maxHeight style', async () => {
      const wrapper = await createWrapper({ maxHeight: '500px' })

      const slot = wrapper.find('.jobs-slot')
      expect(slot.attributes('style')).toContain('max-height: 500px')
    })
  })

  describe('when blocked', () => {
    it('renders notice message when blocked', async () => {
      mockJobStore.blocked = true
      const wrapper = await createWrapper()

      expect(wrapper.find('.notice-message').exists()).toBe(true)
    })
  })

  describe('when no jobs', () => {
    it('does not render when list is empty', async () => {
      mockJobList.length = 0
      const wrapper = await createWrapper()

      expect(wrapper.find('.jobs-slot').exists()).toBe(false)
    })
  })

  describe('data fetching', () => {
    it('fetches jobs on mount when user has location', async () => {
      await createWrapper()

      expect(mockJobStore.fetch).toHaveBeenCalledWith(51.5074, -0.1278)
    })
  })

  describe('emits', () => {
    it('emits rendered on mount', async () => {
      const wrapper = await createWrapper()

      const component = wrapper.findComponent(JobsDaSlot)
      expect(component.emitted('rendered')).toBeTruthy()
    })

    it('emits borednow after timeout', async () => {
      const wrapper = await createWrapper()

      vi.advanceTimersByTime(31000)

      const component = wrapper.findComponent(JobsDaSlot)
      expect(component.emitted('borednow')).toBeTruthy()
    })
  })

  describe('listOnly prop', () => {
    it('limits to 10 jobs when listOnly is true', async () => {
      // Add more jobs to test limiting
      for (let i = 4; i <= 25; i++) {
        mockJobList.push({ id: i, job_reference: `ref-${i}` })
      }
      const wrapper = await createWrapper({ listOnly: true })

      const component = wrapper.findComponent(JobsDaSlot)
      expect(component.vm.displayedJobs.length).toBeLessThanOrEqual(10)
    })
  })
})
