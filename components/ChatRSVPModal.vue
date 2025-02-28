<template>
  <b-modal
    ref="modal"
    scrollable
    :title="chaseup ? 'Shall we chase them up?' : 'Do you expect a reply?'"
    no-stacking
    no-close-on-backdrop
    hide-header-close
    no-close-on-esc
  >
    <template #default>
      <div v-if="chaseup">
        <p>
          Shall we remind <em>{{ user.displayname }}</em> if they don't reply?
        </p>
      </div>
      <div v-else>
        <p>
          Please let us know if you're expecting to talk to
          <em>{{ user.displayname }}</em> again soon.
        </p>
        <p v-if="dohide">
          If you're not, we will hide the chat from your list for now. You can
          still find it from My Posts.
        </p>
      </div>
    </template>
    <template #footer>
      <div v-if="chaseup" class="d-flex justify-content-between w-100">
        <b-button variant="secondary" @click="no"> No thanks </b-button>
        <b-button variant="primary" @click="yes"> Yes please </b-button>
      </div>
      <div v-else class="d-flex justify-content-between w-100">
        <b-button variant="secondary" @click="no"> No reply expected </b-button>
        <b-button variant="primary" @click="yes">
          Yes, I expect a reply
        </b-button>
      </div>
    </template>
  </b-modal>
</template>
<script>
import { useChatStore } from '../stores/chat'
import { useOurModal } from '~/composables/useOurModal'

export default {
  components: {},
  props: {
    id: {
      type: Number,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const chatStore = useChatStore()

    const { modal, hide } = useOurModal()

    return {
      chatStore,
      modal,
      hide,
    }
  },
  data() {
    return {
      chaseup: false,
      dohide: false,
    }
  },
  computed: {
    chatmessages() {
      return this.chatStore?.messagesById(this.id)
    },
    mylast() {
      let ret = null

      for (const msg of this.chatmessages) {
        if (parseInt(msg.userid) === parseInt(this.myid)) {
          ret = msg
        }
      }

      return ret
    },
  },
  methods: {
    async yes() {
      if (this.mylast) {
        await this.chatStore.rsvp(this.mylast.id, this.mylast.chatid, 1)
      }

      this.hide()
    },

    async no() {
      if (this.mylast) {
        await this.chatStore.rsvp(this.mylast.id, this.mylast.chatid, 0)
      }

      if (this.dohide) {
        await this.chatStore.hide(this.id)
      }

      this.hide()
    },
  },
}
</script>
