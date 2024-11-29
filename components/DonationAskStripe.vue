<template>
  <div class="d-flex justify-content-between">
    <div>
      <p v-if="donated">
        You've donated before, so you know that
        <strong>{{ groupname }}</strong> is a charity that's free to use, but
        not free to run. If you're able to <strong>donate again</strong>
        that would be lovely.
      </p>
      <p v-else>
        <strong>{{ groupname }}</strong> is a charity that's free to use, but
        not free to run.
      </p>
      <p>
        This month we're trying to raise
        <strong>&pound;{{ target }}</strong
        ><span v-if="groupid && !targetMet"> for this community</span
        ><span v-else> across the UK</span>.
      </p>
      <p>
        If you can,
        <strong> please donate </strong>
        to keep us running.
      </p>
      <b-button-group class="d-flex flex-wrap mt-1 mb-2 mr-2">
        <b-button
          v-for="amount in amounts"
          :key="'donate-' + amount"
          :pressed="price === amount"
          :variant="price === amount ? 'primary' : 'white'"
          size="lg"
          class="shadow-none"
          @click="setPrice(amount)"
        >
          <span class="d-none d-md-inline"
            ><span v-if="!monthly">Donate </span></span
          >£{{ amount }}<span v-if="monthly"> monthly</span>
        </b-button>
        <div class="text-muted text-small">
          <b-input-group prepend="Other:">
            <b-input
              v-model="otherAmount"
              type="number"
              min="1"
              step="0.50"
              size="lg"
              class="otherWidth"
            />
          </b-input-group>
        </div>
      </b-button-group>
      <BFormCheckbox id="monthly" v-model="monthly" name="monthly" class="mb-2">
        <!--        <v-icon icon="arrow-left" /> Monthly donations are really helpful-->
      </BFormCheckbox>

      <div class="mt-2 mb-2 w-100">
        <StripeDonate
          :key="price + monthly"
          :price="price"
          :monthly="monthly"
          @success="succeeded"
          @no-payment-methods="noMethods"
        />
        <DonationButton
          v-if="payPalFallback"
          :text="`Donate £${price}`"
          :value="price + ''"
          class="mb-4"
        />
        <div ref="belowStripe" />
      </div>
      <p class="mt-2 small">
        You'll get a cute little
        <SupporterInfo size="sm" class="d-inline" />
        badge so that people can see you're a committed freegler.
        <!-- eslint-disable-next-line -->
        Anything you can give is very welcome. You can find other ways to donate (e.g. bank transfer or cheque) <nuxt-link no-prefetch to="/donate?noguard=true">here</nuxt-link>.
      </p>
      <p v-if="groupid && !targetMet" class="text-muted small mt-1">
        This will contribute to the general fund for the ongoing support of
        Freegle. If we raise more than the target, we'll use it to support other
        communities.
      </p>
    </div>
    <DonationThermometer ref="thermo" :groupid="groupid" class="ml-md-4" />
  </div>
</template>
<script>
import SupporterInfo from './SupporterInfo'

export default {
  components: {
    SupporterInfo,
  },
  props: {
    groupid: {
      type: Number,
      required: false,
      default: null,
    },
    groupname: {
      type: String,
      required: true,
    },
    target: {
      type: Number,
      default: 2000,
    },
    raised: {
      type: Number,
      default: 0,
    },
    targetMet: {
      type: Boolean,
      default: false,
    },
    donated: {
      type: String,
      default: null,
    },
    amounts: {
      type: Array,
      required: false,
      default: () => [1, 5, 10],
    },
    default: {
      type: Number,
      required: false,
      default: 1,
    },
  },
  data() {
    return {
      monthly: false,
      price: 1,
      payPalFallback: false,
      otherAmount: null,
    }
  },
  watch: {
    otherAmount(newVal) {
      if (newVal) {
        this.price = parseFloat(newVal)
      } else {
        this.price = this.default
      }
    },
  },
  created() {
    this.price = this.default
  },
  methods: {
    score(amount) {
      this.$emit('score', amount)
    },
    setPrice(price) {
      this.price = price
      this.$refs.belowStripe.scrollIntoView()
    },
    succeeded() {
      this.score(this.price)
      this.$emit('success')
    },
    noMethods() {
      this.payPalFallback = true
    },
  },
}
</script>
<style scoped lang="scss">
.otherWidth {
  width: 6rem;
}

:deep(.form-check-input) {
  border: 1px solid red;
}
</style>
