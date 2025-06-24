<template>
  <b-input-group class="flex max">
    <b-form-input
      v-model="term"
      type="text"
      placeholder="Search email/name/id"
      autocapitalize="none"
      @keyup.enter="dosearch"
    />
    <slot name="append">
      <b-button variant="primary" @click="dosearch">
        <v-icon icon="search" />
      </b-button>
    </slot>
  </b-input-group>
</template>
<script>
export default {
  props: {
    search: {
      type: String,
      required: false,
      default: null,
    },
  },
  emits: ['search'],
  data: function () {
    return {
      term: null,
    }
  },
  mounted() {
    this.term = this.search
  },
  methods: {
    dosearch() {
      this.$emit('search', this.term)
    },
  },
}
</script>
<style scoped>
.max {
  max-width: 300px;
}
</style>
