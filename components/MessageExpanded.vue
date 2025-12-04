<template>
  <div
    v-if="message"
    class="message-expanded-wrapper"
    :class="{ 'in-modal': inModal }"
  >
    <div
      ref="containerRef"
      class="message-expanded-mobile"
      :class="{ stickyAdRendered }"
    >
      <!-- Hide the default navbar by teleporting an empty replacement -->
      <Teleport to="#navbar-mobile">
        <div class="hidden-navbar" />
      </Teleport>

      <!-- Photo Area with Ken Burns animation -->
      <div class="photo-area" @click="showPhotosModal">
        <!-- Back button on photo -->
        <button class="back-button" @click.stop="goBack">
          <v-icon icon="arrow-left" />
        </button>

        <!-- Status overlay images -->
        <b-img
          v-if="message.successful"
          lazy
          src="/freegled.jpg"
          class="status-overlay-image"
          :alt="successfulText"
        />
        <b-img
          v-else-if="message.promised"
          lazy
          src="/promised.jpg"
          class="status-overlay-image"
          alt="Promised"
        />
        <!-- Thumbnail carousel for multiple photos -->
        <div
          v-if="attachmentCount > 1"
          ref="thumbnailsRef"
          class="thumbnail-carousel"
          @touchstart="onThumbnailTouchStart"
          @touchmove="onThumbnailTouchMove"
          @touchend="onThumbnailTouchEnd"
        >
          <div
            v-for="(attachment, index) in message.attachments"
            :key="attachment.id || index"
            class="thumbnail-item"
            :class="{ active: index === currentPhotoIndex }"
            @click.stop="handleThumbnailClick(index)"
          >
            <OurUploadedImage
              v-if="attachment.ouruid"
              :src="attachment.ouruid"
              :modifiers="attachment.externalmods"
              alt="Thumbnail"
              class="thumbnail-image"
              :width="80"
              :height="80"
            />
            <NuxtPicture
              v-else-if="attachment.externaluid"
              format="webp"
              provider="uploadcare"
              :src="attachment.externaluid"
              :modifiers="attachment.externalmods"
              alt="Thumbnail"
              class="thumbnail-image"
              :width="80"
              :height="80"
            />
            <ProxyImage
              v-else-if="attachment.path"
              class-name="thumbnail-image"
              alt="Thumbnail"
              :src="attachment.path"
              :width="80"
              :height="80"
              fit="cover"
            />
          </div>
        </div>

        <!-- Actual photo or placeholder -->
        <div
          v-if="gotAttachments"
          class="photo-container"
          :class="{ 'ken-burns': !prefersReducedMotion }"
        >
          <OurUploadedImage
            v-if="currentAttachment?.ouruid"
            :src="currentAttachment.ouruid"
            :modifiers="currentAttachment.externalmods"
            alt="Item Photo"
            class="photo-image"
            :width="640"
            :height="480"
          />
          <NuxtPicture
            v-else-if="currentAttachment?.externaluid"
            format="webp"
            provider="uploadcare"
            :src="currentAttachment.externaluid"
            :modifiers="currentAttachment.externalmods"
            alt="Item Photo"
            class="photo-image"
            :width="640"
            :height="480"
          />
          <ProxyImage
            v-else-if="currentAttachment?.path"
            class-name="photo-image"
            alt="Item picture"
            :src="currentAttachment.path"
            :width="640"
            :height="480"
            fit="cover"
          />
        </div>

        <!-- No photo - show placeholder -->
        <div v-else class="photo-container">
          <MessagePhotoPlaceholder
            :placeholder-class="placeholderClass"
            :icon="categoryIcon"
          />
        </div>

        <!-- Poster overlay on photo (shown on shorter screens) -->
        <NuxtLink
          v-if="poster"
          :to="posterProfileUrl"
          class="poster-overlay"
          :class="{ 'poster-overlay--below-carousel': attachmentCount > 1 }"
          @click.stop
        >
          <div class="poster-overlay-avatar-wrapper">
            <ProfileImage
              :image="poster.profile?.paththumb"
              :externaluid="poster.profile?.externaluid"
              :ouruid="poster.profile?.ouruid"
              :externalmods="poster.profile?.externalmods"
              :name="poster.displayname"
              class="poster-overlay-avatar"
              is-thumbnail
              size="sm"
            />
            <div v-if="poster.supporter" class="supporter-badge-small">
              <v-icon icon="trophy" />
            </div>
          </div>
          <div class="poster-overlay-info">
            <span class="poster-overlay-name">{{ poster.displayname }}</span>
            <div class="poster-overlay-stats">
              <span v-if="poster.info?.offers" class="poster-overlay-stat">
                <v-icon icon="gift" />{{ poster.info.offers }}
              </span>
              <span v-if="poster.info?.wanteds" class="poster-overlay-stat">
                <v-icon icon="search" />{{ poster.info.wanteds }}
              </span>
            </div>
          </div>
          <v-icon icon="chevron-right" class="poster-overlay-chevron" />
        </NuxtLink>

        <!-- Title overlay at bottom of photo - matches summary layout -->
        <div class="title-overlay">
          <div class="info-row">
            <MessageTag :id="id" :inline="true" class="title-tag ps-1 pe-1" />
            <div class="info-icons">
              <span
                v-if="distanceText"
                class="location"
                @click.stop="showMapModal = true"
              >
                <v-icon icon="map-marker-alt" />{{ distanceText }}
              </span>
              <span
                v-b-tooltip.click.blur="{
                  title: fullTimeAgo,
                  customClass: 'mobile-tooltip',
                }"
                class="time"
                @click.stop
              >
                <v-icon icon="clock" />{{ timeAgo }}
              </span>
              <span
                v-b-tooltip.click.blur="{
                  title: replyTooltip,
                  customClass: 'mobile-tooltip',
                }"
                class="replies"
                @click.stop
              >
                <v-icon icon="comments" />{{ replyCount }}
              </span>
              <span
                v-if="message.deliverypossible && isOffer"
                v-b-tooltip.click.blur="{
                  title: `Delivery may be possible - you can ask, but don't assume it will be`,
                  customClass: 'mobile-tooltip',
                }"
                class="delivery"
                @click.stop
              >
                <v-icon icon="truck" />?
              </span>
              <span
                v-if="message.deadline"
                v-b-tooltip.click.blur="{
                  title: deadlineTooltip,
                  customClass: 'mobile-tooltip',
                }"
                class="deadline"
                @click.stop
              >
                <v-icon icon="hourglass-end" />Ends {{ formattedDeadline }}
              </span>
            </div>
          </div>
          <div class="title-row">
            <span class="title-subject">{{ subjectItemName }}</span>
          </div>
          <div v-if="subjectLocation" class="title-location">
            {{ subjectLocation }}
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="info-section">
        <!-- Description -->
        <div class="description-section">
          <div class="section-header">
            <span class="section-header-text">DESCRIPTION</span>
            <NuxtLink
              :to="'/message/' + id"
              class="section-id-link"
              @click.stop
            >
              #{{ id }}
            </NuxtLink>
          </div>
          <div class="description-content">
            <MessageTextBody :id="id" />
          </div>
        </div>

        <!-- Posted by divider and section (shown on taller screens, after description) -->
        <div v-if="poster" class="section-header section-header--poster">
          <span class="section-header-text">POSTED BY</span>
          <NuxtLink :to="posterProfileUrl" class="section-id-link" @click.stop>
            #{{ poster.id }}
          </NuxtLink>
        </div>
        <NuxtLink
          v-if="poster"
          :to="posterProfileUrl"
          class="poster-section-wrapper"
          @click.stop
        >
          <div class="poster-avatar-wrapper">
            <ProfileImage
              :image="poster.profile?.paththumb"
              :externaluid="poster.profile?.externaluid"
              :ouruid="poster.profile?.ouruid"
              :externalmods="poster.profile?.externalmods"
              :name="poster.displayname"
              class="poster-avatar"
              is-thumbnail
              size="lg"
            />
            <div v-if="poster.supporter" class="supporter-badge">
              <v-icon icon="trophy" />
            </div>
          </div>
          <div class="poster-details">
            <span class="poster-name">{{ poster.displayname }}</span>
            <div class="poster-stats">
              <span v-if="poster.info?.offers" class="poster-stat">
                <v-icon icon="gift" />{{ poster.info.offers
                }}<span class="poster-stat-label">OFFERs</span>
              </span>
              <span v-if="poster.info?.wanteds" class="poster-stat">
                <v-icon icon="search" />{{ poster.info.wanteds
                }}<span class="poster-stat-label">WANTEDs</span>
              </span>
              <span v-if="poster.info?.replies" class="poster-stat">
                <v-icon icon="envelope" />{{ poster.info.replies
                }}<span class="poster-stat-label">replies</span>
              </span>
            </div>
            <div v-if="posterAboutMe" class="poster-aboutme">
              {{ posterAboutMe }}
            </div>
          </div>
          <UserRatings
            v-if="poster.id"
            :id="poster.id"
            size="md"
            :disabled="fromme"
            class="poster-ratings"
            @click.stop.prevent
          />
          <v-icon icon="chevron-right" class="poster-chevron" />
        </NuxtLink>
      </div>
    </div>

    <!-- Fixed footer with Reply button - outside scrollable container for Safari compatibility -->
    <div
      class="app-footer"
      :class="{ expanded: replyExpanded, stickyAdRendered }"
    >
      <div v-if="!replyExpanded" class="w-100">
        <!-- Promised notice -->
        <div
          v-if="message.promised && !message.successful && replyable && !fromme"
          class="promised-notice mb-2"
        >
          <v-icon icon="handshake" />
          {{ message.promisedtome ? 'Promised to you' : 'Already promised' }}
        </div>
        <div
          v-if="replyable && !replied && !message.successful"
          class="footer-buttons"
        >
          <b-button
            variant="secondary"
            size="lg"
            class="cancel-button"
            @click="goBack"
          >
            Cancel
          </b-button>
          <b-button
            v-if="!fromme"
            variant="primary"
            size="lg"
            class="reply-button"
            @click="expandReply"
          >
            Reply
          </b-button>
        </div>
        <b-alert
          v-else-if="replied"
          variant="info"
          :model-value="true"
          class="mb-0"
        >
          Message sent! Check your <nuxt-link to="/chats">Chats</nuxt-link>.
        </b-alert>
      </div>

      <!-- Expanded reply section -->
      <div v-else class="reply-expanded-section">
        <NoticeMessage
          v-if="message.promised && !message.promisedtome"
          variant="warning"
          class="mb-2"
        >
          Already promised - you might not get it.
        </NoticeMessage>
        <client-only>
          <MessageReplySection
            :id="id"
            @close="replyExpanded = false"
            @sent="sent"
          />
        </client-only>
      </div>
    </div>

    <!-- Map Modal - Full Screen -->
    <Teleport v-if="showMapModal" to="body">
      <div class="fullscreen-map-viewer">
        <button class="map-back-button" @click="showMapModal = false">
          <v-icon icon="arrow-left" />
        </button>
        <client-only>
          <MessageMap
            v-if="validPosition"
            :home="home"
            :position="{ lat: message.lat, lng: message.lng }"
            class="fullscreen-map"
          />
        </client-only>
        <div class="map-hint">
          <v-icon icon="info-circle" /> Approximate location shown
        </div>
      </div>
    </Teleport>

    <!-- Photos Modal -->
    <MessagePhotosModal
      v-if="showMessagePhotosModal && attachmentCount"
      :id="message.id"
      @hidden="showMessagePhotosModal = false"
    />
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
} from 'vue'
import { useRouter } from 'vue-router'
import { useMiscStore } from '~/stores/misc'
import { useMe } from '~/composables/useMe'
import { useMessageDisplay } from '~/composables/useMessageDisplay'
import MessageTextBody from '~/components/MessageTextBody'
import MessageTag from '~/components/MessageTag'
import NoticeMessage from '~/components/NoticeMessage'
import MessageReplySection from '~/components/MessageReplySection'
import ProfileImage from '~/components/ProfileImage'
import UserRatings from '~/components/UserRatings'
import { useModalHistory } from '~/composables/useModalHistory'

