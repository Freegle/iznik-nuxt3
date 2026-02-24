<template>
  <div
    class="loading-indicator"
    :style="{ opacity: isLoading ? 1 : 0 }"
    :class="{ 'loading-indicator--transitioned': withTransition }"
  >
    <b-img
      lazy
      src="/loader.gif"
      alt="Loading"
      :width="`${width}px`"
      :height="`${height}px`"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  width: {
    type: Number,
    default: 100,
  },
  height: {
    type: Number,
    default: 85,
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
