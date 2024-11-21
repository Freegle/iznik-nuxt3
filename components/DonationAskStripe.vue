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
      <b-button-group class="d-flex flex-wrap mt-1 mb-2">
        <b-button
          :pressed="price === 1"
          :variant="price === 1 ? 'primary' : 'white'"
          size="lg"
          class="shadow-none"
          @click="setPrice(1)"
        >
          <span class="d-none d-md-inline">Donate </span>£1
        </b-button>
        <b-button
          :pressed="price === 5"
          :variant="price === 5 ? 'primary' : 'white'"
          size="lg"
          class="shadow-none"
          @click="setPrice(5)"
        >
          <span class="d-none d-md-inline">Donate </span>£5
        </b-button>
        <b-button
          :pressed="price === 10"
          :variant="price === 10 ? 'primary' : 'white'"
          size="lg"
          class="shadow-none"
          @click="setPrice(10)"
        >
          <span class="d-none d-md-inline">Donate </span>£10
        </b-button>
      </b-button-group>
      <div class="mt-2 mb-2 w-100">
        <StripeDonate :key="price" :price="price" @success="succeeded" />
        <div ref="belowStripe" />
      </div>
      <p class="mt-2 small">
        You'll get a cute little
        <SupporterInfo size="sm" class="d-inline" />
        badge so that other people can see you're a committed freegler.
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
  },
  data() {
    return {
      monthly: false,
      price: 1,
    }
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
      this.score(this.rpice)
      this.$emit('success')
    },
  },
}
</script>
