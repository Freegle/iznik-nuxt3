<template>
  <div v-if="event">
    <div class="d-flex">
      <ProfileImage
        v-if="user.profile.paththumb"
        :image="user.profile.paththumb"
        class="ml-1 mr-2 mb-1 inline"
        is-thumbnail
        :is-moderator="Boolean(user.showmod)"
        size="lg"
      />
      <div>
        <span class="text-success font-weight-bold">{{
          user.displayname
        }}</span>
        created an event<span class="d-none d-md-inline-block">:</span
        ><br class="d-block d-md-none" />
        &nbsp;<strong>{{ event.title }}</strong>
        <br />
        <span class="text-muted small">
          {{ timeago(newsfeed.added) }}
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
        <b-img
          v-if="event.photo"
          rounded
          lazy
          :src="event.photo.paththumb"
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
<script>
import dayjs from 'dayjs'
import { defineAsyncComponent } from 'vue'
import { useCommunityEventStore } from '../stores/communityevent'
import { useNewsfeedStore } from '../stores/newsfeed'
import { useUserStore } from '../stores/user'
import { useGroupStore } from '../stores/group'
import ProfileImage from '~/components/ProfileImage'
import NewsLoveComment from '~/components/NewsLoveComment'
import NewsBase from '~/components/NewsBase'
const CommunityEventModal = defineAsyncComponent(() =>
  import('~/components/CommunityEventModal')
)

export default {
  components: {
    NewsLoveComment,
    CommunityEventModal,
    ProfileImage,
  },
  extends: NewsBase,
  async setup(props, ctx) {
    const communityEventStore = useCommunityEventStore()
    const newsfeedStore = useNewsfeedStore()
    const userStore = useUserStore()
    const groupStore = useGroupStore()

    const newsfeed = newsfeedStore.byId(props.id)
    await userStore.fetch(newsfeed.userid)

    try {
      const event = await communityEventStore.fetch(newsfeed.eventid)

      await event.groups.forEach(async (groupid) => {
        await groupStore.fetch(groupid)
      })
    } catch (e) {
      // Most likely doesn't exist.
      ctx.emit('hide')
    }

    return {
      communityEventStore,
      newsfeedStore,
      userStore,
      groupStore,
    }
  },
  data: function () {
    return {
      showAddEvent: false,
      showMoreInfo: false,
    }
  },
  computed: {
    event() {
      return this.communityEventStore?.byId(this.newsfeed.eventid)
    },
    date() {
      // Similar code to CommunityEvent
      let ret = null
      const dates = this.event.dates
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
    },
  },
  methods: {
    moreInfo() {
      this.showMoreInfo = true
    },
    addEvent() {
      this.showAddEvent = true
    },
    group(groupid) {
      return this.groupStore?.get(groupid)
    },
  },
}
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
