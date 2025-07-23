<template>
  <div>
    <b-row>
      <b-col>
        <div v-if="isMT" :class="mtClasses">
          <b-card border-variant="warning">
            <b-card-title>
              <h4 v-if="mtNudgerPov">
                <v-icon icon="bell" />&nbsp;{{ chat.user1?.displayname }} nudged
                {{ chat.user2?.displayname }}
              </h4>
              <h4 v-else>
                <v-icon icon="bell" />&nbsp;{{ chat.user2?.displayname }} nudged
                {{ chat.user1?.displayname }}
              </h4>
            </b-card-title>
          </b-card>
        </div>
        <div
          v-else-if="!otheruser || chatmessage.userid != me.id"
          class="media"
        >
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
import { useChatMessageBase } from '../composables/useChat'
import { useMiscStore } from '../stores/misc' // MT..
import { useMe } from '~/composables/useMe'
const miscStore = useMiscStore()
const isMT = ref(miscStore.modtools)

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

const { chat, otheruser, chatmessage } = useChatMessageBase(
  props.chatid,
  props.id,
  props.pov
)

const mtNudgerPov = computed(() => {
  if (!isMT.value) return false
  const nudgerid = chatmessage.value.userid
  return nudgerid === chat.value.user1?.id
})

const mtClasses = computed(() => {
  return mtNudgerPov.value ? 'media float-end mb-1' : 'media'
})
</script>
