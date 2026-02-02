<template>
  <div
    class="stat-card"
    :class="[
      accentClass,
      {
        'stat-card--active': active,
        'stat-card--clickable': clickable,
      },
    ]"
    :role="clickable ? 'button' : undefined"
    @click="clickable ? $emit('click') : undefined"
  >
    <div class="stat-value" :class="valueColorClass">
      {{ formattedValue }}
    </div>
    <div class="stat-label">
      {{ label }}
      <small v-if="subtitle" class="text-muted d-block">
        {{ subtitle }}
      </small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: [Number, String],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: null,
  },
  valueColor: {
    type: String,
    default: null,
  },
  accent: {
    type: String,
    default: null,
    validator: (v) => [null, 'reliable', 'unreliable', 'amp'].includes(v),
  },
  active: {
    type: Boolean,
    default: false,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})

const valueColorClass = computed(() => {
  return props.valueColor ? `text-${props.valueColor}` : ''
})

const accentClass = computed(() => {
  if (props.accent) {
    return `stat-card--${props.accent}`
  }
  return ''
})
</script>

<style scoped>
.stat-card {
  flex: 1 1 auto;
  min-width: 100px;
  max-width: 150px;
  padding: 0.5rem;
  background: #fff;
  border: 1px solid #dee2e6;
  text-align: center;
  transition: all 0.15s;
}

.stat-card--clickable {
  cursor: pointer;
}

.stat-card--clickable:hover {
  background-color: #f0f0f0;
}

.stat-card--active {
  border-color: var(--bs-primary);
  background-color: var(--bs-light);
}

.stat-card--unreliable {
  border-left: 3px solid #ffc107;
}

.stat-card--reliable {
  border-left: 3px solid #28a745;
}

.stat-card--amp {
  border-left: 3px solid #6f42c1;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.125rem;
}

@media (max-width: 576px) {
  .stat-card {
    min-width: 80px;
    max-width: 120px;
    padding: 0.375rem;
  }
}
</style>
