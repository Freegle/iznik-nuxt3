<template>
  <client-only>
    <ChatNotVisible v-if="notVisible" id="notvisible" />
    <div
      v-else-if="!id"
      class="empty-state-pane chatHolder"
      :class="{
        stickyAdRendered,
      }"
    >
      <div class="empty-state-content">
        <v-icon icon="hand-pointer" class="empty-state-icon" />
        <p class="empty-state-text">Select a chat</p>
        <p class="empty-state-hint">
          Click on a conversation in the left pane to view it.
        </p>
      </div>
    </div>
    <div
      v-else-if="me"
      class="chatHolder"
      :class="{
        stickyAdRendered,
        navBarHidden,
      }"
    >
      <!-- Old ChatHeader removed - now using ChatMobileNavbar at all breakpoints -->
      <div
        v-if="chat && chatmessages?.length"
        ref="chatContent"
        class="chatContent"
        :style="{
          opacity: opacity,
        }"
      >
        <div class="pt-1 mb-1 w-100 itemwrapper">
          <ChatTypingIndicator
            :chatid="id"
            :icon="chat?.icon"
            :name="chat?.name"
          />
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
  </client-only>
</template>
<script setup>
import ChatFooter from './ChatFooter'
import ChatTypingIndicator from './ChatTypingIndicator'
import { navBarHidden } from '~/composables/useNavbar'
import { useUserStore } from '~/stores/user'
import { useChatStore } from '~/stores/chat'
import { useMiscStore } from '~/stores/misc'
import { setupChat } from '~/composables/useChat'

// Don't use dynamic imports because it stops us being able to scroll to the bottom after render.
import ChatMessage from '~/components/ChatMessage.vue'
import { useAuthStore } from '~/stores/auth'

const chatStore = useChatStore()
const userStore = useUserStore()
const miscStore = useMiscStore()
const authStore = useAuthStore()

const props = defineProps({
  id: { type: Number, required: true },
})

const windowHeight = ref(window.innerHeight)

function resize() {
  windowHeight.value = window.innerHeight
}

const stickyAdRendered = computed(() => miscStore.stickyAdRendered)

const ChatNotVisible = defineAsyncComponent(() =>
  import('~/components/ChatNotVisible.vue')
)

const { chat } = await setupChat(props.id)

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
    if (chat?.value?.otheruid) {
      await userStore.fetch(chat.value.otheruid)
    }
  }
}

// Reverse the chatmessages because we use flex-direction: column-reverse for scrolling reasons.
const chatmessages = computed(() => {
  const msgs = chatStore.messagesById(props.id)
  return msgs ? msgs.slice().reverse() : []
})

const messagesToShow = ref(0)
const chatBusy = ref(false)
const topVisible = ref(true)
const scrollTimer = ref(null)
const scrollInterval = ref(50)
const loaded = ref(false)

const notVisible = computed(() => {
  let ret = false
  if (props.id && !chatStore?.byChatId(props.id)) {
    // This isn't a chat we can see.
    ret = true
  }

  return ret
})

const opacity = computed(() => {
  // Until we've finished our initial render, don't show anything.  Reduces flicker.
  return loaded.value ? 1 : 0
})

const me = computed(() => authStore.user)
watch(me, async (newVal, oldVal) => {
  if (!oldVal && newVal) {
    await chatStore.fetchChats()

    if (props.id) {
      if (!chatStore.byChatId(props.id)) {
        // It might be an old chat which doesn't appear in our recent ones, but which we are specifically trying
        // to go to.  Fetch all the chats.
        chatStore.searchSince = '2009-09-11'
        await chatStore.fetchChats()
      }

      chatStore.fetchMessages(props.id)

      // Fetch the user.
      if (chat?.value?.otheruid) {
        await userStore.fetch(chat.value.otheruid)
      }
    }
  }
})

onMounted(() => {
  scrollTimer.value = setTimeout(checkScroll, scrollInterval.value)

  resize()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  if (scrollTimer.value) {
    clearTimeout(scrollTimer.value)
  }

  window.removeEventListener('resize', resize)
})

