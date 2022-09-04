<template>
  <nuxt-link
    v-if="user"
    :to="'/profile/' + user.userid"
    class="text-success nodecor"
    :title="'Click to view profile for ' + user.displayname"
  >
    <div class="d-flex">
      <ProfileImage
        :image="user.profile.paththumb"
        class="ml-1 mb-1 inline"
        is-thumbnail
        size="lg"
      />
      <div class="ml-2">
        <span class="text-success font-weight-bold">
          {{ user.displayname }}
        </span>
        <br />
        <span class="text-muted small">
          <span v-if="user.info.publiclocation" class="pl-0">
            <v-icon icon="map-marker-alt" />&nbsp;{{
              user.info.publiclocation.display
            }}
          </span>
          <span v-if="user.info.openoffers + user.info.openwanteds > 0">
            &bull;
            <span v-if="user.info.openoffers" class="text-success">
              {{ openoffers }}&nbsp;
            </span>
            <span v-if="user.info.openwanteds" class="text-success">
              {{ openwanted }}&nbsp;
            </span>
          </span>
          <span v-if="user.showmod">
            &bull;
            <v-icon icon="leaf" /> Freegle Volunteer
          </span>
        </span>
      </div>
    </div>
  </nuxt-link>
</template>
<script>
import pluralize from 'pluralize'
import { useUserStore } from '../stores/user'

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  async setup(props) {
    const userStore = useUserStore()

    await userStore.fetch(props.id)

    return {
      userStore,
    }
  },
  computed: {
    user() {
      return this.userStore.byId(this.id)
    },
    openoffers() {
      let ret = null

      if (this.user.info) {
        ret = pluralize('OFFER', this.user.info.openoffers, true)
      }

      return ret
    },
    openwanted() {
      let ret = null

      if (this.user.info) {
        ret = pluralize('WANTED', this.user.info.openwanteds, true)
      }

      return ret
    },
  },
}
</script>
