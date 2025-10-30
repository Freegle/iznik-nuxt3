<template>
  <b-modal
    :id="'newsReportModal-' + id"
    ref="modal"
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

<script setup>
import { ref } from 'vue'
import { useNewsfeedStore } from '~/stores/newsfeed'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const newsfeedStore = useNewsfeedStore()
const { modal, hide } = useOurModal()
const reason = ref(null)

async function report() {
  await newsfeedStore.report(props.id, reason.value)
  hide()
}
</script>
