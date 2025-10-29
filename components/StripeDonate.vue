<template>
  <div class="height">
    <div
      v-if="loading"
      class="d-flex flex-column justify-content-around text-center pulsate text-muted w-100"
    >
      Loading donation methods...
    </div>
    <div :id="uniqueId"></div>
    <NoticeMessage v-if="error" variant="error">
      {{ error }}
    </NoticeMessage>
  </div>
</template>
<script setup>
import { loadStripe } from '@stripe/stripe-js'
import * as Sentry from '@sentry/browser'
import { uid } from '~/composables/useId'
import { useDonationStore } from '~/stores/donations'

const runtimeConfig = useRuntimeConfig()
const userSite = runtimeConfig.public.USER_SITE
const donationStore = useDonationStore()

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

const loading = ref(true)

const emit = defineEmits(['loaded', 'error', 'success', 'noPaymentMethods'])

const uniqueId = uid('stripe-donate-')

let stripe = null

try {
  stripe = await loadStripe(runtimeConfig.public.STRIPE_PUBLISHABLE_KEY)
} catch (e) {
  console.error('Stripe load error', e)
  Sentry.captureMessage('Stripe load error', {
    extra: e,
  })
  emit('error')
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

onMounted(() => {
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
})
</script>
<style scoped lang="scss">
.height {
  min-height: 48px;
}
</style>