const MessageMap = defineAsyncComponent(() => import('~/components/MessageMap'))
const MessagePhotosModal = defineAsyncComponent(() =>
  import('~/components/MessagePhotosModal')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  replyable: {
    type: Boolean,
    default: true,
  },
  hideClose: {
    type: Boolean,
    default: false,
  },
  actions: {
    type: Boolean,
    default: true,
  },
  isModal: {
    type: Boolean,
    default: false,
  },
  inModal: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['zoom', 'close'])

const router = useRouter()
const miscStore = useMiscStore()
const { me } = useMe()

// Use shared composable for common message display logic
const {
  message,
  subjectItemName,
  subjectLocation,
  fromme,
  gotAttachments,
  attachmentCount,
  timeAgo,
  fullTimeAgo,
  distanceText,
  replyCount,
  replyTooltip,
  isOffer,
  formattedDeadline,
  deadlineTooltip,
  successfulText,
  placeholderClass,
  categoryIcon,
  poster,
  posterProfileUrl,
} = useMessageDisplay(props.id)

const stickyAdRendered = computed(() => miscStore.stickyAdRendered)

// State
const replied = ref(false)
const replyExpanded = ref(false)
const showMapModal = ref(false)
const showMessagePhotosModal = ref(false)
const currentPhotoIndex = ref(0)
const containerRef = ref(null)
const thumbnailsRef = ref(null)
const thumbnailTouchStartX = ref(0)
const thumbnailScrollStart = ref(0)
let thumbnailScrollInterval = null

