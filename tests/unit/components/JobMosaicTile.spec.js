import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import JobMosaicTile from '~/components/JobMosaicTile.vue'

const mockRouter = {
  push: vi.fn(),
  currentRoute: {
    value: { path: '/browse' },
  },
}

const mockJobStore = {
  byId: vi.fn(),
  log: vi.fn(),
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

vi.mock('~/stores/job', () => ({
  useJobStore: () => mockJobStore,
}))

vi.mock('~/constants', () => ({
  JOB_ICON_COLOURS: {
    'dark green': '#2e7d32',
    blue: '#1976d2',
    orange: '#f57c00',
  },
}))

describe('JobMosaicTile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRouter.currentRoute.value.path = '/browse'
    mockJobStore.byId.mockReturnValue({
      id: 1,
      title: 'Software Developer',
      location: 'London',
      url: 'https://example.com/job/1',
      image: 'https://example.com/image.jpg',
    })
  })

  function createWrapper(props = {}) {
    return mount(JobMosaicTile, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          ExternalLink: {
            template: '<a class="external-link" :href="href"><slot /></a>',
            props: ['href'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders tile when job exists', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.mosaic-tile').exists()).toBe(true)
    })

    it('does not render when job is null', () => {
      mockJobStore.byId.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.find('.mosaic-tile').exists()).toBe(false)
    })

    it('renders title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.mosaic-title').text()).toBe('Software Developer')
    })

    it('renders location with icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.mosaic-location').text()).toContain('London')
      expect(
        wrapper
          .find('.mosaic-location .v-icon[data-icon="map-marker-alt"]')
          .exists()
      ).toBe(true)
    })

    it('does not render location when empty', () => {
      mockJobStore.byId.mockReturnValue({
        id: 1,
        title: 'Developer',
        location: '',
        url: 'https://example.com',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.mosaic-location').exists()).toBe(false)
    })

    it('renders ExternalLink with job URL', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.external-link').attributes('href')).toBe(
        'https://example.com/job/1'
      )
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 5 })
      expect(wrapper.props('id')).toBe(5)
    })

    it('has default bgColour of dark green', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('bgColour')).toBe('dark green')
    })

    it('accepts custom bgColour', () => {
      const wrapper = createWrapper({ bgColour: 'blue' })
      expect(wrapper.props('bgColour')).toBe('blue')
    })
  })

  describe('computed title', () => {
    it('returns empty string when job has no title', () => {
      mockJobStore.byId.mockReturnValue({
        id: 1,
        title: '',
        url: 'https://example.com',
      })
      const wrapper = createWrapper()
      expect(wrapper.find('.mosaic-title').text()).toBe('')
    })

    it('filters \\n to newlines', () => {
      mockJobStore.byId.mockReturnValue({
        id: 1,
        title: 'Job\\nTitle',
        url: 'https://example.com',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.title).toBe('Job\nTitle')
    })

    it('filters <br> to newlines', () => {
      mockJobStore.byId.mockReturnValue({
        id: 1,
        title: 'Job<br>Title',
        url: 'https://example.com',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.title).toBe('Job\nTitle')
    })

    it('filters Â£ to £', () => {
      mockJobStore.byId.mockReturnValue({
        id: 1,
        title: 'Â£50,000',
        url: 'https://example.com',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.title).toBe('£50,000')
    })

    it('trims whitespace', () => {
      mockJobStore.byId.mockReturnValue({
        id: 1,
        title: '  Developer  ',
        url: 'https://example.com',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.title).toBe('Developer')
    })

    it('removes diacritics', () => {
      mockJobStore.byId.mockReturnValue({
        id: 1,
        title: 'Café Manager',
        url: 'https://example.com',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.title).toBe('Cafe Manager')
    })
  })

  describe('computed location', () => {
    it('removes leading comma and space from location', () => {
      mockJobStore.byId.mockReturnValue({
        id: 1,
        title: 'Developer',
        location: ', London',
        url: 'https://example.com',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.location).toBe('London')
    })

    it('returns location as-is when no leading comma', () => {
      mockJobStore.byId.mockReturnValue({
        id: 1,
        title: 'Developer',
        location: 'Manchester',
        url: 'https://example.com',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.location).toBe('Manchester')
    })

    it('returns empty string when no location', () => {
      mockJobStore.byId.mockReturnValue({
        id: 1,
        title: 'Developer',
        url: 'https://example.com',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.location).toBe('')
    })
  })

  describe('computed imageUrl', () => {
    it('returns job image when present', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.imageUrl).toBe('https://example.com/image.jpg')
    })

    it('returns null when no image', () => {
      mockJobStore.byId.mockReturnValue({
        id: 1,
        title: 'Developer',
        url: 'https://example.com',
      })
      const wrapper = createWrapper()
      expect(wrapper.vm.imageUrl).toBe(null)
    })
  })

  describe('computed imageStyle', () => {
    it('uses dark green background by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.imageStyle).toEqual({ background: '#2e7d32' })
    })

    it('uses specified bgColour', () => {
      const wrapper = createWrapper({ bgColour: 'blue' })
      expect(wrapper.vm.imageStyle).toEqual({ background: '#1976d2' })
    })

    it('falls back to dark green for unknown colour', () => {
      const wrapper = createWrapper({ bgColour: 'unknown' })
      expect(wrapper.vm.imageStyle).toEqual({ background: '#2e7d32' })
    })
  })

  describe('image display', () => {
    it('shows placeholder by default when image not loaded', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.mosaic-placeholder').exists()).toBe(true)
      expect(
        wrapper
          .find('.mosaic-placeholder .v-icon[data-icon="briefcase"]')
          .exists()
      ).toBe(true)
    })

    it('renders img element with src', () => {
      const wrapper = createWrapper()
      const img = wrapper.find('.mosaic-img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/image.jpg')
    })

    it('sets imageLoaded to true on load event', async () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.imageLoaded).toBe(false)
      await wrapper.find('.mosaic-img').trigger('load')
      expect(wrapper.vm.imageLoaded).toBe(true)
    })

    it('sets imageLoaded to false on error event', async () => {
      const wrapper = createWrapper()
      wrapper.vm.imageLoaded = true
      await wrapper.find('.mosaic-img').trigger('error')
      expect(wrapper.vm.imageLoaded).toBe(false)
    })
  })

  describe('clicked method', () => {
    it('logs job click', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.mosaic-tile').trigger('click')
      expect(mockJobStore.log).toHaveBeenCalledWith({ id: 1 })
    })

    it('navigates to /jobs when not already on jobs page', async () => {
      mockRouter.currentRoute.value.path = '/browse'
      const wrapper = createWrapper()
      await wrapper.find('.mosaic-tile').trigger('click')
      expect(mockRouter.push).toHaveBeenCalledWith('/jobs')
    })

    it('does not navigate when already on /jobs', async () => {
      mockRouter.currentRoute.value.path = '/jobs'
      const wrapper = createWrapper()
      await wrapper.find('.mosaic-tile').trigger('click')
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  describe('fetching job from store', () => {
    it('calls byId with props.id', () => {
      createWrapper({ id: 42 })
      expect(mockJobStore.byId).toHaveBeenCalledWith(42)
    })
  })
})
