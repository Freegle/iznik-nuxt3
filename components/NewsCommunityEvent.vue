<template>
  <div v-if="event" class="community-event">
    <div class="event-header">
      <span class="type-badge">
        <v-icon icon="calendar-alt" class="me-1" />
        Community event
      </span>
    </div>

    <h3 class="event-title">{{ event.title }}</h3>

    <div class="event-meta">
      <span class="meta-item">
        {{ addedago }}
      </span>
      <span v-if="event.groups?.length" class="meta-item">
        on
        <span v-for="(groupid, index) in event.groups" :key="groupid">
          <span v-if="index > 0">, </span>
          <span v-if="group(groupid)">{{ group(groupid).namedisplay }}</span>
        </span>
      </span>
    </div>

    <div class="event-content">
      <div class="event-details">
        <div v-if="date" class="detail-row">
          <v-icon icon="clock" class="detail-icon" />
          <span class="detail-text">{{ date.start }} - {{ date.end }}</span>
        </div>
        <div v-if="event.location" class="detail-row">
          <v-icon icon="map-marker-alt" class="detail-icon" />
          <span class="detail-text">{{ event.location }}</span>
        </div>
        <div v-if="event.description" class="detail-row">
          <v-icon icon="info-circle" class="detail-icon" />
          <span class="detail-text">{{ event.description }}</span>
        </div>
      </div>

      <div v-if="event.image" class="event-photo clickme" @click="moreInfo">
        <OurUploadedImage
          v-if="event.image?.ouruid"
          :src="event.image?.ouruid"
          :modifiers="event.image?.externalmods"
          alt="Community Event Photo"
        />
        <NuxtPicture
          v-else-if="event.image?.externaluid"
          format="webp"
          fit="cover"
          provider="uploadcare"
          :src="event.image?.externaluid"
          :modifiers="event.image?.externalmods"
          alt="Community Event Photo"
        />
        <b-img
          v-else-if="event.image.paththumb"
          lazy
          :src="event.image.paththumb"
        />
      </div>
    </div>

    <div class="event-actions">
      <b-button variant="primary" size="sm" @click="moreInfo">
        <v-icon icon="info-circle" /> More info
      </b-button>
      <b-button variant="link" size="sm" @click="addEvent">
        <v-icon icon="plus" /> Add yours
      </b-button>
    </div>

    <hr class="my-2" />

    <NewsLoveComment
      :newsfeed="newsfeed"
      @focus-comment="$emit('focus-comment')"
    />

    <CommunityEventModal
      v-if="showAddEvent"
      :start-edit="true"
      @hidden="showAddEvent = false"
    />
    <CommunityEventModal
      v-if="showMoreInfo"
      :id="event.id"
      @hidden="showMoreInfo = false"
    />
  </div>
</template>
<script setup>
import { defineAsyncComponent, ref, computed } from 'vue'
import dayjs from 'dayjs'
import { useCommunityEventStore } from '~/stores/communityevent'
import { useNewsfeedStore } from '~/stores/newsfeed'
import { useUserStore } from '~/stores/user'
import { useGroupStore } from '~/stores/group'
import { timeago } from '~/composables/useTimeFormat'
import NewsLoveComment from '~/components/NewsLoveComment'
import OurUploadedImage from '~/components/OurUploadedImage'

const CommunityEventModal = defineAsyncComponent(() =>
  import('~/components/CommunityEventModal')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['focus-comment', 'hide'])

const communityEventStore = useCommunityEventStore()
const newsfeedStore = useNewsfeedStore()
const userStore = useUserStore()
const groupStore = useGroupStore()

const showAddEvent = ref(false)
const showMoreInfo = ref(false)

const newsfeed = computed(() => {
  return newsfeedStore.byId(props.id)
})

const event = computed(() => {
  return communityEventStore?.byId(newsfeed.value.eventid)
})

const date = computed(() => {
  // Similar code to CommunityEvent
  let ret = null
  const dates = event.value?.dates
  let count = 0

  if (dates) {
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i]
      const start = date.start + ' ' + date.starttime
      const end = date.end + ' ' + date.endtime
      if (dayjs(start).diff(end) < 0 || dayjs(start).isSame(end, 'day')) {
        if (count === 0) {
          const startm = dayjs(start)
          let endm = dayjs(end)
          endm = endm.isSame(startm, 'day')
            ? endm.format('HH:mm')
            : endm.format('ddd, Do MMM HH:mm')
          ret = {
            start: startm.format('ddd, Do MMM HH:mm'),
            end: endm,
          }
        }

        count++
      }
    }
  }

  return ret
})

const addedago = computed(() => {
  return timeago(newsfeed.value?.added)
})

function moreInfo() {
  showMoreInfo.value = true
}

function addEvent() {
  showAddEvent.value = true
}

function group(groupid) {
  return groupStore?.get(groupid)
}

// Initialize data
const initialize = async () => {
  try {
    await userStore.fetch(newsfeed.value.userid)
    const currentEvent = await communityEventStore.fetch(newsfeed.value.eventid)

    // Fetch group information for each group
    for (const groupid of currentEvent.groups) {
      await groupStore.fetch(groupid)
    }

    if (!currentEvent) {
      throw new Error('Event not found')
    }
  } catch (e) {
    // Most likely doesn't exist.
    emit('hide')
  }
}

// Run initialization
initialize()
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.community-event {
  padding: 0.5rem 0;
}

.event-header {
  margin-bottom: 0.5rem;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  background: rgba($color-blue--base, 0.1);
  color: $color-blue--base;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.event-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: $color-gray--darker;
}

.event-meta {
  font-size: 0.85rem;
  color: $color-gray--dark;
  margin-bottom: 0.75rem;

  .meta-item {
    &:not(:last-child)::after {
      content: ' · ';
    }
  }
}

.event-content {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;

  @include media-breakpoint-down(md) {
    flex-direction: column;
  }
}

.event-details {
  flex: 1;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
  font-size: 0.9rem;
  line-height: 1.4;

  .detail-icon {
    flex-shrink: 0;
    color: $color-gray--dark;
    width: 1em;
    margin-top: 0.3em;
  }

  .detail-text {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.event-photo {
  flex-shrink: 0;
  width: 120px;

  @include media-breakpoint-down(md) {
    width: 100%;
    max-width: 200px;
  }

  :deep(img) {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
}

.event-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}
</style>
