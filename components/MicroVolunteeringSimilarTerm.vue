<template>
  <div>
    <b-button
      v-if="similar"
      class="selected font-weight-bold"
      variant="white"
      size="lg"
      @click="$emit('not')"
    >
      {{ term.term }}
    </b-button>
    <b-button
      v-else
      class="unselected font-weight-bold"
      variant="white"
      size="lg"
      @click="$emit('similar')"
    >
      {{ term.term }}
    </b-button>
  </div>
</template>
<script>
export default {
  props: {
    term: {
      type: Object,
      required: true,
    },
    similarTerms: {
      type: Array,
      required: true,
    },
  },
  computed: {
    similar() {
      return this.similarTerms.find((t) => t.id === this.term.id)
    },
  },
}
</script>
<style scoped lang="scss">
.selected {
  background-color: $colour-secondary !important;
  border-color: $color-blue--2 !important;
  color: $color-white !important;
}

.unselected {
  background-color: $color-white !important;
  border-color: $color-green--dark !important;
  color: $color-black !important;
}
</style>
