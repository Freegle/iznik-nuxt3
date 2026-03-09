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
      <!-- Profile header for desktop (md+) - mobile uses ChatMobileNavbar -->
      <VisibleWhen :at="['md', 'lg', 'xl', 'xxl']">
        <div
          v-if="chat && otheruser && otheruser.info && !otheruser?.deleted"
          class="desktop-profile-header"
        >
          <div class="profile-header-main">
            <ProfileImage
              :image="chat.icon"
              :name="chat.name"
              class="profile-header-avatar clickme"
              is-thumbnail
              size="lg"
              @click="showInfo"
            />
            <div class="profile-header-info">
              <div class="profile-header-name">
                <span class="clickme" @click="showInfo">{{ chat.name }}</span>
                <SupporterInfo
                  v-if="otheruser.supporter"
                  class="supporter-badge"
                />
              </div>
              <div class="profile-header-stats">
                <UserRatings
                  :id="chat.otheruid"
                  :key="'otheruser-' + chat.otheruid"
                  size="sm"
                />
                <span v-if="otheruser.lastaccess" class="stat-chip">
                  <v-icon icon="clock" class="stat-icon" />
                  {{ otheraccessFull }}
                </span>
                <span v-if="replytimeFull" class="stat-chip">
                  <v-icon icon="reply" class="stat-icon" />
                  {{ replytimeFull }}
                </span>
                <span v-if="milesaway" class="stat-chip">
                  <v-icon icon="map-marker-alt" class="stat-icon" />
                  {{ milesaway }} miles
                </span>
              </div>
            </div>
            <div class="profile-header-actions">
              <b-button
                v-if="unseen"
                variant="white"
                class="action-btn action-btn--mark-read"
                @click="markRead"
              >
                Mark read
                <b-badge variant="danger" class="ms-1">{{ unseen }}</b-badge>
              </b-button>
              <b-button variant="white" class="action-btn" @click="showInfo">
                Profile
              </b-button>
              <b-button
                v-if="chat.chattype === 'User2User'"
                variant="white"
                class="action-btn"
                @click="chat.status === 'Blocked' ? unhide() : showblock()"
              >
                {{ chat.status === 'Blocked' ? 'Unblock' : 'Block' }}
              </b-button>
              <b-button
                variant="white"
                class="action-btn"
                @click="chat.status === 'Closed' ? unhide() : showhide()"
              >
                {{ chat.status === 'Closed' ? 'Unhide' : 'Hide' }}
              </b-button>
              <b-button
                v-if="chat.chattype === 'User2User'"
                variant="white"
                class="action-btn"
                @click="showreport()"
              >
                Report
              </b-button>
            </div>
          </div>
        </div>
      </VisibleWhen>
      <ChatBlockModal
        v-if="showChatBlock && chat?.chattype === 'User2User'"
        :id="id"
        :user="otheruser"
        @confirm="block"
        @hidden="showChatBlock = false"
      />
      <ChatHideModal
        v-if="
          showChatHide &&
          (chat?.chattype === 'User2User' || chat?.chattype === 'User2Mod')
        "
        :id="id"
        :user="otheruser"
        @confirm="hide"
        @hidden="showChatHide = false"
      />
      <ChatReportModal
        v-if="showChatReport && chat?.chattype === 'User2User'"
        :id="'report-' + id"
        :user="otheruser"
        :chatid="chat?.id"
        @confirm="hide"
        @hidden="showChatReport = false"
      />
      <ProfileModal
        v-if="showProfileModal"
        :id="otheruser?.id"
        close-on-message
        @hidden="showProfileModal = false"
      />
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
        <Spinner :size="50" class="float-end" />
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
import VisibleWhen from './VisibleWhen'
import ProfileImage from './ProfileImage'
import UserRatings from './UserRatings'
import SupporterInfo from './SupporterInfo'
import { navBarHidden } from '~/composables/useNavbar'
import { useUserStore } from '~/stores/user'
import { useChatStore } from '~/stores/chat'
import { useMiscStore } from '~/stores/misc'
import { setupChat } from '~/composables/useChat'
import { timeago } from '~/composables/useTimeFormat'

