<template>
  <div v-observe-visibility="visibilityChanged" class="my-message-mobile">
    <div v-if="visible && message?.id">
      <div
        v-if="showOld || !message.outcomes?.length"
        class="message-card"
        :data-message-id="message.id"
      >
        <!-- Rejected notice -->
        <notice-message v-if="rejected" class="mb-2" variant="warning">
          <v-icon icon="exclamation-triangle" /> This post has been returned to
          you. It is not public yet.
        </notice-message>

        <!-- Main content area with photo -->
        <div class="photo-section" @click="goToPost">
          <!-- Photo area -->
          <div class="photo-area">
            <!-- Status overlays -->
            <b-img
              v-if="taken || received"
              lazy
              src="/freegled.jpg"
              class="status-overlay"
              alt="Completed"
            />
            <!-- Promised banner at top -->
            <div
              v-else-if="message.promised && !message.outcomes?.length"
              class="promised-banner"
            >
              <div class="promised-banner-text">
                <v-icon icon="handshake" class="me-2" />
                Promised to&nbsp;<strong>{{ promisedToName }}</strong>
              </div>
              <button class="unpromise-btn" @click.stop="unpromise">
                Unpromise
              </button>
            </div>

            <!-- Photo -->
            <div v-if="hasPhoto" class="photo-container">
              <OurUploadedImage
                v-if="message.attachments[0]?.ouruid"
                :src="message.attachments[0].ouruid"
                :modifiers="message.attachments[0].externalmods"
                alt="Item Photo"
                class="photo-image"
                :width="400"
                :height="200"
              />
              <NuxtPicture
                v-else-if="message.attachments[0]?.externaluid"
                format="webp"
                provider="uploadcare"
                :src="message.attachments[0].externaluid"
                :modifiers="message.attachments[0].externalmods"
                alt="Item Photo"
                class="photo-image"
                :width="400"
                :height="200"
              />
              <ProxyImage
                v-else-if="message.attachments[0]?.path"
                class-name="photo-image"
                alt="Item picture"
                :src="message.attachments[0].path"
                :width="400"
                :height="200"
                fit="cover"
              />
            </div>

            <!-- No photo placeholder -->
            <div v-else class="no-photo-placeholder" :class="placeholderClass">
              <div class="placeholder-pattern"></div>
              <div class="icon-circle">
                <v-icon :icon="categoryIcon" class="placeholder-icon" />
              </div>
            </div>

            <!-- Title overlay -->
            <div class="title-overlay">
              <div class="title-row">
                <div class="title-content">
                  <MessageTag
                    :id="message.id"
                    :inline="true"
                    class="title-tag ps-1 pe-1"
                  />
                  <span class="title-subject">{{ strippedSubject }}</span>
                </div>
                <div class="photo-actions">
                  <button class="photo-action-btn" @click.stop="share">
                    <v-icon icon="share-alt" />
                  </button>
                </div>
              </div>
              <div v-if="message.area" class="info-row">
                <span class="location">
                  <v-icon icon="map-marker-alt" class="me-1" />{{
                    message.area
                  }}
                </span>
              </div>
              <div class="group-row">
                <nuxt-link
                  v-if="messageGroup"
                  :to="'/explore/' + messageGroup.nameshort"
                  class="group-link"
                  @click.stop
                >
                  {{ messageGroup.namedisplay }}
                </nuxt-link>
                <span
                  v-if="messageGroup && timeAgoExpanded"
                  class="group-time-separator"
                  >·</span
                >
                <span v-if="timeAgoExpanded" class="group-time"
                  >{{ timeAgoExpanded }} ago</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Action buttons - compact row -->
        <div v-if="!rejected" class="action-buttons">
          <div class="action-buttons-left">
            <button
              v-if="message.type === 'Offer' && !taken && !withdrawn"
              class="action-btn action-btn--primary"
              @click="outcome('Taken', $event)"
            >
              <v-icon icon="check" />
              <span>TAKEN</span>
            </button>
            <button
              v-if="message.type === 'Wanted' && !received && !withdrawn"
              class="action-btn action-btn--primary"
              @click="outcome('Received', $event)"
            >
              <v-icon icon="check" />
              <span>RECEIVED</span>
            </button>
            <button
              v-if="
                message.type === 'Offer' && !taken && !withdrawn && !isPromised
              "
              class="action-btn action-btn--secondary"
              @click="openPromiseModal"
            >
              <v-icon icon="handshake" />
              <span>Promise</span>
            </button>
            <button
              v-if="!taken && !received && !withdrawn"
              class="action-btn action-btn--light"
              @click="outcome('Withdrawn', $event)"
            >
              <v-icon icon="trash-alt" />
              <span>Withdraw</span>
            </button>
            <button
              v-if="message.canrepost && message.location && message.item"
              class="action-btn action-btn--light"
              @click="repost"
            >
              <v-icon icon="sync" />
              <span>Repost</span>
            </button>
          </div>
          <div class="action-buttons-right">
            <button
              v-if="!message.outcomes?.length"
              class="action-btn action-btn--light"
              @click="edit"
            >
              <v-icon icon="pen" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        <!-- Rejected actions -->
        <div v-else class="action-buttons">
          <button
            v-if="message.location && message.item"
            class="action-btn action-btn--warning"
            @click="repost"
          >
            <v-icon icon="pen" />
            <span>Edit & Resend</span>
          </button>
          <button
            v-if="!withdrawn"
            class="action-btn action-btn--light"
            @click="outcome('Withdrawn', $event)"
          >
            <v-icon icon="trash-alt" />
            <span>Withdraw</span>
          </button>
        </div>

        <!-- Replies section -->
        <div v-if="replies?.length > 0" class="replies-section">
          <div class="replies-header" @click="toggleExpanded">
            <div class="replies-avatars">
              <ProfileImage
                v-for="(reply, index) in repliesPreview"
                :key="'avatar-' + reply.userid"
                :image="getUserProfile(reply.userid)?.paththumb"
                :externaluid="getUserProfile(reply.userid)?.externaluid"
                :ouruid="getUserProfile(reply.userid)?.ouruid"
                :externalmods="getUserProfile(reply.userid)?.externalmods"
                :name="getUserName(reply.userid)"
                class="reply-avatar"
                :style="{ zIndex: index + 1 }"
                is-thumbnail
                size="sm"
              />
              <div v-if="replies.length > 3" class="more-count">
                +{{ replies.length - 3 }}
              </div>
            </div>
            <div class="replies-text">
              <span class="replies-count"
                >{{ replies.length }}
                {{ replies.length === 1 ? 'reply' : 'replies' }}</span
              >
              <v-icon
                :icon="expanded ? 'caret-up' : 'caret-down'"
                class="expand-icon"
              />
            </div>
          </div>

          <Transition name="replies-slide">
            <div v-if="expanded" class="replies-list">
              <MyMessageReply
                v-for="reply in replies"
                :key="'reply-' + reply.id"
                :reply="reply"
                :chats="chats"
                :message="message"
                :taken="taken"
                :received="received"
                :withdrawn="withdrawn"
                :closest="reply.userid === closestUser"
                :best="reply.userid === bestRatedUser"
                :quickest="reply.userid === quickestUser"
              />
            </div>
          </Transition>
        </div>
        <div v-else-if="willAutoRepost" class="no-replies">
          <p class="text-muted small">
            No replies yet. Will auto-repost {{ canrepostatago }}.
          </p>
        </div>
      </div>

      <!-- Modals -->
      <OutcomeModal
        v-if="showOutcomeModal"
        :id="id"
        :type="outcomeType"
        @outcome="bump++"
        @hidden="showOutcomeModal = false"
      />
      <MessageShareModal
        v-if="showShareModal"
        :id="message.id"
        @hidden="showShareModal = false"
      />
      <MessageEditModal v-if="showEditModal" :id="id" @hidden="hidden" />
      <PromiseModal
        v-if="showPromiseModal"
        :messages="[message]"
        :selected-message="message.id"
        :users="replyusers"
        @hidden="showPromiseModal = false"
      />
      <RenegeModal
        v-if="showRenegeModal && promisedTo.length > 0"
        :messages="[message.id]"
        :selected-message="message.id"
        :users="promisedToUsers"
        :selected-user="promisedTo[0]?.id"
        @hidden="showRenegeModal = false"
      />
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { useComposeStore } from '~/stores/compose'
import { useMessageStore } from '~/stores/message'
import { useChatStore } from '~/stores/chat'
import { useUserStore } from '~/stores/user'
import { useTrystStore } from '~/stores/tryst'
import { useLocationStore } from '~/stores/location'
import { useGroupStore } from '~/stores/group'
import { timeago } from '~/composables/useTimeFormat'
import { milesAway } from '~/composables/useDistance'
import { onMounted, ref, computed, watch, useRouter, toRef } from '#imports'
import { useMe } from '~/composables/useMe'
import { useMessageDisplay } from '~/composables/useMessageDisplay'
import ProfileImage from '~/components/ProfileImage'
import MessageTag from '~/components/MessageTag'
import OurUploadedImage from '~/components/OurUploadedImage'

