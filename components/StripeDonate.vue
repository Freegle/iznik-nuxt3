<template>
  <div class="height">
    <div
      v-if="loading"
      class="d-flex flex-column justify-content-around text-center pulsate text-muted w-100"
    >
      Loading donation methods...
    </div>
    <div v-if="isApp" class="d-flex flex-column gap-3">
      <b-button
        v-if="isGooglePayAvailable"
        variant="primary"
        size="lg"
        aria-label="Donate to Freegle with Google Pay"
        @click="useGooglePay"
      >
        <div class="d-flex align-items-center">
          <img src="/GooglePayButton.png" class="w-100" />
        </div>
      </b-button>
      <b-button
        v-if="isApplePayAvailable"
        variant="primary"
        size="lg"
        aria-label="Donate to Freegle with Apple Pay"
        @click="useApplePay"
      >
        <div class="d-flex align-items-center">
          <img src="/ApplePayButton.jpg" class="w-100" />
        </div>
      </b-button>
      <b-button
        v-if="isPayPalAvailable"
        variant="primary"
        size="lg"
        aria-label="Donate to Freegle with PayPay or a card"
        @click="usePayPalCard"
      >
        <div class="d-flex align-items-center">
          <img src="/PayPalButton.png" class="w-100" />
        </div>
      </b-button>
      <p
        v-if="
          !isGooglePayAvailable && !isApplePayAvailable && !isPayPalAvailable
        "
      >
        Sorry, there are no payments methods available on your phone.
      </p>
    </div>
    <div v-else :id="uniqueId"></div>
    <NoticeMessage v-if="error" variant="error">
      {{ error }}
    </NoticeMessage>
  </div>
</template>
<script setup>
import { loadStripe } from '@stripe/stripe-js'
import * as Sentry from '@sentry/browser'
import {
  Stripe,
  PaymentSheetEventsEnum,
  GooglePayEventsEnum,
  ApplePayEventsEnum,
} from '@capacitor-community/stripe'
import { uid } from '~/composables/useId'
import { useDonationStore } from '~/stores/donations'
import { useMobileStore } from '@/stores/mobile'

const runtimeConfig = useRuntimeConfig()
const userSite = runtimeConfig.public.USER_SITE
const donationStore = useDonationStore()
const mobileStore = useMobileStore()

