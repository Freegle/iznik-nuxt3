<template>
  <b-modal
    :id="'newsEdit-' + id"
    ref="editModal"
    v-model="showModal"
    title="Edit your post"
    size="lg"
    no-stacking
  >
    <b-form-textarea
      ref="editText"
      v-model="message"
      rows="8"
      maxlength="2048"
      spellcheck="true"
      placeholder="Edit your post..."
    />
    <template #modal-footer>
      <b-button variant="white" @click="hide"> Cancel </b-button>
      <b-button variant="primary" @click="save"> Save </b-button>
    </template>
  </b-modal>
</template>
<script>
import { useNewsfeedStore } from '../stores/newsfeed'
import modal from '@/mixins/modal'

export default {
  components: {},
  mixins: [modal],
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

    return {
      newsfeedStore,
    }
  },
  data() {
    return {
      showModal: false,
      message: null,
    }
  },
  computed: {},
  methods: {
    async show() {
      // Make sure we're up to date.
      const newsfeed = await this.newsfeedStore.fetch(this.id, true)
      this.message = newsfeed.message
      this.showModal = true
    },
    hide() {
      this.showModal = false
    },
    async save() {
      await this.newsfeedStore.edit(this.id, this.message, this.threadhead)

      this.hide()
    },
  },
}
</script>