const MyMessageReply = defineAsyncComponent(() =>
  import('./MyMessageReply.vue')
)
const MessageShareModal = defineAsyncComponent(() =>
  import('./MessageShareModal')
)
const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
)
const PromiseModal = defineAsyncComponent(() =>
  import('~/components/PromiseModal')
)
const OutcomeModal = defineAsyncComponent(() => import('./OutcomeModal'))
const MessageEditModal = defineAsyncComponent(() =>
  import('./MessageEditModal')
)
const RenegeModal = defineAsyncComponent(() => import('./RenegeModal'))

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  showOld: {
    type: Boolean,
    required: true,
  },
  expand: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const messageStore = useMessageStore()
const chatStore = useChatStore()
const userStore = useUserStore()
const trystStore = useTrystStore()
const composeStore = useComposeStore()
const locationStore = useLocationStore()
const groupStore = useGroupStore()
const router = useRouter()
const { me } = useMe()

// Use shared display composable
const idRef = toRef(props, 'id')
const {
  message,
  strippedSubject,
  gotAttachments: hasPhoto,
  timeAgoExpanded,
  placeholderClass,
  categoryIcon,
} = useMessageDisplay(idRef)

// Data properties
const visible = ref(false)
const expanded = ref(false)
const showOutcomeModal = ref(false)
const outcomeType = ref(null)
const showEditModal = ref(false)
const showShareModal = ref(false)
const showPromiseModal = ref(false)
const showRenegeModal = ref(false)
const bump = ref(0)

