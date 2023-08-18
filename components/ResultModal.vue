<template>
  <b-modal id="result-modal" v-model="showModal" scrollable :title="title">
    <template #default>
      <slot name="default">
        <!-- eslint-disable-next-line -->
        <div v-html="message" />
      </slot>
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Close </b-button>
    </template>
  </b-modal>
</template>
<script>
import modal from '@/mixins/modal'

export default {
  mixins: [modal],
  props: {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      showModal: false,
    }
  },
  methods: {
    confirm() {
      this.$emit('confirm')
      this.hide()
    },
  },
}
</script>
