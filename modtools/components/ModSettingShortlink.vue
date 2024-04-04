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
import pluralize from 'pluralize'
export default {
  props: {
    shortlink: {
      type: Object,
      required: true
    }
  },
  methods: {
    withplural(a, b, c) {
      if (Array.isArray(a)) {
        pluralize.addIrregularRule(...a)
        a = a[0]
      }
      return pluralize(a, b, c)
    }
  }
}
</script>
