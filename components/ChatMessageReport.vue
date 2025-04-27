<template>
  <div>
    <b-row>
      <b-col>
        <b-card border-variant="warning">
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
      </b-col>
    </b-row>
  </div>
</template>
<script setup>
import { useChatBase } from '../composables/useChat'

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

// Use the chat base composable (even though we don't use any of its properties in this component)
useChatBase(props.chatid, props.id, props.pov)
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
