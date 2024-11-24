<template>
  <div>
    <ChatNotVisible v-if="notVisible" id="notvisible" />
    <div v-else-if="me" class="chatHolder" :style="theHeight">
      <ChatHeader :id="id" ref="chatheader" class="chatTitle" />
      <div
        v-if="chat && chatmessages?.length"
        ref="chatContent"
        class="chatContent"
        :style="{
          opacity: opacity,
        }"
      >
        <div class="pt-1 mb-1 w-100 itemwrapper">
          <ChatTypingIndicator :chatid="id" :icon="chat?.icon" />
          <div
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
          </div>
          <div v-observe-visibility="topChanged" />
        </div>
      </div>
      <div v-else-if="chatBusy" class="text-center">
        <b-img class="float-end" src="/loader.gif" width="100px" />
      </div>
      <ChatFooter
        v-bind="$props"
        class="chatFooter"
        @typing="typing"
        @scrollbottom="checkScroll"
      />
    </div>
  </div>
</template>
<script>
import { useChatStore } from '../stores/chat'
import { navBarHidden } from '../composables/useNavbar'
import { useMiscStore } from '../stores/misc'
import ChatHeader from './ChatHeader'
import ChatFooter from './ChatFooter'
import ChatTypingIndicator from './ChatTypingIndicator'
import { useUserStore } from '~/stores/user'
import { setupChat } from '~/composables/useChat'

// Don't use dynamic imports because it stops us being able to scroll to the bottom after render.
import ChatMessage from '~/components/ChatMessage.vue'

const ChatNotVisible = defineAsyncComponent(() =>
  import('~/components/ChatNotVisible.vue')
)

export default {
  components: {
    ChatTypingIndicator,
    ChatHeader,
    ChatFooter,
    ChatMessage,
    ChatNotVisible,
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
    const miscStore = useMiscStore()

    const { chat, otheruser } = await setupChat(props.id)

    if (props.id) {
      if (!chatStore.byChatId(props.id)) {
        // It might be an old chat which doesn't appear in our recent ones, but which we are specifically trying
        // to go to.  Fetch all the chats.
        chatStore.searchSince = '2009-09-11'
        await chatStore.fetchChats()
      }

      if (chat?.value) {
        // Fetch the messages.  No need to wait, as we might already have the messages in store.
        chatStore.fetchMessages(props.id)

        // Fetch the user.
        if( miscStore.modtools){
          if( chat.value.user1id){
            // Need to get user.info using api v2 but user.comments using api v1
            chat.value.otheruid = chat.value.user1id
            await userStore.fetch(chat.value.otheruid)
            const userv2 = userStore.byId(chat.value.otheruid)
            await userStore.fetchMT({ id: chat.value.otheruid})
            const user = userStore.byId(chat.value.otheruid)
            if( user && user.info){
              user.info = userv2.info
              if( user.spammer && user.spammer.collection==='Whitelisted') user.spammer = false
            }
          }
        } else  if (chat?.value?.otheruid) {
            await userStore.fetch(chat.value.otheruid)
        }
      }
    }

    // Reverse the chatmessages because we use flex-direction: column-reverse for scrolling reasons.
    const chatmessages = computed(() => {
      const msgs = chatStore.messagesById(props.id)
      return msgs ? msgs.slice().reverse() : []
    })

    return { chatStore, userStore, miscStore, chat, chatmessages, otheruser }
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
      if (this.id && !this.chatStore?.byChatId(this.id)) {
        // This isn't a chat we can see.
        ret = true
      }

      return ret
    },
    opacity() {
      // Until we've finished our initial render, don't show anything.  Reduces flicker.
      return this.loaded ? 1 : 0
    },
    theHeight() {
      const vh100 = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      )

      let ret = null

      if (
        this.miscStore.breakpoint === 'xs' ||
        this.miscStore.breakpoint === 'sm'
      ) {
        // On mobile there is a sticky ad at the bottom and we want to make sure the buttons show.
        ret = navBarHidden.value ? vh100 - 52 : vh100 - 60 - 52
      } else {
        ret = vh100 - 74
      }

      return 'height: ' + ret + 'px'
    },
  },
  watch: {
    async me(newVal, oldVal) {
      if (!oldVal && newVal) {
        await this.chatStore.fetchChats()

        if (this.id) {
          if (!this.chatStore.byChatId(this.id)) {
            // It might be an old chat which doesn't appear in our recent ones, but which we are specifically trying
            // to go to.  Fetch all the chats.
            this.chatStore.searchSince = '2009-09-11'
            await this.chatStore.fetchChats()
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
  beforeUnmount() {
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
    typing(val) {
      if (
        this.miscStore.breakpoint === 'xs' ||
        this.miscStore.breakpoint === 'sm'
      ) {
        // Also collapse the chat header, to make even more room.
        this.$refs.chatheader.collapse(val)
      }
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.chatpane {
  min-height: 100vh;
}

.chatHolder {
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
