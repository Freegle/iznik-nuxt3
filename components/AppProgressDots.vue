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
  transition: all 0.3s ease;
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
  color: #6c757d;
  transition: color 0.3s ease;
}

// Step states
.step-completed {
  .step-dot {
    background: #28a745;
    color: #fff;
    border: 2px solid #28a745;
  }

  .step-label {
    color: #28a745;
  }
}

.step-active {
  .step-dot {
    background: #007bff;
    color: #fff;
    border: 2px solid #007bff;
    box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.2);
  }

  .step-label {
    color: #007bff;
    font-weight: 600;
  }
}

.step-pending {
  .step-dot {
    background: #fff;
    color: #adb5bd;
    border: 2px solid #dee2e6;
  }

  .step-label {
    color: #adb5bd;
  }
}

// Progress line
.progress-line {
  position: absolute;
  top: 16px;
  left: calc(1rem + 16px);
  right: calc(1rem + 16px);
  height: 2px;
  background: #dee2e6;
  z-index: 0;
}

.progress-line-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
}
</style>
