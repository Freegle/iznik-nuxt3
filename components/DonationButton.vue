<template>
  <div>
    <b-button
      variant="primary"
      size="lg"
      aria-label="Donate to Freegle with PayPal"
      @click="clicked"
    >
      <div class="d-flex align-items-center">
        <div :id="uniqueId" ref="paypalbutton" class="mr-2" @click="suppress" />
        <div v-if="text">{{ text }}</div>
        <div v-else-if="!show">Donate</div>
        <div v-else>{{ show }}</div>
      </div>
    </b-button>
  </div>
</template>
<script>
import { loadScript } from 'vue-plugin-load-script'
import { uid } from '../composables/useId'

export default {
  name: 'DonationButton',
  props: {
    directDonation: {
      type: Boolean,
      required: false,
      default: false,
    },
    value: {
      type: String,
      required: false,
      default: null,
    },
    text: {
      type: String,
      required: false,
      default: null,
    },
  },
  async setup() {
    await loadScript('https://www.paypalobjects.com/donate/sdk/donate-sdk.js')
  },
  watch: {
    value(newVal) {
      console.log('DonateButton watch value', newVal, this.value)
      this.makeButton()
    }
  },
  computed: {
    uniqueId() {
      return uid('donation-')
    },
    buttonId() {
      // These are set up at https://www.paypal.com/donate/buttons/manage
      switch (this.value) {
        case '1':
          return 'BA7SYG5KVH4WW'
        case '1510':
          return 'XEFBZCF2RDEQ8'
        case '2':
          return 'S3RKX5JHQUUL4'
        case '2510':
          return 'KSDKLE7WBW2X2'
        case '3':
          return 'L4GDMEU6FMNFJ'
        case '5':
          return '92MLE3SKST546'
        case '10':
          return 'KTNBE4YMDUGUY'
        case '15':
          return '7T354NV6HL9P4'
        case '25':
          return 'D5P8XMVRDLC7N'
        case 'any':
          // Any amount.
          return '2DZ6YUDERBVKC'
        default:
          // And whatyoucan.  Works better to suggest amounts.
          return 'KSDKLE7WBW2X2'
      }
    },
    show() {
      return this.value ? '£' + this.value : null
    },
  },
  mounted() {
    this.checkPayPalLoaded()
  },
  methods: {
    checkPayPalLoaded() {
      if (window.PayPal) {
        this.makeButton()
      } else {
        setTimeout(this.checkPayPalLoaded, 100)
      }
    },
    makeButton() {
      document.getElementById(this.uniqueId).innerHTML = ''
      console.log('DonationButton makeButton', this.buttonId)
      const self = this
      window.PayPal.Donation.Button({
        env: 'production',
        hosted_button_id: this.buttonId,
        image: {
          src: '/pp_cc_mark_37x23.jpg',
          title: 'Donate ' + (this.show ? this.show : '') + ' with PayPal',
          alt: 'Donate ' + (this.show ? this.show : '') + ' with PayPal',
        },
        onComplete(params) {
          // Because we get a callback we can record the actual amount donated.
          console.log('Donation completed with', params)
          self.$emit('clicked', params.amt)
        },
      }).render('#' + this.uniqueId)
    },
    suppress(e) {
      // Stop clicking on the PayPal button itself triggering the button click which will click the PayPal button.
      e.stopPropagation()
    },
    clicked() {
      if (this.$gtm?.enabled()) {
        this.$gtm.trackEvent({
          event: 'Donate',
          label: 'Z1RRCIfbv7kZELy618UD',
        })
      }

      this.$refs.paypalbutton?.firstChild?.click()
    },
    async donateMonthly() {
      await this.$refs.donateform.submit()
      this.$emit('clicked')
    },
  },
}
</script>
