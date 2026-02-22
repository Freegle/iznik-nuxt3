import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'

// Import component after mocks are set up
import StripeDonate from '~/components/StripeDonate.vue'

// All mocks must be hoisted because they are used in vi.mock factories
const {
  mockIsApp,
  mockIsiOS,
  mockStripeInstance,
  mockCapacitorStripe,
  mockDonationStore,
  mockMobileStore,
} = vi.hoisted(() => {
  const mockIsApp = { value: false }
  const mockIsiOS = { value: false }

  const mockStripeIntent = () =>
    Promise.resolve({
      client_secret: 'test_client_secret_123',
    })

  const mockStripeSubscription = () =>
    Promise.resolve({
      clientSecret: 'test_subscription_secret_123',
    })

  return {
    mockIsApp,
    mockIsiOS,
    mockStripeInstance: {
      elements: () => ({
        create: () => ({
          mount: () => {},
          on: () => {},
        }),
        submit: () => Promise.resolve({}),
      }),
      confirmPayment: () => Promise.resolve({}),
    },
    mockCapacitorStripe: {
      initialize: () => {},
      isGooglePayAvailable: () => Promise.resolve(),
      isApplePayAvailable: () => Promise.reject(new Error('Not available')),
      createGooglePay: () => Promise.resolve(),
      presentGooglePay: () => Promise.resolve({ paymentResult: 'Completed' }),
      createApplePay: () => Promise.resolve(),
      presentApplePay: () => Promise.resolve({ paymentResult: 'Completed' }),
      createPaymentSheet: () => Promise.resolve(),
      presentPaymentSheet: () =>
        Promise.resolve({ paymentResult: 'Completed' }),
      addListener: () => {},
    },
    mockStripeIntent,
    mockStripeSubscription,
    mockDonationStore: {
      stripeIntent: mockStripeIntent,
      stripeSubscription: mockStripeSubscription,
    },
    mockMobileStore: {
      get isApp() {
        return mockIsApp.value
      },
      get isiOS() {
        return mockIsiOS.value
      },
    },
  }
})

// Mock Stripe from @stripe/stripe-js
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: () => Promise.resolve(mockStripeInstance),
}))

// Mock Sentry
vi.mock('@sentry/browser', () => ({
  captureMessage: () => {},
}))

// Mock Capacitor Stripe
vi.mock('@capacitor-community/stripe', () => ({
  Stripe: mockCapacitorStripe,
  PaymentSheetEventsEnum: {
    Failed: 'Failed',
    FailedToLoad: 'FailedToLoad',
    Loaded: 'Loaded',
    Canceled: 'Canceled',
    Completed: 'Completed',
  },
  GooglePayEventsEnum: {
    Failed: 'Failed',
    FailedToLoad: 'FailedToLoad',
    Loaded: 'Loaded',
    Canceled: 'Canceled',
    Completed: 'Completed',
  },
  ApplePayEventsEnum: {
    applePayFailed: 'applePayFailed',
    applePayFailedToLoad: 'applePayFailedToLoad',
    applePayLoaded: 'applePayLoaded',
    applePayCompleted: 'applePayCompleted',
    applePayCanceled: 'applePayCanceled',
    applePayDidSelectShippingContact: 'applePayDidSelectShippingContact',
    applePayDidCreatePaymentMethod: 'applePayDidCreatePaymentMethod',
    Completed: 'Completed',
  },
}))

// Mock uid composable
vi.mock('~/composables/useId', () => ({
  uid: (prefix) => `${prefix}12345`,
}))

vi.mock('~/stores/donations', () => ({
  useDonationStore: () => mockDonationStore,
}))

vi.mock('~/stores/mobile', () => ({
  useMobileStore: () => mockMobileStore,
}))

// Mock useRuntimeConfig
const mockRuntimeConfig = {
  public: {
    STRIPE_PUBLISHABLE_KEY: 'pk_test_123456',
    USER_SITE: 'https://www.ilovefreegle.org',
  },
}

beforeEach(() => {
  globalThis.useRuntimeConfig = vi.fn(() => mockRuntimeConfig)
  // Mock the process.dev check used by the component
  if (typeof globalThis.process === 'object') {
    globalThis.process.dev = false
  }
})