const props = defineProps({
  price: {
    type: Number,
    required: true,
  },
  monthly: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const isApp = ref(mobileStore.isApp) // APP

const loading = ref(true)
const isApplePayAvailable = ref(false)
const isGooglePayAvailable = ref(false)
const isPayPalAvailable = ref(false)
const intent = ref(false)

const emit = defineEmits(['loaded', 'error', 'success', 'noPaymentMethods'])

let uniqueId = null
let stripe = null
let stripeInitialized = false

// App Stripe initialization is deferred to onMounted to ensure runtimeConfig is available
if (!isApp.value) {
  uniqueId = uid('stripe-donate-')
  const stripeKey = runtimeConfig.public.STRIPE_PUBLISHABLE_KEY
  if (stripeKey) {
    try {
      stripe = await loadStripe(stripeKey)
    } catch (e) {
      console.error('Stripe load error', e)
      Sentry.captureMessage('Stripe load error', {
        extra: e,
      })
      emit('error')
    }
  }
}

const appearance = {
  /* appearance */
}

const options = {
  paymentMethods: {
    // In dev, we can't use Google/Apple pay because we aren't over HTTPS and the domain isn't registered.
    googlePay: process.dev ? 'never' : 'auto',
    applePay: process.dev ? 'never' : 'auto',
  },
  paymentMethodOrder: ['googlepay', 'applepay', 'paypal', 'card', 'link'],
  layout: {
    overflow: 'never',
  },
}

let elements = null

if (stripe) {
  if (props.monthly) {
    console.log('Create elements for subscription', event)
    const res = await donationStore.stripeSubscription(props.price)
    console.log('Subscription returned', res)

    elements = stripe.elements({
      clientSecret: res.clientSecret,
      appearance,
    })
  } else {
    console.log('Create elements for one-off payment')
    elements = stripe.elements({
      mode: 'payment',
      amount: props.price * 100, // Price is in pence
      currency: 'gbp',
      appearance,
    })
  }
}

const error = ref(null)

onMounted(async () => {
  if (isApp.value) {
    Sentry.addBreadcrumb({
      category: 'stripe',
      message: 'StripeDonate onMounted - app path',
      data: {
        isApp: isApp.value,
        isiOS: mobileStore.isiOS,
        price: props.price,
        monthly: props.monthly,
      },
    })

    const stripeKey = runtimeConfig.public.STRIPE_PUBLISHABLE_KEY

    if (!stripeKey) {
      console.error('Stripe publishableKey not available at mount')
      Sentry.captureMessage('Stripe publishableKey missing at mount', {
        extra: { runtimeConfigPublic: runtimeConfig.public },
      })
      emit('error')
      loading.value = false
      return
    }

    if (!stripeInitialized) {
      try {
        console.log('Stripe.initialize', stripeKey)
        Stripe.initialize({
          publishableKey: stripeKey,
        })
        stripeInitialized = true
        Sentry.addBreadcrumb({
          category: 'stripe',
          message: 'Stripe.initialize succeeded',
        })
      } catch (e) {
        console.error('Stripe.initialize failed', e)
        Sentry.captureException(e, {
          tags: { stripe_step: 'initialize' },
        })
        emit('error')
        loading.value = false
        return
      }
    }

    try {
      console.log('Stripe props.price', props.price)
      if (mobileStore.isApp) {
        Stripe.addListener(PaymentSheetEventsEnum.Failed, (e) => {
          console.log('Stripe PaymentSheetEventsEnum.Failed', e)
          Sentry.captureMessage('Stripe PaymentSheet failed', {
            extra: { error: e },
            tags: { stripe_step: 'payment_sheet_event' },
          })
        })
        Stripe.addListener(PaymentSheetEventsEnum.FailedToLoad, (e) => {
          console.log('Stripe PaymentSheetEventsEnum.FailedToLoad', e)
          Sentry.captureMessage('Stripe PaymentSheet failed to load', {
            extra: { error: e },
            tags: { stripe_step: 'payment_sheet_event' },
          })
        })
        Stripe.addListener(PaymentSheetEventsEnum.Loaded, () => {
          console.log('Stripe PaymentSheetEventsEnum.Loaded')
          Sentry.addBreadcrumb({
            category: 'stripe',
            message: 'PaymentSheet loaded',
          })
        })
        Stripe.addListener(PaymentSheetEventsEnum.Canceled, () => {
          console.log('Stripe PaymentSheetEventsEnum.Canceled')
          Sentry.addBreadcrumb({
            category: 'stripe',
            message: 'PaymentSheet canceled',
          })
        })
        Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
          console.log('Stripe PaymentSheetEventsEnum.Completed')
          Sentry.addBreadcrumb({
            category: 'stripe',
            message: 'PaymentSheet completed',
          })
        })
        if (!mobileStore.isiOS) {
          Stripe.addListener(GooglePayEventsEnum.Failed, (e) => {
            console.log('Stripe GooglePayEventsEnum.Failed', e)
            Sentry.captureMessage('Stripe GooglePay failed', {
              extra: { error: e },
              tags: { stripe_step: 'googlepay_event' },
            })
          })
          Stripe.addListener(GooglePayEventsEnum.FailedToLoad, (e) => {
            console.log('Stripe GooglePayEventsEnum.FailedToLoad', e)
            Sentry.captureMessage('Stripe GooglePay failed to load', {
              extra: { error: e },
              tags: { stripe_step: 'googlepay_event' },
            })
          })
          Stripe.addListener(GooglePayEventsEnum.Loaded, () => {
            console.log('Stripe GooglePayEventsEnum.Loaded')
          })
          Stripe.addListener(GooglePayEventsEnum.Canceled, () => {
            console.log('Stripe GooglePayEventsEnum.Canceled')
          })
          Stripe.addListener(GooglePayEventsEnum.Completed, () => {
            console.log('Stripe GooglePayEventsEnum.Completed')
          })
        } else {
          // iOS
          Stripe.addListener(ApplePayEventsEnum.applePayFailed, (e) => {
            console.log('Stripe ApplePayEventsEnum.Failed', e)
            Sentry.captureMessage('Stripe ApplePay failed', {
              extra: { error: e },
              tags: { stripe_step: 'applepay_event' },
            })
          })
          Stripe.addListener(ApplePayEventsEnum.applePayFailedToLoad, (e) => {
            console.log('Stripe ApplePayEventsEnum.applePayFailedToLoad', e)
            Sentry.captureMessage('Stripe ApplePay failed to load', {
              extra: { error: e },
              tags: { stripe_step: 'applepay_event' },
            })
          })
          Stripe.addListener(ApplePayEventsEnum.applePayLoaded, () => {
            console.log('Stripe ApplePayEventsEnum.applePayLoaded')
            Sentry.addBreadcrumb({
              category: 'stripe',
              message: 'ApplePay loaded',
            })
          })
          Stripe.addListener(ApplePayEventsEnum.applePayCompleted, () => {
            console.log('Stripe ApplePayEventsEnum.applePayCompleted')
            Sentry.addBreadcrumb({
              category: 'stripe',
              message: 'ApplePay completed',
            })
          })
          Stripe.addListener(ApplePayEventsEnum.applePayCanceled, () => {
            console.log('Stripe ApplePayEventsEnum.applePayCanceled')
            Sentry.addBreadcrumb({
              category: 'stripe',
              message: 'ApplePay canceled',
            })
          })
          Stripe.addListener(
            ApplePayEventsEnum.applePayDidSelectShippingContact,
            () => {
              console.log(
                'Stripe ApplePayEventsEnum.applePayDidSelectShippingContact'
              )
            }
          )
          Stripe.addListener(
            ApplePayEventsEnum.applePayDidCreatePaymentMethod,
            () => {
              console.log(
                'Stripe ApplePayEventsEnum.applePayDidCreatePaymentMethod'
              )
            }
          )
        }

        // Create payment intent
        Sentry.addBreadcrumb({
          category: 'stripe',
          message: 'Creating payment intent',
          data: { price: props.price, monthly: props.monthly },
        })

        if (props.monthly) {
          intent.value = await donationStore.stripeSubscription(props.price)
          console.log('Stripe subscription Intent', intent.value)
        } else {
          intent.value = await donationStore.stripeIntent({
            amount: props.price,
          })
          console.log('Stripe single payment Intent', intent.value)
        }

        if (!intent.value?.client_secret) {
          console.error(
            'Stripe: Payment intent creation returned no client_secret',
            intent.value
          )
          Sentry.captureMessage(
            'Payment intent missing client_secret in app',
            {
              extra: {
                intentValue: JSON.stringify(intent.value),
                price: props.price,
              },
              tags: { stripe_step: 'create_intent' },
            }
          )
        } else {
          Sentry.addBreadcrumb({
            category: 'stripe',
            message: 'Payment intent created successfully',
            data: {
              hasClientSecret: !!intent.value.client_secret,
            },
          })
        }

        // Check payment method availability
        if (!mobileStore.isiOS) {
          try {
            await Stripe.isGooglePayAvailable()
            isGooglePayAvailable.value = true
            Sentry.addBreadcrumb({
              category: 'stripe',
              message: 'Google Pay is available',
            })
          } catch (e) {
            Sentry.addBreadcrumb({
              category: 'stripe',
              message: 'Google Pay not available',
              data: { error: e?.message || String(e) },
            })
          }
        } else {
          try {
            await Stripe.isApplePayAvailable()
            isApplePayAvailable.value = true
            Sentry.addBreadcrumb({
              category: 'stripe',
              message: 'Apple Pay is available',
            })
          } catch (e) {
            console.log('Apple Pay not available', e)
            Sentry.addBreadcrumb({
              category: 'stripe',
              message: 'Apple Pay not available',
              data: { error: e?.message || String(e) },
            })
          }
        }
        console.log('Stripe isGooglePayAvailable', isGooglePayAvailable.value)
        console.log('Stripe isApplePayAvailable', isApplePayAvailable.value)
        isPayPalAvailable.value = true

        Sentry.addBreadcrumb({
          category: 'stripe',
          message: 'App payment init complete',
          data: {
            googlePay: isGooglePayAvailable.value,
            applePay: isApplePayAvailable.value,
            payPal: isPayPalAvailable.value,
            hasIntent: !!intent.value?.client_secret,
          },
        })
      }
    } catch (e) {
      console.error('Stripe Exception', e.message, e)
      Sentry.captureException(e, {
        tags: { stripe_step: 'app_init' },
        extra: {
          price: props.price,
          isiOS: mobileStore.isiOS,
          stripeInitialized,
        },
      })
    }
    if (
      isGooglePayAvailable.value ||
      isApplePayAvailable.value ||
      isPayPalAvailable.value
    ) {
      emit('loaded')
    } else {
      emit('noPaymentMethods')
    }
  }
  if (stripe) {
    console.log(
      'Mounted for #',
      uniqueId,
      document.getElementById(uniqueId) !== null
    )
    const expressCheckoutElement = elements.create('expressCheckout', options)
    expressCheckoutElement.mount('#' + uniqueId)
    expressCheckoutElement.on('ready', (event) => {
      console.log('Express checkout ready', event)
      loading.value = false

      if (
        typeof event.availablePaymentMethods !== 'object' ||
        !Object.keys(event.availablePaymentMethods).length
      ) {
        // We've seen this happen on Brave.
        console.log('No Stripe payment methods available')
        emit('noPaymentMethods')
      } else {
        emit('loaded')
      }
    })
    expressCheckoutElement.on('loaderror', (event) => {
      console.log('Express checkout loadError', event)
      Sentry.captureMessage('Stripe Express Checkout load error', {
        extra: event,
      })
      emit('error')
    })
    expressCheckoutElement.on('change', (event) => {
      console.log('Express checkout change', event)
    })
    expressCheckoutElement.on('loaderstart', (event) => {
      console.log('Express checkout loadStart', event)
    })
    expressCheckoutElement.on('confirm', async (event) => {
      const { submitError } = await elements.submit()

      if (submitError) {
        console.error('Payment submit error')
        Sentry.captureMessage('Stripe Express Checkout load error', {
          extra: event,
        })
        emit('error')
      } else if (!props.monthly) {
        // Create the PaymentIntent and obtain clientSecret
        console.log(
          'One-off payment, price:',
          props.price,
          'type:',
          event.expressPaymentType
        )
        console.log('donationStore:', donationStore)
        console.log('donationStore.config:', donationStore.config)

        let res
        try {
          console.log('Calling stripeIntent...')
          res = await donationStore.stripeIntent({
            amount: props.price,
            paymenttype: event.expressPaymentType,
          })
          console.log('stripeIntent returned:', res)
        } catch (e) {
          console.error('stripeIntent exception:', e)
          console.error('Exception message:', e.message)
          console.error('Exception stack:', e.stack)
          throw e
        }

        const clientSecret = res.client_secret
        console.log('clientSecret:', clientSecret)

        const { error } = await stripe.confirmPayment({
          // `elements` instance used to create the Express Checkout Element
          elements,
          // `clientSecret` from the created PaymentIntent
          clientSecret,
          confirmParams: {
            return_url: userSite + '/donated',
          },
          redirect: 'if_required',
        })

        console.log('Confirm payment returned', error)

        if (error) {
          console.error('Confirm payment error', error)
          Sentry.captureMessage('Confirm payment error', {
            extra: event,
          })
          emit('error')
        } else {
          // The payment UI is support to automatically close. But we have
          // seen a PayPal overlay persist, so remove that if it's present.
          const overlap = document.querySelectorAll('[data-testid="overlay"]')

          overlap.forEach((el) => {
            el.remove()
          })

          emit('success')
        }
      } else {
        const { error } = await stripe.confirmPayment({
          // `Elements` instance that was used to create the Payment Element
          elements,
          confirmParams: {
            return_url: userSite + '/donated',
          },
        })

        if (error) {
          console.error('Create subscription error', error)
          Sentry.captureMessage('Create subscription  error', {
            extra: event,
          })

          error.value = error.message

          emit('error')
        } else {
          emit('success')
        }
      }
    })
  }
  loading.value = false
})

