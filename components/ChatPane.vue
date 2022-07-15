<template>
  <div>
    <div v-if="me" class="chatHolder">
      <ChatHeader :id="id" class="chatTitle" :loaded.sync="headerLoaded" />
      <div
        v-if="chat && chatmessages?.length"
        ref="chatContent"
        class="chatContent"
      >
        <div v-observe-visibility="topChanged" />
        <div
          class="pt-1 mb-1 w-100"
          :style="{
            opacity: opacity,
          }"
        >
          <ChatMessage
            v-for="(chatmessage, index) in chatmesagesToShow"
            :id="chatmessage.id"
            :key="'chatmessage-' + chatmessage.id"
            :chatid="chatmessage.chatid"
            :last="chatmessage.id === chatmessages[chatmessages.length - 1].id"
            :prevmessage="index > 0 ? chatmessages[index - 1].id : null"
            class="mb-1"
          />
        </div>
        <div v-observe-visibility="bottomChanged" />
      </div>
      <div v-else-if="chatBusy && headerLoaded" class="text-center">
        <b-img class="float-end" src="~static/loader.gif" />
      </div>
      <ChatFooter
        v-bind="$props"
        class="chatFooter"
        @scrollbottom="scrollToBottom(true)"
      />
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
      showNotices: true,
      messagesToShow: 0,
      chatBusy: false,
      scrolledToBottom: false,
      topVisible: true,
      scrollTimer: null,
      scrollInterval: 50,
    }
  },
  computed: {
    chatmesagesToShow() {
      return this.chatmessages.slice(-this.messagesToShow)
    },
    opacity() {
      // Until we've finished our initial render, don't show anything.  Reduces flicker.
      return this.scrolledToBottom ? 1 : 0
    },
    overflow() {
      // Until we've finished our initial render, hide the scroll bar.  Reduces flicker
      return this.scrolledToBottom ? 'auto' : 'hidden'
    },
  },
  watch: {
    me(newVal, oldVal) {
      if (!oldVal && newVal) {
        // TODO FEtch new messages
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
      if (this.topVisible) {
        if (this.messagesToShow < this.chatmessages?.length) {
          // We can see the top and we're not showing everything yet.  We need to show more.
          this.messagesToShow = Math.min(
            this.chatmessages?.length,
            this.messagesToShow + 10
          )

          this.scrollTimer = setTimeout(this.checkScroll, this.scrollInterval)
        } else {
          // We can see the top and we're showing everything.
          this.scrollToBottom()
          this.scrolledToBottom = true
        }
      } else if (!this.scrolledToBottom) {
        // The top is not visible.  We want to make sure we are scrolled to the bottom.
        this.scrollToBottom()
        this.scrolledToBottom = true
      }
    },
    scrollToBottom() {
      const container = this.$refs.chatContent

      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    topChanged(isVisible) {
      this.topVisible = isVisible
    },
    bottomChanged(isVisible) {
      this.bottomVisible = isVisible

      if (!this.scrolledToBottom) {
        // We've not yet completed our initial load, and we've lost the bottom.  Force us back down there.
        this.scrollToBottom()
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
  overflow-y: v-bind('overflow');
  overflow-x: hidden;
}

.chatFooter {
  order: 4;
}
</style>
