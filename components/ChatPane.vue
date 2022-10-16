<template>
  <div>
    <ChatNotVisible v-if="notVisible" />
    <div v-else-if="me" class="chatHolder">
      <ChatHeader :id="id" class="chatTitle" />
      <div
        v-if="chat && chatmessages?.length"
        ref="chatContent"
        class="chatContent"
        :style="{
          opacity: opacity,
        }"
      >
        <div class="pt-1 mb-1 w-100 itemwrapper">
          <Suspense
            v-for="(chatmessage, index) in chatmessages"
            :key="'chatmessage-' + chatmessage.id"
          >
            <ChatMessage
              v-if="index < messagesToShow"
              :id="chatmessage.id"
              :chatid="chatmessage.chatid"
              :last="
                chatmessage.id === chatmessages[chatmessages.length - 1].id
              "
              :prevmessage="
                index + 1 < chatmessages.length
                  ? chatmessages[index + 1].id
                  : null
              "
              class="mb-1"
            />

            <template #fallback>
              <div class="invisible" style="min-height: 101px">
                Loading {{ chatmessage.id }}...
              </div>
            </template>
          </Suspense>
          <div v-observe-visibility="topChanged" />
        </div>
      </div>
      <div v-else-if="chatBusy" class="text-center">
        <b-img class="float-end" src="/loader.gif" />
      </div>
      <ChatFooter v-bind="$props" class="chatFooter" />
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

    const { chat, otheruser } = await setupChat(props.id)

    if (props.id) {
      if (!chatStore.byId(props.id)) {
        // It might be an old chat which doesn't appear in our recent ones, but which we are specifically trying
        // to go to.  Fetch all the chats.
        await chatStore.fetchChats('2009-09-11')
      }

      // Fetch the messages.  No need to wait, as we might already have the messages in store.
      chatStore.fetchMessages(props.id)

      // Fetch the user.
      if (chat?.value?.otheruid) {
        await userStore.fetch(chat.value.otheruid)
      }
    }

    // Reverse the chatmessages because we use flex-direction: column-reverse for scrolling reasons.
    const chatmessages = computed(() => {
      const msgs = chatStore.messagesById(props.id)
      return msgs ? msgs.slice().reverse() : []
    })

    return { chatStore, userStore, chat, chatmessages, otheruser }
  },
  data() {
    return {
      messagesToShow: 0,
      chatBusy: false,
      topVisible: true,
      scrollTimer: null,
      scrollInterval: 50,
      loaded: false,
    }
  },
  computed: {
    notVisible() {
      let ret = false
      if (this.id && !this.chatStore.byId(this.id)) {
        // This isn't a chat we can see.
        ret = true
      }

      return ret
    },
    opacity() {
      // Until we've finished our initial render, don't show anything.  Reduces flicker.
      return this.loaded ? 1 : 0
    },
  },
  watch: {
    async me(newVal, oldVal) {
      if (!oldVal && newVal) {
        await this.chatStore.fetchChats()

        if (this.id) {
          if (!this.chatStore.byId(this.id)) {
            // It might be an old chat which doesn't appear in our recent ones, but which we are specifically trying
            // to go to.  Fetch all the chats.
            await this.chatStore.fetchChats('2009-09-11')
          }

          this.chatStore.fetchMessages(this.id)

          // Fetch the user.
          if (this.chat?.value?.otheruid) {
            await this.userStore.fetch(this.chat.value.otheruid)
          }
        }
      }
    },
  },
  mounted() {
    this.scrollTimer = setTimeout(this.checkScroll, this.scrollInterval)
  },
  beforeDestroy() {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
    }
  },
  methods: {
    checkScroll() {
      this.scrollTimer = null

      if (this.topVisible && this.messagesToShow < this.chatmessages?.length) {
        // We can see the top and we're not showing everything yet.  We need to show more.
        //
        // We used to use a computed property based on this index.  But that meant that the computed property
        // had a new value each time we changed this, which forced re-render of each of the messages.  By referencing
        // messagesToShow in the v-for loop we only trigger a render of the new items.
        this.messagesToShow = Math.min(
          this.chatmessages?.length,
          this.messagesToShow + 10
        )

        this.scrollTimer = setTimeout(this.checkScroll, this.scrollInterval)
      } else if (!this.loaded) {
        // We have finished loading - either we've we shown enough to hide the top, or we have loaded everything.
        this.loaded = true
      }
    },
    topChanged(isVisible) {
      this.topVisible = isVisible

      if (this.topVisible && !this.scrollTimer) {
        // We don't want to do this too frequently.
        this.scrollTimer = setTimeout(this.checkScroll, this.scrollInterval)
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
  overflow-y: scroll;
  overflow-x: hidden;
  display: flex;
  flex-direction: column-reverse;
  transition: opacity 0.1s ease-in;
  padding-right: 5px;
  padding-left: 5px;
}

.chatFooter {
  order: 4;
}

.itemwrapper {
  display: flex;
  flex-direction: column-reverse;
}
</style>
