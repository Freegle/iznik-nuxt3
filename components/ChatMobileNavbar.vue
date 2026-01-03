<template>
  <div>
    <!-- Main navbar row -->
    <div
      type="dark"
      class="ourBack layout fixed-top d-flex justify-content-between align-items-center"
    >
      <OfflineIndicator v-if="!online" class="offline" />
      <div v-else class="nav-back-btn" @click="backButton">
        <v-icon icon="arrow-left" class="back-icon" />
        <b-badge v-if="backButtonCount" variant="danger" class="back-badge">
          {{ backButtonCount }}
        </b-badge>
      </div>
      <div
        id="other-user-group"
        ref="expandBtnRef"
        class="other-user-group clickme"
        @click="toggleProfileCard"
      >
        <ProfileImage
          v-if="otheruser && otheruser.info && !otheruser?.deleted"
          :image="chat.icon"
          :name="chat.name"
          class="other-user-avatar"
          is-thumbnail
          size="md"
        />
        <h1 class="text-white truncate header--size5 m-0 other-user-name">
          {{ chat.name }}
        </h1>
      </div>
      <button
        v-if="unseen && !profileCardExpanded"
        class="navbar-mark-read"
        @click.stop="markRead"
      >
        <v-icon icon="check" class="navbar-mark-read-icon" />
        <b-badge variant="danger" class="navbar-mark-read-badge">{{
          unseen
        }}</b-badge>
      </button>
      <b-dropdown no-caret variant="primary" class="userOptions">
        <template #button-content>
          <ProfileImage
            v-if="me?.profile?.path"
            :image="me.profile.path"
            :name="me?.displayname"
            class="m-0 inline"
            is-thumbnail
            size="lg"
          />
          <v-icon v-else icon="user" size="2x" />
        </template>
        <b-dropdown-item href="/settings">
          <div class="d-flex align-items-center">
            <v-icon icon="cog" class="menu-icon" />
            <span class="menu-text">Settings</span>
          </div>
        </b-dropdown-item>
        <b-dropdown-item @click="logout">
          <div class="d-flex align-items-center clickme">
            <v-icon icon="sign-out-alt" class="menu-icon" />
            <span class="menu-text">Logout</span>
          </div>
        </b-dropdown-item>
      </b-dropdown>
    </div>

    <!-- Profile popover -->
    <b-popover
      v-if="cssReady"
      v-model="profileCardExpanded"
      target="other-user-group"
      placement="bottom"
      custom-class="profile-popover"
      manual
    >
      <div v-if="otheruser && otheruser.info" class="profile-card-content">
        <!-- Hint tip for first-time visitors -->
        <div v-if="showProfileHint" class="profile-hint-tip">
          <span>Tap here to show profile info.</span>
          <button class="profile-hint-btn" @click="dismissHint">Got it</button>
        </div>
        <div class="profile-card-main">
          <div class="profile-card-avatar-section">
            <div class="avatar-wrapper">
              <ProfileImage
                :image="chat.icon"
                :name="chat.name"
                class="profile-card-avatar clickme"
                is-thumbnail
                size="lg"
                @click="showInfo"
              />
              <v-icon
                v-if="otheruser.supporter"
                icon="trophy"
                class="supporter-icon"
              />
            </div>
            <SupporterInfo v-if="otheruser.supporter" class="supporter-badge" />
          </div>
          <div class="profile-card-details">
            <div class="profile-card-badges">
              <UserRatings
                :id="chat.otheruid"
                :key="'otheruser-' + chat.otheruid"
                size="sm"
                no-tooltips
                external-modals
                @show-down-modal="handleShowDownModal"
                @show-remove-modal="handleShowRemoveModal"
              />
            </div>
            <div class="profile-card-stats">
              <span v-if="otheruser.lastaccess" class="stat-chip">
                <v-icon icon="clock" class="stat-icon" />
                <span class="stat-label">Last seen</span>
                {{ otheraccessFull }}
              </span>
              <span v-if="replytimeFull" class="stat-chip">
                <v-icon icon="reply" class="stat-icon" />
                <span class="stat-label">Replies in</span>
                {{ replytimeFull }}
              </span>
              <span v-if="!otheruser?.deleted && milesaway" class="stat-chip">
                <v-icon icon="map-marker-alt" class="stat-icon" />
                <span class="stat-label">Distance</span>
                {{ milesaway }} miles
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- Action buttons -->
      <div class="profile-card-actions">
        <button
          v-if="unseen"
          class="action-btn action-btn--mark-read"
          @click="markRead"
        >
          <v-icon icon="check" class="action-icon" />
          <span>Mark read</span>
          <b-badge variant="danger" class="mark-read-badge">{{
            unseen
          }}</b-badge>
        </button>
        <button
          v-if="otheruser && otheruser.info && !otheruser?.deleted"
          class="action-btn"
          @click="showInfo"
        >
          <v-icon icon="user" class="action-icon" />
          <span>Profile</span>
        </button>
        <button
          v-if="chat.chattype === 'User2User' || !unseen"
          class="action-btn"
          @click="chat.status === 'Closed' ? unhide() : showhide()"
        >
          <v-icon
            :icon="chat.status === 'Closed' ? 'eye' : 'eye-slash'"
            class="action-icon"
          />
          <span>{{ chat.status === 'Closed' ? 'Show' : 'Hide' }}</span>
        </button>
        <button
          v-if="chat.chattype === 'User2User' && otheruser"
          class="action-btn"
          @click="chat.status === 'Blocked' ? unhide() : showblock()"
        >
          <v-icon icon="ban" class="action-icon" />
          <span>{{ chat.status === 'Blocked' ? 'Unblock' : 'Block' }}</span>
        </button>
        <button
          v-if="
            chat.chattype === 'User2User' && otheruser && !otheruser?.deleted
          "
          class="action-btn action-btn--danger"
          @click="report"
        >
          <v-icon icon="flag" class="action-icon" />
          <span>Report</span>
        </button>
      </div>
    </b-popover>

    <!-- Modals -->
    <ChatBlockModal
      v-if="showChatBlock && chat.chattype === 'User2User'"
      :id="id"
      :user="otheruser"
      @confirm="block"
      @hidden="showChatBlock = false"
    />
    <ChatHideModal
      v-if="
        showChatHide &&
        (chat.chattype === 'User2User' || chat.chattype === 'User2Mod')
      "
      :id="id"
      :user="otheruser"
      @confirm="hide"
      @hidden="showChatHide = false"
    />
    <ChatReportModal
      v-if="showChatReport && chat.chattype === 'User2User'"
      :id="'report-' + id"
      :user="otheruser"
      :chatid="chat.id"
      @confirm="hide"
      @hidden="showChatReport = false"
    />

    <ProfileModal
      v-if="showProfileModal"
      :id="otheruser?.id"
      close-on-message
      @hidden="showProfileModal = false"
    />

    <UserRatingsDownModal
      v-if="showRatingsDownModal && ratingsUserId"
      :id="ratingsUserId"
      @hidden="showRatingsDownModal = false"
    />
    <UserRatingsRemoveModal
      v-if="showRatingsRemoveModal && ratingsUserId"
      :id="ratingsUserId"
      @hidden="showRatingsRemoveModal = false"
    />
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { nextTick } from 'vue'
import {
  clearNavBarTimeout,
  setNavBarHidden,
  useNavbar,
  navBarHidden,
} from '~/composables/useNavbar'
import { useChatStore } from '~/stores/chat'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { setupChat } from '~/composables/useChat'
import { timeago } from '~/composables/useTimeFormat'

