<template>
  <div>
    {{ price }}
    <div :id="uniqueId" />
  </div>
</template>
<script setup>
import { loadStripe } from '@stripe/stripe-js'
import * as Sentry from '@sentry/browser'
import { uid } from '../composables/useId'

const props = defineProps({
  price: {
    type: Number,
    required: true,
  },
})

const uniqueId = uid('stripe-donate-')

const prices = {
  1: 'price_1QJv67P3oIVajsTkkkkofJdK',
  2: 'price_1QK244P3oIVajsTkYcUs6kEM',
  5: 'price_1QJv7GP3oIVajsTkPVwk699D',
  10: 'price_1QJv7GP3oIVajsTkTG7RGAUA',
  15: 'price_1QK24rP3oIVajsTkwkXPms9B',
  25: 'price_1QK24VP3oIVajsTk3e57kF5S',
}

// Find price ID from props.price, if exists; else default to 1 and log error to Sentry.
let priceId = prices[props.price]

if (!priceId) {
  priceId = prices[0]
  Sentry.captureException(new Error('Invalid price ID'))
}

const runtimeConfig = useRuntimeConfig()
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
}
const elements = stripe.elements({
  mode: 'payment',
  amount: props.price,
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
  })
  expressCheckoutElement.on('loaderror', (event) => {
    console.log('Express checkout loadError', event)
  })
  expressCheckoutElement.on('change', (event) => {
    console.log('Express checkout change', event)
  })
  expressCheckoutElement.on('loaderstart', (event) => {
    console.log('Express checkout loadStart', event)
  })
  console.log('Mounted express checkout')
})
</script>
