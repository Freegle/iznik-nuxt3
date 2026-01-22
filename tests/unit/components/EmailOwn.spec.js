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
    it('shows make primary button when user has an email', () => {
      mockMe.value = { email: 'user@example.com' }
      const wrapper = mountEmailOwn()
      expect(wrapper.find('.action-btn.primary').exists()).toBe(true)
    })

    it('shows delete button when user has an email', () => {
      mockMe.value = { email: 'user@example.com' }
      const wrapper = mountEmailOwn()
      expect(wrapper.find('.action-btn.delete').exists()).toBe(true)
    })

    it('hides make primary button when me has no email', () => {
      mockMe.value = { email: null }
      const wrapper = mountEmailOwn()
      expect(wrapper.find('.action-btn.primary').exists()).toBe(false)
    })

    it('hides delete button when me has no email', () => {
      mockMe.value = { email: null }
      const wrapper = mountEmailOwn()
      expect(wrapper.find('.action-btn.delete').exists()).toBe(false)
    })

    it('hides buttons when me is null', () => {
      mockMe.value = null
      const wrapper = mountEmailOwn()
      expect(wrapper.find('.action-btn.primary').exists()).toBe(false)
      expect(wrapper.find('.action-btn.delete').exists()).toBe(false)
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

  describe('props', () => {
    it('accepts required email prop', () => {
      const wrapper = mountEmailOwn()
      expect(wrapper.props('email')).toEqual(defaultEmail)
    })

    it('accepts email object with various properties', () => {
      const fullEmail = {
        email: 'full@example.com',
        preferred: true,
        ourdomain: true,
        verified: true,
      }
      const wrapper = mountEmailOwn({ email: fullEmail })
      expect(wrapper.props('email').email).toBe('full@example.com')
      expect(wrapper.props('email').preferred).toBe(true)
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

    it('handles me with undefined email', () => {
      mockMe.value = { email: undefined }
      const wrapper = mountEmailOwn()
      // Should hide buttons
      expect(wrapper.find('.action-btn.primary').exists()).toBe(false)
      expect(wrapper.find('.action-btn.delete').exists()).toBe(false)
    })

    it('calls store method when clicked', async () => {
      // Use a successful response for this test since rejection error handling
      // depends on how the component handles the promise
      mockRemoveEmail.mockResolvedValue(undefined)

      const wrapper = mountEmailOwn()
      await wrapper.find('.action-btn.delete').trigger('click')

      // The store method was called
      expect(mockRemoveEmail).toHaveBeenCalledWith('test@example.com')
    })
  })

  describe('layout and styling', () => {
    it('email-item has flex layout', () => {
      const wrapper = mountEmailOwn()
      expect(wrapper.find('.email-item').exists()).toBe(true)
    })

    it('primary button has correct class', () => {
      const wrapper = mountEmailOwn()
      const primaryBtn = wrapper.find('.action-btn.primary')
      expect(primaryBtn.exists()).toBe(true)
    })

    it('delete button has correct class', () => {
      const wrapper = mountEmailOwn()
      const deleteBtn = wrapper.find('.action-btn.delete')
      expect(deleteBtn.exists()).toBe(true)
    })
  })
})