// Computed (additional to composable)
const currentAttachment = computed(() => {
  return message.value?.attachments?.[currentPhotoIndex.value]
})

const validPosition = computed(() => {
  return message.value?.lat || message.value?.lng
})

const home = computed(() => {
  if (me.value?.lat || me.value?.lng) {
    return { lat: me.value.lat, lng: me.value.lng }
  }
  return null
})

const prefersReducedMotion = computed(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

const posterAboutMe = computed(() => {
  const text = poster.value?.aboutme?.text
  if (!text) return null
  return text
})

// Methods
function goBack() {
  if (props.isModal) {
    // When used as a modal overlay, emit close to parent
    emit('close')
  } else {
    // When used as a standalone page, navigate back
    router.back()
  }
}

function showPhotosModal() {
  if (gotAttachments.value) {
    showMessagePhotosModal.value = true
    emit('zoom')
  }
}

function selectPhoto(index) {
  currentPhotoIndex.value = index
}

function handleThumbnailClick(index) {
  if (index === currentPhotoIndex.value) {
    // Clicking the already selected thumbnail opens the photo viewer
    showPhotosModal()
  } else {
    selectPhoto(index)
  }
}

function onThumbnailTouchStart(e) {
  thumbnailTouchStartX.value = e.touches[0].clientX
  thumbnailScrollStart.value = thumbnailsRef.value?.scrollLeft || 0
}

function onThumbnailTouchMove(e) {
  if (!thumbnailsRef.value) return
  const deltaX = thumbnailTouchStartX.value - e.touches[0].clientX
  thumbnailsRef.value.scrollLeft = thumbnailScrollStart.value + deltaX
}

function onThumbnailTouchEnd() {
  // Swipe complete, scroll position is already set
}

function startThumbnailAutoScroll() {
  if (!thumbnailsRef.value || attachmentCount.value <= 1) return

  // Wait a moment then scroll right slowly, then back
  setTimeout(() => {
    if (!thumbnailsRef.value) return
    const maxScroll =
      thumbnailsRef.value.scrollWidth - thumbnailsRef.value.clientWidth
    if (maxScroll <= 0) return

    // Animate scroll manually for smoother control
    const duration = 2000 // 2 seconds to scroll
    const startTime = performance.now()
    const startPos = 0

    function animateScroll(currentTime) {
      if (!thumbnailsRef.value) return
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease in-out
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2
      thumbnailsRef.value.scrollLeft = startPos + maxScroll * eased

      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      } else {
        // Pause then scroll back
        setTimeout(() => {
          if (!thumbnailsRef.value) return
          const backStartTime = performance.now()
          function animateBack(currentTime) {
            if (!thumbnailsRef.value) return
            const elapsed = currentTime - backStartTime
            const progress = Math.min(elapsed / duration, 1)
            const eased =
              progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2
            thumbnailsRef.value.scrollLeft = maxScroll - maxScroll * eased
            if (progress < 1) {
              requestAnimationFrame(animateBack)
            }
          }
          requestAnimationFrame(animateBack)
        }, 1000)
      }
    }
    requestAnimationFrame(animateScroll)
  }, 1000)
}