async function useGooglePay() {
  Sentry.addBreadcrumb({
    category: 'stripe',
    message: 'useGooglePay clicked',
    data: { hasIntent: !!intent.value?.client_secret, price: props.price },
  })

  try {
    if (!intent.value?.client_secret) {
      console.error('Stripe: No payment intent available for Google Pay')
      Sentry.captureMessage('Google Pay attempted without payment intent', {
        tags: { stripe_step: 'googlepay_click' },
        extra: { intentValue: JSON.stringify(intent.value) },
      })
      error.value = 'Payment not ready. Please try again.'
      return
    }

    console.log('useGooglePay - creating')
    await Stripe.createGooglePay({
      paymentIntentClientSecret: intent.value.client_secret,
      merchantIdentifier: 'org.ilovefreegle.direct',
      countryCode: 'GB',
      currency: 'GBP',
    })

    Sentry.addBreadcrumb({
      category: 'stripe',
      message: 'Google Pay created, presenting',
    })

    const result = await Stripe.presentGooglePay()
    console.log('Stripe presentGooglePay', result.paymentResult, result)

    Sentry.addBreadcrumb({
      category: 'stripe',
      message: 'Google Pay result',
      data: { paymentResult: result.paymentResult },
    })

    if (result.paymentResult === GooglePayEventsEnum.Completed) {
      console.log('Stripe GooglePay successful')
      emit('success')
    }
  } catch (e) {
    console.error('Stripe Google Pay error', e)
    Sentry.captureException(e, {
      tags: { stripe_step: 'googlepay_flow' },
      extra: {
        message: e?.message,
        code: e?.code,
        hasIntent: !!intent.value?.client_secret,
      },
    })
    error.value = 'Google Pay failed. Please try another method.'
  }
}

