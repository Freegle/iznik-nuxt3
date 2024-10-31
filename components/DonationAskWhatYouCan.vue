<template>
  <div class="d-flex justify-content-between">
    <div>
      <p>
        <span v-if="donated">
          You've donated before, so you know that
          <strong>{{ groupname }}</strong> is a charity that's free to use, but
          not free to run. If you're able to <strong>donate again</strong>
          that would be lovely.
        </span>
        <span v-else>
          <strong>{{ groupname }}</strong> is a charity that's free to use, but
          not free to run.
        </span>
        This month we're trying to raise
        <strong>&pound;{{ target }}</strong
        ><span v-if="groupid && !targetMet"> for this community</span
        ><span v-else> across the UK</span>.
      </p>
      <p>
        <strong> Please donate what you can </strong>
        to keep us running.
      </p>
      <donation-button @clicked="score(5)" />
      <div class="mt-2 mb-4 d-flex border border-secondary rounded p-2">
        <SupporterInfo size="lg" class="mr-2 align-self-center" />
        <div>
          You'll get a cute little badge so that other people can see you're a
          committed freegler.
        </div>
      </div>
      <p class="mt-2">
        <!-- eslint-disable-next-line -->
        Anything you can give is very welcome. You can find other ways to donate (e.g. bank transfer or cheque) <nuxt-link no-prefetch to="/donate">here</nuxt-link>.
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
import DonationButton from './DonationButton'
import SupporterInfo from './SupporterInfo'

export default {
  components: {
    DonationButton,
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