function stopThumbnailAutoScroll() {
  if (thumbnailScrollInterval) {
    clearInterval(thumbnailScrollInterval)
    thumbnailScrollInterval = null
  }
}

function expandReply() {
  console.log(
    'DEBUG expandReply called, replyable:',
    props.replyable,
    'replied:',
    replied.value,
    'fromme:',
    fromme.value
  )
  replyExpanded.value = true
}

function sent() {
  replyExpanded.value = false
  replied.value = true
  // When used as modal, close after a brief delay so user sees confirmation
  if (props.isModal) {
    setTimeout(() => {
      emit('close')
    }, 1500)
  }
}

// Handle browser back button/swipe when used as modal
useModalHistory(`message-${props.id}`, () => emit('close'), props.isModal)

onMounted(() => {
  // Start auto-scroll hint for thumbnail carousel
  startThumbnailAutoScroll()
})

onUnmounted(() => {
  stopThumbnailAutoScroll()
})
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/sticky-banner.scss';
@import 'assets/css/_color-vars.scss';

.message-expanded-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  /* When inside a b-modal, disable fixed positioning */
  &.in-modal {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    bottom: auto;
    z-index: auto;
  }
}

.message-expanded-mobile {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 80px;
  background: $color-white;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1000;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &.stickyAdRendered {
    bottom: calc(80px + $sticky-banner-height-mobile);

    @media (min-height: $mobile-tall) {
      bottom: calc(80px + $sticky-banner-height-mobile-tall);
    }
  }

  /* When inside a b-modal, disable fixed positioning */
  .in-modal & {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    bottom: auto;
    z-index: auto;
    max-height: 70vh;

    &.stickyAdRendered {
      bottom: auto;
    }
  }
}

