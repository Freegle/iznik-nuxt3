import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import EmailOwn from '~/components/EmailOwn.vue'

// Mock the auth store
const mockRemoveEmail = vi.fn()
const mockMakeEmailPrimary = vi.fn()

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    removeEmail: mockRemoveEmail,
    makeEmailPrimary: mockMakeEmailPrimary,
  }),
}))

// Mock useMe composable with reactive me value
const mockMe = ref({ email: 'primary@example.com' })

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
  }),
}))

describe('EmailOwn', () => {
  const defaultEmail = {
    email: 'test@example.com',
    preferred: false,
    ourdomain: false,
  }

  function mountEmailOwn(props = {}) {
    return mount(EmailOwn, {
      props: {
        email: defaultEmail,
        ...props,
      },
      global: {
        stubs: {
          'v-icon': {
            template: '<i :data-icon="icon"></i>',
            props: ['icon'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockRemoveEmail.mockResolvedValue(undefined)
    mockMakeEmailPrimary.mockResolvedValue(undefined)
    mockMe.value = { email: 'primary@example.com' }
  })

  describe('rendering', () => {
    it('renders the email item container', () => {
      const wrapper = mountEmailOwn()
      expect(wrapper.find('.email-item').exists()).toBe(true)
    })

    it('displays the email address', () => {
      const wrapper = mountEmailOwn()
      expect(wrapper.find('.email-address').text()).toBe('test@example.com')
    })

    it('displays different email addresses', () => {
      const wrapper = mountEmailOwn({
        email: { email: 'another@domain.org' },
      })
      expect(wrapper.find('.email-address').text()).toBe('another@domain.org')
    })
  })

  describe('action buttons visibility', () => {
    it.each([
      [
        { email: 'user@example.com' },
        true,
        'shows buttons when user has email',
      ],
      [{ email: null }, false, 'hides buttons when user has no email'],
      [{ email: undefined }, false, 'hides buttons when email is undefined'],
      [null, false, 'hides buttons when me is null'],
    ])('me=%j -> buttons visible=%s (%s)', (meValue, visible) => {
      mockMe.value = meValue
      const wrapper = mountEmailOwn()
      expect(wrapper.find('.action-btn.primary').exists()).toBe(visible)
      expect(wrapper.find('.action-btn.delete').exists()).toBe(visible)
    })
  })

  describe('make primary functionality', () => {
    it('make primary button has correct text', () => {
      const wrapper = mountEmailOwn()
      expect(wrapper.find('.action-btn.primary').text()).toBe('Make primary')
    })

    it('calls makeEmailPrimary when make primary is clicked', async () => {
      const wrapper = mountEmailOwn()
      await wrapper.find('.action-btn.primary').trigger('click')

      expect(mockMakeEmailPrimary).toHaveBeenCalledWith('test@example.com')
    })

    it('passes correct email to makeEmailPrimary', async () => {
      const customEmail = { email: 'custom@test.org' }
      const wrapper = mountEmailOwn({ email: customEmail })
      await wrapper.find('.action-btn.primary').trigger('click')

      expect(mockMakeEmailPrimary).toHaveBeenCalledWith('custom@test.org')
    })

    it('awaits makeEmailPrimary completion', async () => {
      let resolved = false
      mockMakeEmailPrimary.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        resolved = true
      })

      const wrapper = mountEmailOwn()
      const clickPromise = wrapper.find('.action-btn.primary').trigger('click')

      expect(resolved).toBe(false)
      await clickPromise
      await vi.waitFor(() => expect(resolved).toBe(true))
    })
  })

  describe('delete functionality', () => {
    it('delete button has times icon', () => {
      const wrapper = mountEmailOwn()
      const deleteBtn = wrapper.find('.action-btn.delete')
      const icon = deleteBtn.find('i')
      expect(icon.attributes('data-icon')).toBe('times')
    })

    it('calls removeEmail when delete is clicked', async () => {
      const wrapper = mountEmailOwn()
      await wrapper.find('.action-btn.delete').trigger('click')

      expect(mockRemoveEmail).toHaveBeenCalledWith('test@example.com')
    })

    it('passes correct email to removeEmail', async () => {
      const customEmail = { email: 'todelete@example.org' }
      const wrapper = mountEmailOwn({ email: customEmail })
      await wrapper.find('.action-btn.delete').trigger('click')

      expect(mockRemoveEmail).toHaveBeenCalledWith('todelete@example.org')
    })

    it('awaits removeEmail completion', async () => {
      let resolved = false
      mockRemoveEmail.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        resolved = true
      })

      const wrapper = mountEmailOwn()
      const clickPromise = wrapper.find('.action-btn.delete').trigger('click')

      expect(resolved).toBe(false)
      await clickPromise
      await vi.waitFor(() => expect(resolved).toBe(true))
    })
  })

  describe('edge cases', () => {
    it('handles empty email string', () => {
      const emptyEmail = { email: '' }
      const wrapper = mountEmailOwn({ email: emptyEmail })
      expect(wrapper.find('.email-address').text()).toBe('')
    })

    it('handles email with special characters', () => {
      const specialEmail = { email: 'user+tag@sub.domain.co.uk' }
      const wrapper = mountEmailOwn({ email: specialEmail })
      expect(wrapper.find('.email-address').text()).toBe(
        'user+tag@sub.domain.co.uk'
      )
    })

    it('handles very long email addresses', () => {
      const longEmail = {
        email: 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com',
      }
      const wrapper = mountEmailOwn({ email: longEmail })
      expect(wrapper.find('.email-address').text()).toBe(longEmail.email)
    })
  })
})