// Computed
const hasOutcome = (val) => {
  if (message.value?.outcomes?.length) {
    return message.value.outcomes.some((o) => o.outcome === val)
  }
  return false
}

const taken = computed(() => hasOutcome('Taken'))
const received = computed(() => hasOutcome('Received'))
const withdrawn = computed(() => hasOutcome('Withdrawn'))

const rejected = computed(() => {
  if (message.value?.groups) {
    return message.value.groups.some((g) => g.collection === 'Rejected')
  }
  return false
})

const replies = computed(() => {
  if (message.value?.replies) {
    const promisedUserIds = new Set(
      (message.value.promises || []).map((p) => p.userid)
    )
    return [...message.value.replies].sort((a, b) => {
      // Promised users come first
      const aPromised = promisedUserIds.has(a.userid)
      const bPromised = promisedUserIds.has(b.userid)
      if (aPromised && !bPromised) return -1
      if (!aPromised && bPromised) return 1
      // Then sort by date (most recent first)
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }
  return []
})

const repliesPreview = computed(() => {
  return replies.value.slice(0, 3)
})

const replyuserids = computed(() => {
  const ret = []
  const seen = {}

  // First add users who sent "Interested" replies to this post
  if (message.value?.replies) {
    for (const reply of message.value.replies) {
      if (!seen[reply.userid]) {
        ret.push(reply.userid)
        seen[reply.userid] = true
      }
    }
  }

  // Then add users who are already promised
  if (message.value?.promises) {
    for (const promise of message.value.promises) {
      if (!seen[promise.userid]) {
        ret.push(promise.userid)
        seen[promise.userid] = true
      }
    }
  }

  // Finally add all users from all chats (so we can promise to anyone we've chatted with)
  const chatsList = chatStore?.list || []
  for (const chat of chatsList) {
    if (chat.otheruid && !seen[chat.otheruid]) {
      ret.push(chat.otheruid)
      seen[chat.otheruid] = true
    }
  }

  return ret
})

const replyusers = computed(() => {
  return replyuserids.value.map((uid) => userStore?.byId(uid)).filter((u) => u)
})

const closestUser = computed(() => {
  let ret = null
  let dist = null

  if (replyusers.value?.length > 1 && me.value) {
    replyusers.value.forEach((u) => {
      if (u) {
        const miles = milesAway(u.lat, u.lng, me.value.lat, me.value.lng)
        if (dist === null || miles < dist) {
          dist = miles
          ret = u.id
        }
      }
    })
  }

  return ret
})

const bestRatedUser = computed(() => {
  let ret = null
  let rating = null

  if (replyusers.value?.length > 1) {
    replyusers.value.forEach((u) => {
      if (u && u.info?.ratings?.Up + u.info?.ratings?.Down > 2) {
        const thisrating =
          u.info.ratings.Up / (u.info.ratings.Up + u.info.ratings.Down)
        if (
          u.info.ratings.Up > u.info.ratings.Down &&
          u.info.ratings.Up > 2 &&
          (rating === null || thisrating > rating)
        ) {
          rating = thisrating
          ret = u.id
        }
      }
    })
  }

  return ret
})

const quickestUser = computed(() => {
  let ret = null
  let replytime = null

  if (replyusers.value?.length > 1) {
    replyusers.value.forEach((u) => {
      if (
        u &&
        u.info?.replytime &&
        (replytime === null || u.info.replytime < replytime)
      ) {
        replytime = u.info.replytime
        ret = u.id
      }
    })
  }

  return ret
})

const chats = computed(() => {
  const chatsList = chatStore?.list || []
  return chatsList.filter((c) => message.value?.refchatids?.includes(c.id))
})

const promisedTo = computed(() => {
  const ret = []
  if (message.value?.promises?.length) {
    message.value.promises.forEach((p) => {
      const user = userStore?.byId(p.userid)
      if (user) {
        const tryst = trystStore?.getByUser(p.userid)
        const date = tryst
          ? dayjs(tryst.arrangedfor).format('ddd Do HH:mm')
          : null
        ret.push({ id: p.userid, name: user.displayname, trystdate: date })
      }
    })
  }
  return ret
})

const promisedToName = computed(() => {
  if (promisedTo.value.length > 0) {
    return promisedTo.value[0].name
  }
  return ''
})

const promisedToUsers = computed(() => {
  return promisedTo.value.map((p) => userStore?.byId(p.id)).filter((u) => u)
})

const isPromised = computed(() => {
  return message.value?.promised && !message.value?.outcomes?.length
})

const willAutoRepost = computed(() => {
  if (taken.value || received.value || !message.value?.canrepostat) {
    return false
  }
  return dayjs(message.value.canrepostat).isAfter(dayjs())
})

const canrepostatago = computed(() => {
  return message.value?.canrepostat ? timeago(message.value.canrepostat) : null
})

const messageGroup = computed(() => {
  if (message.value?.groups?.length) {
    const groupId = message.value.groups[0].groupid
    return groupStore?.get(groupId)
  }
  return null
})

// Methods
function getUserProfile(userid) {
  return userStore?.byId(userid)?.profile
}

function getUserName(userid) {
  return userStore?.byId(userid)?.displayname
}

function toggleExpanded() {
  expanded.value = !expanded.value
}

function goToPost() {
  router.push('/mypost/' + props.id)
}

const visibilityChanged = async (isVisible) => {
  if (isVisible) {
    const msg = await messageStore.fetch(props.id)
    visible.value = isVisible

    // Fetch group info for display
    if (msg?.groups?.length) {
      groupStore.fetch(msg.groups[0].groupid)
    }
  }
}

const outcome = (type, e) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  showOutcomeModal.value = true
  outcomeType.value = type
}

const share = (e) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  showShareModal.value = true
}

