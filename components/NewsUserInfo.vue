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
      <span v-if="user?.info?.openoffers + user?.info?.openwanteds > 0">
        &bull;
        <span v-if="user.info.openoffers" class="text-success">
          {{ openoffers }}&nbsp;
        </span>
        <span v-if="user?.info?.openwanteds" class="text-success">
          {{ openwanted }}&nbsp;
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
import pluralize from 'pluralize'
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
    openoffers() {
      let ret = null

      if (this.user?.info) {
        ret = pluralize('OFFER', this.user.info.openoffers, true)
      }

      return ret
    },
    openwanted() {
      let ret = null

      if (this.user?.info) {
        ret = pluralize('WANTED', this.user.info.openwanteds, true)
      }

      return ret
    },
  },
  beforeUpdate() {
    console.log('User info update')
    console.trace()
  },
}
</script>
