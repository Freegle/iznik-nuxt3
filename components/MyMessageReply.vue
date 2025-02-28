<template>
  <div class="border border-success rounded mb-1">
    <div class="layout mb-1">
      <div class="divider" />
      <div class="user d-flex flex-wrap">
        <MyMessageReplyUser :id="replyuser?.id" />
      </div>
      <div class="badges d-flex flex-wrap">
        <div class="mt-1 mb-1 ms-1 d-flex flex-column justify-content-center">
          <b-badge v-if="closest" variant="info" pill class="pb-1 text-white">
            Nearby
          </b-badge>
        </div>
        <div class="mt-1 mb-1 ms-1 d-flex flex-column justify-content-center">
          <b-badge v-if="best" variant="info" pill class="pb-1 text-white">
            Good rating
          </b-badge>
        </div>
        <div class="mt-1 mb-1 ms-1 d-flex flex-column justify-content-center">
          <b-badge v-if="quickest" variant="info" pill class="pb-1 text-white">
            Quick reply
          </b-badge>
        </div>
        <SupporterInfo
          v-if="replyuser?.supporter"
          class="ms-1 d-flex flex-column justify-content-center"
        />
      </div>
      <div
        class="pl-1 flex-shrink-1 ratings d-flex d-md-none justify-content-end align-self-center m-0"
      >
        <UserRatings v-if="replyuser?.id" :id="replyuser?.id" size="sm" />
      </div>
      <div
        class="pl-1 flex-shrink-1 ratings d-none d-md-flex justify-content-end w-100 pr-1 m-0"
      >
        <UserRatings :id="replyuser?.id" />
      </div>
      <div class="d-flex flex-column justify-content-center wrote">
        <div class="d-flex flex-wrap">
          <span v-if="unseen > 0" class="bg-white snippet text-primary mr-w">
            {{ chat?.snippet }}...
          </span>
          <span v-else-if="chat?.snippet" class="bg-white snippet mr-2">
            {{ chat?.snippet }}...
          </span>
          <span v-else class="ml-4"> ... </span>
          <div
            class="text-muted small mb-1 d-flex flex-column justify-content-around"
          >
            <span :title="replylocale">
              {{ replyago }}
            </span>
          </div>
        </div>
      </div>
      <div class="d-flex flex-column justify-content-center ml-2 buttons">
        <div class="d-flex w-100 justify-content-between">
          <b-button
            v-if="promised && !taken && !withdrawn"
            variant="warning"
            class="align-middle mt-1 mb-1 mr-2"
            :size="buttonSize"
            @click="unpromise"
          >
            <div class="d-flex">
              <span class="stacked mt-1">
                <v-icon icon="handshake" />
                <v-icon icon="slash" class="unpromise__slash" /> </span
              >&nbsp;Unpromise
            </div>
          </b-button>
          <b-button
            v-else-if="message.type === 'Offer' && !taken && !withdrawn"
            variant="primary"
            class="align-middle mt-1 mb-1 mr-2"
            :size="buttonSize"
            @click="promise"
          >
            <v-icon icon="handshake" /> Promise
          </b-button>
          <b-button
            variant="secondary"
            class="align-middle mt-1 mb-1 mr-1"
            :size="buttonSize"
            @click="openChat"
          >
            <b-badge v-if="unseen > 0" variant="danger">
              {{ unseen }}
            </b-badge>
            <span v-else>
              <v-icon icon="comments" />
            </span>
            Chat
          </b-button>
        </div>
      </div>
    </div>
    <PromiseModal
      v-if="replyuser && showPromiseModal"
      :messages="[message]"
      :selected-message="message.id"
      :users="[replyuser]"
      :selected-user="replyuser?.id"
      @hidden="showPromiseModal = false"
    />
    <RenegeModal
      v-if="replyuser && showRenegeModal"
      :messages="[message.id]"
      :selected-message="message.id"
      :users="[replyuser]"
      :selected-user="replyuser?.id"
      @hidden="showRenegeModal = false"
    />
  </div>
</template>
<script>
import { useUserStore } from '../stores/user'
import { useMessageStore } from '../stores/message'
import { useChatStore } from '../stores/chat'
import { useRouter } from '#imports'
import SupporterInfo from '~/components/SupporterInfo'
import { timeago, datelocale } from '~/composables/useTimeFormat'
import { useMiscStore } from '~/stores/misc'

const UserRatings = defineAsyncComponent(() =>
  import('~/components/UserRatings')
)
const PromiseModal = defineAsyncComponent(() => import('./PromiseModal'))
const RenegeModal = defineAsyncComponent(() => import('./RenegeModal'))

