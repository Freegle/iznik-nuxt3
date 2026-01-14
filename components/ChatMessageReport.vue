<template>
  <div>
    <b-row>
      <b-col>
        <b-card v-if="!modtools" border-variant="warning">
          <b-card-title>
            <h4>
              <v-icon icon="exclamation-triangle" scale="2" />&nbsp;You reported
              someone
            </h4>
          </b-card-title>
          <b-card-text>
            This has been passed to our volunteers, who will get back to you
            soon.
          </b-card-text>
        </b-card>
        <b-card v-else border-variant="warning">
          <b-card-title>
            <h4 v-if="otheruser">
              <v-icon icon="exclamation-triangle" scale="2" />&nbsp;{{
                otheruser.displayname
              }}
              reported someone
            </h4>
          </b-card-title>
          <b-card-text>
            {{ emessage }}
            {{ chatmessage.refchatid }} - {{ chatmessage.userid }}
            <ModChatViewButton
              :id="chatmessage.refchatid"
              class="mt-2"
              :pov="chatmessage.userid"
            />
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>
<script setup>
import { useChatMessageBase } from '~/composables/useChat'
import { useMiscStore } from '~/stores/misc'

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

const miscStore = useMiscStore()
const modtools = computed(() => miscStore.modtools)

// Use the chat base composable (even though we don't use any of its properties in this component)
useChatMessageBase(props.chatid, props.id, props.pov)
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
