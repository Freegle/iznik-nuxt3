<template>
  <NoticeMessage type="info" class="text-center font-weight-bold text-danger">
    <div class="donation-ask-content">
      <p class="mb-3">
        We're a charity - free to use, but not free to run. Help us keep going
        by donating?
      </p>

      <!-- Amount selection buttons -->
      <div class="d-flex justify-content-center align-items-center mb-3">
        <b-button
          v-for="amount in amounts"
          :key="'donate-' + amount"
          :pressed="selectedAmount === amount"
          :variant="selectedAmount === amount ? 'primary' : 'white'"
          size="lg"
          class="shadow-none"
          style="max-width: 100px"
          @click="selectedAmount = amount"
        >
          £{{ amount }}
        </b-button>
        <b-input-group prepend="Other:" class="ml-2" style="max-width: 150px">
          <b-input
            v-model="otherAmount"
            type="number"
            min="1"
            step="0.50"
            size="lg"
            placeholder="£"
          />
        </b-input-group>
      </div>

      <!-- Donation buttons -->
      <div class="d-flex justify-content-center">
        <DonationButton
          v-if="payPalFallback"
          :key="selectedAmount"
          :text="`Donate £${selectedAmount}`"
          :value="selectedAmount"
        />
        <StripeDonate
          v-else
          :key="selectedAmount"
          :price="selectedAmount"
          @success="emit('donation-made')"
          @no-payment-methods="payPalFallback = true"
          @error="payPalFallback = true"
        />
      </div>
    </div>
  </NoticeMessage>
</template>

<script setup>
import { ref, watch } from '#imports'
import NoticeMessage from '~/components/NoticeMessage.vue'
import DonationButton from '~/components/DonationButton.vue'
import StripeDonate from '~/components/StripeDonate.vue'

const props = defineProps({
  defaultAmount: {
    type: Number,
    default: 1,
  },
  amounts: {
    type: Array,
    default: () => [1],
  },
})

const emit = defineEmits(['donation-made'])

const selectedAmount = ref(props.defaultAmount)
const otherAmount = ref(null)
const payPalFallback = ref(false)

// Update selectedAmount whenever otherAmount changes
watch(otherAmount, (newVal) => {
  if (newVal && parseFloat(newVal) > 0) {
    selectedAmount.value = parseFloat(newVal)
  } else if (!newVal) {
    // Reset to default if cleared
    selectedAmount.value = props.defaultAmount
  }
})
</script>

<style scoped lang="scss">
.donation-ask-content {
  padding: 0.5rem;
}
</style>
