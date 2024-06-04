<template>
  <b-input-group class="flex max">
    <b-form-input v-model="term" type="text" placeholder="Search email/name/id" :disabled="disabled" autocapitalize="none"
      @keyup.native.enter="search" />
    <b-input-group-append>
      <b-button variant="primary" :disabled="disabled" @click="search">
        <v-icon icon="search" />
      </b-button>
    </b-input-group-append>
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
    groupid: { // TODO: change how used
      type: Number,
      required: false,
      default: null
    },
    disabled: { // TODO: when used?
      type: Boolean,
      required: false,
      default: false
    },
    value: { // TODO: when used?
      type: String,
      required: false,
      default: null
    },
    spam: { // TODO: when used?
      type: Boolean,
      required: false,
      default: false
    }
  },
  methods: {
    search() {
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