const router = useRouter()
const authStore = useAuthStore()
const me = computed(() => authStore.user)

const ChatBlockModal = defineAsyncComponent(() => import('./ChatBlockModal'))
const ChatHideModal = defineAsyncComponent(() => import('./ChatHideModal'))
const ChatReportModal = defineAsyncComponent(() =>
  import('~/components/ChatReportModal')
)
const UserRatingsDownModal = defineAsyncComponent(() =>
  import('~/components/UserRatingsDownModal')
)
const UserRatingsRemoveModal = defineAsyncComponent(() =>
  import('~/components/UserRatingsRemoveModal')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const chatStore = useChatStore()
const chat = chatStore.byChatId(props.id)

const { online, backButtonCount, backButton, logout } = useNavbar()

const { otheruser, milesaway, unseen } = await setupChat(props.id)

// Modal states
const showChatBlock = ref(false)
const showChatHide = ref(false)
const showChatReport = ref(false)
const showRatingsDownModal = ref(false)
const showRatingsRemoveModal = ref(false)
const ratingsUserId = ref(null)

const otheraccessFull = computed(() => {
  if (!otheruser.value?.lastaccess) return null
  const full = timeago(otheruser.value.lastaccess)
  // Remove "ago" suffix for cleaner display
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
const profileCardExpanded = ref(false)
const showProfileHint = ref(false)
const cssReady = ref(false)
const expandBtnRef = ref(null)

const miscStore = useMiscStore()

// Check if we should show the profile hint (not dismissed in last 7 days)
const shouldShowHint = computed(() => {
  const dismissed = miscStore.vals?.profileHintDismissed
  if (!dismissed) return true
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return dismissed < sevenDaysAgo
})

async function showInfo() {
  profileCardExpanded.value = false
  await nextTick()
  showProfileModal.value = true
}

async function handleShowDownModal(userId) {
  profileCardExpanded.value = false
  ratingsUserId.value = userId
  await nextTick()
  showRatingsDownModal.value = true
}

async function handleShowRemoveModal(userId) {
  profileCardExpanded.value = false
  ratingsUserId.value = userId
  await nextTick()
  showRatingsRemoveModal.value = true
}

function toggleProfileCard() {
  profileCardExpanded.value = !profileCardExpanded.value
  // Hide hint when user interacts with profile card
  if (showProfileHint.value) {
    showProfileHint.value = false
  }
}

function dismissHint() {
  showProfileHint.value = false
  profileCardExpanded.value = false
  miscStore.set({ key: 'profileHintDismissed', value: Date.now() })
}

// Action methods
const hide = async () => {
  await chatStore.hide(props.id)
  router.push('/chats')
}

const block = async () => {
  await chatStore.block(props.id)
  router.push('/chats')
}

const unhide = async () => {
  await chatStore.unhide(props.id)
}

const markRead = async () => {
  await chatStore.markRead(props.id)
  profileCardExpanded.value = false
}

const showhide = () => {
  profileCardExpanded.value = false
  showChatHide.value = true
}

const showblock = () => {
  profileCardExpanded.value = false
  showChatBlock.value = true
}

const report = () => {
  profileCardExpanded.value = false
  showChatReport.value = true
}

function handleScroll() {
  const scrollY = window.scrollY

  if (scrollY > 200 && !navBarHidden.value) {
    setNavBarHidden(true)
  } else if (scrollY < 100 && navBarHidden.value) {
    setNavBarHidden(false)
  }

  // Also collapse profile card on scroll
  if (scrollY > 50 && profileCardExpanded.value) {
    profileCardExpanded.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)

  // Use double requestAnimationFrame to ensure CSS is fully applied before showing
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cssReady.value = true

      // Show the profile hint if not dismissed recently
      if (shouldShowHint.value) {
        setTimeout(() => {
          showProfileHint.value = true
          profileCardExpanded.value = true
        }, 500)
      }
    })
  })
})

