import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import Discourse from '~/modtools/pages/discourse.vue'

// Mock useMe composable with reactive myid
const mockMyid = ref(null)
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myid: mockMyid,
  }),
}))

// Mock auth store
const mockAuthStore = {
  user: null,
}
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

describe('Discourse Page', () => {
  let originalLocation

  beforeEach(() => {
    vi.clearAllMocks()
    mockMyid.value = null
    mockAuthStore.user = null

    // Mock window.location
    originalLocation = window.location
    delete window.location
    window.location = { href: '' }
  })

  afterEach(() => {
    window.location = originalLocation
  })

  function mountComponent() {
    return mount(Discourse, {
      global: {
        stubs: {
          'b-img': { template: '<img />' },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders the redirect message', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'This should redirect you back to Discourse'
      )
    })

    it('renders the loading image', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.spinner-border').exists()).toBe(true)
    })
  })

  describe('redirect behavior', () => {
    it('redirects immediately when myid is already set', async () => {
      mockMyid.value = 123
      mountComponent()
      await flushPromises()

      expect(window.location).toBe('https://discourse.ilovefreegle.org')
    })

    it('redirects when user is in auth store on mount', async () => {
      mockAuthStore.user = { id: 456 }
      mountComponent()
      await flushPromises()

      expect(window.location).toBe('https://discourse.ilovefreegle.org')
    })

    it('does not redirect when user is not logged in', async () => {
      mockMyid.value = null
      mockAuthStore.user = null
      mountComponent()
      await flushPromises()

      expect(window.location.href).toBe('')
    })

    it('redirects when myid changes from null to a value', async () => {
      mockMyid.value = null
      mountComponent()
      await flushPromises()

      // User not logged in - no redirect
      expect(window.location.href).toBe('')

      // User logs in
      mockMyid.value = 789
      await nextTick()
      await flushPromises()

      expect(window.location).toBe('https://discourse.ilovefreegle.org')
    })
  })
})