async function usePayPalCard() {
  Sentry.addBreadcrumb({
    category: 'stripe',
    message: 'usePayPalCard clicked',
    data: { hasIntent: !!intent.value?.client_secret, price: props.price },
  })

  try {
    if (!intent.value?.client_secret) {
      console.error('Stripe: No payment intent available for PayPal/card')
      Sentry.captureMessage('PayPal/card attempted without payment intent', {
        tags: { stripe_step: 'paypal_click' },
        extra: { intentValue: JSON.stringify(intent.value) },
      })
      error.value = 'Payment not ready. Please try again.'
      return
    }

    console.log('usePayPalCard - creating payment sheet')
    await Stripe.createPaymentSheet({
      paymentIntentClientSecret: intent.value.client_secret,
      merchantDisplayName: 'Freegle',
    })

    Sentry.addBreadcrumb({
      category: 'stripe',
      message: 'Payment sheet created, presenting',
    })

    const result = await Stripe.presentPaymentSheet()
    console.log('Stripe presentPaymentSheet', result.paymentResult, result)

    Sentry.addBreadcrumb({
      category: 'stripe',
      message: 'Payment sheet result',
      data: { paymentResult: result.paymentResult },
    })

    if (result.paymentResult === PaymentSheetEventsEnum.Completed) {
      console.log('Stripe PayPal/card successful')
      emit('success')
    }
  } catch (e) {
    console.error('Stripe PayPal/card error', e)
    Sentry.captureException(e, {
      tags: { stripe_step: 'paypal_flow' },
      extra: {
        message: e?.message,
        code: e?.code,
        hasIntent: !!intent.value?.client_secret,
      },
    })
    error.value = 'Payment failed. Please try another method.'
  }
}