// Photo Area - fixed height, scrollable with content
.photo-area {
  position: relative;
  width: 100%;
  flex: 0 0 auto;
  height: 50vh;
  min-height: 200px;
  overflow: hidden;
  background: $color-gray--lighter;
  cursor: pointer;
}

// Photo container - positioned to fill photo-area
.photo-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
}

// All image elements fill container
.photo-container :deep(picture),
.photo-container :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

// Ken Burns animation is in unscoped style block at end of file

// Stats pills inside title overlay
.stats-pills {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 0.5rem;
}

.pills-left {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.pills-right {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  background: $color-white-opacity-25;
  color: $color-white;
  padding: 0.15rem 0.4rem;
  border-radius: 1rem;
  font-size: 0.7rem;

  &.clickable {
    cursor: pointer;
    background: $color-blue--bright;
  }
}

.delivery-maybe {
  font-weight: bold;
  font-size: 0.8rem;
  margin-left: -0.1rem;
}

// Status overlay image (promised/freegled)
.status-overlay-image {
  position: absolute;
  z-index: 10;
  transform: rotate(15deg);
  top: 50%;
  left: 50%;
  width: 50%;
  max-width: 200px;
  margin-left: -25%;
  margin-top: -15%;
  pointer-events: none;
}

// Thumbnail carousel at top of photo area
.thumbnail-carousel {
  position: absolute;
  top: 1rem; // Same as back button
  transform: translateY(
    calc((40px - 50px) / 2)
  ); // Center 50px thumbnails with 40px button
  left: 50px; // Closer to back button, fade handles overlap
  right: 1rem;
  z-index: 11;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 4px;
  padding-left: 15px;
  mask-image: linear-gradient(to right, transparent 0%, black 15px);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15px);

  &::-webkit-scrollbar {
    display: none;
  }
}

.thumbnail-item {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid $color-white-opacity-50;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;

  &.active {
    border-color: $color-white;
    transform: scale(1.1);
  }

  &:not(.active):hover {
    border-color: $color-white-opacity-80;
  }
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// Back button on photo
.back-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: $color-black-opacity-50;
  border: none;
  color: $color-white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 12;
  font-size: 1.2rem;

  &:hover {
    background: $color-black-opacity-70;
  }
}

// Title overlay at bottom - more eye-catching
.title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem 1rem 0.75rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.92) 0%,
    rgba(0, 0, 0, 0.9) 8%,
    rgba(0, 0, 0, 0.86) 16%,
    rgba(0, 0, 0, 0.8) 24%,
    rgba(0, 0, 0, 0.7) 32%,
    rgba(0, 0, 0, 0.58) 42%,
    rgba(0, 0, 0, 0.44) 52%,
    rgba(0, 0, 0, 0.3) 62%,
    rgba(0, 0, 0, 0.18) 72%,
    rgba(0, 0, 0, 0.1) 82%,
    rgba(0, 0, 0, 0.04) 92%,
    rgba(0, 0, 0, 0) 100%
  );
  color: $color-white;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.info-icons {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;

  @include media-breakpoint-up(md) {
    gap: 0.5rem;
    font-size: 0.85rem;
  }
}

