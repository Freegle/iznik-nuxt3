import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import JobOne from '~/components/JobOne.vue'

const mockJob = {
  id: 123,
  job_reference: 'test-ref-123',
  title: 'Software Developer',
  location: ', London',
  url: 'https://jobs.example.com/123',
  image: 'https://example.com/job-image.jpg',
  category: 'IT;Technology',
  dist: 5.5,
  body: 'This is a great job opportunity for developers.',
  cpc: 0.5,
}

const mockJobStore = {
  byId: vi.fn().mockReturnValue(mockJob),
  log: vi.fn(),
}

const mockRouter = {
  push: vi.fn(),
  currentRoute: { value: { path: '/browse' } },
}

const mockAction = vi.fn()

vi.mock('~/stores/job', () => ({
  useJobStore: () => mockJobStore,
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

vi.mock('~/composables/useClientLog', () => ({
  action: (...args) => mockAction(...args),
}))

vi.mock('~/constants', () => ({
  JOB_ICON_COLOURS: {
    'dark green': '#2d5016',
    'soft sage green': '#7a9e7e',
  },
}))

describe('JobOne', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockJobStore.byId.mockReturnValue({ ...mockJob })
    mockRouter.currentRoute = { value: { path: '/browse' } }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(JobOne, {
      props: {
        id: 123,
        ...props,
      },
      global: {
        stubs: {
          ExternalLink: {
            template: '<a class="external-link" :href="href"><slot /></a>',
            props: ['href'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders job-item container when job exists', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.job-item').exists()).toBe(true)
    })

    it('does not render when job is null', () => {
      mockJobStore.byId.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.find('.job-item').exists()).toBe(false)
    })

    it('calls byId with correct id', () => {
      createWrapper({ id: 456 })
      expect(mockJobStore.byId).toHaveBeenCalledWith(456)
    })
  })

  describe('summary mode', () => {
    it('renders job-summary when summary prop is true', () => {
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.job-summary').exists()).toBe(true)
      expect(wrapper.find('.job-card').exists()).toBe(false)
    })

    it('renders job title', () => {
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.job-title').text()).toBe('Software Developer')
    })

    it('renders job location without leading comma', () => {
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.job-location').text()).toContain('London')
    })

    it('renders briefcase icon when no image', () => {
      mockJobStore.byId.mockReturnValue({ ...mockJob, image: null })
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.v-icon[data-icon="briefcase"]').exists()).toBe(true)
    })

    it('renders chevron icon', () => {
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.v-icon[data-icon="chevron-right"]').exists()).toBe(
        true
      )
    })
  })

  describe('card mode', () => {
    it('renders job-card when summary prop is false', () => {
      const wrapper = createWrapper({ summary: false })
      expect(wrapper.find('.job-card').exists()).toBe(true)
      expect(wrapper.find('.job-summary').exists()).toBe(false)
    })

    it('renders card title', () => {
      const wrapper = createWrapper({ summary: false })
      expect(wrapper.find('.job-card-title').text()).toBe('Software Developer')
    })

    it('renders job category', () => {
      const wrapper = createWrapper({ summary: false })
      expect(wrapper.find('.job-category').text()).toBe('IT')
    })

    it('renders distance in miles', () => {
      const wrapper = createWrapper({ summary: false })
      expect(wrapper.find('.job-distance').text()).toContain('mi')
    })

    it('renders Nearby for very close jobs', () => {
      mockJobStore.byId.mockReturnValue({ ...mockJob, dist: 0.5 })
      const wrapper = createWrapper({ summary: false })
      expect(wrapper.find('.job-distance').text()).toContain('Nearby')
    })

    it('renders job description', () => {
      const wrapper = createWrapper({ summary: false })
      expect(wrapper.find('.job-card-description').text()).toContain(
        'great job opportunity'
      )
    })

    it('adds highlight class when highlight prop is true', () => {
      const wrapper = createWrapper({ summary: false, highlight: true })
      expect(wrapper.find('.job-card--highlight').exists()).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('returns empty title when job has no title', () => {
      mockJobStore.byId.mockReturnValue({ ...mockJob, title: null })
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.job-title').text()).toBe('')
    })

    it('cleans up location with leading comma', () => {
      mockJobStore.byId.mockReturnValue({
        ...mockJob,
        location: ', Manchester',
      })
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.job-location').text()).toContain('Manchester')
      expect(wrapper.find('.job-location').text()).not.toContain(', Manchester')
    })

    it('returns first category when multiple are present', () => {
      mockJobStore.byId.mockReturnValue({
        ...mockJob,
        category: 'Healthcare;Medical;Nursing',
      })
      const wrapper = createWrapper({ summary: false })
      expect(wrapper.find('.job-category').text()).toBe('Healthcare')
    })

    it('truncates long descriptions', () => {
      const longBody = 'A'.repeat(200)
      mockJobStore.byId.mockReturnValue({ ...mockJob, body: longBody })
      const wrapper = createWrapper({ summary: false })
      const description = wrapper.find('.job-card-description').text()
      expect(description.length).toBeLessThan(200)
      expect(description).toContain('...')
    })
  })

  describe('click handling', () => {
    it('logs click to jobStore', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.job-item').trigger('click')
      expect(mockJobStore.log).toHaveBeenCalledWith({ id: 123 })
    })

    it('logs click action for analytics', async () => {
      const wrapper = createWrapper({
        position: 2,
        listLength: 10,
        context: 'sidebar',
      })
      await wrapper.find('.job-item').trigger('click')
      expect(mockAction).toHaveBeenCalledWith(
        'job_ad_click',
        expect.objectContaining({
          job_id: 123,
          position: 2,
          list_length: 10,
          context: 'sidebar',
        })
      )
    })

    it('navigates to /jobs when not already on jobs page', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.job-item').trigger('click')
      expect(mockRouter.push).toHaveBeenCalledWith('/jobs')
    })

    it('does not navigate when already on jobs page', async () => {
      mockRouter.currentRoute = { value: { path: '/jobs' } }
      const wrapper = createWrapper()
      await wrapper.find('.job-item').trigger('click')
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  describe('hover handling', () => {
    it('logs hover action once', async () => {
      const wrapper = createWrapper({ position: 1, listLength: 5 })
      await wrapper.find('.job-item').trigger('mouseenter')
      expect(mockAction).toHaveBeenCalledWith(
        'job_ad_hover',
        expect.objectContaining({
          job_id: 123,
          position: 1,
          list_length: 5,
        })
      )
    })

    it('does not log hover action twice', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.job-item').trigger('mouseenter')
      await wrapper.find('.job-item').trigger('mouseenter')
      const hoverCalls = mockAction.mock.calls.filter(
        (call) => call[0] === 'job_ad_hover'
      )
      expect(hoverCalls.length).toBe(1)
    })
  })

  describe('icon styles', () => {
    it('applies dark green background by default', () => {
      const wrapper = createWrapper({ summary: true })
      const icon = wrapper.find('.job-icon')
      expect(icon.attributes('style')).toContain('#2d5016')
    })

    it('applies custom bgColour', () => {
      const wrapper = createWrapper({
        summary: true,
        bgColour: 'soft sage green',
      })
      const icon = wrapper.find('.job-icon')
      expect(icon.attributes('style')).toContain('#7a9e7e')
    })
  })

  describe('external link', () => {
    it('links to job URL', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.external-link').attributes('href')).toBe(
        'https://jobs.example.com/123'
      )
    })
  })

  describe('filterNonsense utility', () => {
    it('cleans up escaped newlines', () => {
      mockJobStore.byId.mockReturnValue({
        ...mockJob,
        title: 'Job\\nTitle',
      })
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.job-title').text()).toBe('Job\nTitle')
    })

    it('cleans up HTML br tags', () => {
      mockJobStore.byId.mockReturnValue({
        ...mockJob,
        title: 'Job<br>Title',
      })
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.job-title').text()).toBe('Job\nTitle')
    })

    it('cleans up currency encoding', () => {
      mockJobStore.byId.mockReturnValue({
        ...mockJob,
        title: 'Â£50k Salary',
      })
      const wrapper = createWrapper({ summary: true })
      expect(wrapper.find('.job-title').text()).toBe('£50k Salary')
    })
  })
})
