<template>
  <div>
    <p
      class="font-weight-bold text-center text--large-responsive text-primary-emphasis"
    >
      £10 donation = £100 impact!
    </p>
    <p class="text-center mt-4">
      For every £10 donation, we have an impact of about £100 in stuff saved
      from landfill/incinerators - and reused by other freeglers.
    </p>
    <p class="text-center mt-4">
      <span class="font-weight-bold">Can you help us do more?</span> If you're
      able to donate to help us keep going, that would be lovely. <br /><span
        class="font-weight-bold"
        >Monthly donations</span
      >
      are particularly helpful.
    </p>
    <div class="d-flex flex-wrap justify-content-between mt-2">
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
  },
  methods: {
    score(amount) {
      this.$emit('score', amount)
    },
  },
}
</script>
