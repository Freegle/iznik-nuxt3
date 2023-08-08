<template>
  <div>
    <b-row class="pb-1">
      <b-col>
        <div class="media">
          <b-card border-variant="success" :class="{ 'ml-auto': !amUser }">
            <b-card-title>
              <div v-if="group">
                <h4>
                  <ProfileImage
                    v-if="group"
                    :image="group.profile"
                    class="mr-1 mb-1 mt-1 inline"
                    is-thumbnail
                    size="sm"
                  />
                  <span class="align-middle">
                    Message from {{ group.namedisplay }} Volunteers
                  </span>
                </h4>
              </div>
              <h4 v-else>Message from Freegle Volunteers</h4>
            </b-card-title>
            <b-card-text>
              <div :class="emessage ? 'media-body chatMessage' : 'media-body'">
                <span>
                  <span
                    v-if="
                      chatmessage.secondsago < 60 ||
                      chatmessage.id > chat.lastmsgseen
                    "
                    class="prewrap font-weight-bold"
                    >{{ emessage }}</span
                  >
                  <span v-else class="preline forcebreak">{{ emessage }}</span>
                  <b-img
                    v-if="chatmessage.image"
                    fluid
                    :src="chatmessage.image.path"
                    lazy
                    rounded
                  />
                </span>
              </div>
              <div v-if="chatmessage.refmsgid">
                <hr />
                <p>
                  If you have been asked to edit and resend this message, you
                  can do so here:
                </p>
                <b-button variant="warning" @click="repost">
                  <v-icon icon="pen" /> Edit and Resend
                </b-button>
              </div>
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
import ProfileImage from '~/components/ProfileImage'

export default {
  components: {
    ProfileImage,
  },
  extends: ChatBase,
  async setup(props) {
    const composeStore = useComposeStore()

    await fetchReferencedMessage(props.chatid, props.id)

    return { composeStore }
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
      const message = this.refmsg

      if (message) {
        // Remove any partially composed messages we currently have, because they'll be confusing.
        await this.composeStore.clearMessages()

        // Add this message to the compose store so that it will show up on the compose page.
        await this.composeStore.setMessage(
          0,
          {
            type: message.type,
            item: message.item.name.trim(),
            description: message.textbody.trim(),
            availablenow: message.availablenow,
            repostof: this.chatmessage.refmsgid,
          },
          this.me
        )

        await this.composeStore.setAttachmentsForMessage(
          message.id,
          message.attachments
        )

        this.$router.push(message.type === 'Offer' ? '/give' : 'find')
      }
    },
  },
}
</script>
