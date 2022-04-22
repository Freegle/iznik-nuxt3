<template>
  <img loading="lazy" :src="src" />
</template>
<script>
// TODO Beta of Bootstrap-Vue-3 doesn't support lazy load.

export default {
  props: {
    src: {
      type: String,
      required: true,
    },
  },
}
</script>
