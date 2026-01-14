<template>
  <div class="notice p-2" :class="'notice--' + variant">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    required: false,
    default: 'info',
  },
})
</script>

<style scoped lang="scss">
.notice {
  border-left: 4px solid;
}

.notice--primary {
  background-color: $colour-success-bg;
  border-left-color: $colour-success;
  color: $colour-success-fg;
}

.notice--info {
  background-color: $color-blue--x-light;
  border-left-color: $color-blue--1;
  color: $color-blue--1;
}

.notice--warning {
  background-color: $color-yellow-1;
  border-left-color: $color-yellow-3;
  color: $color-yellow-3;
}

.notice--danger {
  background-color: $color-red--lighter;
  border-left-color: $color-red--dark;
  color: $color-red--dark;
}
</style>
