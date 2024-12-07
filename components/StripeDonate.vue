<template>
  <div class="height">
    <div v-if="loading" class="d-flex flex-column justify-content-around text-center pulsate text-muted w-100">
      Loading payment methods...
    </div>
    <div class="d-flex justify-content-between flex-wrap">
      <b-button v-if="isGooglePayAvailable" variant="primary" size="lg" aria-label="Donate to Freegle with Google Pay" @click="useGooglePay">
        <div class="d-flex align-items-center">
          <img src="/GooglePayButton.png" class="w-100" />
        </div>
      </b-button>
      <b-button v-if="isApplePayAvailable" variant="primary" size="lg" aria-label="Donate to Freegle with Apple Pay" @click="useApplePay">
        <div class="d-flex align-items-center">
          <img src="/ApplePayButton.jpg" class="w-100" />
        </div>
      </b-button>
      <b-button v-if="isPayPalAvailable" variant="primary" size="lg" aria-label="Donate to Freegle with PayPay or a card" @click="usePayPalCard">
        <div class="d-flex align-items-center">
          <img src="/PayPalButton.png" class="w-100" />
        </div>
      </b-button>
      <p v-if="!isGooglePayAvailable && !isApplePayAvailable && !isPayPalAvailable">
        Sorry, there are no payments methods available on your phone.
      </p>
    </div>
  </div>
</template>
<script setup>

// https://www.ilovefreegle.org/donated/
import { Stripe, PaymentSheetEventsEnum, GooglePayEventsEnum, ApplePayEventsEnum } from '@capacitor-community/stripe'

import { useDonationStore } from '~/stores/donations'
import { useMobileStore } from '@/stores/mobile'

const runtimeConfig = useRuntimeConfig()
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

const loading = ref(true)
const isApplePayAvailable = ref(false)
const isGooglePayAvailable = ref(false)
const isPayPalAvailable = ref(false)
const intent = ref(false)

const emit = defineEmits(['loaded', 'error', 'success', 'noPaymentMethods'])

console.log('Stripe.initialize', runtimeConfig.public.STRIPE_PUBLISHABLE_KEY)
Stripe.initialize({
  publishableKey: runtimeConfig.public.STRIPE_PUBLISHABLE_KEY,
})

onMounted(async () => {
  try {
    console.log('Stripe props.price', props.price)
    if (mobileStore.isApp && !mobileStore.isiOS) { // Disable on iOS for now

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
      } else { //iOS
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
        Stripe.addListener(ApplePayEventsEnum.applePayDidSelectShippingContact, () => {
          console.log('Stripe ApplePayEventsEnum.applePayDidSelectShippingContact')
        })
        Stripe.addListener(ApplePayEventsEnum.applePayDidCreatePaymentMethod, () => {
          console.log('Stripe ApplePayEventsEnum.applePayDidCreatePaymentMethod')
        })
      }

      if (props.monthly) { // monthly never set in app as not supported
        intent.value = await donationStore.stripeSubscription(props.price)
        console.log('Stripe subscription Intent', intent.value)
      } else {
        intent.value = await donationStore.stripeIntent({
          amount: props.price,
          //test: true,
        })
        console.log('Stripe single payment Intent', intent.value)
      }

      if (!mobileStore.isiOS) { // Android
        try {
          await Stripe.isGooglePayAvailable()
          isGooglePayAvailable.value = true
        } catch (e) {
          // eg Not implemented on Device.
        }
      } else { // iOS
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
  if (isGooglePayAvailable.value || isApplePayAvailable.value || isPayPalAvailable.value) {
    emit('loaded')
  } else {
    emit('noPaymentMethods')
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
    //customerId: customer,
    //customerEphemeralKeySecret: ephemeralKey,
    //enableGooglePay: true,
    //enableApplePay: false,
    merchantDisplayName: 'Freegle',
    /**
     * iOS Only
     * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#userinterfacestyle
     * @default undefined
     */
    //returnURL:
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
    paymentSummaryItems: [{
      label: 'Freegle Donation',
      amount: props.price
    }],
    merchantIdentifier: 'Freegle',
    //merchantDisplayName: 'Freegle',
    countryCode: 'GB',
    currency: 'GBP',
  });
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
