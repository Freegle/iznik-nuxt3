<template>
  <nuxt-link
    :to="'/profile/' + user.id"
    class="text-success nodecor"
    :title="'Click to view profile for ' + user.displayname"
  >
    <span class="text-muted small">
      <span v-if="user.info && user.info.publiclocation" class="pl-0">
        <v-icon icon="map-marker-alt" class="ml-2" />&nbsp;{{
          user.info.publiclocation.display
        }}
      </span>
      <span
        v-if="
          user.activecounts &&
          user.activecounts.offers + user.activecounts.wanteds > 0
        "
      >
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
      <span v-if="user.showmod">
        &bull;
        <v-icon icon="leaf" /> Freegle Volunteer
      </span>
    </span>
  </nuxt-link>
</template>
<script>
import { useUserStore } from '../stores/user'

export default {
  props: {
    userid: {
      type: Number,
      required: true,
    },
  },
  async setup(props) {
    const userStore = useUserStore()

    const user = await userStore.fetch(props.userid)

    return {
      userStore,
      user,
    }
  },
  beforeUpdate() {
    console.log('User info update')
    console.trace()
  },
}
</script>