onBeforeUnmount(() => {
  clearNavBarTimeout()
  window.removeEventListener('scroll', handleScroll)
})
</script>
<style scoped lang="scss">
@import 'assets/css/navbar.scss';
@import 'assets/css/_color-vars.scss';

.layout {
  min-height: $navbar-mobile-chat-height;
  padding: 0.5rem 0.75rem;

  h1 {
    line-height: 1.3;
    overflow: visible;
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .expand-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    margin-right: 0.5rem;
  }
}

.nav-back-btn {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.25);
  }
}

.back-icon {
  color: white;
  font-size: 1.25rem;
}

.back-badge {
  margin-left: 6px;
  font-size: 0.65rem;
}

.navbar-mark-read {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #dc3545;
  border-radius: 50%;
  cursor: pointer;
  margin-right: 8px;
  flex-shrink: 0;
}

.navbar-mark-read-icon {
  color: #dc3545;
  font-size: 1rem;
}

.navbar-mark-read-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  font-size: 0.6rem;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  line-height: 18px;
}

.navbar-avatar {
  transition: transform 0.3s ease;
}

.other-user-group {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4px 8px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 8px;
  max-width: calc(100% - 120px);
}

.other-user-avatar {
  flex-shrink: 0;
  margin-right: 8px;
}

