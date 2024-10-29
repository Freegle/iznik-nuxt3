<template>
  <div>
    <div class="w-100 justify-content-around">
      <b-img class="w-100" src="/donate/Impact.png" fluid />
    </div>
    <p class="mt-2">If you can, please donate.</p>
    <div class="d-flex flex-wrap justify-content-between mt-2">
      <JustGivingDonationButton class="mb-1" />
      <donation-button value="5" class="mb-1" @clicked="score(5)" />
      <donation-button value="10" class="mb-1" @clicked="score(10)" />
      <donation-button value="15" class="mb-1" @clicked="score(15)" />
    </div>
  </div>
</template>
<script>
import DonationButton from './DonationButton'

export default {
  components: {
    DonationButton,
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
  },
  methods: {
    score(amount) {
      this.$emit('score', amount)
    },
  },
}
</script>