// Don't use dynamic imports because it stops us being able to scroll to the bottom after render.
import ChatMessage from '~/components/ChatMessage.vue'
import { useAuthStore } from '~/stores/auth'

const ProfileModal = defineAsyncComponent(() =>
  import('~/components/ProfileModal')
)
const ChatBlockModal = defineAsyncComponent(() =>
  import('~/components/ChatBlockModal')
)
const ChatHideModal = defineAsyncComponent(() =>
  import('~/components/ChatHideModal')
)
const ChatReportModal = defineAsyncComponent(() =>
  import('~/components/ChatReportModal')
)

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

const { chat, otheruser, milesaway, unseen } = await setupChat(props.id)

// Watch for changes in unseen messages count - when a new message comes in via background poll,
// the chat's unseen count changes and we need to fetch the new messages to display them.
watch(unseen, () => {
  if (props.id) {
    chatStore.fetchMessages(props.id)
  }
})

const otheraccessFull = computed(() => {
  if (!otheruser.value?.lastaccess) return null
  const full = timeago(otheruser.value.lastaccess)
  return full.replace(/ ago$/, '')
})

const replytimeFull = computed(() => {
  let ret = null
  let secs = null

  if (otheruser?.value?.info) {
    secs = otheruser.value.info.replytime
  }

  if (secs) {
    if (secs < 60) {
      const val = Math.round(secs)
      ret = val + (val === 1 ? ' second' : ' seconds')
    } else if (secs < 60 * 60) {
      const val = Math.round(secs / 60)
      ret = val + (val === 1 ? ' minute' : ' minutes')
    } else if (secs < 24 * 60 * 60) {
      const val = Math.round(secs / 60 / 60)
      ret = val + (val === 1 ? ' hour' : ' hours')
    } else {
      const val = Math.round(secs / 60 / 60 / 24)
      ret = val + (val === 1 ? ' day' : ' days')
    }
  }

  return ret
})

const showProfileModal = ref(false)
const showChatBlock = ref(false)
const showChatHide = ref(false)
const showChatReport = ref(false)

const router = useRouter()

function showInfo() {
  showProfileModal.value = true
}

function showblock() {
  showChatBlock.value = true
}

function showhide() {
  showChatHide.value = true
}

function showreport() {
  showChatReport.value = true
}

async function hide() {
  await chatStore.hide(props.id)
  router.push('/chats')
}

async function block() {
  await chatStore.block(props.id)
  router.push('/chats')
}

async function unhide() {
  await chatStore.unhide(props.id)
}

async function markRead() {
  await chatStore.markRead(props.id)
}

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

/* Desktop profile header */
.desktop-profile-header {
  order: 2;
  background: white;
  padding: 12px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.profile-header-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @include media-breakpoint-only(md) {
    gap: 8px;
  }
}

.profile-header-avatar {
  flex-shrink: 0;
}

.profile-header-info {
  flex: 1;
  min-width: 0;
}

.profile-header-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.profile-header-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: $color-gray--lighter;
  font-size: 0.75rem;
  color: $color-gray--darker;
  font-weight: 500;
}

.stat-icon {
  font-size: 0.7rem;
  color: $color-green--dark;
}

.supporter-badge {
  font-size: 0.8rem;
}

.profile-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-left: auto;

  @include media-breakpoint-only(md) {
    width: 100%;
    margin-left: 0;
    margin-top: 8px;
    justify-content: flex-start;
  }
}

.action-btn {
  font-size: 0.7rem;
  padding: 2px 8px;
}

.action-btn--mark-read {
  border: 1px solid #dc3545 !important;
  color: #dc3545 !important;
}
</style>
