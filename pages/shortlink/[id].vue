<template>
  <client-only>
    <div></div>
  </client-only>
</template>
<script>
import { useRoute } from 'vue-router'

export default {
  setup() {
    const route = useRoute()
    const id = route.params.id

    return {
      id,
    }
  },
  mounted() {
    window.location = 'https://freegle.in/' + this.id
  },
}
</script>