.location,
.time,
.replies,
.delivery,
.deadline {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background: $color-black-opacity-50;
  padding: 0.15rem 0.4rem;
  backdrop-filter: blur(4px);
}

.location {
  cursor: pointer;
}

.title-row {
  width: 100%;
  min-width: 0;
}

.title-tag {
  font-size: 0.9rem !important;
  white-space: nowrap !important;
  flex-shrink: 0;

  @include media-breakpoint-up(md) {
    font-size: 1rem !important;
  }
}

.title-subject {
  display: block;
  width: 100%;
  font-size: clamp(1rem, 4vw, 1.25rem);
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);

  @include media-breakpoint-up(md) {
    font-size: clamp(1.25rem, 3.5vw, 1.75rem);
  }
}

.title-location {
  font-size: 0.85rem;
  opacity: 0.85;
  margin-top: 0.15rem;

  @include media-breakpoint-up(md) {
    font-size: 1rem;
  }
}

.photo-counter {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: $color-black-opacity-60;
  color: $color-white;
  padding: 0.25rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  z-index: 11;
}

// Info Section - natural height, scrolls with main container
.info-section {
  flex: 0 0 auto;
  padding: 1rem;
}

// Poster overlay on photo (shown on shorter screens)
.poster-overlay {
  display: none;
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: $color-white-opacity-95;
  backdrop-filter: blur(8px);
  color: $color-gray--darker;
  padding: 0.4rem 0.6rem;
  z-index: 11;
  text-decoration: none;
  max-width: 60%;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px $color-black-opacity-15;
  border: 1px solid $color-gray-3;

  &:hover {
    background: $color-white;
    color: $color-gray--darker;
    text-decoration: none;
  }

  &--below-carousel {
    top: 75px;
  }

  @media (max-height: 700px) {
    display: flex;
  }
}

.poster-overlay-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.poster-overlay-avatar {
  :deep(.ProfileImage__container) {
    width: 28px !important;
    height: 28px !important;
  }
}

.supporter-badge-small {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: gold;
  color: $color-white;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid $color-white;
  font-size: 0.45rem;
}

.poster-overlay-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.poster-overlay-name {
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poster-overlay-stats {
  display: flex;
  gap: 0.5rem;
  font-size: 0.65rem;
  color: $color-gray--dark;
}

.poster-overlay-stat {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}

.poster-overlay-chevron {
  flex-shrink: 0;
  color: $color-gray--dark;
  font-size: 0.9rem;
  margin-left: auto;
}

/* Section header with label on left, ID link on right */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid $color-gray-3;
  padding-bottom: 0.25rem;

  /* POSTED BY header hides on short screens where overlay is shown */
  &--poster {
    @media (max-height: 700px) {
      display: none;
    }
  }
}

.section-header-text {
  font-size: 0.7rem;
  font-weight: 600;
  color: $color-gray--base;
  letter-spacing: 0.1em;
}

.section-id-link {
  font-size: 0.7rem;
  font-weight: 500;
  color: $color-gray--base;
  text-decoration: none;

  &:hover {
    color: $color-gray--dark;
    text-decoration: underline;
  }
}

/* Poster section wrapper - now a link for tablet layout with ratings */
.poster-section-wrapper {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-top: 0.5rem;
  text-decoration: none;
  color: inherit;
  background: $colour-info-bg;
  border-left: 3px solid $colour-info-fg;

  &:hover {
    text-decoration: none;
    color: inherit;
    background: darken($colour-info-bg, 3%);
  }

  /* Hide on short screens where overlay is shown */
  @media (max-height: 700px) {
    display: none;
  }

  /* Very narrow screens: stack vertically */
  @media (max-width: 320px) {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Poster aboutme - hidden on mobile, shown on tablet */
.poster-aboutme {
  display: none;
  font-size: 0.85rem;
  line-height: 1.5;
  color: $color-gray--darker;
  margin-top: 0.5rem;
  font-style: italic;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &::before {
    content: '"';
  }

  &::after {
    content: '"';
  }

  @include media-breakpoint-up(md) {
    display: -webkit-box;
  }
}

/* Poster ratings - hidden on mobile, shown on tablet */
.poster-ratings {
  display: none !important;
  flex-shrink: 0;

  @include media-breakpoint-up(md) {
    display: flex !important;
  }
}

.poster-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.poster-avatar {
  :deep(.ProfileImage__container) {
    width: 48px !important;
    height: 48px !important;
  }
}

.supporter-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: gold;
  color: $color-white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid $color-white;
  font-size: 0.6rem;
}

.poster-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  overflow: hidden;
}

