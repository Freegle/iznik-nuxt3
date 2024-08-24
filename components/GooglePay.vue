<template>
  <div ref="googlePay" />
</template>
<script>
import { loadScript } from 'vue-plugin-load-script'

export default {
  name: 'GooglePay',
  props: {
    totalPrice: {
      type: String,
      default: '1.00',
      required: true,
    },
  },
  data: () => ({
    config: {
      /**
       * Define the version of the Google Pay API referenced when creating your
       * configuration
       *
       * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#PaymentDataRequest|apiVersion in PaymentDataRequest}
       */
      baseRequest: {
        apiVersion: 2,
        apiVersionMinor: 0,
      },
      /**
       * Identify your gateway and your site's gateway merchant identifier
       *
       * The Google Pay API response will return an encrypted payment method capable
       * of being charged by a supported gateway after payer authorization
       *
       * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#gateway|PaymentMethodTokenizationSpecification}
       */
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'stripe',
          'stripe:version': '2018-10-31',
          'stripe:publishableKey':
            'pk_live_51PrK1sP3oIVajsTkBJ3XrexNVYYdFeJnpIq9oGhcfWzoH15nDoeXT5icgpOP3xuf7RjLn0MTcpQfrKKbbjTJYNQz00wRqEDLUf',
        },
      },
      /**
       * Card networks supported by your site and your gateway
       *
       * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#CardParameters|CardParameters}
       * @todo confirm card networks supported by your site and gateway
       */
      allowedCardNetworks: [
        'AMEX',
        'DISCOVER',
        'INTERAC',
        'JCB',
        'MASTERCARD',
        'VISA',
      ],
      /**
       * Card authentication methods supported by your site and your gateway
       *
       * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#CardParameters|CardParameters}
       * @todo confirm your processor supports Android device tokens for your
       * supported card networks
       */
      allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
    },
  }),
  computed: {},
  async mounted() {
    await loadScript('https://pay.google.com/gp/p/js/pay.js')
    this.loadGooglePay()
  },
  methods: {
    loadGooglePay() {
      /**
       * Describe your site's support for the CARD payment method and its required
       * fields
       *
       * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#CardParameters|CardParameters}
       */
      const baseCardPaymentMethod = {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: this.config.allowedCardAuthMethods,
          allowedCardNetworks: this.config.allowedCardNetworks,
        },
      }

      /**
       * Describe your site's support for the CARD payment method including optional
       * fields
       *
       * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#CardParameters|CardParameters}
       */
      const cardPaymentMethod = Object.assign({}, baseCardPaymentMethod, {
        tokenizationSpecification: this.config.tokenizationSpecification,
      })

      /**
       * An initialized google.payments.api.PaymentsClient object or null if not yet set
       *
       * @see {@link getGooglePaymentsClient}
       */
      let paymentsClient = null

      /**
       * Configure your site's support for payment methods supported by the Google Pay
       * API.
       *
       * Each member of allowedPaymentMethods should contain only the required fields,
       * allowing reuse of this base request when determining a viewer's ability
       * to pay and later requesting a supported payment method
       *
       * @returns {object} Google Pay API version, payment methods supported by the site
       */
      const getGoogleIsReadyToPayRequest = () => {
        return Object.assign({}, this.config.baseRequest, {
          allowedPaymentMethods: [baseCardPaymentMethod],
        })
      }

      /**
       * Configure support for the Google Pay API
       *
       * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#PaymentDataRequest|PaymentDataRequest}
       * @returns {object} PaymentDataRequest fields
       */
      const getGooglePaymentDataRequest = () => {
        const paymentDataRequest = Object.assign({}, this.config.baseRequest)
        paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod]
        paymentDataRequest.transactionInfo = getGoogleTransactionInfo()
        paymentDataRequest.merchantInfo = {
          // @todo a merchant ID is available for a production environment after approval by Google
          // See {@link https://developers.google.com/pay/api/web/guides/test-and-deploy/integration-checklist|Integration checklist}
          merchantId: process.env.VUE_APP_GOOGLE_PAY_MERCHANT_ID,
          merchantName: process.env.VUE_APP_GOOGLE_PAY_MERCHANT_NAME,
        }
        return paymentDataRequest
      }

      /**
       * Return an active PaymentsClient or initialize
       *
       * @see {@link https://developers.google.com/pay/api/web/reference/client#PaymentsClient|PaymentsClient constructor}
       * @returns {google.payments.api.PaymentsClient} Google Pay API client
       */
      const getGooglePaymentsClient = () => {
        if (paymentsClient === null) {
          paymentsClient = new window.google.payments.api.PaymentsClient({
            // Alterar o environment para 'PRODUCTION' em prod
            environment: process.env.VUE_APP_GOOGLE_PAY_ENVIRONMENT,
          })
        }
        return paymentsClient
      }

      /**
       * Initialize Google PaymentsClient after Google-hosted JavaScript has loaded
       *
       * Display a Google Pay payment button after confirmation of the viewer's
       * ability to pay.
       */
      const onGooglePayLoaded = () => {
        const paymentsClient = getGooglePaymentsClient()
        paymentsClient
          .isReadyToPay(getGoogleIsReadyToPayRequest())
          .then((response) => {
            if (response.result) {
              addGooglePayButton()
              // @todo prefetch payment data to improve performance after confirming site functionality
              // prefetchGooglePaymentData();
              this.$emit('loaded', response.result)
            }
          })
          .catch((err) => {
            // show error in developer console for debugging
            console.error(err)
            this.$emit('loadedError', err)
          })
      }

      /**
       * Add a Google Pay purchase button alongside an existing checkout button
       *
       * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#ButtonOptions|Button options}
       * @see {@link https://developers.google.com/pay/api/web/guides/brand-guidelines|Google Pay brand guidelines}
       */
      const addGooglePayButton = () => {
        const paymentsClient = getGooglePaymentsClient()
        const button = paymentsClient.createButton({
          onClick: onGooglePaymentButtonClicked,
          buttonType: 'donate',
        })
        this.$refs.googlePay.appendChild(button)
      }

      /**
       * Provide Google Pay API with a payment amount, currency, and amount status
       *
       * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#TransactionInfo|TransactionInfo}
       * @returns {object} transaction info, suitable for use as transactionInfo property of PaymentDataRequest
       */
      const getGoogleTransactionInfo = () => ({
        countryCode: 'GB',
        currencyCode: 'GBP',
        totalPriceStatus: 'FINAL',
        // set to cart total
        totalPrice: this.totalPrice,
      })

      /**
       * Prefetch payment data to improve performance
       *
       * @see {@link https://developers.google.com/pay/api/web/reference/client#prefetchPaymentData|prefetchPaymentData()}
       */
      // function prefetchGooglePaymentData() {
      //   const paymentDataRequest = getGooglePaymentDataRequest();
      //   // transactionInfo must be set but does not affect cache
      //   paymentDataRequest.transactionInfo = {
      //     totalPriceStatus: "NOT_CURRENTLY_KNOWN",
      //     currencyCode: "USD",
      //   };
      //   const paymentsClient = getGooglePaymentsClient();
      //   paymentsClient.prefetchPaymentData(paymentDataRequest);
      // }

      /**
       * Show Google Pay payment sheet when Google Pay payment button is clicked
       */
      const onGooglePaymentButtonClicked = () => {
        const paymentDataRequest = getGooglePaymentDataRequest()
        paymentDataRequest.transactionInfo = getGoogleTransactionInfo()

        const paymentsClient = getGooglePaymentsClient()
        paymentsClient
          .loadPaymentData(paymentDataRequest)
          .then((paymentData) => {
            // handle the response
            processPayment(paymentData)
          })
          .catch((err) => {
            // show error in developer console for debugging
            console.error(err)
            this.$emit('paymentError', err)
          })
      }
      /**
       * Process payment data returned by the Google Pay API
       *
       * @param {object} paymentData response from Google Pay API after user approves payment
       * @see {@link https://developers.google.com/pay/api/web/reference/response-objects#PaymentData|PaymentData object reference}
       */
      const processPayment = (paymentData) => {
        // show returned data in developer console for debugging
        console.log(paymentData)
        // @todo pass payment token to your gateway to process payment
        const paymentToken =
          paymentData.paymentMethodData.tokenizationData.token
        this.$emit('paymentSuccess', paymentToken)
      }

      onGooglePayLoaded()
    },
  },
}
</script>
