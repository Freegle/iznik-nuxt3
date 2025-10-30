<template>
  <div>
    <b-modal id="modEmailMessageModal" ref="modal" size="lg" @hidden="onHide">
      <template #title class="w-100"> Message received by email </template>
      <template #default>
        <p>
          Sometimes messages which arrive by email aren't translated into Chat
          correctly. Here you can see a bit more of the original email.
        </p>
        <b-tabs content-class="mt-3">
          <b-tab title="Pretty View" active>
            <Letter v-if="message" :html="html" :text="text" />
          </b-tab>
          <b-tab title="Raw Message Source">
            <NoticeMessage variant="info" class="mb-1">
              This is the raw email we received. It may have had large
              attachments removed for space reasons. The body of the email is
              sometimes encoded, and you might not be able to read it. If you
              need help, ask on Tech.
            </NoticeMessage>
            <!-- eslint-disable-next-line-->
            <pre v-if="message">{{ message.message }}</pre>
          </b-tab>
        </b-tabs>
      </template>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import { Letter } from 'vue-letter'
import { extract } from 'letterparser'
import { useMessageStore } from '~/stores/message'
import { useOurModal } from '~/composables/useOurModal'

export default {
  components: { Letter },
  props: {
    id: {
      type: Number,
      required: true,
    },
    collection: {
      type: String,
      required: false,
      default: null,
    },
  },
  emits: ['hidden'],
  setup() {
    const { modal, hide } = useOurModal()
    const messageStore = useMessageStore()
    return { messageStore, modal, hide }
  },
  data() {
    return {
      message: null,
    }
  },
  computed: {
    parsed() {
      if (this.message) {
        return this.message && this.message.message
          ? extract(this.message.message)
          : null
      }
      return null
    },
    text() {
      return this.parsed ? this.parsed.text : null
    },
    html() {
      return this.parsed ? this.parsed.html : null
    },
  },
  methods: {
    async show() {
      // Get message directly rather than via store, to get message mail source
      this.message = await this.messageStore.fetchMT({
        id: this.id,
        messagehistory: true,
      })

      this.showModal = true
    },
    onHide() {
      this.$emit('hidden')
    },
  },
}
</script>
