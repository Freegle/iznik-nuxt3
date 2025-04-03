<template>
  <div
    v-if="
      !chatmessage?.sameasnext ||
      last ||
      chatmessage?.bymailid ||
      chatmessage?.gap
    "
    class="text-muted fontsize mb-1"
  >
    <div v-if="!messageIsFromCurrentUser">
      <span
        class="chat__dateread--theirs"
        :title="datetimeshort(chatmessage?.date)"
      >
        {{ timeadapt(chatmessage?.date) }}
      </span>
      <b-badge
        v-if="chatmessage?.replyexpected && !chatmessage?.replyreceived"
        variant="danger"
        class="ml-1"
      >
        RSVP - reply expected
      </b-badge>
    </div>
    <div v-else class="d-flex justify-content-end chat__dateread--mine">
      <span v-if="chatmessage?.seenbyall" title="This message has been read.">
        <v-icon icon="check" class="text-success" />
      </span>
      <span
        v-else-if="chatmessage?.mailedtoall"
        title="This message has been sent out by email from our system."
      >
        <v-icon icon="envelope" />
      </span>
      <span
        v-else-if="
          mod &&
          chat &&
          chat.chattype === 'User2Mod' &&
          otheruser &&
          otheruser.settings &&
          otheruser.settings.notifications &&
          !otheruser.settings.notifications.email
        "
        title="This freegler normally has email notifications turned off.  We always email messages from mods though."
      >
        <v-icon icon="envelope" class="text-danger" />
      </span>
      <span
        v-else
        title="This message has been delivered in Chat.  Depending on the other freegler's settings it may also be sent out by email soon - then this would turn into a little envelope."
      >
        <v-icon icon="check" class="text-muted" />
      </span>
      <span v-if="chat.chattype === 'User2Mod'" class="ml-1">
        <span v-if="chatmessage?.userid === me.id"> You </span>
        <span v-else-if="othermodname">
          {{ othermodname }}
        </span>
        <span v-else>
          <v-icon icon="hashtag" class="text-muted fa-0-8x" />{{
            chatmessage?.userid
          }}
        </span>
        sent this
      </span>
      <span v-if="chatmessage?.reviewrequired" class="text-danger small">
        Pending review
      </span>
      <span :title="datetimeshort(chatmessage?.date)" class="ml-1">{{
        timeadapt(chatmessage?.date)
      }}</span>
      <span
        v-if="mod && chatmessage?.bymailid"
        class="btn btn-sm btn-white mb-2 clickme"
        :title="
          'Received by email #' + chatmessage?.bymailid + ' click to view'
        "
        @click="viewOriginal"
      >
        <v-icon icon="info-circle" /> View original email
      </span>
      <b-badge
        v-if="chatmessage?.replyexpected && !chatmessage?.replyreceived"
        variant="danger"
        class="ml-1"
      >
        RSVP - reply requested
      </b-badge>
    </div>
  </div>
</template>

<script>
import { setupChat } from '../composables/useChat'
import { useUserStore } from '../stores/user'
import ChatBase from './ChatBase'

export default {
  extends: ChatBase,
  props: {
    chatid: {
      type: Number,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
  },
  async setup(props) {
    const userStore = useUserStore()

    const { chat, otheruser, chatmessage } = await setupChat(
      props.chatid,
      props.id
    )

    let chatMessageUser = null

    if (chatmessage?.userid) {
      userStore.fetch(this.chatmessage.userid)
      chatMessageUser = userStore.get(chatmessage.userid)
    }

    return {
      chatmessage,
      chat,
      otheruser,
      chatMessageUser,
    }
  },
  data() {
    return {
      dePlural: /^1 (.*)s/,
    }
  },
  computed: {
    othermodname() {
      return this.chatMessageUser?.displayname
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.chat__dateread--theirs {
  padding-left: 40px;
  margin-bottom: 5px;
}

.chat__dateread--mine {
  padding-right: 40px;
  padding-left: 10px;
  margin-bottom: 5px;
}

.fontsize {
  font-size: 0.7em;

  @include media-breakpoint-up(md) {
    font-size: 0.875em;
  }
}
</style>
