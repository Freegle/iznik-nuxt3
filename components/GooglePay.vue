<template>
  <client-only>
    <!--    eslint-disable -->
    <google-pay-button
      v-if="paymentRequest"
      environment="PRODUCTION"
      :button-color="buttonColor"
      :button-type="buttonType"
      :button-size-mode="isCustomSize ? 'fill' : 'static'"
      :paymentRequest.prop="paymentRequest"
      :style="{ width: `${buttonWidth}px`, height: `${buttonHeight}px` }"
      @loadpaymentdata="onLoadPaymentData"
      @error="onError"
    ></google-pay-button>
  </client-only>
</template>
<script>
import '@google-pay/button-element'

export default {
  props: {
    totalPrice: {
      type: String,
      default: '1.00',
      required: true,
    },
  },
  data: () => ({
    buttonColor: 'default',
    buttonType: 'donate',
    isCustomSize: false,
    buttonWidth: 240,
    buttonHeight: 40,
    isTop: window === window.top,
  }),
  computed: {
    paymentRequest() {
      return {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['AMEX', 'VISA', 'MASTERCARD'],
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
          totalPriceLabel: 'Total',
          totalPrice: this.totalPrice,
          currencyCode: 'GBP',
          countryCode: 'gb',
        },
      }
    },
  },
  methods: {
    onLoadPaymentData: (event) => {
      console.log('load payment data', event.detail)
    },
    onError: (event) => {
      console.error('error', event.error)
    },
  },
}
</script>
