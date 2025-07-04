<template>
  <div>
    <ShortLink
      v-for="shortlink in shortlinks"
      :id="shortlink.id"
      :key="'shortlink-' + shortlink.id"
      class="bg-white m-0"
    />
  </div>
</template>
<script setup>
import ShortLink from './ShortLink'

defineProps({
  shortlinks: {
    type: Array,
    required: true,
  },
})
</script>
