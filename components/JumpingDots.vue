<template>
  <span class="jumping-dots" :class="sizeClass">
    <span class="dot dot-1"></span>
    <span class="dot dot-2"></span>
    <span class="dot dot-3"></span>
  </span>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
})

const sizeClass = computed(() => `jumping-dots--${props.size}`)
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.jumping-dots {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
}

.dot {
  background-color: $color-gray--normal;
  border-radius: 50%;
  animation: jump 1.4s ease-in-out infinite;
}

.dot-1 {
  animation-delay: 0s;
}

.dot-2 {
  animation-delay: 0.2s;
}

.dot-3 {
  animation-delay: 0.4s;
}

// Size variants
.jumping-dots--sm {
  .dot {
    width: 4px;
    height: 4px;
  }
}

.jumping-dots--md {
  .dot {
    width: 6px;
    height: 6px;
  }
}

.jumping-dots--lg {
  .dot {
    width: 8px;
    height: 8px;
  }
}

@keyframes jump {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}
</style>