export default {
  components: {
    SupporterInfo,
    UserRatings,
    PromiseModal,
    RenegeModal,
  },
  props: {
    message: {
      type: Object,
      required: true,
    },
    taken: {
      type: Boolean,
      required: false,
      default: false,
    },
    received: {
      type: Boolean,
      required: false,
      default: false,
    },
    withdrawn: {
      type: Boolean,
      required: false,
      default: false,
    },
    reply: {
      type: Object,
      required: true,
    },
    chats: {
      type: Array,
      required: true,
    },
    closest: {
      type: Boolean,
      required: false,
      default: false,
    },
    best: {
      type: Boolean,
      required: false,
      default: false,
    },
    quickest: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  async setup(props) {
    const userStore = useUserStore()
    const messageStore = useMessageStore()
    const chatStore = useChatStore()
    const miscStore = useMiscStore()

    const promises = []

    promises.push(userStore.fetch(props.reply.userid))

    const chat = chatStore.toUser(props.reply.userid)

    if (!chat) {
      // A chat that isn't fetched in the default chat list - maybe old, maybe closed.  We want to fetch it, but
      // we don't want to update the roster - otherwise the act of viewing this reply will cause the chat to become
      // active again.
      promises.push(
        chatStore.openChatToUser({
          userid: props.reply.userid,
          updateRoster: false,
        })
      )
    }

    await Promise.all(promises)

    return {
      userStore,
      messageStore,
      chatStore,
      miscStore,
    }
  },
  data() {
    return {
      showPromiseModal: false,
      showRenegeModal: false,
    }
  },
  computed: {
    chat() {
      return this.chatStore?.toUser(this.reply.userid)
    },
    replyuser() {
      return this.userStore?.byId(this.reply.userid)
    },
    replyago() {
      return timeago(this.chat?.lastdate)
    },
    replylocale() {
      return datelocale(this.chat?.lastdate)
    },
    unseen() {
      // See if this reply has unseen messages in the chats.
      let unseen = 0

      for (const chat of this.chats) {
        if (chat.id === this.reply?.chatid) {
          unseen += chat.unseen
        }
      }

      return unseen
    },
    promised() {
      if (this.message?.promisecount && this.message.promises?.length) {
        for (const promise of this.message.promises) {
          if (promise.userid === this.reply.userid) {
            return true
          }
        }
      }

      return false
    },
    buttonSize() {
      const breakpoint = this.miscStore?.breakpoint
      return breakpoint === 'xs' || breakpoint === 'sm' ? 'sm' : 'md'
    },
  },
  methods: {
    openChat() {
      const router = useRouter()
      router.push('/chats/' + this.chat?.id)
    },
    promise() {
      this.showPromiseModal = true
    },
    unpromise() {
      this.showRenegeModal = true
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.snippet {
  border: 1px solid $color-gray--light;
  border-radius: 10px;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-left: 4px;
  padding-right: 4px;
  word-wrap: break-word;
  line-height: 1.5;
  font-weight: bold;

  @include media-breakpoint-up(md) {
    font-size: 125%;
  }
}

.unpromise__slash {
  transform: rotate(180deg);
  transform: translate(2px, -7px);
  color: $color-red;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto auto auto;

  .user {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
    align-self: start;
    font-size: 150%;
  }

  .badges {
    grid-row: 2 / 3;
    grid-column: 1 / 3;
    justify-self: end;
  }

  .ratings {
    grid-row: 1 / 2;
    grid-column: 2 / 3;
    align-self: end;
    margin-top: 0.5rem;
    margin-right: 0.5rem;
  }

  .divider {
    border-bottom: 1px solid $color-gray--light;
    margin-top: 5px;
    margin-bottom: 5px;
    grid-row: 3 / 4;
    grid-column: 1 / 3;
  }

  .wrote {
    grid-row: 4 / 5;
    grid-column: 1 / 3;
    margin-top: 0.5rem;
    margin-left: 0.5rem;
  }

  .buttons {
    grid-row: 5 / 6;
    grid-column: 1 / 3;
    margin-top: 0.25rem;
  }

  @include media-breakpoint-up(md) {
    grid-template-columns: 3fr 1fr;
    grid-template-rows: auto auto auto;

    .divider {
      grid-column: 1 / 4;
      grid-row: 3 / 4;
      margin-top: 5px;
    }

    .user {
      grid-column: 1 / 2;
      grid-row: 1 / 2;
    }

    .badges {
      grid-row: 2 / 3;
      grid-column: 3 / 4;
    }

    .ratings {
      grid-column: 3 / 4;
      grid-row: 1 / 2;
    }

    .wrote {
      grid-row: 4 / 5;
      grid-column: 1 / 2;
      border-top: 0;
    }

    .buttons {
      grid-column: 2 / 4;
      grid-row: 4 / 5;
      justify-self: end;
      border-top: 0;
    }
  }
}

.stacked {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;

  svg {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }

  svg:nth-child(2) {
    color: white;
    padding-top: 7px;
    padding-right: 7px;
  }
}
</style>
