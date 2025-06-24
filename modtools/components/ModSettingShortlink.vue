<template>
  <div>
    <!-- eslint-disable-next-line -->
    <a :href="'https://freegle.in/' + shortlink.name" rel="noopener noreferrer">freegle.in/{{ shortlink.name }}</a>
    <span class="text-muted small">
      created {{ timeago(shortlink.created) }}
      {{ pluralise('click', shortlink.clicks, true) }}
    </span>
  </div>
</template>
<script>
export default {
  props: {
    shortlink: {
      type: Object,
      required: true,
    },
  },
}
</script>