const openPromiseModal = (e) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  // Fetch chats so we can show users with active chats
  chatStore.fetchChats()
  showPromiseModal.value = true
}

const unpromise = (e) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  showRenegeModal.value = true
}

const edit = async (e) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  await messageStore.fetch(props.id, true)
  showEditModal.value = true
}

const repost = async (e) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }

  await composeStore.clearMessages()

  await composeStore.setMessage(
    0,
    {
      id: message.value.id,
      savedBy: message.value.fromuser,
      item: message.value.item?.name.trim(),
      description: message.value.textbody?.trim() || null,
      availablenow: message.value.availablenow,
      type: message.value.type,
      repostof: props.id,
      deadline: null,
    },
    me
  )

  if (message.value.location) {
    const locs = await locationStore.typeahead(message.value.location.name)
    composeStore.postcode = locs[0]
  }

  await composeStore.setAttachmentsForMessage(0, message.value.attachments)
  router.push(message.value.type === 'Offer' ? '/give' : '/find')
}

const hidden = () => {
  showEditModal.value = false
  messageStore.fetch(props.id)
}

// Watchers
watch(
  message,
  (newVal) => {
    if (newVal?.promises) {
      newVal.promises.forEach((p) => userStore.fetch(p.userid))
    }
    if (newVal?.replycount === 1) {
      expanded.value = true
    }
  },
  { immediate: true }
)

