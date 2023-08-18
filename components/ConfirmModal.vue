<template>
  <b-modal id="confirmmodal" v-model="showModal" scrollable :title="title">
    <template #default>
      <slot name="default">
        <!-- eslint-disable-next-line -->
        <div v-html="message" />
      </slot>
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Cancel </b-button>
      <b-button variant="primary" @click="confirm"> Confirm </b-button>
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
      required: false,
      default: 'Are you sure?',
    },
    message: {
      type: String,
      required: false,
      default: '<p>Are you sure you want to do this?</p>',
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
