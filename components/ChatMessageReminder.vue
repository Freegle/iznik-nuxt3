<template>
  <div>
    <b-row>
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
<script setup>
import { computed } from 'vue'
import { useChatMessageBase } from '~/composables/useChat'

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
const { chat, chatmessage, emessage, myid } = useChatMessageBase(
  props.chatid,
  props.id,
  props.pov
)

const amUser = computed(() => {
  return chat.value && chat.value.user && chat.value.user.id === myid
})
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
