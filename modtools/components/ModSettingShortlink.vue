<template>
  <div>
    <!-- eslint-disable-next-line -->
    <a :href="'https://freegle.in/' + shortlink.name" rel="noopener noreferrer">freegle.in/{{ shortlink.name }}</a>
    <span class="text-muted small">
      created {{ timeago(shortlink.created) }}
      {{ withplural('click', shortlink.clicks, true) }}
    </span>
  </div>
</template>
<script>
import { withplural } from '../composables/usePluralize'

export default {
  props: {
    shortlink: {
      type: Object,
      required: true
    }
  }
}
</script>
