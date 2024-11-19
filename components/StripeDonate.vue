<template>
  <div class="height">
    <div v-if="loading" class="d-flex flex-column justify-content-around text-center pulsate text-muted w-100">
      Loading payment methods...
    </div>
    <div :id="uniqueId"></div>
  </div>
</template>
<script setup>
import { Stripe, PaymentSheetEventsEnum, GooglePayEventsEnum } from '@capacitor-community/stripe'

import { uid } from '../composables/useId'
import { useDonationStore } from '~/stores/donations'

const runtimeConfig = useRuntimeConfig()
const donationStore = useDonationStore()

const props = defineProps({
  price: {
    type: Number,
    required: true,
  },
})

const loading = ref(true)

const emit = defineEmits(['loaded', 'error', 'success'])

const uniqueId = uid('stripe-donate-')

Stripe.initialize({
  publishableKey: runtimeConfig.public.STRIPE_PUBLISHABLE_KEY,
})

onMounted(async () => {
  try {
    console.log(
      'Mounted for #',
      uniqueId,
      document.getElementById(uniqueId) !== null
    )
    console.log('props.price', props.price)

    Stripe.addListener(PaymentSheetEventsEnum.Failed, (e) => {
      console.log('PaymentSheetEventsEnum.Failed', e);
    })
    Stripe.addListener(PaymentSheetEventsEnum.FailedToLoad, (e) => {
      console.log('PaymentSheetEventsEnum.FailedToLoad', e);
    })
    Stripe.addListener(PaymentSheetEventsEnum.Loaded, () => {
      console.log('PaymentSheetEventsEnum.Loaded');
    })
    Stripe.addListener(PaymentSheetEventsEnum.Canceled, () => {
      console.log('PaymentSheetEventsEnum.Canceled');
    })
    Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
      console.log('PaymentSheetEventsEnum.Completed');
    })
    Stripe.addListener(GooglePayEventsEnum.Failed, (e) => {
      console.log('GooglePayEventsEnum.Failed', e);
    })
    Stripe.addListener(GooglePayEventsEnum.FailedToLoad, (e) => {
      console.log('GooglePayEventsEnum.FailedToLoad', e);
    })
    Stripe.addListener(GooglePayEventsEnum.Loaded, () => {
      console.log('GooglePayEventsEnum.Loaded');
    })
    Stripe.addListener(GooglePayEventsEnum.Canceled, () => {
      console.log('GooglePayEventsEnum.Canceled');
    })
    Stripe.addListener(GooglePayEventsEnum.Completed, () => {
      console.log('GooglePayEventsEnum.Completed');
    })
    Stripe.addListener(GooglePayEventsEnum.Completed, () => {
      console.log('GooglePayEventsEnum.Completed');
    });


    const intent = await donationStore.stripeIntent(
      props.price,
    )
    console.log('Intent', intent)

    const isGooglePayAvailable = await Stripe.isGooglePayAvailable()
    console.log('isGooglePayAvailable', isGooglePayAvailable)
    if (isGooglePayAvailable === undefined) {
      // disable to use Google Pay
      //    return;
    }

    await Stripe.createPaymentSheet({
      paymentIntentClientSecret: intent.client_secret,
      //customerId: customer,
      //customerEphemeralKeySecret: ephemeralKey,
      enableGooglePay: true,
      //enableApplePay: false,
      merchantDisplayName: 'Freegle',
    })
    console.log('createPaymentSheet')

    const result = await Stripe.presentPaymentSheet()
    console.log('presentPaymentSheet', result.paymentResult, result)
    if (result.paymentResult === PaymentSheetEventsEnum.Completed) {
      // Happy path
      console.log('Happy path')
    }
    console.log('DONE')

    /*
      // Prepare Google Pay
      await Stripe.createGooglePay({
      paymentIntentClientSecret: paymentIntent,
  
      // Web only. Google Pay on Android App doesn't need
      paymentSummaryItems: [{
        label: 'Product Name',
        amount: 1099.00
      }],
      merchantIdentifier: 'merchant.com.getcapacitor.stripe',
      countryCode: 'US',
      currency: 'USD',
    });
  
      // Present Google Pay
    const result = await Stripe.presentGooglePay();
    if (result.paymentResult === GooglePayEventsEnum.Completed) {
      // Happy path
    }
    */
  } catch (e) {
    console.log('Exception', e.message)
  }
})
</script>
<style scoped lang="scss">
.height {
  min-height: 48px;
}
</style>
