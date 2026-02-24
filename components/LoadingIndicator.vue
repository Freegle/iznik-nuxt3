<template>
  <div
    class="loading-indicator"
    :style="{ opacity: isLoading ? 1 : 0 }"
    :class="{ 'loading-indicator--transitioned': withTransition }"
  >
    <Spinner :size="size" />
  </div>
</template>

<script setup>
const props = defineProps({
  size: {
    type: Number,
    default: 50,
  },
  throttle: {
    type: Number,
    default: 0,
  },
  withTransition: {
    type: Boolean,
    default: false,
  },
})

const { isLoading } = useLoadingIndicator({
  throttle: props.throttle,
})
</script>

<style lang="scss">
.loading-indicator {
  &--transitioned {
    transition: all 0.25s;
  }

  pointer-events: none;
}
</style>
