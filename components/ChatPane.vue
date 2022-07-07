<template>
  <div>
    <div v-if="me">
      <client-only>
        <div class="chatHolder">
          <ChatHeader :id="id" class="chatTitle" :loaded.sync="headerLoaded" />
          <div
            v-if="chat && chatmessages?.length"
            ref="chatContent"
            class="chatContent"
            infinite-wrapper
          >
            <infinite-loading
              v-if="otheruser || chat.chattype === 'User2Mod'"
              direction="top"
              force-use-infinite-wrapper="true"
              :distance="distance"
              class="w-100"
              @infinite="loadMore"
            >
              <template #error>&nbsp;</template>
              <template #complete>&nbsp;</template>
              <template #spinner>
                <div v-if="!chatmessages.length" class="col text-center w-100">
                  <b-img src="/loader.gif" alt="Loading..." />
                </div>
              </template>
            </infinite-loading>
            <div
              v-if="
                otheruser ||
                chat.chattype === 'User2Mod' ||
                chat.chattype === 'Mod2Mod'
              "
              class="pt-1 mb-1 w-100"
            >
              <ChatMessage
                v-for="(chatmessage, index) in chatmessages"
                :key="'chatmessage-' + chatmessage.id"
                :chatmessage="chatmessage"
                :chat="chat"
                :otheruser="otheruser"
                :last="
                  chatmessage.id === chatmessages[chatmessages.length - 1].id
                "
                :prevmessage="index > 0 ? chatmessages[index - 1].id : null"
              />
            </div>
            <div v-if="chatBusy && headerLoaded" class="text-center">
              <b-img class="float-right" src="~static/loader.gif" />
            </div>
          </div>
          <ChatFooter
            v-bind="$props"
            class="chatFooter"
            @scrollbottom="scrollToBottom(true)"
          />
        </div>
      </client-only>
    </div>
  </div>
</template>
<script>
import { useChatStore } from '../stores/chat'
import ChatHeader from './ChatHeader'
import ChatFooter from './ChatFooter'
import { useUserStore } from '~/stores/user'

// Don't use dynamic imports because it stops us being able to scroll to the bottom after render.
import ChatMessage from '~/components/ChatMessage.vue'

export default {
  components: {
    ChatHeader,
    ChatFooter,
    ChatMessage,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const chatStore = useChatStore()
    const userStore = useUserStore()

    return { chatStore, userStore }
  },
  data() {
    return {
      headerLoaded: false,
      distance: 1000,
      showNotices: true,
      sendmessage: null,
      messagesToShow: 1,
      chatBusy: false,
    }
  },
  computed: {
    chat() {
      return this.chatStore.byId(this.id)
    },
    chatmessages() {
      return this.chatStore.messagesById(this.id)
    },
    otheruserid() {
      // The user who isn't us.
      let ret = null

      if (
        this.chat &&
        this.myid &&
        this.chat.chattype === 'User2User' &&
        this.chat.user1
      ) {
        ret = this.chat.user1 === this.myid ? this.chat.user2 : this.chat.user1
      }

      return ret
    },
    otheruser() {
      let user = null

      if (this.otheruserid) {
        user = this.userStore.byId(this.otheruserid)
      }

      return user
    },
  },
  watch: {
    me(newVal, oldVal) {
      if (!oldVal && newVal) {
        // TODO FEtch new messages
      }
    },
  },
  methods: {
    loadMore($state) {
      // TODO Chat message paging.
      if (this.messagesToShow < this.chatmessages?.length) {
        this.messagesToShow++
        $state.loaded()
      } else {
        $state.complete()
      }
    },
  },
}
</script>
<style scoped lang="scss">
.chatpane {
  min-height: 100vh;
}

.chatHolder {
  height: calc(100vh - 74px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chatTitle {
  order: 1;
  z-index: 1000;
}

.chatContent {
  order: 3;
  justify-content: flex-start;
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.chatFooter {
  order: 4;
}
</style>
