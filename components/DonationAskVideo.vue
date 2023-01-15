<template>
  <div>
    <p class="font-weight-bold">
      We've made little video to explain why we ask for donations. It's just
      this guy Edward in his living room, because we don't waste your money on
      fancy PR agencies.
    </p>
    <div class="ratio ratio-16x9">
      <iframe
        class="embed-responsive-item w-100"
        src="https://www.youtube.com/embed/TByrRQdLVD8"
        allowfullscreen
      />
    </div>
    <p class="font-weight-bold text-center mt-4">
      If you're able to donate to help us keep going, that would be lovely.
    </p>
    <p class="text-center mt-2">Click to donate monthly:</p>
    <div class="d-flex justify-content-around">
      <OurToggle
        v-model="monthly"
        :sync="true"
        :labels="{
          unchecked: 'One-off donation',
          checked: 'Monthly donation',
        }"
      />
    </div>
    <p class="text-center mt-2">Click the amount to donate:</p>
    <div v-if="monthly" class="d-flex flex-wrap justify-content-between mt-2">
      <donation-button
        link="paypal1"
        show="£1"
        monthly
        monthlyvalue="Supporter1"
        @clicked="score(4)"
      />
      <donation-button
        link="paypal1"
        show="£5"
        monthly
        monthlyvalue="Supporter5"
        @clicked="score(20)"
      />
      <donation-button
        link="paypal1"
        show="£10"
        monthly
        monthlyvalue="Supporter10"
        @clicked="score(40)"
      />
    </div>
    <div v-else class="d-flex flex-wrap justify-content-between mt-2">
      <donation-button
        link="paypal1"
        show="£1"
        class="mb-1"
        @clicked="score(1)"
      />
      <donation-button
        link="paypal5"
        show="£5"
        class="mb-1"
        @clicked="score(5)"
      />
      <donation-button
        link="paypal10"
        show="£10"
        class="mb-1"
        @clicked="score(10)"
      />
    </div>
  </div>
</template>
<script>
import DonationButton from './DonationButton'
import OurToggle from '~/components/OurToggle'

export default {
  components: {
    OurToggle,
    DonationButton,
  },
  props: {
    groupid: {
      type: Number,
      required: true,
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
  },
  data() {
    return {
      monthly: false,
    }
  },
  methods: {
    score(amount) {
      this.$emit('score', amount)
    },
  },
}
</script>
