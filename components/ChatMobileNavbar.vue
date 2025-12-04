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
        class="flex-grow-1 d-flex justify-content-around clickme"
        @click="toggleProfileCard"
      >
        <h1 class="text-white truncate text-center header--size5 m-0">
          {{ chat.name }}
        </h1>
      </div>
      <div
        v-if="otheruser && otheruser.info && !otheruser?.deleted"
        ref="expandBtnRef"
        class="expand-btn clickme"
        :class="{ pulsating: isPulsating }"
        @click="toggleProfileCard"
      >
        <ProfileImage
          :image="chat.icon"
          :name="chat.name"
          class="navbar-avatar"
          is-thumbnail
          size="md"
        />
      </div>
    </div>

    <!-- Expandable profile card -->
    <div
      v-if="cssReady"
      class="profile-card"
      :class="{ 'profile-card--expanded': profileCardExpanded }"
    >
      <div v-if="otheruser && otheruser.info" class="profile-card-content">
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
            <span v-if="otheruser.supporter" class="supporter-dot" />
          </div>
          <SupporterInfo v-if="otheruser.supporter" class="supporter-badge" />
        </div>
        <div class="profile-card-details">
          <div class="profile-card-badges">
            <UserRatings
              :id="chat.otheruid"
              :key="'otheruser-' + chat.otheruid"
              size="sm"
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
      <!-- Action buttons -->
      <div class="profile-card-actions">
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
    </div>

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
  </div>
</template>
<script setup>
import {
  clearNavBarTimeout,
  setNavBarHidden,
  useNavbar,
  navBarHidden,
} from '~/composables/useNavbar'
import { useChatStore } from '~/stores/chat'
import { setupChat } from '~/composables/useChat'
import { timeago } from '~/composables/useTimeFormat'

const ChatBlockModal = defineAsyncComponent(() => import('./ChatBlockModal'))
const ChatHideModal = defineAsyncComponent(() => import('./ChatHideModal'))
const ChatReportModal = defineAsyncComponent(() =>
  import('~/components/ChatReportModal')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const chatStore = useChatStore()
const chat = chatStore.byChatId(props.id)

const { online, backButtonCount, backButton } = useNavbar()

const { otheruser, milesaway, unseen } = await setupChat(props.id)

// Modal states
const showChatBlock = ref(false)
const showChatHide = ref(false)
const showChatReport = ref(false)

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
const isPulsating = ref(false)
const cssReady = ref(false)
const chevronX = ref('calc(100% - 24px) -30px')
const expandBtnRef = ref(null)
let autoCollapseTimer = null
let expandTimer = null
let pulsateTimer = null

function showInfo() {
  showProfileModal.value = true
}

function triggerPulsate() {
  isPulsating.value = true
  if (pulsateTimer) {
    clearTimeout(pulsateTimer)
  }
  pulsateTimer = setTimeout(() => {
    isPulsating.value = false
  }, 600)
}

function toggleProfileCard() {
  triggerPulsate()
  profileCardExpanded.value = !profileCardExpanded.value
  if (autoCollapseTimer) {
    clearTimeout(autoCollapseTimer)
    autoCollapseTimer = null
  }
  if (expandTimer) {
    clearTimeout(expandTimer)
    expandTimer = null
  }
}

// Action methods
const hide = async () => {
  await chatStore.hide(props.id)
}

const block = async () => {
  await chatStore.block(props.id)
}

const unhide = async () => {
  await chatStore.unhide(props.id)
}

const showhide = () => {
  showChatHide.value = true
}

const showblock = () => {
  showChatBlock.value = true
}

const report = () => {
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
      // Calculate the actual chevron position relative to profile card
      if (expandBtnRef.value) {
        const rect = expandBtnRef.value.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        // Y position: chevron center is above the profile card (which starts at top: 60px)
        // So we need a negative Y to point back up to the chevron
        const centerY = rect.top + rect.height / 2 - 60 // 60px is the profile card's top
        chevronX.value = `${centerX}px ${centerY}px`
      }

      cssReady.value = true

      // Delay the profile card animation to let the page settle first
      expandTimer = setTimeout(() => {
        triggerPulsate()
        profileCardExpanded.value = true

        // Auto-collapse after 3 seconds of being expanded
        autoCollapseTimer = setTimeout(() => {
          triggerPulsate()
          profileCardExpanded.value = false
        }, 3000)
      }, 800)
    })
  })
})

onBeforeUnmount(() => {
  clearNavBarTimeout()
  window.removeEventListener('scroll', handleScroll)
  if (autoCollapseTimer) {
    clearTimeout(autoCollapseTimer)
  }
  if (expandTimer) {
    clearTimeout(expandTimer)
  }
  if (pulsateTimer) {
    clearTimeout(pulsateTimer)
  }
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

.navbar-avatar {
  transition: transform 0.3s ease;
}

.expand-btn.pulsating .navbar-avatar {
  animation: pulse-chevron 0.6s ease-in-out;
}

@keyframes pulse-chevron {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.4);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

/* Expandable profile card */
.profile-card {
  position: fixed;
  top: 66px;
  right: 0;
  left: 0;
  background: white;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transform: scale(0);
  /* Dynamic transform-origin set via v-bind (includes both X and Y) */
  transform-origin: v-bind(chevronX);
  transition: max-height 0.5s ease-out, opacity 0.5s ease-out,
    transform 0.5s ease-out, padding 0.5s ease-out, visibility 0s linear 0.5s;
  z-index: 1039;
  padding: 0;
  box-shadow: none;
  border-bottom: none;
  visibility: hidden;
  will-change: transform, opacity;

  /* Restrict width on md+ breakpoints */
  @include media-breakpoint-up(md) {
    left: auto;
    right: 12px;
    max-width: 400px;
    border-radius: 0 0 8px 8px;
  }

  &--expanded {
    max-height: 220px;
    opacity: 1;
    transform: scale(1);
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-bottom: 1px solid $color-gray--light;
    visibility: visible;
    transition: max-height 0.5s ease-out, opacity 0.5s ease-out,
      transform 0.5s ease-out, padding 0.5s ease-out, visibility 0s linear 0s;
  }
}

.profile-card-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid $color-gray--lighter;
  margin-bottom: 10px;
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

.supporter-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #ffd700, #ffb800);
  border: 2px solid white;
  border-radius: 50%;
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
}

.action-icon {
  font-size: 1rem;
  margin-bottom: 2px;
}

:deep(.badge) {
  font-size: 0.6em;
}
</style>
