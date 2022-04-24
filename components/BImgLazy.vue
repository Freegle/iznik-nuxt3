<template>
  <img
    loading="lazy"
    :src="src"
    :class="{
      'rounded-circle': rounded === 'circle',
    }"
  />
</template>
<script>
// TODO Alpha of Bootstrap-Vue-3 doesn't support lazy load so we roll our own for now.

export default {
  props: {
    src: {
      type: String,
      required: true,
    },
    rounded: {
      type: String,
      required: false,
      default: null,
    },
  },
}
</script>
<style scoped lang="scss">
.rounded-circle {
  border-radius: 50% !important;
}
</style>
