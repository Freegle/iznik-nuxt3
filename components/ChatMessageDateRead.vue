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
        {{ timeadaptChat(chatmessage?.date) }}
      </span>
      <b-badge
        v-if="chatmessage?.replyexpected && !chatmessage?.replyreceived"
        variant="danger"
        class="ml-1"
      >
        RSVP - reply expected
      </b-badge>
      <span
        v-if="mod && chatmessage?.bymailid"
        class="btn btn-sm btn-white mb-2 ml-2 clickme"
        :title="
          'Received by email #' + chatmessage?.bymailid + ' click to view'
        "
        @click="showOriginal = true"
      >
        <v-icon icon="info-circle" /> View original email
      </span>
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
        timeadaptChat(chatmessage?.date)
      }}</span>
      <span
        v-if="mod && chatmessage?.bymailid"
        class="btn btn-sm btn-white mb-2 ml-2 clickme"
        :title="
          'Received by email #' + chatmessage?.bymailid + ' click to view'
        "
        @click="showOriginal = true"
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
    <ModMessageEmailModal
      v-if="showOriginal"
      :id="chatmessage?.bymailid"
      @hidden="showOriginal = false"
    />
  </div>
</template>
<script setup>
import { useUserStore } from '~/stores/user'
import { useChatMessageBase } from '~/composables/useChat'
import { datetimeshort, timeadaptChat } from '~/composables/useTimeFormat'
import { ref, computed, onMounted, defineAsyncComponent } from '#imports'
import { useMe } from '~/composables/useMe'

const ModMessageEmailModal = defineAsyncComponent(() =>
  import('~/modtools/components/ModMessageEmailModal.vue')
)

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
  last: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const userStore = useUserStore()
const { me, mod } = useMe()

// Use ChatBase functionality via composable
const { chat, otheruser, chatmessage, messageIsFromCurrentUser } =
  useChatMessageBase(props.chatid, props.id, props.pov)

// Data properties
const chatMessageUser = ref(null)
const showOriginal = ref(false)

// Computed properties
const othermodname = computed(() => {
  return chatMessageUser.value?.displayname
})

// Methods
// Load chatMessageUser data
onMounted(async () => {
  if (chatmessage.value?.userid) {
    await userStore.fetch(chatmessage.value.userid)
    chatMessageUser.value = userStore.byId(chatmessage.value.userid)
  }
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.chat__dateread--theirs {
  padding-left: 48px;
  margin-bottom: 4px;
  margin-top: -2px;

  @include media-breakpoint-up(md) {
    padding-left: 52px;
  }
}

.chat__dateread--mine {
  padding-right: 8px;
  margin-bottom: 4px;
  margin-top: -2px;
}

.fontsize {
  font-size: 0.7em;

  @include media-breakpoint-up(md) {
    font-size: 0.875em;
  }
}
</style>
