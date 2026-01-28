import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import GroupHeader from '~/components/GroupHeader.vue'

const mockGroup = {
  id: 123,
  namedisplay: 'Test Community',
  nameshort: 'testcommunity',
  tagline: 'A test tagline',
  description: '<p>This is a test description</p>',
  profile: '/test-profile.jpg',
  membercount: 1500,
  founded: '2020-01-01',
  modsemail: 'mods@test.com',
  showmods: [
    { id: 1, displayname: 'Mod 1', profile: '/mod1.jpg' },
    { id: 2, displayname: 'Mod 2', profile: '/mod2.jpg' },
  ],
  sponsors: [
    {
      id: 1,
      name: 'Test Sponsor',
      imageurl: '/sponsor.jpg',
      linkurl: 'https://sponsor.com',
      tagline: 'Sponsor tagline',
      description: 'Sponsor description',
    },
  ],
}

const { mockUser, mockMember } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockUser: ref({ id: 456, displayname: 'Test User' }),
    mockMember: ref(null),
  }
})

const mockAuthStore = {
  get user() {
    return mockUser.value
  },
  member: vi.fn(() => mockMember.value),
  joinGroup: vi.fn().mockResolvedValue(undefined),
  leaveGroup: vi.fn().mockResolvedValue(undefined),
}

const mockRouter = {
  push: vi.fn(),
}

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