watch(
  replies,
  (newVal) => {
    if (newVal?.length === 1) {
      expanded.value = true
    }
  },
  { immediate: true }
)

watch(replyuserids, (newVal) => {
  newVal.forEach((uid) => userStore.fetch(uid))
})

onMounted(() => {
  expanded.value = props.expand
})
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'assets/css/_color-vars.scss';

.my-message-mobile {
  margin-bottom: 12px;
}

.message-card {
  background: white;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.photo-section {
  cursor: pointer;
}

.photo-area {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 50%;
  background: $color-gray--light;
  overflow: hidden;
}

.photo-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

:deep(.photo-image),
:deep(picture),
:deep(picture img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
}

.no-photo-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &.offer-gradient {
    background: radial-gradient(
        ellipse at 30% 20%,
        rgba(129, 199, 132, 0.9) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 70% 80%,
        rgba(56, 142, 60, 0.8) 0%,
        transparent 50%
      ),
      linear-gradient(160deg, #66bb6a 0%, #43a047 50%, #2e7d32 100%);

    .placeholder-pattern {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70' viewBox='0 0 70 70'%3E%3Ctext x='35' y='52' font-family='Arial,sans-serif' font-size='50' font-weight='bold' fill='white' fill-opacity='0.12' text-anchor='middle'%3E?%3C/text%3E%3C/svg%3E");
      background-size: 70px 70px;
    }
  }

  &.wanted-gradient {
    background: radial-gradient(
        ellipse at 25% 25%,
        rgba(144, 202, 249, 0.9) 0%,
        transparent 45%
      ),
      radial-gradient(
        ellipse at 75% 75%,
        rgba(66, 165, 245, 0.7) 0%,
        transparent 45%
      ),
      linear-gradient(160deg, #64b5f6 0%, #42a5f5 50%, #1e88e5 100%);

    .placeholder-pattern {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70' viewBox='0 0 70 70'%3E%3Ctext x='35' y='52' font-family='Arial,sans-serif' font-size='50' font-weight='bold' fill='white' fill-opacity='0.12' text-anchor='middle'%3E?%3C/text%3E%3C/svg%3E");
      background-size: 70px 70px;
    }
  }
}

.placeholder-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.icon-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.placeholder-icon {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.status-overlay {
  position: absolute;
  z-index: 10;
  transform: rotate(15deg);
  top: 50%;
  left: 50%;
  width: 40%;
  max-width: 80px;
  margin-left: -20%;
  margin-top: -10%;
  pointer-events: none;
}

.promised-banner {
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  right: 0;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(
    to bottom,
    rgba(0, 123, 255, 0.95) 0%,
    rgba(0, 123, 255, 0.85) 100%
  );
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.promised-banner-text {
  display: flex;
  align-items: center;
}

.unpromise-btn {
  background: $color-orange--dark;
  border: none;
  color: white;
  padding: 2px 10px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: darken($color-orange--dark, 10%);
  }
}

.photo-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  margin-left: 8px;
}

.photo-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.25);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }

  svg {
    font-size: 0.75rem;
  }
}

