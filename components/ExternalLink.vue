<template>
  <!-- eslint-disable-next-line -->
  <a :href="carefulHref" :target="target" rel="noopener noreferrer"><slot /></a>
</template>
<script>
export default {
  props: {
    href: {
      type: String,
      required: true,
    },
  },
  computed: {
    carefulHref() {
      return this.href.startsWith('http') || this.href.startsWith('mailto')
        ? this.href
        : 'https://' + this.href
    },
    target() {
      return this.href.startsWith('mailto') ? '_self' : '_blank'
    },
  },
}
</script>
