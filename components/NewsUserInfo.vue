<template>
  <nuxt-link
    no-prefetch
    :to="'/profile/' + newsfeed.userid"
    class="text-success nodecor"
    :title="'Click to view profile for ' + newsfeed.displayname"
  >
    <span class="text-muted small">
      <span v-if="newsfeed.location" class="pl-0">
        <v-icon icon="map-marker-alt" class="ml-2" />&nbsp;{{
          newsfeed.location
        }}
      </span>
      <span
        v-if="newsfeed.userinfo.openoffers + newsfeed.userinfo.openwanteds > 0"
      >
        &bull;
        <span v-if="newsfeed.userinfo.openoffers" class="text-success">
          {{ openoffers }}&nbsp;
        </span>
        <span v-if="newsfeed.userinfo.openwanteds" class="text-success">
          {{ openwanted }}&nbsp;
        </span>
      </span>
      <span v-if="newsfeed.showmod">
        &bull;
        <v-icon icon="leaf" /> Freegle Volunteer
      </span>
    </span>
  </nuxt-link>
</template>
<script>
import pluralize from 'pluralize'
import { useNewsfeedStore } from '../stores/newsfeed'

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const newsfeedStore = useNewsfeedStore()

    return {
      newsfeedStore,
    }
  },
  computed: {
    newsfeed() {
      return this.newsfeedStore.byId(this.id)
    },
    openoffers() {
      let ret = null

      if (this.newsfeed.userinfo) {
        ret = pluralize('OFFER', this.newsfeed.userinfo.openoffers, true)
      }

      return ret
    },
    openwanted() {
      let ret = null

      if (this.newsfeed.userinfo) {
        ret = pluralize('WANTED', this.newsfeed.userinfo.openwanteds, true)
      }

      return ret
    },
  },
}
</script>
