<template>
  <div class="height">
    <div
      v-if="loading"
      class="d-flex flex-column justify-content-around text-center pulsate text-muted w-100"
    >
      Loading donation methods...
    </div>
    <div v-if="isApp" class="d-flex justify-content-between flex-wrap">
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

definePageMeta({
  layout: 'login',
})

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
if (isApp.value) {
  console.log('Stripe.initialize', runtimeConfig.public.STRIPE_PUBLISHABLE_KEY)
  Stripe.initialize({
    publishableKey: runtimeConfig.public.STRIPE_PUBLISHABLE_KEY,
  })
} else {
  uniqueId = uid('stripe-donate-')
  try {
    stripe = await loadStripe(runtimeConfig.public.STRIPE_PUBLISHABLE_KEY)
  } catch (e) {
    console.error('Stripe load error', e)
    Sentry.captureMessage('Stripe load error', {
      extra: e,
    })
    emit('error')
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
    try {
      console.log('Stripe props.price', props.price)
      if (mobileStore.isApp && !mobileStore.isiOS) {
        // Disable on iOS for now

        Stripe.addListener(PaymentSheetEventsEnum.Failed, (e) => {
          console.log('Stripe PaymentSheetEventsEnum.Failed', e)
        })
        Stripe.addListener(PaymentSheetEventsEnum.FailedToLoad, (e) => {
          console.log('Stripe PaymentSheetEventsEnum.FailedToLoad', e)
        })
        Stripe.addListener(PaymentSheetEventsEnum.Loaded, () => {
          console.log('Stripe PaymentSheetEventsEnum.Loaded')
        })
        Stripe.addListener(PaymentSheetEventsEnum.Canceled, () => {
          console.log('Stripe PaymentSheetEventsEnum.Canceled')
        })
        Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
          console.log('Stripe PaymentSheetEventsEnum.Completed')
        })
        if (!mobileStore.isiOS) {
          Stripe.addListener(GooglePayEventsEnum.Failed, (e) => {
            console.log('Stripe GooglePayEventsEnum.Failed', e)
          })
          Stripe.addListener(GooglePayEventsEnum.FailedToLoad, (e) => {
            console.log('Stripe GooglePayEventsEnum.FailedToLoad', e)
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
          })
          Stripe.addListener(ApplePayEventsEnum.applePayFailedToLoad, (e) => {
            console.log('Stripe ApplePayEventsEnum.applePayFailedToLoad', e)
          })
          Stripe.addListener(ApplePayEventsEnum.applePayLoaded, () => {
            console.log('Stripe ApplePayEventsEnum.applePayLoaded')
          })
          Stripe.addListener(ApplePayEventsEnum.applePayCompleted, () => {
            console.log('Stripe ApplePayEventsEnum.applePayCompleted')
          })
          Stripe.addListener(ApplePayEventsEnum.applePayCanceled, () => {
            console.log('Stripe ApplePayEventsEnum.applePayCanceled')
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

        if (props.monthly) {
          // monthly never set in app as not supported
          intent.value = await donationStore.stripeSubscription(props.price)
          console.log('Stripe subscription Intent', intent.value)
        } else {
          intent.value = await donationStore.stripeIntent({
            amount: props.price,
            // test: true,
          })
          console.log('Stripe single payment Intent', intent.value)
        }

        if (!mobileStore.isiOS) {
          // Android
          try {
            await Stripe.isGooglePayAvailable()
            isGooglePayAvailable.value = true
          } catch (e) {
            // eg Not implemented on Device.
          }
        } else {
          // iOS
          try {
            await Stripe.isApplePayAvailable()
            isApplePayAvailable.value = true
          } catch (e) {
            // eg Not implemented on Android.
          }
        }
        console.log('Stripe isGooglePayAvailable', isGooglePayAvailable.value)
        console.log('Stripe isApplePayAvailable', isApplePayAvailable.value)
        isPayPalAvailable.value = true
      }
    } catch (e) {
      console.log('Stripe Exception', e.message)
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
        console.log('One-off', event)
        const res = await donationStore.stripeIntent(
          props.price,
          event.expressPaymentType
        )
        console.log('Intent', res)

        const clientSecret = res.client_secret

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
  console.log('useGooglePay')
  console.log('Stripe createGooglePay BEFORE')
  // Prepare Google Pay
  await Stripe.createGooglePay({
    paymentIntentClientSecret: intent.value.client_secret,

    merchantIdentifier: 'org.ilovefreegle.direct',
    countryCode: 'GB',
    currency: 'GBP',
  })
  console.log('Stripe createGooglePay AFTER')

  // Present Google Pay
  const result = await Stripe.presentGooglePay()
  console.log('Stripe presentGooglePay', result.paymentResult, result)
  if (result.paymentResult === GooglePayEventsEnum.Completed) {
    // Happy path
    console.log('Stripe GooglePay successful')
    emit('success')
  }
  console.log('Stripe DONE')
}

async function usePayPalCard() {
  console.log('usePayPalCard')
  await Stripe.createPaymentSheet({
    paymentIntentClientSecret: intent.value.client_secret,
    // customerId: customer,
    // customerEphemeralKeySecret: ephemeralKey,
    // enableGooglePay: true,
    // enableApplePay: false,
    merchantDisplayName: 'Freegle',
    /**
     * iOS Only
     * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#userinterfacestyle
     * @default undefined
     */
    // returnURL:
  })
  console.log('Stripe createPaymentSheet')

  const result = await Stripe.presentPaymentSheet()
  console.log('Stripe presentPaymentSheet', result.paymentResult, result)
  if (result.paymentResult === PaymentSheetEventsEnum.Completed) {
    console.log('Stripe PayPal/card successful')
    emit('success')
  }
  console.log('Stripe DONE')
}

async function useApplePay() {
  console.log('useApplePay')
  await Stripe.createApplePay({
    paymentIntentClientSecret: intent.value.client_secret,
    paymentSummaryItems: [
      {
        label: 'Freegle Donation',
        amount: props.price,
      },
    ],
    merchantIdentifier: 'Freegle',
    // merchantDisplayName: 'Freegle',
    countryCode: 'GB',
    currency: 'GBP',
  })
  // Present Apple Pay
  const result = await Stripe.presentApplePay()
  console.log('Stripe presentApplePay', result.paymentResult, result)
  if (result.paymentResult === ApplePayEventsEnum.Completed) {
    console.log('Stripe ApplePay successful')
    emit('success')
  }
  console.log('Stripe DONE')
}
</script>
<style scoped lang="scss">
.height {
  min-height: 48px;
}
</style>
