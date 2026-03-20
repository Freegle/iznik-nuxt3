<template>
  <div class="app-progress-dots">
    <div
      v-for="step in steps"
      :key="step.number"
      class="progress-step"
      :class="{
        'step-completed': step.number < currentStep,
        'step-active': step.number === currentStep,
        'step-pending': step.number > currentStep,
      }"
    >
      <div class="step-dot">
        <v-icon
          v-if="step.number < currentStep"
          icon="check"
          class="check-icon"
        />
        <span v-else class="step-number">{{ step.number }}</span>
      </div>
      <span v-if="showLabels" class="step-label">{{ step.label }}</span>
    </div>
    <div class="progress-line">
      <div class="progress-line-fill" :style="{ width: progressWidth }" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentStep: {
    type: Number,
    required: true,
  },
  totalSteps: {
    type: Number,
    required: false,
    default: 3,
  },
  labels: {
    type: Array,
    required: false,
    default: () => ['Photos', 'Details', 'Confirm'],
  },
  showLabels: {
    type: Boolean,
    required: false,
    default: true,
  },
})

const steps = computed(() => {
  return Array.from({ length: props.totalSteps }, (_, i) => ({
    number: i + 1,
    label: props.labels[i] || `Step ${i + 1}`,
  }))
})

const progressWidth = computed(() => {
  if (props.currentStep <= 1) return '0%'
  if (props.currentStep >= props.totalSteps) return '100%'
  return `${((props.currentStep - 1) / (props.totalSteps - 1)) * 100}%`
})
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.app-progress-dots {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  padding: 0 1rem;
  margin-bottom: 1.5rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  flex: 1;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all var(--transition-slow);
  margin-bottom: 0.5rem;
}

.step-number {
  line-height: 1;
}

.check-icon {
  font-size: 0.875rem;
}

.step-label {
  font-size: 0.75rem;
  text-align: center;
  color: $color-gray--normal;
  transition: color var(--transition-slow);
}

// Step states
.step-completed {
  .step-dot {
    background: $color-success;
    color: $color-white;
    border: 2px solid $color-success;
  }

  .step-label {
    color: $color-success;
  }
}

.step-active {
  .step-dot {
    background: $color-blue--bright;
    color: $color-white;
    border: 2px solid $color-blue--bright;
    box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.2);
  }

  .step-label {
    color: $color-blue--bright;
    font-weight: 600;
  }
}

.step-pending {
  .step-dot {
    background: $color-white;
    color: var(--color-gray-400);
    border: 2px solid var(--color-gray-300);
  }

  .step-label {
    color: var(--color-gray-400);
  }
}

// Progress line
.progress-line {
  position: absolute;
  top: 16px;
  left: calc(1rem + 16px);
  right: calc(1rem + 16px);
  height: 2px;
  background: var(--color-gray-300);
  z-index: 0;
}

.progress-line-fill {
  height: 100%;
  background: $color-success;
  transition: width var(--transition-slow);
}
</style>
