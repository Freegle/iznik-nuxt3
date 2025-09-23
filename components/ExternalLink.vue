<template>
  <!-- eslint-disable-next-line -->
  <a :href="carefulHref" :target="target" rel="noopener noreferrer"><slot /></a>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  href: {
    type: String,
    required: true,
  },
})

const carefulHref = computed(() => {
  return props.href?.startsWith('http') || props.href?.startsWith('mailto')
    ? props.href
    : 'https://' + props.href
})

const target = computed(() => {
  return props.href?.startsWith('mailto') ? '_self' : '_blank'
})
</script>
