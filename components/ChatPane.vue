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
                :id="chatmessage.id"
                :key="'chatmessage-' + chatmessage.id"
                :chatid="chatmessage.chatid"
                :last="
                  chatmessage.id === chatmessages[chatmessages.length - 1].id
                "
                :prevmessage="index > 0 ? chatmessages[index - 1].id : null"
              />
            </div>
            <div v-if="chatBusy && headerLoaded" class="text-center">
              <b-img class="float-end" src="~static/loader.gif" />
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
import { setupChat } from '~/composables/useChat'

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
  async setup(props) {
    const chatStore = useChatStore()
    const userStore = useUserStore()

    const { chat, chatmessages, otheruser } = await setupChat(props.id)

    return { chatStore, userStore, chat, chatmessages, otheruser }
  },
  data() {
    return {
      headerLoaded: false,
      distance: 1000,
      showNotices: true,
      messagesToShow: 1,
      chatBusy: false,
    }
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
    scrollToBottom() {
      this.waitForRef('chatContent', () => {
        const container = this.$refs.chatContent

        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
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
