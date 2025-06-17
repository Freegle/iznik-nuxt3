<template>
  <client-only>
    <div></div>
  </client-only>
</template>
<script setup>
import { useRoute, onMounted } from '#imports'

const route = useRoute()
const id = route.params.id

onMounted(() => {
  window.location = 'https://freegle.in/' + id
})
</script>
