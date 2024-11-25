<template>
  <div class="height">
    <div
      v-if="loading"
      class="d-flex flex-column justify-content-around text-center pulsate text-muted w-100"
    >
      Loading donation methods...
    </div>
    <div :id="uniqueId"></div>
  </div>
</template>
<script setup>
import { loadStripe } from '@stripe/stripe-js'
import * as Sentry from '@sentry/browser'
import { uid } from '../composables/useId'
import { useDonationStore } from '~/stores/donations'

const runtimeConfig = useRuntimeConfig()
const userSite = runtimeConfig.public.USER_SITE
const donationStore = useDonationStore()

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

const stripe = await loadStripe(runtimeConfig.public.STRIPE_PUBLISHABLE_KEY)

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

const elements = stripe.elements({
  mode: props.monthly ? 'subscription' : 'payment',
  amount: props.price * 100, // Price is in pence
  currency: 'gbp',
  appearance,
})

onMounted(() => {
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

    if (!event.availablePaymentMethods) {
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
    } else {
      // Create the PaymentIntent and obtain clientSecret
      console.log('Confirm', event)
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
        // The payment UI automatically closes with a success animation.
        // Your customer is redirected to your `return_url` if required.
        emit('success')
      }
    }
  })
})
</script>
<style scoped lang="scss">
.height {
  min-height: 48px;
}
</style>
