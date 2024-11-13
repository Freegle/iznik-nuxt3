<template>
  <div class="height">
    <div :id="uniqueId" />
  </div>
</template>
<script setup>
import { loadStripe } from '@stripe/stripe-js'
import { uid } from '../composables/useId'

const props = defineProps({
  price: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['loaded', 'error'])

const uniqueId = uid('stripe-donate-')

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
    emit('loaded')
  })
  expressCheckoutElement.on('loaderror', (event) => {
    console.log('Express checkout loadError', event)
    emit('error')
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
<style scoped lang="scss">
.height {
  min-height: 48px;
}
</style>
