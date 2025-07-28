<template>
  <client-only>
    <ChatNotVisible v-if="notVisible" id="notvisible" />
    <p
      v-else-if="!id"
      class="text-center text-info font-weight-bold mt-2 chatHolder"
      :class="{
        stickyAdRendered,
      }"
    >
      Please click on a chat in the left pane.
    </p>
    <div
      v-else-if="me"
      class="chatHolder"
      :class="{
        stickyAdRendered,
        navBarHidden,
      }"
    >
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
              :pov="chatmessage.userid"
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
import { navBarHidden } from '../composables/useNavbar'
import ChatHeader from './ChatHeader'
import ChatFooter from './ChatFooter'
import ChatTypingIndicator from './ChatTypingIndicator'
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
    if (miscStore.modtools) {
      if (chat.value.user1id) {
        const otheruid = chat.value.user1id
        await userStore.fetch(otheruid)
        chat.value.otheruid = otheruid
      }
    } else if (chat?.value?.otheruid) {
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

const chatheader = ref(null)

function typing(val) {
  if (miscStore.breakpoint === 'xs' || miscStore.breakpoint === 'sm') {
    // Also collapse the chat header, to make even more room.
    if (chatheader.value) {
      chatheader.value.collapse(val)
    }
  }
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/sticky-banner.scss';

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
