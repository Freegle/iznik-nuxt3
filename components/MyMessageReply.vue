<template>
  <div :class="['reply-mobile', { 'reply-mobile--promised': promised }]">
    <!-- Chat bubble with avatar and name inside -->
    <div
      v-if="chat?.snippet"
      :class="['chat-bubble', unseen > 0 ? 'chat-bubble--unread' : '']"
      @click="openChat"
    >
      <ProfileImage
        :image="replyuser?.profile?.paththumb"
        :externaluid="replyuser?.profile?.externaluid"
        :ouruid="replyuser?.profile?.ouruid"
        :externalmods="replyuser?.profile?.externalmods"
        :name="replyuser?.displayname || 'User'"
        class="chat-avatar"
        is-thumbnail
        size="lg"
        @click.stop="openProfile"
      />
      <div class="chat-content">
        <span class="user-name" @click.stop="openProfile">{{
          replyuser?.displayname
        }}</span>
        <span class="chat-text">{{ chat.snippet }}...</span>
      </div>
      <span class="chat-time">{{ replyagoShort }}</span>
      <button class="chat-btn">
        <b-badge v-if="unseen > 0" variant="danger" class="chat-badge">
          {{ unseen }}
        </b-badge>
        <span>Chat</span>
        <v-icon icon="angle-double-right" />
      </button>
    </div>
    <div v-else class="chat-bubble chat-bubble--empty" @click="openChat">
      <ProfileImage
        :image="replyuser?.profile?.paththumb"
        :externaluid="replyuser?.profile?.externaluid"
        :ouruid="replyuser?.profile?.ouruid"
        :externalmods="replyuser?.profile?.externalmods"
        :name="replyuser?.displayname || 'User'"
        class="chat-avatar"
        is-thumbnail
        size="lg"
        @click.stop="openProfile"
      />
      <div class="chat-content">
        <span class="user-name" @click.stop="openProfile">{{
          replyuser?.displayname
        }}</span>
      </div>
      <span class="chat-time">{{ replyagoShort }}</span>
      <button class="chat-btn">
        <span>Chat</span>
        <v-icon icon="angle-double-right" />
      </button>
    </div>

    <!-- Action buttons row -->
    <div class="action-row">
      <div class="ratings-section">
        <UserRatings
          v-if="replyuser?.id"
          :id="replyuser.id"
          size="lg"
          class="user-ratings"
        />
        <SupporterInfo v-if="replyuser?.supporter" class="supporter-badge" />
      </div>
      <div class="action-section">
        <button
          v-if="promised && !taken && !withdrawn"
          class="action-btn action-btn--warning"
          @click="unpromise"
        >
          <v-icon icon="handshake" />
          <span>Unpromise</span>
        </button>
        <button
          v-else-if="message.type === 'Offer' && !taken && !withdrawn"
          class="action-btn action-btn--primary"
          @click="promise"
        >
          <v-icon icon="handshake" />
          <span>Promise</span>
        </button>
      </div>
    </div>
    <!-- Badges row -->
    <div v-if="closest || best || quickest" class="badges-row">
      <b-badge v-if="closest" variant="info" pill class="badge-item">
        <v-icon icon="map-marker-alt" class="me-1" />Nearby
      </b-badge>
      <b-badge v-if="best" variant="info" pill class="badge-item">
        <v-icon icon="star" class="me-1" />Good rating
      </b-badge>
      <b-badge v-if="quickest" variant="info" pill class="badge-item">
        <v-icon icon="clock" class="me-1" />Quick reply
      </b-badge>
    </div>

    <!-- Modals -->
    <PromiseModal
      v-if="replyuser && showPromiseModal"
      :messages="[message]"
      :selected-message="message.id"
      :users="replyusers"
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
    <ProfileModal
      v-if="showProfileModal"
      :id="replyuser?.id"
      @hidden="showProfileModal = false"
    />
  </div>
</template>

