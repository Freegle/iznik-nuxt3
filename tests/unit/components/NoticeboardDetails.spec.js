import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import NoticeboardDetails from '~/components/NoticeboardDetails.vue'

const mockNoticeboard = {
  id: 123,
  name: 'Test Noticeboard',
  description: 'A test noticeboard description',
  lat: 51.5074,
  lng: -0.1278,
  added: '2024-01-15T10:00:00Z',
  addedby: 42,
  addedbyuser: { displayname: 'Test User' },
  checks: [
    { id: 1, date: '2024-02-01', result: 'confirmed' },
    { id: 2, date: '2024-03-01', result: 'confirmed' },
  ],
}

const mockNoticeboardStore = {
  fetch: vi.fn().mockResolvedValue(mockNoticeboard),
  byId: vi.fn().mockReturnValue(mockNoticeboard),
  refresh: vi.fn().mockResolvedValue(undefined),
  decline: vi.fn().mockResolvedValue(undefined),
  inactive: vi.fn().mockResolvedValue(undefined),
  saveComments: vi.fn().mockResolvedValue(undefined),
}

vi.mock('~/stores/noticeboard', () => ({
  useNoticeboardStore: () => mockNoticeboardStore,
}))

vi.mock('~/composables/useMap', () => ({
  attribution: () => 'Map attribution',
  osmtile: () => 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
}))

vi.mock('~/constants', () => ({
  MAX_MAP_ZOOM: 18,
}))

describe('NoticeboardDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNoticeboardStore.byId.mockReturnValue({ ...mockNoticeboard })
    mockNoticeboardStore.fetch.mockResolvedValue({ ...mockNoticeboard })
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(NoticeboardDetails, { id: 123, ...props }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'b-card': {
            template: '<div class="b-card"><slot /></div>',
            props: ['noBody'],
          },
          'b-card-body': {
            template: '<div class="b-card-body"><slot /></div>',
          },
          'client-only': {
            template: '<div class="client-only"><slot /></div>',
          },
          'l-map': {
            template: '<div class="l-map"><slot /></div>',
            props: ['zoom', 'maxZoom', 'center', 'style'],
          },
          'l-tile-layer': {
            template: '<div class="l-tile-layer" />',
            props: ['url', 'attribution'],
          },
          'l-marker': {
            template: '<div class="l-marker" />',
            props: ['latLng', 'interactive'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
          },
          SpinButton: {
            template:
              '<button class="spin-button" :data-label="label" @click="handleClick"><slot />{{ label }}</button>',
            props: ['iconName', 'variant', 'size', 'label'],
            emits: ['handle'],
            methods: {
              handleClick() {
                this.$emit('handle', () => {})
              },
            },
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant"><slot /></button>',
            props: ['variant', 'size', 'to'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          'b-form': {
            template: '<form class="b-form"><slot /></form>',
          },
          'b-form-textarea': {
            template:
              '<textarea class="b-form-textarea" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['id', 'modelValue', 'placeholder'],
            emits: ['update:modelValue'],
          },
          NoticeboardCheck: {
            template:
              '<div class="noticeboard-check" :data-check-id="check.id" />',
            props: ['noticeboard', 'check'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders noticeboard name as heading', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('h1').text()).toBe('Test Noticeboard')
    })

    it('renders card when noticeboard exists', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })

    it('does not render card when noticeboard is null', async () => {
      mockNoticeboardStore.byId.mockReturnValue(null)
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(false)
    })
  })

  describe('map display', () => {
    it('renders Leaflet map in client-only wrapper', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.client-only .l-map').exists()).toBe(true)
    })

    it('renders marker at noticeboard location', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.l-marker').exists()).toBe(true)
    })
  })

  describe('description', () => {
    it('shows description when present', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('A test noticeboard description')
    })

    it('does not show NoticeMessage when no description', async () => {
      mockNoticeboardStore.byId.mockReturnValue({
        ...mockNoticeboard,
        description: null,
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })
  })

  describe('action buttons', () => {
    it('renders I put up a poster button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('I put up a poster!')
    })

    it('renders Download the poster button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Download the poster')
    })

    it('renders Please ask someone else button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Please ask someone else')
    })

    it('renders Noticeboard no longer active button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Noticeboard no longer active')
    })
  })

  describe('comments form', () => {
    it('renders comments textarea', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-form-textarea').exists()).toBe(true)
    })

    it('renders Save comments button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Save comments')
    })
  })

  describe('history section', () => {
    it('renders history heading', async () => {
      const wrapper = await createWrapper()
      const h2s = wrapper.findAll('h2')
      const historyHeading = h2s.find((h) => h.text().includes('History'))
      expect(historyHeading).toBeDefined()
    })

    it('renders NoticeboardCheck for each check', async () => {
      const wrapper = await createWrapper()
      const checks = wrapper.findAll('.noticeboard-check')
      expect(checks).toHaveLength(2)
    })

    it('shows added date formatted', async () => {
      const wrapper = await createWrapper()
      // dayjs format 'Do MMMM, YYYY' outputs ordinal day
      expect(wrapper.text()).toMatch(/15\w* January, 2024/)
    })

    it('shows addedby user name', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('by Test User')
    })
  })

  describe('data fetching', () => {
    it('fetches noticeboard on mount', async () => {
      await createWrapper({ id: 456 })
      expect(mockNoticeboardStore.fetch).toHaveBeenCalledWith(456)
    })
  })

  describe('action methods', () => {
    it('calls refresh on putup click', async () => {
      const wrapper = await createWrapper()
      const button = wrapper.find('[data-label="I put up a poster!"]')
      await button.trigger('click')
      await flushPromises()
      expect(mockNoticeboardStore.refresh).toHaveBeenCalledWith(123)
    })

    it('calls decline on shutup click', async () => {
      const wrapper = await createWrapper()
      const button = wrapper.find('[data-label="Please ask someone else"]')
      await button.trigger('click')
      await flushPromises()
      expect(mockNoticeboardStore.decline).toHaveBeenCalledWith(123)
    })

    it('calls inactive on dead click', async () => {
      const wrapper = await createWrapper()
      const button = wrapper.find('[data-label="Noticeboard no longer active"]')
      await button.trigger('click')
      await flushPromises()
      expect(mockNoticeboardStore.inactive).toHaveBeenCalledWith(123)
    })
  })

  describe('computed properties', () => {
    it('returns default center when noticeboard is null', async () => {
      mockNoticeboardStore.byId.mockReturnValue(null)
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(NoticeboardDetails)
      expect(component.vm.center).toEqual([53.945, -2.5209])
    })

    it('returns noticeboard center when available', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(NoticeboardDetails)
      expect(component.vm.center).toEqual([51.5074, -0.1278])
    })
  })
})
