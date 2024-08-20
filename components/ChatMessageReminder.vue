<template>
  <div>
    <b-row class="pb-1">
      <b-col>
        <div class="media">
          <b-card border-variant="success" :class="{ 'ml-auto': !amUser }">
            <b-card-title>
              <h4>
                <span class="align-middle"> Reminder:</span>
              </h4>
            </b-card-title>
            <b-card-text>
              <div :class="emessage ? 'media-body chatMessage' : 'media-body'">
                <span
                  v-if="
                    chatmessage.secondsago < 60 ||
                    chatmessage.id > chat.lastmsgseen
                  "
                  class="prewrap font-weight-bold"
                  >{{ emessage }}</span
                >
                <span v-else class="preline forcebreak">{{ emessage }}</span>
              </div>
              <div class="text-muted small">This is an automated message.</div>
            </b-card-text>
          </b-card>
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import { useComposeStore } from '../stores/compose'
import { fetchReferencedMessage } from '../composables/useChat'
import ChatBase from '~/components/ChatBase'
import { useRouter } from '#imports'

export default {
  extends: ChatBase,
  async setup(props) {
    const composeStore = useComposeStore()

    await fetchReferencedMessage(props.chatid, props.id)

    return { composeStore }
  },
  data: function () {
    return {
      contactGroupId: null,
    }
  },
  computed: {
    group() {
      return this.chat && this.chat.group ? this.chat.group : null
    },
    amUser() {
      return this.chat && this.chat.user && this.chat.user.id === this.myid
    },
  },
  methods: {
    async repost() {
      const message = Object.assign({}, this.refmsg)

      if (message) {
        // Remove any partially composed messages we currently have, because they'll be confusing.
        await this.composeStore.clearMessages()

        // Add this message to the compose store so that it will show up on the compose page.
        await this.composeStore.setMessage(
          0,
          {
            type: message.type,
            item: message.item?.name?.trim(),
            description: message.textbody.trim(),
            availablenow: message.availablenow,
            repostof: this.chatmessage.refmsgid,
          },
          this.me
        )

        this.composeStore.setAttachmentsForMessage(0, message.attachments)

        const router = useRouter()
        router.push(message.type === 'Offer' ? '/give' : '/find')
      }
    },
  },
}
</script>
