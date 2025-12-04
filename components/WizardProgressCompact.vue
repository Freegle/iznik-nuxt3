<template>
  <div class="wizard-compact">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="step"
      :class="{
        active: activeStage === index + 1,
        completed: activeStage > index + 1,
      }"
    >
      <div class="step-connector" :class="{ first: index === 0 }" />
      <div class="step-dot">
        <v-icon
          v-if="activeStage > index + 1"
          icon="check"
          class="check-icon"
        />
        <v-icon v-else :icon="step.icon" class="step-icon" />
      </div>
      <div
        class="step-connector"
        :class="{ last: index === steps.length - 1 }"
      />
      <span class="step-label">{{ step.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeStage: {
    type: Number,
    required: true,
  },
  showOptions: {
    type: Boolean,
    default: true,
  },
})

const steps = computed(() => {
  const baseSteps = [
    { label: 'Item', icon: 'camera' },
    { label: 'Location', icon: 'map-marker-alt' },
  ]

  if (props.showOptions) {
    baseSteps.push({ label: 'Options', icon: 'sliders-h' })
  }

  baseSteps.push({ label: 'Post', icon: 'paper-plane' })

  return baseSteps
})
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.wizard-compact {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0.75rem 0;
  background: linear-gradient(to bottom, #f8faf8, white);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  max-width: 140px;
}

.step-connector {
  position: absolute;
  top: 18px;
  height: 3px;
  background: #e5e7eb;
  z-index: 0;

  &:first-of-type {
    left: 0;
    right: 50%;
    margin-right: 18px;
  }

  &:last-of-type {
    left: 50%;
    right: 0;
    margin-left: 18px;
  }

  &.first {
    background: transparent;
  }

  &.last {
    background: transparent;
  }
}

.step.completed .step-connector {
  background: $color-green-background;

  &.first,
  &.last {
    background: transparent;
  }
}

.step.active .step-connector:first-of-type {
  background: $color-green-background;

  &.first {
    background: transparent;
  }
}

.step-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 3px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: all 0.2s ease;
}

.step-icon {
  font-size: 0.9rem;
  color: #9ca3af;
}

.check-icon {
  font-size: 0.85rem;
  color: white;
}

.step-label {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 0.4rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

/* Active state */
.step.active .step-dot {
  background: $color-green-background;
  border-color: $color-green-background;
  box-shadow: 0 0 0 4px rgba($color-green-background, 0.2);
}

.step.active .step-icon {
  color: white;
}

.step.active .step-label {
  color: $color-green-background;
  font-weight: 600;
}

/* Completed state */
.step.completed .step-dot {
  background: $color-green-background;
  border-color: $color-green-background;
}

.step.completed .step-label {
  color: #6b7280;
}
</style>
