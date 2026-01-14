<template>
  <div v-if="user" class="profile-mobile">
    <!-- Hero Section -->
    <div class="hero-section">
      <!-- Profile Image -->
      <div class="profile-image-container">
        <ProfileImage
          :image="user.profile?.path"
          :name="user.displayname"
          class="profile-image"
          is-thumbnail
          size="xl"
        />
        <div v-if="user.supporter" class="supporter-badge">
          <v-icon icon="heart" />
        </div>
      </div>

      <!-- User Name -->
      <h1 class="user-name">{{ user.displayname }}</h1>
      <nuxt-link v-if="mod" :to="`/profile/${id}`" class="member-id"
        >#{{ id }}</nuxt-link
      >

      <!-- Freegler Since -->
      <div class="member-since">
        Freegler since {{ dateonly(user.added) }}
        <span v-if="user?.showmod" class="volunteer-badge">
          <v-icon icon="leaf" /> Volunteer
        </span>
      </div>

      <!-- Location -->
      <div v-if="locationName" class="location-line">
        {{ locationName }}
      </div>

      <!-- Distance and reply time -->
      <div class="info-pills">
        <span v-if="milesaway" class="info-pill">
          <v-icon icon="map-marker-alt" /> {{ milesaway }}
        </span>
        <span v-if="replyTimeText" class="info-pill">
          <v-icon icon="clock" /> {{ replyTimeText }}
        </span>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-value">{{ user.info?.offers || 0 }}</span>
          <span class="stat-label">OFFERs</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <span class="stat-value">{{ user.info?.wanteds || 0 }}</span>
          <span class="stat-label">WANTEDs</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <span class="stat-value">{{ user.info?.collected || 0 }}</span>
          <span class="stat-label">Collected</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <UserRatings :id="id" size="md" :disabled="!myid" class="ratings" />
        <ChatButton
          v-if="myid && id !== myid"
          :userid="id"
          size="md"
          title="Message"
          variant="primary"
          class="message-btn"
        />
      </div>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <!-- Supporter Notice -->
      <div v-if="user.supporter" class="supporter-notice">
        <v-icon icon="heart" />
        <span>Kindly supports Freegle with donations of time or money</span>
      </div>

      <!-- About Me -->
      <div v-if="aboutme" class="about-section">
        <div class="section-label">ABOUT ME</div>
        <blockquote class="about-quote">"{{ aboutme }}"</blockquote>
      </div>

      <!-- Expected replies warning -->
      <div v-if="user.expectedreplies" class="expected-replies-warning">
        <v-icon icon="exclamation-triangle" />
        {{ expectedrepliesText }} still waiting for a reply
      </div>

      <!-- Active OFFERs -->
      <div class="posts-section">
        <div class="section-header">
          <v-icon icon="gift" class="section-icon offer" />
          <span>{{ activeOFFERCount }}</span>
        </div>
        <div v-if="activeOffers.length" class="posts-grid">
          <MessageList
            :messages-for-list="activeOffers"
            selected-type="Offer"
            :jobs="false"
          />
        </div>
        <div v-else class="no-posts">None at the moment</div>
      </div>

      <!-- Active WANTEDs -->
      <div class="posts-section">
        <div class="section-header">
          <v-icon icon="search" class="section-icon wanted" />
          <span>{{ activeWANTEDCount }}</span>
        </div>
        <div v-if="activeWanteds.length" class="posts-grid">
          <MessageList
            :messages-for-list="activeWanteds"
            selected-type="Wanted"
            :jobs="false"
          />
        </div>
        <div v-else class="no-posts">None at the moment</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import pluralize from 'pluralize'
import { computed, defineAsyncComponent } from 'vue'
import { useUserStore } from '~/stores/user'
import { milesAway } from '~/composables/useDistance'
import { useMessageStore } from '~/stores/message'
import { twem } from '~/composables/useTwem'
import { useMe } from '~/composables/useMe'
import { dateonly } from '~/composables/useTimeFormat'
import ProfileImage from '~/components/ProfileImage'
import UserRatings from '~/components/UserRatings'
import ChatButton from '~/components/ChatButton'

