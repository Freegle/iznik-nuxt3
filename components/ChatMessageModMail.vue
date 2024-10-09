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
              <div v-if="realMod" class="text-muted small">
                <div class="small">
                  (Sent by <v-icon icon="hashtag" class="text-muted" scale="0.5" />{{ chatmessage.userid }})
                </div>
              </div>
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
              <div v-if="chatmessage.refmsgid && refmsg">
                <hr />
                <p>
                  If you have been asked to edit and resend this message, you
                  can do so here:
                </p>
                <b-button variant="warning" @click="repost">
                  <v-icon icon="pen" /> Edit and Resend
                </b-button>
              </div>
              <NoticeMessage
                v-else-if="!modtools && (chat.chattype === 'User2User')"
                variant="warning"
                class="mt-2"
              >
                <p>
                  Volunteers won't see any replies you make in here about this
                  message - they'll go to the other freegler. If you want to
                  contact the volunteers, please use the button below.
                </p>
                <GroupSelect
                  v-model="contactGroupId"
                  remember="contactmods"
                  class="mb-3"
                />
                <ChatButton
                  :groupid="contactGroupId"
                  size="md"
                  title="Contact community volunteers"
                  variant="primary"
                  class="mb-2"
                />
              </NoticeMessage>
            </b-card-text>
          </b-card>
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import { useComposeStore } from '../stores/compose'
import { useMiscStore } from '~/stores/misc'
import { fetchReferencedMessage } from '../composables/useChat'
import NoticeMessage from './NoticeMessage'
import ChatButton from './ChatButton'
import ChatBase from '~/components/ChatBase'
import ProfileImage from '~/components/ProfileImage'
import { useRouter } from '#imports'

export default {
  components: {
    NoticeMessage,
    ProfileImage,
    ChatButton,
  },
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
    modtools(){
      const miscStore = useMiscStore()
      return miscStore.modtools
    },
    group() {
      return this.chat && this.chat.group ? this.chat.group : null
    },
    amUser() {
      return this.chat && this.chat.user && this.chat.user.id === this.myid // TODO: Needs fixing for MT when viewing others' chat
    },
    realMod() {
      return (
        this.realMe &&
        (this.realMe.systemrole === 'Moderator' ||
          this.realMe.systemrole === 'Support' ||
          this.realMe.systemrole === 'Admin')
      )
    }
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
