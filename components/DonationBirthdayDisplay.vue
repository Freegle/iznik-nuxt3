<template>
  <div class="birthday-donation-display mb-3">
    <div class="donation-amount-display mb-2">
      <h4 class="mb-0">
        You're kindly donating £{{ price }}<span v-if="monthly"> monthly</span>
      </h4>
    </div>
    <div class="other-amount-section">
      <b-input-group prepend="Other amount:">
        <b-input
          :model-value="modelValue"
          type="number"
          min="1"
          step="0.50"
          size="lg"
          class="otherWidth"
          placeholder="Enter amount"
          @update:model-value="$emit('update:modelValue', $event)"
        />
      </b-input-group>
    </div>
  </div>
</template>

<script setup>
defineProps({
  price: {
    type: Number,
    required: true,
  },
  monthly: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Number,
    default: null,
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped lang="scss">
.birthday-donation-display {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9ff, #e3f2fd);
  border-radius: var(--radius-lg, 0.75rem);
  border: 2px solid $color-gray-3;
}

.donation-amount-display h4 {
  color: $color-gray--darker;
  font-weight: bold;
}

.other-amount-section {
  margin-top: 1rem;
}

.other-amount-section .input-group-prepend .input-group-text {
  background-color: var(--color-gray-50);
  border-color: $color-gray-3;
  color: $color-gray--dark;
  font-weight: 500;
}

.otherWidth {
  width: 6rem;
}
</style>