.title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 0.75rem 0.5rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.6) 70%,
    transparent 100%
  );
  color: white;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 0.15rem;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.title-tag {
  flex-shrink: 0;
  font-size: 0.6rem;
}

:deep(.title-tag .tagbadge) {
  font-size: 0.6rem;
}

.title-subject {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.2;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  opacity: 0.9;
}

.group-row {
  font-size: 0.65rem;
  opacity: 0.85;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.group-link {
  color: white;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.group-time-separator {
  opacity: 0.6;
}

.group-time {
  opacity: 0.7;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid $color-gray--lighter;
}

.action-buttons-left {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.action-buttons-right {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &--primary {
    background: $color-green-background;
    color: white;

    &:hover {
      background: darken($color-green-background, 10%);
    }
  }

  &--secondary {
    background: $color-blue--bright;
    color: white;

    &:hover {
      background: darken($color-blue--bright, 10%);
    }
  }

  &--warning {
    background: $color-orange--dark;
    color: white;

    &:hover {
      background: darken($color-orange--dark, 10%);
    }
  }

  &--light {
    background: $color-gray--lighter;
    color: $color-gray--dark;

    &:hover {
      background: darken($color-gray--lighter, 10%);
    }
  }
}

.replies-section {
  padding: 0;
}

.replies-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  cursor: pointer;
  background: lighten($color-green-background, 45%);
  border-left: 4px solid $color-green-background;

  &:hover {
    background: lighten($color-green-background, 40%);
  }
}

.replies-avatars {
  display: flex;
  align-items: center;
  height: 36px;
}

.reply-avatar {
  margin-left: -8px;
  position: relative;
  width: 32px;
  height: 32px;

  &:first-child {
    margin-left: 0;
  }

  :deep(.ProfileImage__container) {
    width: 32px !important;
    height: 32px !important;
  }

  :deep(.profile) {
    width: 32px !important;
    height: 32px !important;
    display: block !important;
  }

  :deep(.circle) {
    width: 32px !important;
    height: 32px !important;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    display: block !important;
  }

  :deep(picture) {
    width: 32px !important;
    height: 32px !important;
    display: block !important;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  }

  :deep(img) {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
    display: block !important;
    border: none !important;
    border-radius: 50%;
  }

  :deep(.generated-avatar) {
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
    min-height: 32px !important;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    overflow: hidden;

    svg {
      width: 32px !important;
      height: 32px !important;
      display: block !important;
    }
  }
}

.more-count {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: $color-green-background;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  margin-left: 4px;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  z-index: 10;
  position: relative;
}

.replies-text {
  display: flex;
  align-items: center;
  gap: 8px;
  background: $color-green-background;
  color: white;
  padding: 8px 14px;
  border-radius: 20px;
  font-weight: 600;
}

.replies-count {
  font-size: 0.85rem;
  font-weight: 600;
}

.expand-icon {
  color: white;
}

.replies-list {
  padding: 0 12px 12px;
}

.no-replies {
  padding: 12px;
  text-align: center;
}

.replies-slide-enter-active,
.replies-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.replies-slide-enter-from,
.replies-slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.replies-slide-enter-to,
.replies-slide-leave-from {
  opacity: 1;
  max-height: 2000px;
  transform: translateY(0);
}
</style>
