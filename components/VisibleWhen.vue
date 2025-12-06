<template>
  <div v-if="show">
    <slot />
  </div>
</template>
<script setup>
import { useMiscStore } from '~/stores/misc'

const props = defineProps({
  at: {
    type: Array,
    required: false,
    default: null,
  },
  not: {
    type: Array,
    required: false,
    default: null,
  },
})

const store = useMiscStore()

const breakpoint = computed(() => store.breakpoint)

const show = computed(() => {
  if (process.server) {
    // Drop all optional components for SSR, otherwise we might start to render them on the client when we
    // don't need to.
    return false
  } else if (!breakpoint.value) {
    // Breakpoint not yet determined (BreakpointFettler hasn't mounted).
    // Return false to avoid showing duplicate content during hydration.
    return false
  } else if (props.at) {
    return props.at.includes(breakpoint.value)
  } else {
    return !props.not.includes(breakpoint.value)
  }
})
</script>
