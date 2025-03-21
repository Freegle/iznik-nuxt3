<template>
  <b-input-group class="flex max">
    <b-form-input v-model="term" type="text" placeholder="Search email/name/id" autocapitalize="none" @keyup.native.enter="dosearch" />
    <slot name="append">
      <b-button variant="primary" @click="dosearch">
        <v-icon icon="search" />
      </b-button>
    </slot>
  </b-input-group>
</template>
<script>
export default {
  emits: ['search'],
  data: function () {
    return {
      term: null,
    }
  },
  props: {
    search: {
      type: String,
      required: false,
      default: null
    },
  },
  mounted() {
    this.term = this.search
  },
  methods: {
    dosearch() {
      this.$emit('search', this.term)
    }
  }
}
</script>
<style scoped>
.max {
  max-width: 300px;
}
</style>
