<template>
  <div class="pl-2">
    <vue-thermometer
      :key="raised"
      :value="raised"
      :min="0"
      :max="max"
      :options="thermOptions"
      scale="£"
    />

    <h4 v-if="raised">&pound;{{ raised }}<br />Raised</h4>
  </div>
</template>
<script>
import { useDonationStore } from '../stores/donations'
import VueThermometer from '~/components/VueThermometer'

export default {
  components: {
    VueThermometer,
  },
  props: {
    groupid: {
      type: Number,
      required: false,
      default: null,
    },
  },
  async setup(props) {
    const donationStore = useDonationStore()

    await donationStore.fetch(props.groupid)

    return {
      donationStore,
      target: donationStore.target,
      raised: donationStore.raised,
    }
  },
  data() {
    return {
      thermOptions: {
        thermo: {
          color: 'darkgreen',
          backgroundColor: 'white',
          frameColor: 'black',
          ticks: 11,
          ticksEnabled: true,
          tickColor: 'black',
          tickWidth: '1',
        },
      },
    }
  },
  computed: {
    max() {
      // If we've raised more than the target, stretch it a bit.
      if (this.raised > this.target) {
        let max = this.raised * 1.1

        if (max > 500) {
          max = Math.round((max + 0.5) / 500) * 500
        }

        return max
      } else {
        return this.target
      }
    },
  },
}
</script>
