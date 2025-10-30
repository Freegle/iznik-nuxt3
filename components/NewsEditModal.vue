<template>
  <b-modal
    :id="'newsEdit-' + id"
    ref="modal"
    scrollable
    title="Edit your post"
    size="lg"
    no-stacking
    @shown="onShow"
  >
    <b-form-textarea
      ref="editText"
      v-model="message"
      rows="8"
      maxlength="2048"
      spellcheck="true"
      placeholder="Edit your post..."
    />
    <template #footer>
      <b-button variant="white" @click="hide"> Cancel </b-button>
      <b-button variant="primary" @click="save"> Save </b-button>
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
  threadhead: {
    type: Number,
    required: true,
  },
})

const newsfeedStore = useNewsfeedStore()
const { modal, hide } = useOurModal()
const editText = ref(null)

const message = ref(null)

async function onShow() {
  // Make sure we're up to date.
  const newsfeed = await newsfeedStore.fetch(props.id, true)
  message.value = newsfeed.message
}

async function save() {
  await newsfeedStore.edit(props.id, message.value, props.threadhead)
  hide()
}
</script>
