import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { ref, defineComponent } from 'vue'
import LoginModal from '~/components/LoginModal.vue'
import { LoginError, SignUpError } from '~/api/APIErrors'

// Mock defineAsyncComponent to return proper Vue components
vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    defineAsyncComponent: () =>
      defineComponent({
        name: 'MockedAsyncComponent',
        template: '<div class="mocked-async-component"><slot /></div>',
      }),
  }
})

// Use vi.hoisted to ensure variables are available during mock factory execution
const {
  mockLogin,
  mockSignUp,
  mockFetchUser,
  mockLoggedInEver,
  mockLoginType,
  mockForceLogin,
  mockMarketingConsent,
  mockSetMarketingConsent,
  mockModtools,
  mockIsApp,
  mockIsiOS,
  mockOsVersion,
  mockMe,
  mockLoggedIn,
  mockRouterPush,
} = vi.hoisted(() => {
  return {
    mockLogin: vi.fn().mockResolvedValue(),
    mockSignUp: vi.fn().mockResolvedValue(),
    mockFetchUser: vi.fn().mockResolvedValue(),
    mockLoggedInEver: { value: false },
    mockLoginType: { value: null },
    mockForceLogin: { value: false },
    mockMarketingConsent: { value: true },
    mockSetMarketingConsent: vi.fn(),
    mockModtools: { value: false },
    mockIsApp: { value: false },
    mockIsiOS: { value: false },
    mockOsVersion: { value: '16.0' },
    mockMe: { value: null },
    mockLoggedIn: { value: false },
    mockRouterPush: vi.fn(),
  }
})

// Mock stores with getter syntax for reactive values
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    signUp: mockSignUp,
    fetchUser: mockFetchUser,
    get loggedInEver() {
      return mockLoggedInEver.value
    },
    set loggedInEver(val) {
      mockLoggedInEver.value = val
    },
    get loginType() {
      return mockLoginType.value
    },
    set loginType(val) {
      mockLoginType.value = val
    },
    get forceLogin() {
      return mockForceLogin.value
    },
    set forceLogin(val) {
      mockForceLogin.value = val
    },
  }),
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    get marketingConsent() {
      return mockMarketingConsent.value
    },
    setMarketingConsent: mockSetMarketingConsent,
    get modtools() {
      return mockModtools.value
    },
  }),
}))

vi.mock('~/stores/mobile', () => ({
  useMobileStore: () => ({
    get isApp() {
      return mockIsApp.value
    },
    get isiOS() {
      return mockIsiOS.value
    },
    get osVersion() {
      return mockOsVersion.value
    },
  }),
}))

// Mock useMe composable
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    get me() {
      return ref(mockMe.value)
    },
    get loggedIn() {
      return ref(mockLoggedIn.value)
    },
  }),
}))

// Mock pinia storeToRefs - must include defineStore for store files
vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal()
  const { ref } = require('vue')
  return {
    ...actual,
    storeToRefs: (store) => ({
      loggedInEver: ref(store.loggedInEver),
      loginType: ref(store.loginType),
      forceLogin: ref(store.forceLogin),
    }),
  }
})

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/',
  }),
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

// Mock runtime config
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      GOOGLE_CLIENT_ID: 'test-google-client-id',
      GOOGLE_IOS_CLIENT_ID: 'test-ios-client-id',
      FACEBOOK_APPID: 'test-facebook-appid',
      FACEBOOK_CLIENTID: 'test-facebook-clientid',
    },
  }),
}))

// Mock API
vi.mock('~/api', () => ({
  default: () => ({
    bandit: {
      chosen: vi.fn(),
      shown: vi.fn(),
    },
  }),
}))

// Mock Capacitor social login
vi.mock('@capgo/capacitor-social-login', () => ({
  SocialLogin: {
    initialize: vi.fn(),
    login: vi.fn(),
  },
}))

// Mock Apple sign in
vi.mock('@capacitor-community/apple-sign-in', () => ({
  SignInWithApple: {
    authorize: vi.fn(),
  },
}))

