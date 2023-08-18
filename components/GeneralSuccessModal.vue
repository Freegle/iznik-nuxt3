<template>
  <b-modal
    id="general-success-modal"
    v-model="showModal"
    scrollable
    :title="title"
    no-stacking
  >
    <template #default>
      <b-row>
        <b-col>
          <p>{{ message }}</p>
        </b-col>
      </b-row>
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
      default: 'Success',
    },
    message: {
      type: String,
      default: 'Successfully performed the requested action!',
    },
  },
  methods: {
    confirm() {
      this.$emit('confirm')
      this.hide()
    },
  },
}
</script>
