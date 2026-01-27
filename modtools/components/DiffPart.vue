<template>
  <!-- eslint-disable-next-line -->
  <span :class="diffClass" :title="diffTitle">{{ part.value }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  part: {
    type: Object,
    required: true,
  },
})

const diffClass = computed(() => {
  if (props.part.added) {
    return 'text-warning'
  } else if (props.part.removed) {
    return 'strike text-danger text-muted'
  } else {
    return 'text-black'
  }
})

const diffTitle = computed(() => {
  if (props.part.added) {
    return 'Added'
  } else if (props.part.removed) {
    return 'Removed'
  } else {
    return 'Unchanged'
  }
})
</script>
