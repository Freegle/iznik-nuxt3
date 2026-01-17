<template>
  <div>
    <b-row>
      <b-col>
        <div v-if="chatmessage?.userid != myid" class="media">
          <div v-if="!refmsg">
            This chat message refers to a post (<v-icon
              icon="hashtag"
              class="text-muted fa-0-8x"
            />{{ chatmessage.refmsgid }}) which has been deleted.
          </div>
          <b-card v-else border-variant="warning" class="ml-2">
            <b-card-title>
              <b-img
                v-if="refmsg?.attachments?.length > 0"
                class="float-end"
                rounded
                thumbnail
                generator-unable-to-provide-required-alt=""
                lazy
                :src="refmsg.attachments[0].paththumb"
                width="70px"
                @error="brokenImage"
              />
              <ProfileImage
                :image="otheruser?.profile?.paththumb"
                :name="otheruser?.displayname"
                class="mr-1 mb-1 mt-1 inline"
                is-thumbnail
                size="sm"
              />
              <span class="small black"
                >Sorry...this is no longer promised to you:</span
              >
              <br />
              <h4>
                {{ refmsg.subject }}
              </h4>
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
            </b-card-text>
          </b-card>
        </div>
        <div v-else class="media float-end">
          <div v-if="!refmsg">
            This chat message refers to a post (<v-icon
              icon="hashtag"
              class="text-muted fa-0-8x"
            />{{ chatmessage.refmsgid }}) which has been deleted.
          </div>
          <b-card v-else border-variant="warning">
            <b-card-title>
              <b-img
                v-if="refmsg && refmsg.attachments?.length > 0"
                class="float-end"
                rounded
                thumbnail
                generator-unable-to-provide-required-alt=""
                lazy
                :src="refmsg.attachments[0].paththumb"
                width="70px"
                @error="brokenImage"
              />
              <ProfileImage
                :image="me.profile.path"
                :name="me.displayname"
                class="mr-1 mb-1 mt-1 inline"
                is-thumbnail
                size="sm"
              />
              <span class="small black"
                >You cancelled your promise to
                <strong>{{ otheruser?.displayname }}</strong> for:</span
              >
              <br />
              <h4>
                {{ refmsg.subject }}
              </h4>
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
            </b-card-text>
          </b-card>
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script setup>
import {
  fetchReferencedMessage,
  useChatMessageBase,
} from '~/composables/useChat'
import ProfileImage from '~/components/ProfileImage'
import { useMessageStore } from '~/stores/message'

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
const {
  chat,
  chatmessage,
  emessage,
  refmsg,
  refmsgid,
  me,
  myid,
  otheruser,
  brokenImage,
} = useChatMessageBase(props.chatid, props.id, props.pov)

if (refmsgid.value) {
  useMessageStore().fetch(refmsgid.value)
}

// Setup
await fetchReferencedMessage(props.chatid, props.id)
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