function checkScroll() {
  scrollTimer.value = null

  if (topVisible.value && messagesToShow.value < chatmessages?.value?.length) {
    // We can see the top and we're not showing everything yet.  We need to show more.
    //
    // We used to use a computed property based on this index.  But that meant that the computed property
    // had a new value each time we changed this, which forced re-render of each of the messages.  By referencing
    // messagesToShow in the v-for loop we only trigger a render of the new items.
    messagesToShow.value = Math.min(
      chatmessages?.value?.length,
      messagesToShow?.value + 10
    )

    scrollTimer.value = setTimeout(checkScroll, scrollInterval.value)
  } else if (!loaded.value) {
    // We have finished loading - either we've we shown enough to hide the top, or we have loaded everything.
    loaded.value = true
  }
}

function topChanged(isVisible) {
  topVisible.value = isVisible

  if (topVisible.value && !scrollTimer.value) {
    // We don't want to do this too frequently.
    scrollTimer.value = setTimeout(checkScroll, scrollInterval.value)
  }
}

function typing() {
  // No longer need to collapse header - using simplified mobile navbar
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/sticky-banner.scss';
@import 'assets/css/_color-vars.scss';

// The height is complex:
// - By default we use the whole height.
// - If the navbar is visible, we subtract that - different height on mobile and desktop.
// - If a sticky ad is shown, we subtract that.
// We are suspicious of v-bind not working, so we do this purely using classes.
.chatHolder {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: height 1s;

  height: calc(100vh - 60px);

  @include media-breakpoint-up(md) {
    height: calc(100vh - 78px);
  }

  &.navBarHidden {
    height: 100vh;
  }

  &.stickyAdRendered {
    height: calc(100vh - 60px - $sticky-banner-height-mobile);

    @media (min-height: $mobile-tall) {
      height: calc(100vh - 60px - $sticky-banner-height-mobile-tall);
    }

    @include media-breakpoint-up(md) {
      height: calc(100vh - 78px - $sticky-banner-height-desktop);

      @media (min-height: $desktop-tall) {
        height: calc(100vh - 78px - $sticky-banner-height-desktop-tall);
      }
    }

    &.navBarHidden {
      height: calc(100vh - $sticky-banner-height-mobile);

      @media (min-height: $mobile-tall) {
        height: calc(100vh - $sticky-banner-height-mobile-tall);
      }

      @include media-breakpoint-up(md) {
        height: calc(100vh - $sticky-banner-height-desktop);

        @media (min-height: $desktop-tall) {
          height: calc(100vh - $sticky-banner-height-desktop-tall);
        }
      }
    }
  }

  @supports (height: 100dvh) {
    height: calc(100dvh - 60px);

    @include media-breakpoint-up(md) {
      height: calc(100dvh - 78px);
    }

    &.navBarHidden {
      height: 100dvh;
    }

    &.stickyAdRendered {
      height: calc(100dvh - 60px - $sticky-banner-height-mobile);

      @media (min-height: $mobile-tall) {
        height: calc(100dvh - 60px - $sticky-banner-height-mobile-tall);
      }

      @include media-breakpoint-up(md) {
        height: calc(100dvh - 78px - $sticky-banner-height-desktop);

        @media (min-height: $desktop-tall) {
          height: calc(100dvh - 78px - $sticky-banner-height-desktop-tall);
        }
      }

      &.navBarHidden {
        height: calc(100dvh - $sticky-banner-height-mobile);

        @media (min-height: $mobile-tall) {
          height: calc(100dvh - $sticky-banner-height-mobile-tall);
        }

        @include media-breakpoint-up(md) {
          height: calc(100dvh - $sticky-banner-height-desktop);

          @media (min-height: $desktop-tall) {
            height: calc(100dvh - $sticky-banner-height-desktop-tall);
          }
        }
      }
    }
  }
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
  padding-right: 8px;
  padding-left: 8px;
  background-color: $color-gray--lighter;
  background-image: url('/chat-pattern.svg');
  background-repeat: repeat;
  background-size: 200px 200px;
}

.chatFooter {
  order: 4;
}

.itemwrapper {
  display: flex;
  flex-direction: column-reverse;
}

/* Empty state for no chat selected */
.empty-state-pane {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $color-gray--lighter;
  background-image: url('/chat-pattern.svg');
  background-repeat: repeat;
  background-size: 200px 200px;
}

.empty-state-content {
  text-align: center;
  background: white;
  padding: 32px 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-state-icon {
  font-size: 2.5rem;
  color: $color-green-background;
  margin-bottom: 12px;
}

.empty-state-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: $color-gray--darker;
  margin-bottom: 4px;
}

.empty-state-hint {
  font-size: 0.85rem;
  color: $color-gray--dark;
  margin: 0;
}
</style>