.poster-name {
  font-size: 1rem;
  font-weight: 600;
  color: $color-gray--darker;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poster-stats {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: $color-gray--dark;
}

.poster-distance,
.poster-stat {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.poster-stat-label {
  display: none;
  margin-left: 0.15rem;

  @include media-breakpoint-up(md) {
    display: inline;
  }
}

.poster-chevron {
  flex-shrink: 0;
  align-self: center;
  color: $color-gray--dark;
  font-size: 1.25rem;
  padding: 0.5rem;
  margin-right: -0.5rem;
}

// Description
.description-section {
  margin-bottom: 1rem;
}

.description-content {
  background: $color-gray-3;
  border-left: 3px solid $color-green--darker;
  padding: 1rem;
  border-radius: 0 8px 8px 0;
  font-size: 1rem;
  line-height: 1.7;
  color: $color-gray--darker;
}

.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  border-top: 1px solid $color-gray-3;
  background: $color-white;
  z-index: 1100;

  &.stickyAdRendered {
    bottom: $sticky-banner-height-mobile;

    @media (min-height: $mobile-tall) {
      bottom: $sticky-banner-height-mobile-tall;
    }
  }

  /* When inside a b-modal, disable fixed positioning */
  .in-modal & {
    position: relative;
    bottom: auto;
    left: auto;
    right: auto;
    z-index: auto;

    &.stickyAdRendered {
      bottom: auto;
    }
  }
}

.footer-buttons {
  display: flex;
  gap: 0.75rem;
  width: 100%;

  .cancel-button,
  .reply-button {
    flex: 1;
    width: auto !important;
    display: flex !important;
    justify-content: center;
  }

  /* Mobile: only Reply button visible, full width */
  @media (max-width: 767.98px) {
    .cancel-button {
      display: none !important;
    }

    .reply-button {
      width: 100% !important;
    }
  }
}

/* When only Cancel button is shown (own posts), full width */
.footer-buttons:has(.cancel-button:only-child) .cancel-button {
  flex: 1;
  width: 100% !important;
}

.reply-expanded-section {
  max-height: 70vh;
  overflow-y: auto;
}

.promised-notice {
  text-align: center;
  color: $color-orange--dark;
  font-size: 0.85rem;
  font-weight: 500;
}

// Fullscreen map viewer
.fullscreen-map-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $color-gray--lighter;
  z-index: 10000;
  display: flex;
  flex-direction: column;
}

.map-back-button {
  position: absolute;
  top: env(safe-area-inset-top, 0);
  left: 0;
  margin: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: $color-white-opacity-95;
  border: none;
  color: $color-gray--darker;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10001;
  font-size: 1.25rem;
  box-shadow: 0 2px 8px $color-black-opacity-20;

  &:active {
    background: $color-white;
  }
}

.fullscreen-map {
  flex: 1;
  width: 100%;
  height: 100% !important;

  :deep(.leaflet-container) {
    height: 100% !important;
  }
}

.map-hint {
  position: absolute;
  bottom: env(safe-area-inset-bottom, 0);
  left: 0;
  right: 0;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: $color-white-opacity-90;
  color: $color-gray--dark;
  font-size: 0.85rem;
  text-align: center;
  margin-left: 1rem;
  margin-right: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px $color-black-opacity-10;
}
</style>

<!-- Unscoped styles for Ken Burns - scoped :deep() doesn't penetrate NuxtPicture -->
<style lang="scss">
// Ken Burns effect - slow pan and zoom
@keyframes kenburns {
  0% {
    transform: scale(1.15) translate(0%, 3%);
  }
  25% {
    transform: scale(1.15) translate(-3%, 0%);
  }
  50% {
    transform: scale(1.15) translate(0%, -3%);
  }
  75% {
    transform: scale(1.15) translate(3%, 0%);
  }
  100% {
    transform: scale(1.15) translate(0%, 3%);
  }
}

.photo-container.ken-burns img {
  animation: kenburns 20s ease-in-out infinite;
  will-change: transform;
  transform-origin: center center;
}

@media (prefers-reduced-motion: reduce) {
  .photo-container.ken-burns img {
    animation: none !important;
  }
}
</style>
