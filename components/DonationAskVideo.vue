<template>
  <div>
    <p class="font-weight-bold">
      <span v-if="donated">
        You might have seen this video when you donated before. It explains why
        we ask for donations.
      </span>
      <span v-else>
        We've made little video to explain why we ask for donations.
      </span>
      It's just this guy Edward in his living room, because we don't waste your
      money on fancy PR agencies.
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
      Monthly donations are particularly helpful.
    </p>
    <div class="d-flex flex-wrap justify-content-between mt-2">
      <JustGivingDonationButton class="mb-1" />
      <donation-button value="1" class="mb-1" @clicked="score(1)" />
      <donation-button value="5" class="mb-1" @clicked="score(5)" />
      <donation-button value="10" class="mb-1" @clicked="score(10)" />
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
