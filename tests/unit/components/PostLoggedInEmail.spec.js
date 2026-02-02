import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PostLoggedInEmail from '~/components/PostLoggedInEmail.vue'

const mockUser = vi.fn()

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    get user() {
      return mockUser()
    },
  }),
}))

describe('PostLoggedInEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.mockReturnValue(null)
  })

  function createWrapper() {
    return mount(PostLoggedInEmail, {
      global: {
        stubs: {
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
          'b-button': {
            template: '<button :href="to"><slot /></button>',
            props: ['size', 'variant', 'to'],
          },
        },
      },
    })
  }

  describe('when user has email', () => {
    beforeEach(() => {
      mockUser.mockReturnValue({ email: 'test@example.com' })
    })

    it('shows the email address', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('test@example.com')
    })

    it('shows message about replies', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(
        'Replies will come back to this email address'
      )
    })

    it('shows spam folder warning', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Spam folder')
    })

    it('links to settings page', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a[href="/settings"]').exists()).toBe(true)
    })

    it('does not show no-email message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).not.toContain("don't have an email address")
    })
  })

  describe('when user has no email', () => {
    beforeEach(() => {
      mockUser.mockReturnValue({ email: null })
    })

    it('shows no email message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("don't have an email address")
    })

    it('explains why email is needed', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(
        'email address to let you know when you have replies'
      )
    })

    it('shows settings button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button').text()).toContain('Go to Settings')
    })

    it('links to settings page', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a[href="/settings"]').exists()).toBe(true)
    })
  })

  describe('when user is not logged in', () => {
    beforeEach(() => {
      mockUser.mockReturnValue(null)
    })

    it('shows no email message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("don't have an email address")
    })
  })
})
