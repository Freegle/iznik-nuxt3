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
<script setup>
import { computed } from 'vue'
import { useDonationStore } from '~/stores/donations'
import VueThermometer from '~/components/VueThermometer'

const props = defineProps({
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
})

const donationStore = useDonationStore()
await donationStore.fetch(props.groupid)

const target = donationStore.target
const raised = donationStore.raised

const thermOptions = {
  thermo: {
    color: 'darkgreen',
    backgroundColor: 'white',
    frameColor: 'black',
    ticks: 11,
    ticksEnabled: true,
    tickColor: 'black',
    tickWidth: '1',
  },
}

const max = computed(() => {
  // If we've raised more than the target, stretch it a bit.
  if (raised > target) {
    let maxValue = raised * 1.1

    if (maxValue > 500) {
      maxValue = Math.round((maxValue + 0.5) / 500) * 500
    }

    return maxValue
  } else {
    return target
  }
})
</script>
