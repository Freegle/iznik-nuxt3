<template>
  <div>
    <DiffPart
      v-for="part in diff"
      :key="'diff-' + JSON.stringify(part)"
      :part="part"
    />
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { diffChars } from 'diff'

const props = defineProps({
  old: {
    type: String,
    required: false,
    default: '',
  },
  new: {
    type: String,
    required: false,
    default: '',
  },
})

const diff = computed(() => {
  if (!props.old || !props.new) {
    return null
  }

  return diffChars(props.old, props.new)
})
</script>
