import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import GoogleOneTap from '~/components/GoogleOneTap.vue'

const mockAuthStore = {
  loggedIn: false,
  login: vi.fn().mockResolvedValue(undefined),
}

const { mockRuntimeConfig } = vi.hoisted(() => {
  return {
    mockRuntimeConfig: {
      public: {
        GOOGLE_CLIENT_ID: 'test-client-id',
        CIRCLECI: false,
      },
    },
  }
})

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('#app', () => ({
  useRuntimeConfig: () => mockRuntimeConfig,
}))

vi.mock('jwt-decode', () => ({
  default: vi.fn().mockReturnValue({
    email: 'test@example.com',
    name: 'Test User',
  }),
}))

describe('GoogleOneTap', () => {
  let mockGoogle

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockAuthStore.loggedIn = false
    mockRuntimeConfig.public.CIRCLECI = false

    mockGoogle = {
      accounts: {
        id: {
          initialize: vi.fn(),
          prompt: vi.fn((callback) => callback()),
        },
      },
    }

    vi.stubGlobal('google', mockGoogle)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function createWrapper() {
    return mount(GoogleOneTap, {
      global: {
        stubs: {
          ClientOnly: {
            template: '<div><slot /></div>',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders div with g_id_onload id when show is true', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('#g_id_onload').exists()).toBe(true)
    })

    it('passes client ID as data attribute', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const div = wrapper.find('#g_id_onload')
      expect(div.attributes('data-client_id')).toBe('test-client-id')
    })

    it('sets auto_select to true', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const div = wrapper.find('#g_id_onload')
      expect(div.attributes('data-auto_select')).toBe('true')
    })

    it('sets use_fedcm_for_prompt to true', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const div = wrapper.find('#g_id_onload')
      expect(div.attributes('data-use_fedcm_for_prompt')).toBe('true')
    })
  })

  describe('Google SDK initialization', () => {
    it('initializes Google SDK on mount', async () => {
      createWrapper()
      await flushPromises()

      expect(mockGoogle.accounts.id.initialize).toHaveBeenCalledWith({
        client_id: 'test-client-id',
        callback: expect.any(Function),
      })
    })

    it('calls Google prompt after initialization', async () => {
      createWrapper()
      await flushPromises()

      expect(mockGoogle.accounts.id.prompt).toHaveBeenCalled()
    })
  })

  describe('logged in state', () => {
    it('emits complete when already logged in', async () => {
      mockAuthStore.loggedIn = true
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.emitted('complete')).toBeTruthy()
    })

    it('does not initialize Google SDK when already logged in', async () => {
      mockAuthStore.loggedIn = true
      createWrapper()
      await flushPromises()

      expect(mockGoogle.accounts.id.initialize).not.toHaveBeenCalled()
    })
  })

  describe('fallback timeout', () => {
    it('emits complete after timeout', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      vi.advanceTimersByTime(15000)

      expect(wrapper.emitted('complete')).toBeTruthy()
    })
  })

  describe('credential response handling', () => {
    it('assigns handler to window on mount', async () => {
      createWrapper()
      await flushPromises()

      expect(window.handleGoogleCredentialsResponse).toBeDefined()
    })

    it('calls authStore.login with credential', async () => {
      createWrapper()
      await flushPromises()

      await window.handleGoogleCredentialsResponse({
        credential: 'test-jwt-token',
      })

      expect(mockAuthStore.login).toHaveBeenCalledWith({
        googlejwt: 'test-jwt-token',
        googlelogin: true,
      })
    })

    it('emits loggedin on successful login', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      await window.handleGoogleCredentialsResponse({
        credential: 'test-jwt-token',
      })

      expect(wrapper.emitted('loggedin')).toBeTruthy()
    })

    it('emits complete when already logged in on callback', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      mockAuthStore.loggedIn = true

      await window.handleGoogleCredentialsResponse({
        credential: 'test-jwt-token',
      })

      expect(wrapper.emitted('complete')).toBeTruthy()
    })
  })

  describe('CircleCI environment', () => {
    it('emits complete immediately in CircleCI', async () => {
      mockRuntimeConfig.public.CIRCLECI = true

      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(mockGoogle.accounts.id.initialize).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('handles Google SDK initialization error gracefully', async () => {
      mockGoogle.accounts.id.initialize = vi.fn(() => {
        throw new Error('SDK error')
      })

      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.emitted('complete')).toBeTruthy()
    })

    it('handles prompt error gracefully', async () => {
      mockGoogle.accounts.id.prompt = vi.fn(() => {
        throw new Error('Prompt error')
      })

      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.emitted('complete')).toBeTruthy()
    })
  })
})
