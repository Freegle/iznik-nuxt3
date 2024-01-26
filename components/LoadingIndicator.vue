<template>
  <div :style="{ opacity: isLoading ? 1 : 0 }">
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
    default: 100,
  },
  throttle: {
    type: Number,
    default: 0,
  },
})

const { isLoading } = useLoadingIndicator({
  throttle: props.throttle,
})
</script>