<script setup>
import { defineAsyncComponent, ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { useUserStore } from '~/stores/user'
import { useChatStore } from '~/stores/chat'
import { useRouter } from '#imports'
import { timeagoShort } from '~/composables/useTimeFormat'
import ProfileImage from '~/components/ProfileImage'
import SupporterInfo from '~/components/SupporterInfo'

const UserRatings = defineAsyncComponent(() =>
  import('~/components/UserRatings')
)
const PromiseModal = defineAsyncComponent(() => import('./PromiseModal'))
const RenegeModal = defineAsyncComponent(() => import('./RenegeModal'))
const ProfileModal = defineAsyncComponent(() =>
  import('~/components/ProfileModal')
)

const props = defineProps({
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
})

const userStore = useUserStore()
const chatStore = useChatStore()
const router = useRouter()

const showPromiseModal = ref(false)
const showRenegeModal = ref(false)
const showProfileModal = ref(false)

// Initialize data
const initialize = async () => {
  await userStore.fetch(props.reply.userid)

  const existingChat = chatStore.toUser(props.reply.userid)
  if (!existingChat) {
    await chatStore.openChatToUser({
      userid: props.reply.userid,
      updateRoster: false,
    })
  }
}

initialize()

const chat = computed(() => chatStore?.toUser(props.reply.userid))

const replyuser = computed(() => userStore?.byId(props.reply.userid))

const replyuserids = computed(() => {
  const ret = []

  if (replyuser.value) {
    ret.push(replyuser.value.id)
  }

  let chats = chatStore?.list || []
  chats = chats.filter(
    (c) =>
      c.status !== 'Blocked' &&
      c.status !== 'Closed' &&
      c.chattype === 'User2User'
  )

  chats.sort((a, b) => {
    if (a.lastdate && b.lastdate) {
      return dayjs(b.lastdate).diff(dayjs(a.lastdate))
    } else if (a.lastdate) {
      return -1
    } else if (b.lastdate) {
      return 1
    }
    return 0
  })

  chats.forEach((c) => {
    if (c.otheruid && c.otheruid !== replyuser.value?.id) {
      ret.push(c.otheruid)
    }
  })

  return ret
})

const replyusers = computed(() => {
  return replyuserids.value.map((uid) => userStore?.byId(uid)).filter((u) => u)
})

const replyagoShort = computed(() => timeagoShort(chat.value?.lastdate))

const unseen = computed(() => {
  let count = 0
  for (const c of props.chats) {
    if (c.id === props.reply?.chatid) {
      count += c.unseen
    }
  }
  return count
})

const promised = computed(() => {
  if (props.message?.promisecount && props.message.promises?.length) {
    return props.message.promises.some((p) => p.userid === props.reply.userid)
  }
  return false
})

watch(
  replyuserids,
  (newVal) => {
    newVal.forEach((uid) => userStore.fetch(uid))
  },
  { immediate: true }
)

function openChat() {
  router.push('/chats/' + chat.value?.id)
}

function openProfile() {
  showProfileModal.value = true
}

function promise() {
  showPromiseModal.value = true
}

function unpromise() {
  showRenegeModal.value = true
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'assets/css/_color-vars.scss';

.reply-mobile {
  padding: 12px;
  background: white;
  border-bottom: 2px solid $color-gray--light;
  margin-bottom: 8px;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  &--promised {
    background: rgba($color-green-background, 0.06);
  }
}

.chat-avatar {
  flex-shrink: 0;
  cursor: pointer;
  width: 36px;
  min-width: 36px;
  height: 36px;
  min-height: 36px;
  align-self: flex-start;
  position: relative;
  overflow: visible;

  :deep(.ProfileImage__container) {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    min-height: 36px !important;
    display: grid !important;
    grid-template-columns: 36px !important;
    grid-template-rows: 36px !important;
  }

  :deep(picture),
  :deep(.profile) {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    min-height: 36px !important;
    max-width: 36px !important;
    max-height: 36px !important;
    grid-row: 1 / 2;
    grid-column: 1 / 2;
    border-radius: 50%;
    overflow: hidden;
    display: block;
  }

  :deep(img) {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    min-height: 36px !important;
    max-width: 36px !important;
    max-height: 36px !important;
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }

  :deep(.generated-avatar) {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    min-height: 36px !important;
    grid-row: 1 / 2;
    grid-column: 1 / 2;
    border-radius: 50%;
    overflow: hidden;

    svg {
      width: 36px !important;
      height: 36px !important;
      display: block;
    }
  }
}

.chat-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 700;
  font-size: 0.85rem;
  color: $color-black;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.user-ratings {
  flex-shrink: 0;
  position: relative;
  z-index: 0;
  transform: scale(0.65);
  transform-origin: left center;
  margin-right: -35%;
}

.supporter-badge {
  flex-shrink: 0;
}

.chat-time {
  font-size: 0.75rem;
  color: $color-gray--dark;
  flex-shrink: 0;
  margin-left: auto;
  padding-left: 8px;
}

.chat-bubble {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: $color-gray--lighter;
  border-radius: 12px;
  cursor: pointer;

  &--unread {
    background: lighten($color-blue--bright, 40%);

    .chat-text {
      color: $color-blue--1;
      font-weight: 500;
    }
  }
}

.chat-text {
  font-size: 0.85rem;
  color: $color-gray--dark;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  background: $color-gray--dark;
  color: white;
  flex-shrink: 0;

  &:hover {
    background: darken($color-gray--dark, 10%);
  }
}

.chat-badge {
  font-size: 0.65rem;
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.ratings-section {
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 320px) {
    display: none;
  }
}

.badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.action-section {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &--primary {
    background: $color-green-background;
    color: white;

    &:hover {
      background: darken($color-green-background, 10%);
    }
  }

  &--warning {
    background: $color-orange--dark;
    color: white;

    &:hover {
      background: darken($color-orange--dark, 10%);
    }
  }
}

.badge-item {
  font-size: 0.7rem;
  font-weight: 500;
  padding: 4px 8px;
}
</style>