.other-user-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Hint tip at top of profile card */
.profile-hint-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
  background: #f0f4f8;
  border: 1px solid #d0d8e0;
  font-size: 0.9rem;
  color: #333;
}

.profile-hint-btn {
  background: $color-green-background;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: darken($color-green-background, 5%);
  }
}

:deep(.userOptions .dropdown-toggle) {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  margin-right: 0.5rem;

  &::after {
    display: none;
  }
}

:deep(.userOptions .dropdown-menu) {
  background: white !important;
  border: 1px solid #ddd !important;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  padding: 0;
  min-width: 160px;
  margin-top: 0.25rem;

  .dropdown-item {
    background: white !important;
    color: #333 !important;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }

    &:hover,
    &:focus {
      background: #f8f8f8 !important;
    }
  }
}

.menu-icon {
  color: $color-green-background !important;
  width: 1.1rem !important;
  height: 1.1rem !important;
  margin-right: 0.5rem;
}

.menu-text {
  font-size: 0.9rem;
  color: #333;
}

/* Profile popover styling */
:deep(.profile-popover) {
  max-width: calc(100vw - 24px);
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  .popover-body {
    padding: 12px;
  }

  .popover-arrow::before,
  .popover-arrow::after {
    border-bottom-color: white;
  }
}

.profile-card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid $color-gray--lighter;
  margin-bottom: 10px;
}

.profile-card-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-card-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
}

.supporter-icon {
  position: absolute;
  bottom: -2px;
  right: -2px;
  font-size: 0.75rem;
  color: #ffd700;
  background: white;
  border-radius: 50%;
  padding: 2px;
}

.supporter-badge {
  font-size: 0.85rem;
}

.profile-card-avatar {
  flex-shrink: 0;
}

.profile-card-details {
  flex: 1;
  min-width: 0;
}

.profile-card-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.profile-card-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: $color-gray--lighter;
  font-size: 0.75rem;
  color: $color-gray--darker;
  font-weight: 500;
}

.stat-icon {
  font-size: 0.7rem;
  color: $color-green--dark;
}

.stat-label {
  display: none;
  color: $color-gray--dark;
  font-weight: 400;

  @include media-breakpoint-up(md) {
    display: inline;
  }
}

.profile-card-ratings {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

// Action buttons row
.profile-card-actions {
  display: flex;
  justify-content: space-around;
  gap: 8px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: $color-gray--dark;
  font-size: 0.65rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: $color-gray--lighter;
  }

  &:active {
    background-color: $color-gray--light;
  }

  &--danger {
    color: #c62828;
  }

  &--mark-read {
    position: relative;
    color: #dc3545;
    border: 1px solid #dc3545;
    background: rgba(220, 53, 69, 0.05);

    .action-icon {
      color: #dc3545;
    }
  }
}

.mark-read-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 0.6rem;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  line-height: 16px;
}

.action-icon {
  font-size: 1rem;
  margin-bottom: 2px;
}

:deep(.badge) {
  font-size: 0.6em;
}
</style>
