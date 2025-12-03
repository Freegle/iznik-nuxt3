<template>
  <div v-if="typing && icon" class="chatMessageWrapper pb-1">
    <div class="chatMessageProfilePic">
      <ProfileImage
        :image="icon"
        :name="name"
        class="ml-1 mb-1 mt-1 inline"
        is-thumbnail
        size="sm"
      />
    </div>
    <div class="chatMessage forcebreak chatMessage__owner pt-2">
      <div class="d-flex">
        <JumpingDots size="lg" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { TYPING_TIME_INVERVAL } from '../constants'
import { useMiscStore } from '~/stores/misc'
import { useChatStore } from '~/stores/chat'
import ProfileImage from '~/components/ProfileImage'
import JumpingDots from '~/components/JumpingDots.vue'

const chatStore = useChatStore()
const miscStore = useMiscStore()

const props = defineProps({
  chatid: {
    type: Number,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
    default: null,
  },
})

// The typing status should be updated about every 10 seconds.  We check every 10 seconds, and then consider them
// to be typing if they have been typing in the last 20 seconds.  That gives some grace for network delays.
let checkTypingTimer = null

const chat = computed(() => {
  return chatStore.byChatId(props.chatid)
})

const typing = computed(() => {
  let typing = chat.value?.lasttype
  let lastdate = chat.value?.lastdate

  if (typing && lastdate) {
    const now = new Date().getTime()
    typing = new Date(typing)
    lastdate = new Date(lastdate)

    // We are typing if we know that we have been doing so recently, and more recently than the
    // last sent message in the chat.
    if (
      now - typing < TYPING_TIME_INVERVAL * 3 &&
      typing.getTime() > lastdate.getTime()
    ) {
      return true
    }
  }

  return false
})

async function checkTyping() {
  // All we need to do is refetch the chat, which will update the typing status.  Only do this if the window is
  // visible so as not to be cruel to the server just because we've implemented a poll-based mechanism rather than
  // web sockets.
  if (miscStore.visible) {
    await chatStore.fetchChat(props.chatid)
  }

  checkTypingTimer = setTimeout(checkTyping, TYPING_TIME_INVERVAL)
}

onMounted(() => {
  checkTypingTimer = setTimeout(checkTyping, TYPING_TIME_INVERVAL)
})

onBeforeUnmount(() => {
  if (checkTypingTimer) {
    clearTimeout(checkTypingTimer)
  }
})
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.chatMessageProfilePic {
  min-width: 25px;
  position: relative;
  top: 3px;
  left: 3px;
  margin-right: 5px;

  @include media-breakpoint-up(md) {
    min-width: 35px;
  }
}

.chatMessageWrapper {
  display: flex;
  padding-right: 10px;
}
</style>
