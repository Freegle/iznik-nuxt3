import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import NewsLovesUserInfo from '~/components/NewsLovesUserInfo.vue'

const mockUser = {
  id: 123,
  displayname: 'Test User',
  profile: {
    paththumb: 'https://example.com/thumb.jpg',
  },
  info: {
    openoffers: 3,
    openwanteds: 2,
  },
  showmod: false,
}

const mockUserStore = {
  byId: vi.fn().mockReturnValue(mockUser),
  publicLocationById: vi.fn().mockReturnValue(null),
  fetch: vi.fn().mockResolvedValue(undefined),
  fetchPublicLocation: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('NewsLovesUserInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.byId.mockReturnValue({ ...mockUser })
    mockUserStore.publicLocationById.mockReturnValue(null)
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(NewsLovesUserInfo, { id: 123, ...props }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          ProfileImage: {
            template:
              '<div class="profile-image" :data-src="image" :data-size="size" />',
            props: ['image', 'isThumbnail', 'size'],
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

  describe('rendering', () => {
    it('renders when user exists', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.text-success.nodecor.clickme').exists()).toBe(true)
    })

    it('does not render when user is null', async () => {
      mockUserStore.byId.mockReturnValue(null)
      const wrapper = await createWrapper()
      expect(wrapper.find('.text-success.nodecor.clickme').exists()).toBe(false)
    })

    it('renders profile image', async () => {
      const wrapper = await createWrapper()
      const img = wrapper.find('.profile-image')
      expect(img.exists()).toBe(true)
      expect(img.attributes('data-src')).toBe('https://example.com/thumb.jpg')
    })

    it('renders user displayname', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Test User')
    })
  })

  describe('data fetching', () => {
    it('fetches user on mount', async () => {
      await createWrapper({ id: 456 })
      expect(mockUserStore.fetch).toHaveBeenCalledWith(456)
    })

    it('fetches public location', async () => {
      await createWrapper({ id: 789 })
      expect(mockUserStore.fetchPublicLocation).toHaveBeenCalledWith(789)
    })
  })

  describe('public location', () => {
    it('renders location when available', async () => {
      mockUserStore.publicLocationById.mockReturnValue({
        display: 'London, UK',
      })
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('London, UK')
      expect(wrapper.find('.v-icon[data-icon="map-marker-alt"]').exists()).toBe(
        true
      )
    })

    it('does not render location when unavailable', async () => {
      mockUserStore.publicLocationById.mockReturnValue(null)
      const wrapper = await createWrapper()
      expect(wrapper.find('.v-icon[data-icon="map-marker-alt"]').exists()).toBe(
        false
      )
    })
  })

  describe('open posts info', () => {
    it('renders open offers count', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('3 OFFERS')
    })

    it('renders open wanteds count', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('2 WANTEDS')
    })

    it('does not render posts info when both are zero', async () => {
      mockUserStore.byId.mockReturnValue({
        ...mockUser,
        info: { openoffers: 0, openwanteds: 0 },
      })
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('OFFER')
      expect(wrapper.text()).not.toContain('WANTED')
    })
  })

  describe('volunteer badge', () => {
    it('renders volunteer badge when showmod is true', async () => {
      mockUserStore.byId.mockReturnValue({
        ...mockUser,
        showmod: true,
      })
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Freegle Volunteer')
      expect(wrapper.find('.v-icon[data-icon="leaf"]').exists()).toBe(true)
    })

    it('does not render volunteer badge when showmod is false', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('Freegle Volunteer')
    })
  })

  describe('click handling', () => {
    it('emits goto on click', async () => {
      const wrapper = await createWrapper()
      await wrapper.find('.text-success.nodecor.clickme').trigger('click')

      const component = wrapper.findComponent(NewsLovesUserInfo)
      expect(component.emitted('goto')).toHaveLength(1)
    })
  })

  describe('title attribute', () => {
    it('sets title with user displayname', async () => {
      const wrapper = await createWrapper()
      const container = wrapper.find('.text-success.nodecor.clickme')
      expect(container.attributes('title')).toBe(
        'Click to view profile for Test User'
      )
    })
  })
})
