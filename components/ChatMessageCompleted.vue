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
          <b-card v-else border-variant="info" class="ml-2">
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
              <h4>
                {{ refmsg?.subject }}
              </h4>
            </b-card-title>
            <b-card-text>
              <div v-if="emessage">
                <NoticeMessage variant="info">
                  <div class="small">
                    <v-icon icon="info-circle" />
                    <span v-if="refmsg?.type === 'Offer'">
                      This is no longer available.
                    </span>
                    <span v-else> Thanks, this has now been received. </span>
                  </div>
                </NoticeMessage>
                <div class="preline forcebreak mt-1">
                  {{ emessage }}
                </div>
              </div>
              <div v-else>
                <v-icon icon="info-circle" />
                <span v-if="refmsg?.type === 'Offer'">
                  This is no longer available.
                </span>
                <span v-else> Thanks, this has now been received. </span>
                <div class="text-muted small">
                  This is an automated message.
                </div>
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
          <b-card v-else border-variant="info">
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
              <h4>
                {{ refmsg?.subject }}
              </h4>
            </b-card-title>
            <b-card-text>
              <div v-if="emessage">
                <NoticeMessage variant="info">
                  <div class="text-muted small">
                    <v-icon icon="info-circle" />
                    <span v-if="refmsg?.type === 'Offer'">
                      This is no longer available.
                    </span>
                    <span v-else> Thanks, this has now been received. </span>
                  </div>
                </NoticeMessage>
                <div class="preline forcebreak mt-1">
                  {{ emessage }}
                </div>
              </div>
              <div v-else>
                <v-icon icon="info-circle" />
                <span v-if="refmsg?.type === 'Offer'">
                  We've let them know this is no longer available.
                </span>
                <span v-else> This has now been received. </span>
                <div class="text-muted small">
                  This is an automated message.
                </div>
              </div>
            </b-card-text>
          </b-card>
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script setup>
import NoticeMessage from './NoticeMessage'
import { useChatMessageBase } from '~/composables/useChat'
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
const { chatmessage, emessage, refmsg, refmsgid, myid, brokenImage } =
  useChatMessageBase(props.chatid, props.id, props.pov)

if (refmsgid.value) {
  useMessageStore().fetch(refmsgid.value)
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
