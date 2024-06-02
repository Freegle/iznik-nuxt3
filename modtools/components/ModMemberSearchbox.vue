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
    groupid: {
      type: Number,
      required: false,
      default: null
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    value: {
      type: String,
      required: false,
      default: null
    },
    spam: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  methods: {
    search() {
      // Tick to allow value to appear.
      console.log('Search', this.term)
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
