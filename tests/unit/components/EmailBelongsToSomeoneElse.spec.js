import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import EmailBelongsToSomeoneElse from '~/components/EmailBelongsToSomeoneElse.vue'

// Mock auth store
const mockUser = ref({ email: 'current@example.com' })
const mockAuthStore = {
  get user() {
    return mockUser.value
  },
  saveEmail: vi.fn().mockResolvedValue({}),
}
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

describe('EmailBelongsToSomeoneElse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.value = { email: 'current@example.com' }
  })

  function createWrapper(props = {}) {
    return mount(EmailBelongsToSomeoneElse, {
      props: {
        theirs: 'other@example.com',
        ...props,
      },
      global: {
        stubs: {
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('displays the other email address', () => {
      const wrapper = createWrapper({ theirs: 'other@example.com' })
      expect(wrapper.text()).toContain('other@example.com')
    })

    it('displays current user email', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('current@example.com')
    })

    it('explains about different accounts', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('different account')
    })

    it('mentions merging accounts', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('merge')
    })

    it('shows Request merge button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Request merge')
    })
  })

  describe('request merge flow', () => {
    it('calls saveEmail when Request merge is clicked', async () => {
      const wrapper = createWrapper({ theirs: 'other@example.com' })
      const button = wrapper.find('button')
      await button.trigger('click')

      expect(mockAuthStore.saveEmail).toHaveBeenCalledWith({
        email: 'other@example.com',
      })
    })

    it('shows confirmation after requesting merge', async () => {
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      await button.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('verification mail')
      expect(wrapper.text()).toContain('spam folder')
    })

    it('hides Request merge button after clicking', async () => {
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      await button.trigger('click')
      await flushPromises()

      expect(wrapper.text()).not.toContain('Request merge')
    })
  })

  describe('when user email is not available', () => {
    it('shows generic message when no current email', () => {
      mockUser.value = null
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('an existing account')
    })
  })
})
