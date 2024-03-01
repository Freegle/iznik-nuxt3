<template>
  <div>
    <b-modal v-if="message" id="modEmailMessageModal" v-model="showModal" size="lg">
      <template #title class="w-100">
        Message received by email
      </template>
      <template #default>
        <p>
          Sometimes messages which arrive by email aren't translated into Chat correctly. Here you can see a bit
          more of the original email.
        </p>
        <b-tabs content-class="mt-3">
          <b-tab title="Pretty View" active>
            <Letter :html="html" :text="text" />
          </b-tab>
          <b-tab title="Raw Message Source">
            <NoticeMessage variant="info" class="mb-1">
              This is the raw email we received. It may have had large attachments removed for space reasons. The body
              of the email is sometimes encoded, and you might not be able to read it. If you need help, ask on Tech.
            </NoticeMessage>
            <!-- eslint-disable-next-line-->
            <pre>{{ message.message }}</pre>
          </b-tab>
        </b-tabs>
      </template>
      <template #footer>
        <b-button variant="white" @click="hide">
          Close
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import { useModal } from '~/composables/useModal'
import { useMessageStore } from '../../stores/message'

import { extract } from 'letterparser'

export default {
  setup() {
    const { modal, hide } = useModal()
    const messageStore = useMessageStore()
    return { messageStore, modal, hide }
  },
  props: {
    id: {
      type: Number,
      required: true
    },
    collection: {
      type: String,
      required: false,
      default: null
    }
  },
  computed: {
    message() {
      return this.messageStore.get(this.id)
    },
    parsed() {
      return this.message && this.message.message
        ? extract(this.message.message)
        : null
    },
    text() {
      return this.parsed ? this.parsed.text : null
    },
    html() {
      return this.parsed ? this.parsed.html : null
    }
  },
  methods: {
    async show() {
      this.messageStore.fetch(this.id, true, this.collection) // Too many params

      this.showModal = true
    }
  }
}
</script>