describe('LoginModal', () => {
  let wrapper = null

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset mock data
    mockLogin.mockResolvedValue()
    mockSignUp.mockResolvedValue()
    mockFetchUser.mockResolvedValue()
    mockLoggedInEver.value = false
    mockLoginType.value = null
    mockForceLogin.value = false
    mockMarketingConsent.value = true
    mockIsApp.value = false
    mockIsiOS.value = false
    mockMe.value = null
    mockLoggedIn.value = false
    mockRouterPush.mockReset()

    // Mock window objects for social login
    global.window.FB = {
      login: vi.fn(),
      init: vi.fn(),
      AppEvents: { logPageView: vi.fn() },
    }
    global.window.google = {
      accounts: {
        id: {
          initialize: vi.fn(),
          renderButton: vi.fn(),
          disableAutoSelect: vi.fn(),
        },
      },
    }
    global.window.PasswordCredential = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  function createWrapper(props = {}) {
    wrapper = shallowMount(LoginModal, {
      props,
      attachTo: document.body,
      global: {
        stubs: {
          'b-modal': {
            template: `
              <div v-if="modelValue" class="b-modal" :id="id">
                <slot name="title" />
                <slot />
              </div>
            `,
            props: [
              'id',
              'modelValue',
              'noFade',
              'size',
              'noTrap',
              'noCloseOnBackdrop',
              'hideHeaderClose',
              'noCloseOnEsc',
              'hideFooter',
              'modalClass',
              'scrollable',
            ],
          },
          'b-button': {
            template:
              '<button :class="[variant, $attrs.class]" :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size', 'type', 'value', 'disabled'],
            emits: ['click'],
          },
          'b-img': {
            template: '<img :src="src" />',
            props: ['src'],
          },
          'b-form': {
            template:
              '<form @submit="$emit(\'submit\', $event)"><slot /></form>',
            props: ['id', 'action', 'autocomplete', 'method'],
            emits: ['submit'],
          },
          'b-form-group': {
            template:
              '<div class="form-group"><label>{{ label }}</label><slot /></div>',
            props: ['label', 'labelFor'],
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" :placeholder="placeholder" :type="type" :name="name" :class="$attrs.class" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: [
              'modelValue',
              'placeholder',
              'name',
              'autocomplete',
              'id',
              'type',
            ],
            emits: ['update:modelValue'],
          },
          'b-form-checkbox': {
            template:
              '<label><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" /><slot /></label>',
            props: ['modelValue', 'name', 'id'],
            emits: ['update:modelValue'],
          },
          'b-alert': {
            template:
              '<div v-if="modelValue" class="alert" :class="variant"><slot /></div>',
            props: ['variant', 'modelValue'],
          },
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to', 'noPrefetch', 'target'],
          },
          'notice-message': {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          EmailValidator: {
            template:
              '<input :value="email" class="email-validator" @input="$emit(\'update:email\', $event.target.value); $emit(\'update:valid\', true)" />',
            props: ['email', 'valid', 'size', 'inputClass'],
            emits: ['update:email', 'update:valid'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
          },
          PasswordEntry: {
            template:
              '<input type="password" :value="modelValue" :placeholder="placeholder" class="password-entry" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: [
              'modelValue',
              'originalPassword',
              'errorBorder',
              'placeholder',
            ],
            emits: ['update:modelValue'],
          },
        },
        config: {
          globalProperties: {
            gtm: {
              enabled: () => false,
              trackEvent: vi.fn(),
            },
          },
        },
      },
    })
    return wrapper
  }

  describe('rendering', () => {
    it('renders modal when not logged in and forceLogin is true', async () => {
      mockLoggedIn.value = false
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('hides modal when forceLogin is false', async () => {
      mockLoggedIn.value = false
      mockForceLogin.value = false
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.b-modal').exists()).toBe(false)
    })

    it('shows sign up title when user has never logged in', async () => {
      mockLoggedInEver.value = false
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Join the Reuse Revolution!')
    })

    it('shows welcome back title when user has logged in before', async () => {
      mockLoggedInEver.value = true
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Welcome back')
    })

    it('displays Facebook login button', async () => {
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()
      const fbButton = wrapper.find('.social-button--facebook')
      expect(fbButton.exists()).toBe(true)
      expect(fbButton.text()).toContain('Continue with Facebook')
    })

    it('displays login form with email and password fields', async () => {
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.email-validator').exists()).toBe(true)
      expect(wrapper.find('.password-entry').exists()).toBe(true)
    })

    it('shows marketing consent checkbox', async () => {
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain("We'll keep in touch by email")
    })
  })

  describe('sign up mode', () => {
    beforeEach(() => {
      mockLoggedInEver.value = false
      mockForceLogin.value = true
    })

    it('shows name field in sign up mode', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('input[name="fullname"]').exists()).toBe(true)
    })

    it('shows "Join Freegle!" button text in sign up mode', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      const submitButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Join Freegle!')
      expect(submitButton).toBeTruthy()
    })

    it('shows terms and privacy links in sign up mode', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Terms')
      expect(wrapper.text()).toContain('Privacy Policy')
    })

    it('shows Log in button to switch to sign in mode', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      const switchButton = wrapper.find('.test-already-a-freegler')
      expect(switchButton.exists()).toBe(true)
      expect(switchButton.text()).toBe('Log in')
    })
  })

  describe('sign in mode', () => {
    beforeEach(() => {
      mockLoggedInEver.value = true
      mockForceLogin.value = true
    })

    it('hides name field in sign in mode', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('input[name="fullname"]').exists()).toBe(false)
    })

    it('shows "Log in" button text in sign in mode', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      // Look for the Log in button that is the submit button (with primary class)
      const submitButton = wrapper
        .findAll('button.primary')
        .find((b) => b.text() === 'Log in')
      expect(submitButton).toBeTruthy()
    })

    it('shows forgot password link in sign in mode', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Forgot password?')
    })

    it('shows Join button to switch to sign up mode', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      const joinButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Join')
      expect(joinButton).toBeTruthy()
    })
  })

  describe('mode switching', () => {
    it('switches from sign up to sign in when Log in clicked', async () => {
      mockLoggedInEver.value = false
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Join the Reuse Revolution!')

      const loginButton = wrapper.find('.test-already-a-freegler')
      await loginButton.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Welcome back')
    })

    it('switches from sign in to sign up when Join clicked', async () => {
      mockLoggedInEver.value = true
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Welcome back')

      const joinButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Join')
      await joinButton.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Join the Reuse Revolution!')
    })
  })

  describe('native login', () => {
    beforeEach(() => {
      mockLoggedInEver.value = true
      mockForceLogin.value = true
    })

    it('calls authStore.login with email and password', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const emailInput = wrapper.find('.email-validator')
      const passwordInput = wrapper.find('.password-entry')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')
      await flushPromises()

      const form = wrapper.find('form')
      await form.trigger('submit', {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      })
      await flushPromises()

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('shows error when login fails', async () => {
      mockLogin.mockRejectedValue(new LoginError(2, 'Invalid credentials'))
      const wrapper = createWrapper()
      await flushPromises()

      const emailInput = wrapper.find('.email-validator')
      const passwordInput = wrapper.find('.password-entry')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('wrongpassword')
      await flushPromises()

      const form = wrapper.find('form')
      await form.trigger('submit', {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      })
      await flushPromises()

      expect(wrapper.find('.alert').exists()).toBe(true)
      expect(wrapper.text()).toContain('Invalid credentials')
    })

    it('shows form error when email is empty', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const passwordInput = wrapper.find('.password-entry')
      await passwordInput.setValue('password123')
      await flushPromises()

      const form = wrapper.find('form')
      await form.trigger('submit', {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      })
      await flushPromises()

      expect(wrapper.find('.alert').exists()).toBe(true)
      expect(wrapper.text()).toContain('Please fill out the form')
    })

    it('shows form error when password is empty', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const emailInput = wrapper.find('.email-validator')
      await emailInput.setValue('test@example.com')
      await flushPromises()

      const form = wrapper.find('form')
      await form.trigger('submit', {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      })
      await flushPromises()

      expect(wrapper.find('.alert').exists()).toBe(true)
      expect(wrapper.text()).toContain('Please fill out the form')
    })
  })

  describe('native sign up', () => {
    beforeEach(() => {
      mockLoggedInEver.value = false
      mockForceLogin.value = true
    })

    it('calls authStore.signUp with fullname, email and password', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const nameInput = wrapper.find('input[name="fullname"]')
      const emailInput = wrapper.find('.email-validator')
      const passwordInput = wrapper.find('.password-entry')

      await nameInput.setValue('Test User')
      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')
      await flushPromises()

      const form = wrapper.find('form')
      await form.trigger('submit', {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      })
      await flushPromises()

      expect(mockSignUp).toHaveBeenCalledWith({
        fullname: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('shows error when sign up fails', async () => {
      mockSignUp.mockRejectedValue(new SignUpError(2, 'Email already exists'))
      const wrapper = createWrapper()
      await flushPromises()

      const nameInput = wrapper.find('input[name="fullname"]')
      const emailInput = wrapper.find('.email-validator')
      const passwordInput = wrapper.find('.password-entry')

      await nameInput.setValue('Test User')
      await emailInput.setValue('existing@example.com')
      await passwordInput.setValue('password123')
      await flushPromises()

      const form = wrapper.find('form')
      await form.trigger('submit', {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      })
      await flushPromises()

      expect(wrapper.find('.alert').exists()).toBe(true)
      expect(wrapper.text()).toContain('Email already exists')
    })

    it('attempts login when name is missing (confused user case)', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const emailInput = wrapper.find('.email-validator')
      const passwordInput = wrapper.find('.password-entry')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')
      await flushPromises()

      const form = wrapper.find('form')
      await form.trigger('submit', {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      })
      await flushPromises()

      // When name is missing but email/password present, it tries login instead (confused user case)
      expect(mockLogin).toHaveBeenCalled()
    })
  })

  describe('social login buttons', () => {
    beforeEach(() => {
      mockForceLogin.value = true
    })

    it('shows Facebook button', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      const fbButton = wrapper.find('.social-button--facebook')
      expect(fbButton.exists()).toBe(true)
    })

    it('shows Google button placeholder for web', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.social-button--google').exists()).toBe(true)
    })

    it('shows Apple button only on iOS app', async () => {
      mockIsApp.value = true
      mockIsiOS.value = true
      mockOsVersion.value = '16.0'
      const wrapper = createWrapper()
      await flushPromises()
      const appleButton = wrapper.find('.social-button--apple')
      expect(appleButton.exists()).toBe(true)
    })

    it('hides Apple button on non-iOS', async () => {
      mockIsApp.value = true
      mockIsiOS.value = false
      const wrapper = createWrapper()
      await flushPromises()
      const appleButton = wrapper.find('.social-button--apple')
      expect(appleButton.exists()).toBe(false)
    })

    it('shows Google app button on app', async () => {
      mockIsApp.value = true
      const wrapper = createWrapper()
      await flushPromises()
      const googleButton = wrapper.find('.social-button--google-app')
      expect(googleButton.exists()).toBe(true)
    })
  })

  describe('forgot password', () => {
    beforeEach(() => {
      mockLoggedInEver.value = true
      mockForceLogin.value = true
    })

    it('navigates to /forgot when forgot password clicked', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const forgotLink = wrapper
        .findAll('a')
        .find((a) => a.text().includes('Forgot password'))
      await forgotLink.trigger('click')
      await flushPromises()

      expect(mockRouterPush).toHaveBeenCalledWith('/forgot')
    })
  })

  describe('force login behavior', () => {
    it('shows modal when forceLogin is true', async () => {
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('hides modal when forceLogin is false', async () => {
      mockForceLogin.value = false
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.b-modal').exists()).toBe(false)
    })
  })

  describe('gmail tip', () => {
    beforeEach(() => {
      mockForceLogin.value = true
    })

    it('shows tip when gmail email entered', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const emailInput = wrapper.find('.email-validator')
      await emailInput.setValue('user@gmail.com')
      await flushPromises()

      expect(wrapper.text()).toContain('Continue with Google')
    })

    it('shows tip when googlemail email entered', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const emailInput = wrapper.find('.email-validator')
      await emailInput.setValue('user@googlemail.com')
      await flushPromises()

      expect(wrapper.text()).toContain('Continue with Google')
    })
  })

  describe('login type display', () => {
    it('shows login type hint when available', async () => {
      mockLoginType.value = 'Facebook'
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('You usually use Facebook')
    })

    it('hides login type hint when not available', async () => {
      mockLoginType.value = null
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).not.toContain('You usually use')
    })
  })

  describe('exposed methods', () => {
    it('exposes show method', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(typeof wrapper.vm.show).toBe('function')
    })

    it('exposes hide method', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(typeof wrapper.vm.hide).toBe('function')
    })

    it('exposes tryLater method', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(typeof wrapper.vm.tryLater).toBe('function')
    })

    it('tryLater sets native error message', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      wrapper.vm.tryLater(true)
      expect(wrapper.vm.nativeLoginError).toBe(
        'Something went wrong; please try later.'
      )
    })

    it('tryLater sets social error message', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      wrapper.vm.tryLater(false)
      expect(wrapper.vm.socialLoginError).toBe(
        'Something went wrong; please try later.'
      )
    })
  })

  describe('marketing consent', () => {
    beforeEach(() => {
      mockForceLogin.value = true
    })

    it('displays marketing consent checkbox', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    })

    it('checkbox is checked by default', async () => {
      mockMarketingConsent.value = true
      const wrapper = createWrapper()
      await flushPromises()
      const checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.element.checked).toBe(true)
    })
  })

  describe('modal visibility', () => {
    it('modal is hidden when logged in', async () => {
      mockLoggedIn.value = true
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()
      // The v-if="!loggedIn" should hide the modal
      expect(wrapper.find('.b-modal').exists()).toBe(false)
    })
  })

  describe('component initialization', () => {
    it('sets marketing consent to true on mount if not set', async () => {
      mockMarketingConsent.value = null
      mockForceLogin.value = true
      createWrapper()
      await flushPromises()
      expect(mockSetMarketingConsent).toHaveBeenCalledWith(true)
    })

    it('does not override existing marketing consent', async () => {
      mockMarketingConsent.value = false
      mockForceLogin.value = true
      createWrapper()
      await flushPromises()
      expect(mockSetMarketingConsent).not.toHaveBeenCalled()
    })
  })

  describe('OR divider', () => {
    it('shows OR divider between social and native login', async () => {
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('OR')
    })
  })

  describe('ModTools affiliation disclaimer', () => {
    it('does not show affiliation disclaimer on Freegle site', async () => {
      mockModtools.value = false
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).not.toContain('affiliated with Freegle')
    })

    it('shows affiliation disclaimer on ModTools', async () => {
      mockModtools.value = true
      mockForceLogin.value = true
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('affiliated with Freegle')
    })
  })
})
