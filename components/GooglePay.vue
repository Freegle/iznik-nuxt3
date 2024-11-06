<template>
  <client-only>
    <!--    eslint-disable -->
    <google-pay-button
      environment="PRODUCTION"
      :button-color="buttonColor"
      :button-type="buttonType"
      button-size-mode="static"
      :paymentRequest.prop="paymentRequest"
      @onPaymentAuthorized="onPaymentDataAuthorized"
      :style="{ width: `${buttonWidth}px`, height: `${buttonHeight}px` }"
      @loadpaymentdata="onLoadPaymentData"
      @error="onError"
    ></google-pay-button>
  </client-only>
</template>
<script setup>
import '@google-pay/button-element'
import { loadScript } from 'vue-plugin-load-script'

await loadScript('https://pay.google.com/gp/p/js/pay.js')

const props = defineProps({
  totalPrice: {
    type: String,
    default: '1.00',
    required: true,
  },
})

const buttonColor = ref('default')
const buttonType = ref('donate')
const buttonWidth = ref(240)
const buttonHeight = ref(40)
const paymentRequest = ref({
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['AMEX', 'VISA', 'MASTERCARD'],
        billingAddressRequired: false,
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'stripe',
          'stripe:version': '2018-10-31',
          'stripe:publishableKey':
            'pk_live_51PrK1sP3oIVajsTkBJ3XrexNVYYdFeJnpIq9oGhcfWzoH15nDoeXT5icgpOP3xuf7RjLn0MTcpQfrKKbbjTJYNQz00wRqEDLUf',
        },
      },
    },
  ],
  merchantInfo: {
    merchantId: 'BCR2DN4T6OLMZ5BG',
    merchantName: 'Freegle',
  },
  transactionInfo: {
    totalPriceStatus: 'FINAL',
    totalPriceLabel: 'Donation',
    totalPrice: props.totalPrice,
    currencyCode: 'GBP',
    countryCode: 'GB',
  },
})

function onLoadPaymentData(event) {
  console.log('load payment data', event.detail)
}

function onError(event) {
  console.error('error', event.error)
}

function onPaymentDataAuthorized(paymentData) {
  console.log('payment authorized', paymentData)

  return {
    transactionState: 'SUCCESS',
  }
}
</script>
