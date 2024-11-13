<template>
  <div>
    {{ price }}
    <b-button variant="primary" @click="submit">Pay now!</b-button>
  </div>
</template>
<script setup>
import { loadStripe } from '@stripe/stripe-js'
import * as Sentry from '@sentry/browser'
import { useComposeStore } from '~/stores/compose'

const props = defineProps({
  price: {
    type: Number,
    required: true,
  },
})

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
const userSite = runtimeConfig.public.USER_SITE
const stripe = await loadStripe(runtimeConfig.public.STRIPE_PUBLISHABLE_KEY)

async function submit() {
  const composeStore = useComposeStore()
  const email = composeStore.email

  const { error } = await stripe.redirectToCheckout({
    lineItems: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    successUrl: userSite + '/donated',
    cancelUrl: userSite + '/donate',
    customerEmail: email,
  })
  console.log('Error', error)
}
</script>
