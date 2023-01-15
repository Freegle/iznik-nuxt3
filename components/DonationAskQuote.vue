<template>
  <div class="d-flex justify-content-between">
    <div>
      <div>
        <p>Freegler Mary writes:</p>
        <!-- eslint-disable-next-line -->
          <p class="quote">I pass on my unwanted items here as I hate waste with a passion! It's a last resort to bin it! I also donate to Freegle via Paypal as it's my way of saying thank you for all the free items and to make sure Freegle is kept going.</p>
      </div>
      <p>
        Could you be like Mary and help us keep going? If you can,
        <strong> please donate </strong>
        to keep us running.
      </p>
      <div class="mt-2 mb-4 d-flex border border-secondary rounded p-2">
        <SupporterInfo size="lg" class="mr-2 align-self-center" />
        <div>
          You'll get a cute little badge so that other people can see you're a
          committed freegler.
        </div>
      </div>
      <div class="d-flex justify-content-between flex-wrap">
        <donation-button
          link="paypal2"
          show="£2"
          class="mb-1"
          @clicked="score(2)"
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
<style scoped lang="scss">
.quote {
  font-size: 1.25rem;
  font-weight: bold;
  font-style: italic;

  &::before {
    content: open-quote;
  }

  &::after {
    content: close-quote;
  }
}
</style>