describe('GroupHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.value = { id: 456, displayname: 'Test User' }
    mockMember.value = null
    mockAuthStore.member.mockReturnValue(null)
  })

  function createWrapper(props = {}) {
    return mount(GroupHeader, {
      props: {
        group: { ...mockGroup },
        showJoin: true,
        showGiveFind: false,
        ...props,
      },
      global: {
        stubs: {
          'b-card': {
            template: '<div class="b-card"><slot /></div>',
            props: ['bgLight'],
          },
          'b-card-title': {
            template: '<div class="b-card-title"><slot /></div>',
          },
          'b-card-subtitle': {
            template: '<div class="b-card-subtitle"><slot /></div>',
          },
          'b-card-body': {
            template: '<div class="b-card-body"><slot /></div>',
          },
          'b-img': {
            template: '<img class="b-img" :src="src" />',
            props: ['rounded', 'thumbnail', 'alt', 'src', 'width', 'height'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant"><slot /></button>',
            props: ['variant', 'to', 'size', 'block'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" :data-label="label" @click="handleClick"><slot />{{ label }}</button>',
            props: ['iconName', 'variant', 'label'],
            emits: ['handle'],
            methods: {
              handleClick() {
                this.$emit('handle', () => {})
              },
            },
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon', 'title'],
          },
          NuxtLink: {
            template: '<a class="nuxt-link" :href="to"><slot /></a>',
            props: ['to'],
          },
          'nuxt-link': {
            template: '<a class="nuxt-link" :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          DateFormatted: {
            template: '<span class="date-formatted">{{ value }}</span>',
            props: ['value', 'format'],
          },
          ChatButton: {
            template: '<button class="chat-button"><slot /></button>',
            props: ['groupid', 'title', 'chattype', 'variant', 'size'],
          },
          GroupShowMod: {
            template: '<div class="group-show-mod" :data-id="modtoshow?.id" />',
            props: ['modtoshow'],
          },
          SponsorLogo: {
            template: '<img class="sponsor-logo" :src="image" />',
            props: ['image', 'altText'],
          },
          ExternalLink: {
            template: '<a class="external-link" :href="href"><slot /></a>',
            props: ['href'],
          },
        },
      },
    })
  }

  describe('mobile layout rendering', () => {
    it('renders mobile layout', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.mobile-group-header').exists()).toBe(true)
    })

    it('shows group name', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Test Community')
    })

    it('shows tagline', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('A test tagline')
    })

    it('shows member count', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('1,500')
      expect(wrapper.text()).toContain('freeglers')
    })

    it('shows founded date', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.date-formatted').exists()).toBe(true)
    })

    it('shows profile image', () => {
      const wrapper = createWrapper()
      const img = wrapper.find('.mobile-hero__logo')
      expect(img.exists()).toBe(true)
    })
  })

  describe('desktop layout rendering', () => {
    it('renders desktop card layout', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })

    it('shows group title in card', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card-title').text()).toContain('Test Community')
    })

    it('shows tagline in card subtitle', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card-subtitle').text()).toBe('A test tagline')
    })
  })

  describe('description', () => {
    it('shows description when present', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('This is a test description')
    })

    it('shows default description when none provided', () => {
      const wrapper = createWrapper({
        group: { ...mockGroup, description: null },
      })
      expect(wrapper.text()).toContain('Give and get stuff for free')
    })

    it('shows read more link for long description', () => {
      const longDescription = 'A'.repeat(500)
      const wrapper = createWrapper({
        group: { ...mockGroup, description: longDescription },
      })
      expect(wrapper.find('.mobile-description__more').exists()).toBe(true)
    })
  })

  describe('navigation links', () => {
    it('shows events link', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Events')
    })

    it('shows volunteering link', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Volunteering')
    })

    it('shows stories link', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Stories')
    })

    it('shows stats link', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Stats')
    })
  })

  describe('join functionality', () => {
    it('shows Join button when not a member', () => {
      mockAuthStore.member.mockReturnValue(null)
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Join')
    })

    it('calls joinGroup on Join click when logged in', async () => {
      mockAuthStore.member.mockReturnValue(null)
      const wrapper = createWrapper()
      const button = wrapper.find('[data-label="Join"]')
      await button.trigger('click')
      await flushPromises()
      expect(mockAuthStore.joinGroup).toHaveBeenCalledWith(456, 123, true)
    })

    it('redirects to login when not logged in', async () => {
      mockUser.value = null
      mockAuthStore.member.mockReturnValue(null)
      const wrapper = createWrapper()
      const button = wrapper.find('[data-label="Join"]')
      await button.trigger('click')
      await flushPromises()
      expect(mockRouter.push).toHaveBeenCalledWith('/explore/join/123')
    })
  })

  describe('leave functionality', () => {
    it('shows Leave button when a member', () => {
      mockAuthStore.member.mockReturnValue('Member')
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Leave')
    })

    it('calls leaveGroup on Leave click', async () => {
      mockAuthStore.member.mockReturnValue('Member')
      const wrapper = createWrapper()
      const button = wrapper.find('[data-label="Leave"]')
      await button.trigger('click')
      await flushPromises()
      expect(mockAuthStore.leaveGroup).toHaveBeenCalledWith(456, 123)
    })

    it('does not show Join or Leave for Moderator', () => {
      mockAuthStore.member.mockReturnValue('Moderator')
      const wrapper = createWrapper()
      expect(wrapper.find('[data-label="Join"]').exists()).toBe(false)
      expect(wrapper.find('[data-label="Leave"]').exists()).toBe(false)
    })
  })

  describe('moderator role display', () => {
    it('shows crown icon for Owner', () => {
      mockAuthStore.member.mockReturnValue('Owner')
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="crown"]').exists()).toBe(true)
    })

    it('shows crown icon for Moderator', () => {
      mockAuthStore.member.mockReturnValue('Moderator')
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="crown"]').exists()).toBe(true)
    })

    it('does not show crown icon for Member', () => {
      mockAuthStore.member.mockReturnValue('Member')
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="crown"]').exists()).toBe(false)
    })
  })

  describe('give/find buttons', () => {
    it('shows Give and Find buttons when showGiveFind is true', () => {
      const wrapper = createWrapper({ showGiveFind: true })
      expect(wrapper.text()).toContain('Give stuff')
      expect(wrapper.text()).toContain('Find stuff')
    })

    it('hides Give and Find buttons when showGiveFind is false', () => {
      const wrapper = createWrapper({ showGiveFind: false })
      expect(wrapper.find('.mobile-give-find').exists()).toBe(false)
    })
  })

  describe('volunteer contact', () => {
    it('shows contact volunteers section', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Contact')
    })

    it('shows moderator avatars', () => {
      const wrapper = createWrapper()
      const mods = wrapper.findAll('.group-show-mod')
      expect(mods.length).toBeGreaterThan(0)
    })

    it('shows ChatButton when logged in', () => {
      mockUser.value = { id: 456 }
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-button').exists()).toBe(true)
    })

    it('shows email link when logged out', () => {
      mockUser.value = null
      const wrapper = createWrapper()
      expect(wrapper.find('a[href="mailto:mods@test.com"]').exists()).toBe(true)
    })
  })

  describe('sponsors', () => {
    it('shows sponsor section when sponsors exist', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Test Sponsor')
    })

    it('shows sponsor logo', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.sponsor-logo').exists()).toBe(true)
    })

    it('links to sponsor website', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a[href="https://sponsor.com"]').exists()).toBe(true)
    })

    it('does not show sponsors section when no sponsors', () => {
      const wrapper = createWrapper({
        group: { ...mockGroup, sponsors: null },
      })
      expect(wrapper.find('.mobile-sponsors').exists()).toBe(false)
    })
  })

  describe('default profile image', () => {
    it('shows default icon when no profile image', () => {
      const wrapper = createWrapper({
        group: { ...mockGroup, profile: null },
      })
      const img = wrapper.find('.mobile-hero__logo')
      expect(img.attributes('src')).toBe('/icon.png')
    })
  })

  describe('description cleaning', () => {
    it('removes empty paragraph tags', () => {
      const wrapper = createWrapper({
        group: {
          ...mockGroup,
          description: '<p></p><p>Real content</p><p><br></p>',
        },
      })
      const component = wrapper.findComponent(GroupHeader)
      expect(component.vm.description).not.toContain('<p></p>')
      expect(component.vm.description).not.toContain('<p><br></p>')
    })
  })
})
