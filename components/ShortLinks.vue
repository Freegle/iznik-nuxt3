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
<script>
import ShortLink from './ShortLink'

export default {
  components: { ShortLink },
  props: {
    shortlinks: {
      type: Array,
      required: true,
    },
  },
}
</script>
