<template>
  <b-input-group class="flex max">
    <b-form-input v-model="term" type="text" placeholder="Search email/name/id" :disabled="disabled" autocapitalize="none"
      @keyup.native.enter="dosearch" />
    <b-input-group>
      <slot name="append">
        <b-button variant="primary" :disabled="disabled" @click="dosearch">
          <v-icon icon="search" />
        </b-button>
      </slot>
    </b-input-group>
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
    search: { // TODO: when used?
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
