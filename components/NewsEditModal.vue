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
<script>
import { useNewsfeedStore } from '../stores/newsfeed'
import { useOurModal } from '~/composables/useOurModal'

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
    threadhead: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const newsfeedStore = useNewsfeedStore()

    const { modal, hide } = useOurModal()

    return {
      newsfeedStore,
      modal,
      hide,
    }
  },
  data() {
    return {
      showModal: false,
      message: null,
    }
  },
  methods: {
    async onShow() {
      // Make sure we're up to date.
      const newsfeed = await this.newsfeedStore.fetch(this.id, true)
      this.message = newsfeed.message
    },

    async save() {
      await this.newsfeedStore.edit(this.id, this.message, this.threadhead)

      this.hide()
    },
  },
}
</script>
