<template>
  <div v-if="event">
    <div v-if="user" class="d-flex">
      <ProfileImage
        v-if="user.profile.paththumb"
        :image="user.profile.paththumb"
        class="ml-1 mr-2 mb-1 inline"
        is-thumbnail
        :is-moderator="Boolean(user.showmod)"
        size="lg"
      />
      <div>
        <span v-if="user.id">
          <span class="text-success font-weight-bold">{{
            user.displayname
          }}</span>
          created an event</span
        >
        <span v-else> An event was created</span>
        <span class="d-none d-md-inline-block">:</span
        ><span class="d-block d-md-none" /><span class="d-none d-md-inline"
          >&nbsp;</span
        ><strong>{{ event.title }}</strong>
        <br />
        <span class="text-muted small">
          {{ addedago }}
          on
          <span v-for="groupid in event.groups" :key="groupid">
            <span v-if="group(groupid)">
              {{ group(groupid).namedisplay }}
            </span>
          </span>
        </span>
      </div>
    </div>
    <div class="communityevent__container">
      <div class="communityevent__description">
        <div v-if="event.description" class="text-truncate">
          <v-icon icon="info-circle" class="fa-fw" />
          {{ event.description }}
        </div>
        <div v-if="event.location" class="text-truncate">
          <v-icon icon="map-marker-alt" class="fa-fw" />
          {{ event.location }}
        </div>
        <div v-if="date">
          <v-icon icon="calendar-alt" class="fa-fw" /> {{ date.start }} -
          {{ date.end }}
        </div>
        <b-button variant="secondary" class="mt-3 mb-2" @click="moreInfo">
          <v-icon icon="info-circle" /> More info
        </b-button>
      </div>
      <div class="communityevent__photo">
        <OurUploadedImage
          v-if="event.image?.ouruid"
          :src="event.image?.ouruid"
          :modifiers="event.image?.externalmods"
          alt="Community Event Photo"
          :width="200"
          @click="moreInfo"
        />
        <NuxtPicture
          v-else-if="event.image?.externaluid"
          format="webp"
          fit="cover"
          provider="uploadcare"
          :src="event.image?.externaluid"
          :modifiers="event.image?.externalmods"
          alt="Community Event Photo"
          :width="200"
          :height="200"
          @click="moreInfo"
        />
        <b-img
          v-else-if="event.image"
          rounded
          lazy
          :src="event.image.paththumb"
          class="clickme mt-2 mt-md-0 w-100"
          @click="moreInfo"
        />
      </div>
    </div>
    <hr />
    <div class="mt-2 d-flex flex-wrap justify-content-between">
      <NewsLoveComment
        :newsfeed="newsfeed"
        @focus-comment="$emit('focus-comment')"
      />
      <div>
        <b-button variant="secondary" size="sm" @click="addEvent">
          <v-icon icon="plus" /> Add your event
        </b-button>
      </div>
    </div>
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
import ProfileImage from '~/components/ProfileImage'
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

const userid = computed(() => {
  return newsfeed.value?.userid
})

const user = computed(() => {
  return userStore.byId(userid.value)
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

.communityevent__container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.communityevent__description {
  width: 100%;

  @include media-breakpoint-up(lg) {
    width: 65%;
    padding-right: 15px;
  }
}

.communityevent__photo {
  width: 100%;

  @include media-breakpoint-up(lg) {
    width: 30%;
  }
}
</style>
