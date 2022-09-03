<template>
  <nuxt-link
    :to="'/profile/' + newsfeed.userid"
    class="text-success nodecor"
    :title="'Click to view profile for ' + user?.displayname"
  >
    <span class="text-muted small">
      <span v-if="newsfeed.location" class="pl-0">
        <v-icon icon="map-marker-alt" class="ml-2" />&nbsp;{{
          newsfeed.location
        }}
      </span>
      <span v-if="user?.activecounts?.offers + user?.activecounts?.wanteds > 0">
        &bull;
        <span v-if="user.activecounts.offers" class="text-success">
          {{
            user.activecounts.offers
              | pluralize(['OFFER', 'OFFERs'], { includeNumber: true })
          }}&nbsp;
        </span>
        <span v-if="user.activecounts.wanteds" class="text-success">
          {{
            user.activecounts.wanteds
              | pluralize(['WANTED', 'WANTEDs'], { includeNumber: true })
          }}&nbsp;
        </span>
      </span>
      <span v-if="user?.showmod">
        &bull;
        <v-icon icon="leaf" /> Freegle Volunteer
      </span>
    </span>
  </nuxt-link>
</template>
<script>
import { useUserStore } from '../stores/user'
import { useNewsfeedStore } from '../stores/newsfeed'

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const userStore = useUserStore()
    const newsfeedStore = useNewsfeedStore()

    // Fetch the user to get all the info we might show.  But we don't need to wait because we have the name to render
    // from the newsfeed object.
    const newsfeed = newsfeedStore.byId(props.id)

    if (newsfeed) {
      userStore.fetch(newsfeed.userid)
    }

    return {
      userStore,
      newsfeedStore,
    }
  },
  computed: {
    newsfeed() {
      return this.newsfeedStore.byId(this.id)
    },
    user() {
      return this.newsfeed?.userid
        ? this.userStore.byId(this.newsfeed.userid)
        : null
    },
  },
  beforeUpdate() {
    console.log('User info update')
    console.trace()
  },
}
</script>
