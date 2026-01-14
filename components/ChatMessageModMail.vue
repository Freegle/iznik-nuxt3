<template>
  <div>
    <b-row>
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
                v-else-if="chat.chattype === 'User2User'"
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
<script setup>
import { ref, computed } from 'vue'
import NoticeMessage from './NoticeMessage'
import ChatButton from './ChatButton'
import { useComposeStore } from '~/stores/compose'
import {
  fetchReferencedMessage,
  useChatMessageBase,
} from '~/composables/useChat'
import ProfileImage from '~/components/ProfileImage'
import GroupSelect from '~/components/GroupSelect'
import { useRouter } from '#imports'

const props = defineProps({
  chatid: {
    type: Number,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  last: {
    type: Boolean,
    required: false,
    default: false,
  },
  pov: {
    type: Number,
    required: false,
    default: null,
  },
  highlightEmails: {
    type: Boolean,
    required: false,
    default: false,
  },
})

// Use the chat base composable
const { chat, chatmessage, emessage, refmsg, me, myid } = useChatMessageBase(
  props.chatid,
  props.id,
  props.pov
)

const composeStore = useComposeStore()
const contactGroupId = ref(null)

// Setup
await fetchReferencedMessage(props.chatid, props.id)

const group = computed(() => {
  return chat.value && chat.value.group ? chat.value.group : null
})

const amUser = computed(() => {
  return chat.value && chat.value.user && chat.value.user.id === myid
})

async function repost() {
  const message = Object.assign({}, refmsg.value)

  if (message) {
    // Remove any partially composed messages we currently have, because they'll be confusing.
    await composeStore.clearMessages()

    // Add this message to the compose store so that it will show up on the compose page.
    await composeStore.setMessage(
      0,
      {
        type: message.type,
        item: message.item?.name?.trim(),
        description: message.textbody.trim(),
        availablenow: message.availablenow,
        repostof: chatmessage.value.refmsgid,
      },
      me.value
    )

    composeStore.setAttachmentsForMessage(0, message.attachments)

    const router = useRouter()
    router.push(message.type === 'Offer' ? '/give' : '/find')
  }
}
</script>
<style scoped lang="scss">
.chatMessage {
  border: 1px solid $color-gray--light;
  border-radius: 10px;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-left: 4px;
  padding-right: 2px;
  word-wrap: break-word;
  line-height: 1.5;
}
</style>
