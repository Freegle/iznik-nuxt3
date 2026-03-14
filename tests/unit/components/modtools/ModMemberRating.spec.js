import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import ModMemberRating from '~/modtools/components/ModMemberRating.vue'

// Mock user store
const mockUserStore = {
  byId: vi.fn(),
  ratingReviewed: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

// Mock useModMe composable
vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    amAModOn: vi.fn((groupid) => groupid === 789),
  }),
}))

describe('ModMemberRating', () => {
  const createRating = (overrides = {}) => ({
    id: 123,
    rater: 456,
    ratee: 789,
    raterdisplayname: 'Rater User',
    rateedisplayname: 'Ratee User',
    rating: 'Down',
    reason: 'No show',
    text: 'They never showed up',
    timestamp: dayjs().subtract(1, 'day').toISOString(),
    reviewrequired: true,
    groupid: 789,
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModMemberRating, {
      props: {
        rating: createRating(),
        ...props,
      },
      global: {
        stubs: {
          'b-card': {
            template: '<div class="card"><slot /><slot name="header" /></div>',
            props: ['noBody'],
          },
          'b-card-header': {
            template:
              '<div class="card-header" :class="headerBgVariant ? \'bg-\' + headerBgVariant : \'\'"><slot /></div>',
            props: ['headerBgVariant'],
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon', 'scale'],
          },
          ChatButton: {
            template: '<div class="chat-button" :data-userid="userid" />',
            props: ['userid', 'groupid', 'title', 'variant'],
          },
        },
        mocks: {
          timeago: (val) => `${dayjs().diff(dayjs(val), 'days')} days ago`,
        },
        directives: {
          'observe-visibility': {
            mounted(el, binding) {
              el._visibilityCallback = binding.value
            },
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.byId.mockReturnValue({
      id: 456,
      memberof: [{ id: 789, namedisplay: 'Test Group' }],
    })
    mockUserStore.ratingReviewed.mockResolvedValue()
  })

  describe('rendering', () => {
    it('displays rater displayname', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Rater User')
    })

    it('displays ratee displayname', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Ratee User')
    })

    it('displays rater id', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('456')
    })

    it('displays ratee id', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('789')
    })

    it('shows thumbs down text for Down rating', () => {
      const wrapper = mountComponent({
        rating: createRating({ rating: 'Down' }),
      })
      expect(wrapper.text()).toContain('gave a thumbs down to')
    })

    it('shows thumbs up text for Up rating', () => {
      const wrapper = mountComponent({ rating: createRating({ rating: 'Up' }) })
      expect(wrapper.text()).toContain('gave a thumbs up to')
    })

    it('displays reason when present', () => {
      const wrapper = mountComponent({
        rating: createRating({ reason: 'No show' }),
      })
      expect(wrapper.text()).toContain('No show')
    })

    it('displays text comment when present', () => {
      const wrapper = mountComponent({
        rating: createRating({ text: 'They never showed up' }),
      })
      expect(wrapper.text()).toContain('They never showed up')
    })

    it('shows New badge when reviewrequired is true', () => {
      const wrapper = mountComponent({
        rating: createRating({ reviewrequired: true }),
      })
      expect(wrapper.text()).toContain('New')
    })

    it('hides New badge when reviewrequired is false', () => {
      const wrapper = mountComponent({
        rating: createRating({ reviewrequired: false }),
      })
      expect(wrapper.text()).not.toContain('New')
    })

    it('displays group name when available', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test Group')
    })

    it('renders two ChatButtons', () => {
      const wrapper = mountComponent()
      const chatButtons = wrapper.findAll('.chat-button')
      expect(chatButtons.length).toBe(2)
    })

    it('has ChatButton for rater', () => {
      const wrapper = mountComponent({ rating: createRating({ rater: 456 }) })
      const chatButtons = wrapper.findAll('.chat-button')
      expect(chatButtons[0].attributes('data-userid')).toBe('456')
    })

    it('has ChatButton for ratee', () => {
      const wrapper = mountComponent({ rating: createRating({ ratee: 789 }) })
      const chatButtons = wrapper.findAll('.chat-button')
      expect(chatButtons[1].attributes('data-userid')).toBe('789')
    })
  })

  describe('header styling', () => {
    it('has warning background when reviewrequired', () => {
      const wrapper = mountComponent({
        rating: createRating({ reviewrequired: true }),
      })
      const header = wrapper.find('.card-header')
      expect(header.classes()).toContain('bg-warning')
    })

    it('has default background when not reviewrequired', () => {
      const wrapper = mountComponent({
        rating: createRating({ reviewrequired: false }),
      })
      const header = wrapper.find('.card-header')
      expect(header.classes()).toContain('bg-default')
    })
  })

  describe('groupName computed', () => {
    it('returns group name when rater is member of group', () => {
      mockUserStore.byId.mockReturnValue({
        id: 456,
        memberof: [{ id: 789, namedisplay: 'Test Group' }],
      })
      const wrapper = mountComponent({
        rating: createRating({ rater: 456, groupid: 789 }),
      })
      expect(wrapper.vm.groupName).toBe('Test Group')
    })

    it('returns null when rater has no memberof', () => {
      mockUserStore.byId.mockReturnValue({ id: 456, memberof: null })
      const wrapper = mountComponent()
      expect(wrapper.vm.groupName).toBeNull()
    })

    it('returns null when rater is not found', () => {
      mockUserStore.byId.mockReturnValue(null)
      const wrapper = mountComponent()
      expect(wrapper.vm.groupName).toBeNull()
    })

    it('returns null when rater is not member of the group', () => {
      mockUserStore.byId.mockReturnValue({
        id: 456,
        memberof: [{ id: 999, namedisplay: 'Other Group' }],
      })
      const wrapper = mountComponent({ rating: createRating({ groupid: 789 }) })
      expect(wrapper.vm.groupName).toBeNull()
    })

    it('returns null when not a mod on the group', () => {
      mockUserStore.byId.mockReturnValue({
        id: 456,
        memberof: [{ id: 888, namedisplay: 'Non-Mod Group' }],
      })
      const wrapper = mountComponent({ rating: createRating({ groupid: 888 }) })
      expect(wrapper.vm.groupName).toBeNull()
    })

    it('returns null when rater prop is falsy', () => {
      const wrapper = mountComponent({ rating: createRating({ rater: null }) })
      expect(wrapper.vm.groupName).toBeNull()
    })
  })

  describe('visibilityChanged', () => {
    it('calls ratingReviewed when visible and reviewrequired', () => {
      const wrapper = mountComponent({
        rating: createRating({ id: 123, reviewrequired: true }),
      })
      wrapper.vm.visibilityChanged(true)
      expect(mockUserStore.ratingReviewed).toHaveBeenCalledWith({ id: 123 })
    })

    it('does not call ratingReviewed when not reviewrequired', () => {
      const wrapper = mountComponent({
        rating: createRating({ reviewrequired: false }),
      })
      wrapper.vm.visibilityChanged(true)
      expect(mockUserStore.ratingReviewed).not.toHaveBeenCalled()
    })

    it('does not call ratingReviewed when not visible', () => {
      const wrapper = mountComponent({
        rating: createRating({ reviewrequired: true }),
      })
      wrapper.vm.visibilityChanged(false)
      expect(mockUserStore.ratingReviewed).not.toHaveBeenCalled()
    })
  })

  describe('rating text display', () => {
    it('does not show reason paragraph when text is empty', () => {
      const wrapper = mountComponent({
        rating: createRating({ text: null, reason: null }),
      })
      expect(wrapper.find('.text-danger p').exists()).toBe(false)
    })

    it('shows reason paragraph when text is present', () => {
      const wrapper = mountComponent({
        rating: createRating({
          text: 'Some comment',
          reason: 'Bad experience',
        }),
      })
      expect(wrapper.text()).toContain('Bad experience')
      expect(wrapper.text()).toContain('Some comment')
    })
  })

  describe('nuxt-link destinations', () => {
    it('links to rater member page', () => {
      const wrapper = mountComponent({
        rating: createRating({ rater: 456, groupid: 789 }),
      })
      const links = wrapper.findAll('a')
      expect(links[0].attributes('href')).toBe('/members/approved/789/456')
    })

    it('links to ratee member page', () => {
      const wrapper = mountComponent({
        rating: createRating({ ratee: 111, groupid: 789 }),
      })
      const links = wrapper.findAll('a')
      expect(links[1].attributes('href')).toBe('/members/approved/789/111')
    })
  })
})
