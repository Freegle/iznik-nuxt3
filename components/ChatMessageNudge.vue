<template>
  <div>
    <b-row>
      <b-col>
        <div v-if="!otheruser || chatmessage.userid != me.id" class="media">
          <b-card border-variant="warning">
            <b-card-title>
              <h4><v-icon icon="bell" />&nbsp;You've been nudged!</h4>
            </b-card-title>
            <b-card-text>
              {{ otheruser ? otheruser.displayname : 'Someone' }} is waiting for
              you to reply.
            </b-card-text>
          </b-card>
        </div>
        <div v-else class="media float-end mb-1">
          <b-card border-variant="warning">
            <b-card-title>
              <h4><v-icon icon="bell" />&nbsp;You nudged them.</h4>
            </b-card-title>
          </b-card>
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script setup>
import { useChatMessageBase } from '~/composables/useChat'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  chatid: {
    type: Number,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  pov: {
    type: Number,
    required: false,
    default: null,
  },
})

const { me } = useMe()

const { otheruser, chatmessage } = useChatMessageBase(
  props.chatid,
  props.id,
  props.pov
)
</script>
