<template>
  <div>
    <b-modal
      :id="'newsReportModal-' + id"
      v-model="showModal"
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
  </div>
</template>
<script>
import modal from '@/mixins/modal'

export default {
  mixins: [modal],
  props: {
    id: {
      type: Number,
      required: true,
    },
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