describe('StripeDonate', () => {
  let mockExpressCheckoutElement
  let mockElements
  let mockStripeInstanceSpy

  beforeEach(() => {
    vi.clearAllMocks()
    mockIsApp.value = false
    mockIsiOS.value = false

    // Create spy-able versions of the mock functions
    mockExpressCheckoutElement = {
      mount: vi.fn(),
      on: vi.fn(),
    }

    mockElements = {
      create: vi.fn(() => mockExpressCheckoutElement),
      submit: vi.fn(() => Promise.resolve({})),
    }

    mockStripeInstanceSpy = {
      elements: vi.fn(() => mockElements),
      confirmPayment: vi.fn(() => Promise.resolve({})),
    }

    // Override the mock's elements method
    mockStripeInstance.elements = mockStripeInstanceSpy.elements
    mockStripeInstance.confirmPayment = mockStripeInstanceSpy.confirmPayment
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  async function createWrapper(props = { price: 5 }) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(StripeDonate, props),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'b-button': {
            template:
              '<button :aria-label="ariaLabel" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'ariaLabel'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering (web mode)', () => {
    it('renders the component', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(StripeDonate)
      expect(component.exists()).toBe(true)
    })

    it('renders a div with unique id for Stripe element', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(StripeDonate)
      expect(component.find('#stripe-donate-12345').exists()).toBe(true)
    })

    it('does not show app payment buttons in web mode', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('button[aria-label*="Google Pay"]').exists()).toBe(
        false
      )
      expect(wrapper.find('button[aria-label*="Apple Pay"]').exists()).toBe(
        false
      )
      expect(wrapper.find('button[aria-label*="PayPal"]').exists()).toBe(false)
    })

    it('mounts express checkout element', async () => {
      await createWrapper()
      expect(mockExpressCheckoutElement.mount).toHaveBeenCalledWith(
        '#stripe-donate-12345'
      )
    })

    it('has loading class for minimum height', async () => {
      const wrapper = await createWrapper()
      const component = wrapper.findComponent(StripeDonate)
      expect(component.find('.height').exists()).toBe(true)
    })
  })

  describe('props handling', () => {
    it('accepts price prop', async () => {
      const wrapper = await createWrapper({ price: 10 })
      const component = wrapper.findComponent(StripeDonate)
      expect(component.props('price')).toBe(10)
    })

    it('defines monthly prop with correct default', () => {
      // Verify the component has monthly prop defined with default false
      const props = StripeDonate.props
      expect(props.monthly).toBeDefined()
      expect(props.monthly.default).toBe(false)
    })

    it('defaults monthly to false', async () => {
      const wrapper = await createWrapper({ price: 5 })
      const component = wrapper.findComponent(StripeDonate)
      expect(component.props('monthly')).toBe(false)
    })

    it('creates payment elements with correct amount for one-off', async () => {
      await createWrapper({ price: 10 })
      expect(mockStripeInstanceSpy.elements).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'payment',
          amount: 1000, // Price in pence
          currency: 'gbp',
        })
      )
    })
  })

  describe('express checkout events', () => {
    it('sets up ready event listener', async () => {
      await createWrapper()
      expect(mockExpressCheckoutElement.on).toHaveBeenCalledWith(
        'ready',
        expect.any(Function)
      )
    })

    it('sets up loaderror event listener', async () => {
      await createWrapper()
      expect(mockExpressCheckoutElement.on).toHaveBeenCalledWith(
        'loaderror',
        expect.any(Function)
      )
    })

    it('sets up change event listener', async () => {
      await createWrapper()
      expect(mockExpressCheckoutElement.on).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
    })

    it('sets up loaderstart event listener', async () => {
      await createWrapper()
      expect(mockExpressCheckoutElement.on).toHaveBeenCalledWith(
        'loaderstart',
        expect.any(Function)
      )
    })

    it('sets up confirm event listener', async () => {
      await createWrapper()
      expect(mockExpressCheckoutElement.on).toHaveBeenCalledWith(
        'confirm',
        expect.any(Function)
      )
    })

    it('emits loaded when ready with payment methods', async () => {
      const wrapper = await createWrapper()

      // Find the ready callback and call it
      const readyCall = mockExpressCheckoutElement.on.mock.calls.find(
        (call) => call[0] === 'ready'
      )
      const readyCallback = readyCall[1]
      readyCallback({
        availablePaymentMethods: { card: true, googlePay: true },
      })

      await flushPromises()

      const component = wrapper.findComponent(StripeDonate)
      expect(component.emitted('loaded')).toBeTruthy()
    })

    it('emits noPaymentMethods when ready with no methods', async () => {
      const wrapper = await createWrapper()

      const readyCall = mockExpressCheckoutElement.on.mock.calls.find(
        (call) => call[0] === 'ready'
      )
      const readyCallback = readyCall[1]
      readyCallback({ availablePaymentMethods: {} })

      await flushPromises()

      const component = wrapper.findComponent(StripeDonate)
      expect(component.emitted('noPaymentMethods')).toBeTruthy()
    })

    it('emits error on loaderror', async () => {
      const wrapper = await createWrapper()

      const loaderrorCall = mockExpressCheckoutElement.on.mock.calls.find(
        (call) => call[0] === 'loaderror'
      )
      const loaderrorCallback = loaderrorCall[1]
      loaderrorCallback({ type: 'validation_error' })

      await flushPromises()

      const component = wrapper.findComponent(StripeDonate)
      expect(component.emitted('error')).toBeTruthy()
    })
  })

  describe('payment confirmation (one-off)', () => {
    it('emits success on successful payment', async () => {
      const wrapper = await createWrapper({ price: 10 })

      const confirmCall = mockExpressCheckoutElement.on.mock.calls.find(
        (call) => call[0] === 'confirm'
      )
      const confirmCallback = confirmCall[1]

      mockElements.submit.mockResolvedValue({})
      mockStripeInstanceSpy.confirmPayment.mockResolvedValue({})

      await confirmCallback({ expressPaymentType: 'card' })
      await flushPromises()

      const component = wrapper.findComponent(StripeDonate)
      expect(component.emitted('success')).toBeTruthy()
    })

    it('emits error when confirmPayment fails', async () => {
      const wrapper = await createWrapper({ price: 10 })

      const confirmCall = mockExpressCheckoutElement.on.mock.calls.find(
        (call) => call[0] === 'confirm'
      )
      const confirmCallback = confirmCall[1]

      mockElements.submit.mockResolvedValue({})
      mockStripeInstanceSpy.confirmPayment.mockResolvedValue({
        error: { message: 'Payment failed' },
      })

      await confirmCallback({ expressPaymentType: 'card' })
      await flushPromises()

      const component = wrapper.findComponent(StripeDonate)
      expect(component.emitted('error')).toBeTruthy()
    })

    it('emits error when submit fails', async () => {
      const wrapper = await createWrapper({ price: 10 })

      const confirmCall = mockExpressCheckoutElement.on.mock.calls.find(
        (call) => call[0] === 'confirm'
      )
      const confirmCallback = confirmCall[1]

      mockElements.submit.mockResolvedValue({
        submitError: { message: 'Submit failed' },
      })

      await confirmCallback({ expressPaymentType: 'card' })
      await flushPromises()

      const component = wrapper.findComponent(StripeDonate)
      expect(component.emitted('error')).toBeTruthy()
    })
  })

  describe('app mode - Android', () => {
    beforeEach(() => {
      mockIsApp.value = true
      mockIsiOS.value = false
    })

    it('shows Google Pay button on Android when available', async () => {
      const wrapper = await createWrapper()

      const component = wrapper.findComponent(StripeDonate)
      expect(component.vm.isGooglePayAvailable).toBe(true)
      expect(wrapper.find('button[aria-label*="Google Pay"]').exists()).toBe(
        true
      )
    })

    it('shows PayPal button on Android', async () => {
      const wrapper = await createWrapper()

      const component = wrapper.findComponent(StripeDonate)
      expect(component.vm.isPayPalAvailable).toBe(true)
      // Note: component has typo "PayPay" in aria-label
      expect(wrapper.find('button[aria-label*="PayPay"]').exists()).toBe(true)
    })

    it('does not show Apple Pay button on Android', async () => {
      const wrapper = await createWrapper()

      expect(wrapper.find('button[aria-label*="Apple Pay"]').exists()).toBe(
        false
      )
    })

    it('emits loaded when payment methods available', async () => {
      const wrapper = await createWrapper()

      const component = wrapper.findComponent(StripeDonate)
      expect(component.emitted('loaded')).toBeTruthy()
    })
  })

  describe('app mode - iOS', () => {
    beforeEach(() => {
      mockIsApp.value = true
      mockIsiOS.value = true
    })

    it('does not check Apple Pay availability on iOS (disabled pending Benevity)', async () => {
      // iOS Apple Pay is disabled in the component pending Benevity approval
      const wrapper = await createWrapper()

      // Because of the !mobileStore.isiOS check, it won't check Apple Pay on iOS
      const component = wrapper.findComponent(StripeDonate)
      expect(component.vm.isApplePayAvailable).toBe(false)
    })

    it('shows PayPal button on iOS even when Apple Pay unavailable', async () => {
      const wrapper = await createWrapper()

      // PayPal is available on all app platforms including iOS
      expect(wrapper.find('button[aria-label*="PayPay"]').exists()).toBe(true)
      // No "sorry" message because PayPal is available
      expect(wrapper.text()).not.toContain(
        'Sorry, there are no payments methods available'
      )
    })

    it('emits loaded on iOS when PayPal is available', async () => {
      const wrapper = await createWrapper()

      const component = wrapper.findComponent(StripeDonate)
      expect(component.emitted('loaded')).toBeTruthy()
    })
  })

  describe('error handling', () => {
    it('shows error message when error ref is set', async () => {
      const wrapper = await createWrapper()

      const component = wrapper.findComponent(StripeDonate)
      component.vm.error = 'Payment failed'

      await wrapper.vm.$nextTick()

      expect(wrapper.find('.notice-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('Payment failed')
    })

    it('emits error when Stripe key is missing in app mode', async () => {
      mockIsApp.value = true
      globalThis.useRuntimeConfig = vi.fn(() => ({
        public: { STRIPE_PUBLISHABLE_KEY: null },
      }))

      const wrapper = await createWrapper()

      const component = wrapper.findComponent(StripeDonate)
      expect(component.emitted('error')).toBeTruthy()
    })
  })

  describe('emits', () => {
    it('defines all expected emits', () => {
      const emits = StripeDonate.emits
      expect(emits).toContain('loaded')
      expect(emits).toContain('error')
      expect(emits).toContain('success')
      expect(emits).toContain('noPaymentMethods')
    })
  })
})
