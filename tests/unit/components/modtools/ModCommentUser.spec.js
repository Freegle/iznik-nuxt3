import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModCommentUser from '~/modtools/components/ModCommentUser.vue'

// Mock the datetimeshort composable
vi.mock('~/composables/useDateFormat', () => ({
  useDateFormat: () => ({
    datetimeshort: vi.fn((date) => `formatted: ${date}`),
  }),
}))

describe('ModCommentUser', () => {
  const defaultProps = {
    comment: {
      id: 100,
      user1: 'Test comment',
      user: {
        id: 123,
        displayname: 'Test User',
        email: null,
        emails: [
          { email: 'test@example.com', preferred: true, ourdomain: false },
        ],
        lastaccess: '2024-01-15',
        profile: {
          paththumb: 'https://example.com/photo.jpg',
        },
      },
    },
  }

  function mountComponent(props = {}) {
    return mount(ModCommentUser, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-card': {
            template: '<div class="card"><slot /></div>',
          },
          'b-card-header': {
            template: '<div class="card-header"><slot /></div>',
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'v-icon': {
            template: '<span class="icon" />',
            props: ['icon', 'scale'],
          },
          ExternalLink: {
            template: '<a :href="href"><slot /></a>',
            props: ['href'],
          },
          ProfileImage: {
            template: '<img class="profile-image" />',
            props: ['image', 'name', 'isThumbnail', 'size'],
          },
          ModComment: {
            template: '<div class="mod-comment" />',
            props: ['comment', 'user'],
          },
        },
        mocks: {
          datetimeshort: (date) => `formatted: ${date}`,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders user id', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('123')
    })

    it('renders email with mailto link', () => {
      const wrapper = mountComponent()
      const link = wrapper.find('a[href="mailto:test@example.com"]')
      expect(link.exists()).toBe(true)
    })

    it('renders last access time when present', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Active')
    })

    it('does not render last access when not present', () => {
      const wrapper = mountComponent({
        comment: {
          ...defaultProps.comment,
          user: {
            ...defaultProps.comment.user,
            lastaccess: null,
          },
        },
      })
      expect(wrapper.text()).not.toContain('Active')
    })

    it('renders ProfileImage with user photo', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('renders ModComment component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-comment').exists()).toBe(true)
    })
  })

  describe('email computed property', () => {
    it('returns email from emails array when user.email is null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.email).toBe('test@example.com')
    })

    it('returns null when user has no emails array', () => {
      const wrapper = mountComponent({
        comment: {
          ...defaultProps.comment,
          user: {
            ...defaultProps.comment.user,
            emails: [],
          },
        },
      })
      expect(wrapper.vm.email).toBe(null)
    })

    it('returns null when user has email property set', () => {
      const wrapper = mountComponent({
        comment: {
          ...defaultProps.comment,
          user: {
            ...defaultProps.comment.user,
            email: 'direct@example.com',
          },
        },
      })
      expect(wrapper.vm.email).toBe(null)
    })

    it('skips ourdomain emails', () => {
      const wrapper = mountComponent({
        comment: {
          ...defaultProps.comment,
          user: {
            ...defaultProps.comment.user,
            emails: [
              {
                email: 'internal@ourdomain.com',
                preferred: true,
                ourdomain: true,
              },
              {
                email: 'external@example.com',
                preferred: false,
                ourdomain: false,
              },
            ],
          },
        },
      })
      expect(wrapper.vm.email).toBe('external@example.com')
    })

    it('prefers preferred email', () => {
      const wrapper = mountComponent({
        comment: {
          ...defaultProps.comment,
          user: {
            ...defaultProps.comment.user,
            emails: [
              {
                email: 'first@example.com',
                preferred: false,
                ourdomain: false,
              },
              {
                email: 'preferred@example.com',
                preferred: true,
                ourdomain: false,
              },
            ],
          },
        },
      })
      expect(wrapper.vm.email).toBe('preferred@example.com')
    })
  })

  describe('props', () => {
    it('passes comment to ModComment', () => {
      const wrapper = mountComponent()
      // ModComment is stubbed, check stub exists
      expect(wrapper.find('.mod-comment').exists()).toBe(true)
    })
  })
})
