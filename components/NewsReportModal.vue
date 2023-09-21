<template>
  <b-modal
    :id="'newsReportModal-' + id"
    re="modal"
    scrollable
    title="Report a post"
    size="lg"
    no-stacking
  >
    <template #default>
      <p>What don't you like about this?</p>
      <b-form-textarea
        v-model="reason"
        rows="2"
        placeholder="Please let us know what you don't like, and one of our volunteers will review it."
      />
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Close </b-button>
      <b-button variant="primary" @click="report"> Submit Report </b-button>
    </template>
  </b-modal>
</template>

<script>
import { useNewsfeedStore } from '../stores/newsfeed'
import { useModal } from '~/composables/useModal'

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const newsfeedStore = useNewsfeedStore()

    const { modal, hide } = useModal()

    return {
      newsfeedStore,
      modal,
      hide,
    }
  },
  data() {
    return {
      reason: null,
    }
  },
  methods: {
    async report() {
      await this.newsfeedStore.report(this.id, this.reason)

      this.hide()
    },
  },
}
</script>
