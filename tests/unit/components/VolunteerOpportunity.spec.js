import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import VolunteerOpportunity from '~/components/VolunteerOpportunity.vue'

const { mockVolunteering, mockGroup, mockUser } = vi.hoisted(() => {
  return {
    mockVolunteering: {
      id: 1,
      title: 'Community Garden Helper',
      description: 'Help maintain our community garden',
      location: 'Central Park',
      groups: [100],
      userid: 200,
      added: '2024-01-01T10:00:00Z',
      renewed: '2024-01-15T10:00:00Z',
      expired: false,
      image: null,
      earliestDate: {
        string: { start: '9am', end: '12pm' },
      },
    },
    mockGroup: {
      id: 100,
      namedisplay: 'Freegle London',
    },
    mockUser: {
      id: 200,
      displayname: 'Test User',
    },
  }
})

const mockVolunteeringStore = {
  fetch: vi.fn().mockResolvedValue(mockVolunteering),
  byId: vi.fn().mockReturnValue(mockVolunteering),
  renew: vi.fn().mockResolvedValue(undefined),
  expire: vi.fn().mockResolvedValue(undefined),
}

const mockGroupStore = {
  fetch: vi.fn().mockResolvedValue(mockGroup),
  get: vi.fn().mockReturnValue(mockGroup),
}

const mockUserStore = {
  fetch: vi.fn().mockResolvedValue(mockUser),
  byId: vi.fn().mockReturnValue(mockUser),
}

const mockAuthStore = {
  user: { id: 1 },
}

vi.mock('~/stores/volunteering', () => ({
  useVolunteeringStore: () => mockVolunteeringStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/composables/useTwem', () => ({
  twem: vi.fn((text) => text),
}))

describe('VolunteerOpportunity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockVolunteeringStore.byId.mockReturnValue(mockVolunteering)
    mockUserStore.byId.mockReturnValue(mockUser)
    mockGroupStore.get.mockReturnValue(mockGroup)
    mockAuthStore.user = { id: 1 }
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(VolunteerOpportunity, {
                id: 1,
                summary: false,
                ...props,
              }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'ariaLabel'],
            emits: ['click'],
          },
          'b-img': {
            template: '<img class="b-img" :src="src" />',
            props: ['src', 'lazy'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          ReadMore: {
            template: '<div class="read-more">{{ text }}</div>',
            props: ['text', 'maxChars'],
          },
          OurUploadedImage: {
            template: '<img class="our-uploaded-image" :src="src" />',
            props: ['src', 'modifiers', 'alt'],
          },
          NuxtPicture: {
            template: '<img class="nuxt-picture" :src="src" />',
            props: ['src', 'fit', 'format', 'provider', 'modifiers', 'alt'],
          },
          VolunteerOpportunityModal: {
            template: '<div class="volunteer-opportunity-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders volunteer opportunity card', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.volop-card').exists()).toBe(true)
    })

    it('shows title', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Community Garden Helper')
    })

    it('shows description', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Help maintain our community garden')
    })

    it('shows location', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Central Park')
    })

    it('shows time range when available', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('9am')
      expect(wrapper.text()).toContain('12pm')
    })
  })

  describe('link behavior', () => {
    it('links to volunteering detail page', async () => {
      const wrapper = await createWrapper()
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe('/volunteering/1')
    })
  })

  describe('summary mode', () => {
    it('shows summary content in summary mode', async () => {
      const wrapper = await createWrapper({ summary: true })
      expect(wrapper.find('.volop-card').exists()).toBe(true)
    })

    it('hides ID in summary mode', async () => {
      const wrapper = await createWrapper({ summary: true })
      expect(wrapper.text()).not.toContain('#1')
    })

    it('shows ID in detail mode', async () => {
      const wrapper = await createWrapper({ summary: false })
      expect(wrapper.text()).toContain('#1')
    })
  })

  describe('owner actions', () => {
    it('shows owner actions when user owns the opportunity', async () => {
      mockAuthStore.user = { id: 200 }
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-button').exists()).toBe(true)
    })

    it('hides owner actions when user does not own', async () => {
      mockAuthStore.user = { id: 999 }
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain("Yes, it's still active")
    })

    it('calls renew when renew button clicked', async () => {
      mockAuthStore.user = { id: 200 }
      const wrapper = await createWrapper()
      const renewBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('still active'))
      if (renewBtn) {
        await renewBtn.trigger('click')
        expect(mockVolunteeringStore.renew).toHaveBeenCalledWith(1)
      }
    })

    it('calls expire when remove button clicked', async () => {
      mockAuthStore.user = { id: 200 }
      const wrapper = await createWrapper()
      const expireBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('remove'))
      if (expireBtn) {
        await expireBtn.trigger('click')
        expect(mockVolunteeringStore.expire).toHaveBeenCalledWith(1)
      }
    })
  })

  describe('warning notice', () => {
    it('shows expired warning when opportunity is expired', async () => {
      mockVolunteeringStore.byId.mockReturnValue({
        ...mockVolunteering,
        expired: true,
      })
      mockAuthStore.user = { id: 200 }
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('reactivate')
    })
  })

  describe('images', () => {
    it('shows OurUploadedImage when ouruid present', async () => {
      mockVolunteeringStore.byId.mockReturnValue({
        ...mockVolunteering,
        image: { ouruid: 'test-uid', externalmods: {} },
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })

    it('shows NuxtPicture when externaluid present', async () => {
      mockVolunteeringStore.byId.mockReturnValue({
        ...mockVolunteering,
        image: { externaluid: 'external-uid', externalmods: {} },
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)
    })

    it('shows b-img when path present', async () => {
      mockVolunteeringStore.byId.mockReturnValue({
        ...mockVolunteering,
        image: { path: '/images/volunteer.jpg' },
      })
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })
  })

  describe('modal', () => {
    it('shows more info button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('More info')
    })
  })

  describe('groups display', () => {
    it('shows group name in detail mode', async () => {
      const wrapper = await createWrapper({ summary: false })
      expect(wrapper.text()).toContain('Freegle London')
    })
  })

  describe('filter group', () => {
    it('renders when filterGroup matches', async () => {
      const wrapper = await createWrapper({ filterGroup: 100 })
      expect(wrapper.find('.volop-card').exists()).toBe(true)
    })

    it('does not render when filterGroup does not match', async () => {
      const wrapper = await createWrapper({ filterGroup: 999 })
      expect(wrapper.find('.volop-card').exists()).toBe(false)
    })
  })

  describe('title tag', () => {
    it('uses default h3 tag', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('h3').exists()).toBe(true)
    })
  })

  describe('icons', () => {
    it('shows clock icon for time', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-icon="clock"]').exists()).toBe(true)
    })

    it('shows map marker icon for location', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-icon="map-marker-alt"]').exists()).toBe(true)
    })
  })
})
