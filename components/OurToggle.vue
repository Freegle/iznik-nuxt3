<template>
  <div class="our-toggle" :class="[variant, 'toggle-' + size]">
    <Toggle
      v-model="currentValue"
      class="toggle"
      :on-label="labels.checked"
      :off-label="labels.unchecked"
      :disabled="disabled"
    />
  </div>
</template>
<script setup>
// This is a separate component partly because the toggle we use is not SSR-safe, and by async loading this component
// we can avoid importing it until we're on the client.
import Toggle from '@vueform/toggle'
import { ref, watch } from '#imports'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: false,
    default: false,
  },
  size: {
    type: String,
    required: false,
    default: 'md',
  },
  labels: {
    type: Object,
    required: false,
    default: () => ({ checked: 'On', unchecked: 'Off' }),
  },
  variant: {
    type: String,
    required: false,
    default: 'green',
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['change', 'update:modelValue'])
const currentValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    currentValue.value = newVal
  }
)

watch(currentValue, (newVal) => {
  // Older calling code uses @change event.
  emit('change', newVal)
  emit('update:modelValue', newVal)
})
</script>
<style src="@vueform/toggle/themes/default.css"></style>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.our-toggle {
  display: inline-block;
}

// Green variant (default)
.green {
  --toggle-bg-on: #{$color-green-background};
  --toggle-border-on: #{$color-green-background};
  --toggle-bg-off: #e0e0e0;
  --toggle-border-off: #e0e0e0;
}

// ModTools green variant
.modgreen {
  --toggle-bg-on: #338808;
  --toggle-border-on: #338808;
  --toggle-bg-off: #e0e0e0;
  --toggle-border-off: #e0e0e0;
}

// Size variants
.toggle-sm :deep(.toggle-container) {
  font-size: 0.75rem;
}

.toggle-md :deep(.toggle-container) {
  font-size: 0.85rem;
}

.toggle-lg :deep(.toggle-container) {
  font-size: 0.95rem;
}

// Modern toggle styling
:deep(.toggle-container) {
  border: none !important;
  border-radius: 999px;
  transition: all 0.2s ease;

  &:focus {
    box-shadow: 0 0 0 2px rgba($color-green-background, 0.2);
  }
}

:deep(.toggle) {
  min-width: fit-content;
  width: fit-content;
  border-radius: 999px;
  font-weight: 500;

  .toggle-label {
    min-width: fit-content;
    width: fit-content;
    padding: 0 0.75rem;
  }
}

:deep(.toggle-on) {
  background: var(--toggle-bg-on);
  border-color: var(--toggle-border-on);
  padding-left: 0.5rem;
  padding-right: 2rem;
}

:deep(.toggle-off) {
  background: var(--toggle-bg-off);
  border-color: var(--toggle-border-off);
  padding-left: 2rem;
  padding-right: 0.5rem;
  color: #666;
}

:deep(.toggle-handle) {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

:deep(.toggle-handle-on),
:deep(.toggle-handle-off) {
  border-radius: 50%;
}
</style>