async function useApplePay() {
  Sentry.addBreadcrumb({
    category: 'stripe',
    message: 'useApplePay clicked',
    data: { hasIntent: !!intent.value?.client_secret, price: props.price },
  })

  try {
    if (!intent.value?.client_secret) {
      console.error('Stripe: No payment intent available for Apple Pay')
      Sentry.captureMessage('Apple Pay attempted without payment intent', {
        tags: { stripe_step: 'applepay_click' },
        extra: { intentValue: JSON.stringify(intent.value) },
      })
      error.value = 'Payment not ready. Please try again.'
      return
    }

    console.log('useApplePay - creating')
    await Stripe.createApplePay({
      paymentIntentClientSecret: intent.value.client_secret,
      paymentSummaryItems: [
        {
          label: 'Freegle Donation',
          amount: props.price,
        },
      ],
      merchantIdentifier: 'merchant.org.ilovefreegle.direct',
      countryCode: 'GB',
      currency: 'GBP',
    })

    Sentry.addBreadcrumb({
      category: 'stripe',
      message: 'Apple Pay created, presenting',
    })

    const result = await Stripe.presentApplePay()
    console.log('Stripe presentApplePay', result.paymentResult, result)

    Sentry.addBreadcrumb({
      category: 'stripe',
      message: 'Apple Pay result',
      data: { paymentResult: result.paymentResult },
    })

    if (result.paymentResult === ApplePayEventsEnum.Completed) {
      console.log('Stripe ApplePay successful')
      emit('success')
    }
  } catch (e) {
    console.error('Stripe Apple Pay error', e)
    Sentry.captureException(e, {
      tags: { stripe_step: 'applepay_flow' },
      extra: {
        message: e?.message,
        code: e?.code,
        hasIntent: !!intent.value?.client_secret,
      },
    })
    error.value = 'Apple Pay failed. Please try another method.'
  }
}
</script>
<style scoped lang="scss">
.height {
  min-height: 48px;
}
</style>