const MessageList = defineAsyncComponent(() =>
  import('~/components/MessageList.vue')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const userStore = useUserStore()
const messageStore = useMessageStore()
const { me, myid, mod } = useMe()

// Get active messages
const messages = await messageStore.fetchByUser(props.id, true, true)

// Load them into store
messages.forEach((message) => {
  messageStore.fetch(message.id)
})

// Get public location
await userStore.fetchPublicLocation(props.id)

const user = computed(() => {
  return props.id ? userStore?.byId(props.id) : null
})

const publicLocation = computed(() => {
  return props.id ? userStore?.publicLocationById(props.id) : null
})

function active(type) {
  const ret = []
  for (const message of messages) {
    if (message.type === type && !message.successful) {
      ret.push(message)
    }
  }
  return ret
}

const activeOffers = computed(() => active('Offer'))
const activeWanteds = computed(() => active('Wanted'))

const aboutme = computed(() => {
  return user.value?.aboutme ? twem(user.value.aboutme.text) : null
})

const expectedrepliesText = computed(() => {
  return pluralize('freegler', user.value?.expectedreplies, true)
})

const milesaway = computed(() => {
  const dist = milesAway(
    me.value?.lat,
    me.value?.lng,
    user.value?.lat,
    user.value?.lng
  )
  return dist ? pluralize('mile', dist, true) : null
})

const activeOFFERCount = computed(() => {
  return pluralize('active OFFER', activeOffers.value.length, true)
})

const activeWANTEDCount = computed(() => {
  return pluralize('active WANTED', activeWanteds.value.length, true)
})

// Location name for display
const locationName = computed(() => {
  if (!publicLocation.value) return null
  return publicLocation.value.location || publicLocation.value.groupname || null
})

// Compact reply time text for pill display
const replyTimeText = computed(() => {
  if (!user.value?.info?.replytime) return null
  const secs = user.value.info.replytime
  let time
  if (secs < 60) {
    time = Math.round(secs) + 's'
  } else if (secs < 60 * 60) {
    time = Math.round(secs / 60) + 'm'
  } else if (secs < 24 * 60 * 60) {
    time = Math.round(secs / 60 / 60) + 'h'
  } else {
    time = Math.round(secs / 60 / 60 / 24) + 'd'
  }
  return `Replies ~${time}`
})
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.profile-mobile {
  min-height: 100vh;
  background: $color-white;
  max-width: 800px;
  margin: 0 auto;
}

// Hero Section
.hero-section {
  background: $color-white;
  padding: 0.75rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  border-bottom: 1px solid $color-gray-3;
}

.profile-image-container {
  position: relative;
  margin-bottom: 0.5rem;
}

.profile-image {
  :deep(.ProfileImage__container) {
    width: 100px;
    height: 100px;
  }

  :deep(img),
  :deep(picture img) {
    width: 100px !important;
    height: 100px !important;
    min-width: 100px !important;
    min-height: 100px !important;
    max-width: 100px !important;
    max-height: 100px !important;
    border: 3px solid $color-gray-3 !important;
  }

  :deep(.generated-avatar) {
    width: 100px !important;
    height: 100px !important;
    border: 3px solid $color-gray-3 !important;
  }
}

.supporter-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: gold;
  color: $color-white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid $color-white;
  font-size: 0.85rem;
}

.user-name {
  color: $color-gray--darker;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
}

.member-id {
  font-size: 0.75rem;
  color: $color-gray--base;
  text-align: center;
  text-decoration: none;

  &:hover {
    color: $color-gray--dark;
    text-decoration: underline;
  }
}

.member-since {
  color: $color-gray--dark;
  font-size: 0.85rem;
  margin-top: 0.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.volunteer-badge {
  background: $colour-success;
  color: $color-white;
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
}

// Location line
.location-line {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: $color-gray--dark;
  margin-top: 0.25rem;
}

// Info Pills
.info-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.15rem;
  justify-content: center;
}

.info-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: $color-gray--dark;
}

// Stats Row
.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: $colour-success;
}

.stat-label {
  font-size: 0.7rem;
  color: $color-gray--dark;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: $color-gray-3;
}

// Action Buttons
.action-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.message-btn {
  :deep(.btn) {
    font-weight: 600;
  }
}

// Content Section
.content-section {
  padding: 1rem;
}

// Supporter Notice
.supporter-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fff8dc;
  border-left: 3px solid gold;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #8b7355;
}

// About Section
.about-section {
  margin-bottom: 1rem;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: $color-gray--dark;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.about-quote {
  background: $color-gray--lighter;
  border-left: 3px solid $colour-success;
  padding: 1rem;
  margin: 0;
  font-style: italic;
  color: $color-gray--darker;
  line-height: 1.5;
}

// Expected Replies Warning
.expected-replies-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fff3cd;
  border-left: 3px solid $colour-warning;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #856404;
}

// Posts Section
.posts-section {
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: $color-gray--lighter;
  font-weight: 600;
  color: $color-gray--darker;
}

.section-icon {
  &.offer {
    color: $colour-success;
  }

  &.wanted {
    color: $colour-secondary;
  }
}

.posts-grid {
  padding: 0.5rem;
}

.no-posts {
  padding: 1rem;
  text-align: center;
  color: $color-gray--dark;
  font-size: 0.9rem;
}
</style>
