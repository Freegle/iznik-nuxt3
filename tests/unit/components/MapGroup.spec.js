import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MapGroup from '~/components/MapGroup.vue'

const mockGet = vi.fn()
const mockFetch = vi.fn()
const mockOneOfMyGroups = vi.fn()

vi.mock('~/stores/group', () => ({
  useGroupStore: () => ({
    get: mockGet,
    fetch: mockFetch,
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    oneOfMyGroups: mockOneOfMyGroups,
  }),
}))

describe('MapGroup', () => {
  const mockGroup = {
    id: 1,
    namedisplay: 'Test Freegle Group',
    nameshort: 'test-group',
    profile: '/group/profile.jpg',
    tagline: 'Sharing is caring',
    modsemail: 'mods@test-group.freegle.org.uk',
    onmap: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReturnValue(mockGroup)
    mockOneOfMyGroups.mockReturnValue(false)
  })

  function createWrapper(props = {}) {
    return mount(MapGroup, {
      props: {
        id: 1,
        ...props,
      },
      global: {
        stubs: {
          GroupProfileImage: {
            template: '<div class="group-profile-image" :data-image="image" />',
            props: ['image', 'altText'],
          },
          ExternalLink: {
            template: '<a :href="href" class="external-link"><slot /></a>',
            props: ['href'],
          },
          'nuxt-link': {
            template: '<a :href="to" class="nuxt-link"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'to'],
          },
          'v-icon': {
            template: '<span class="v-icon" />',
            props: ['icon', 'title'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders when group exists and is on map', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.layout').exists()).toBe(true)
    })

    it('does not render when group is null', () => {
      mockGet.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.find('.layout').exists()).toBe(false)
    })

    it('does not render when group is not on map', () => {
      mockGet.mockReturnValue({ ...mockGroup, onmap: false })
      const wrapper = createWrapper()
      expect(wrapper.find('.layout').exists()).toBe(false)
    })

    it('fetches group on mount', () => {
      createWrapper({ id: 42 })
      expect(mockFetch).toHaveBeenCalledWith(42, true)
    })
  })

  describe('group display', () => {
    it('shows group profile image', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.group-profile-image').exists()).toBe(true)
    })

    it('shows group name', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Test Freegle Group')
    })

    it('has name link to explore page', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.name').exists()).toBe(true)
    })

    it('shows tagline when present', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Sharing is caring')
    })

    it('hides tagline when not present', () => {
      mockGet.mockReturnValue({ ...mockGroup, tagline: null })
      const wrapper = createWrapper()
      expect(wrapper.find('.tagline').exists()).toBe(false)
    })

    it('shows contact volunteers link', () => {
      const wrapper = createWrapper()
      const contactLink = wrapper.find('.external-link')
      expect(contactLink.exists()).toBe(true)
      expect(contactLink.attributes('href')).toBe(
        'mailto:mods@test-group.freegle.org.uk'
      )
      expect(contactLink.text()).toContain('Contact volunteers')
    })
  })

  describe('join button', () => {
    it('shows join button when not a member', () => {
      mockOneOfMyGroups.mockReturnValue(false)
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const joinButton = buttons.find((b) => b.text() === 'Join')
      expect(joinButton).toBeTruthy()
    })

    it('hides join button when already a member', () => {
      mockOneOfMyGroups.mockReturnValue(true)
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const joinButton = buttons.find((b) => b.text() === 'Join')
      expect(joinButton).toBeUndefined()
    })
  })

  describe('explore button', () => {
    it('always shows explore button', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const exploreButton = buttons.find((b) => b.text() === 'Explore')
      expect(exploreButton).toBeTruthy()
    })
  })

  describe('profile image fallback', () => {
    it('uses group profile when available', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('.group-profile-image').attributes('data-image')
      ).toBe('/group/profile.jpg')
    })

    it('uses default icon when no profile', () => {
      mockGet.mockReturnValue({ ...mockGroup, profile: null })
      const wrapper = createWrapper()
      expect(
        wrapper.find('.group-profile-image').attributes('data-image')
      ).toBe('/icon.png')
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 55 })
      expect(wrapper.props('id')).toBe(55)
    })
  })
})
