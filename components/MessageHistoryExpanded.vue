<template>
  <div>
    <div
      v-if="message.fromuser"
      class="grey p-2 d-flex clickme"
      :title="'Click to view profile for ' + message.fromuser.displayname"
    >
      <ProfileImage
        v-if="message.fromuser && message.fromuser.profile"
        :image="message.fromuser.profile.turl"
        class="ml-1 mb-1 inline"
        is-thumbnail
        size="sm"
        @click="showProfileModal"
      />
      <div>
        <div
          class="d-flex justify-content-between flex-wrap order-0"
          @click="showProfileModal"
        >
          <div class="text-muted align-middle decornone d-flex">
            Posted by {{ message.fromuser.displayname }}
          </div>
        </div>
        <nuxt-link
          v-if="message.interacted"
          :to="'/chats/' + message.interacted"
          class="font-weight-bold"
          title="You've chatted to this freegler before.  Click here to view Chat."
        >
          <v-icon icon="link" /> Connected before
        </nuxt-link>
        <!--        TODO-->
        <!--        <Supporter v-if="message.fromuser.supporter" class="d-inline" />-->
        <div
          v-if="
            message.fromuser &&
            message.fromuser.info &&
            message.fromuser.info.openoffers +
              message.fromuser.info.openwanteds >
              0
          "
          @click="showProfileModal"
        >
          <span v-if="message.fromuser.info.openoffers" class="text-success">
            {{ openOfferPlural }}
          </span>
          <span
            v-if="
              message.fromuser.info.openoffers &&
              message.fromuser.info.openwanteds
            "
          >
            &bull;
          </span>
          <span v-if="message.fromuser.info.openwanteds" class="text-success">
            {{ openWantedPlural }}
          </span>
        </div>
        <div
          v-for="group in message.groups"
          :key="'message-' + message.id + '-' + group.id"
        >
          <span :title="group.arrival">{{ timeago(group.arrival) }} on </span>
          <nuxt-link
            v-if="group.groupid in groups"
            :to="'/explore/' + groups[group.groupid].exploreLink"
            :title="'Click to view ' + groups[group.groupid].namedisplay"
          >
            {{ groups[group.groupid].namedisplay }}
          </nuxt-link>
        </div>
        <span v-if="milesaway" class="align-middle" @click="showProfileModal">
          About {{ milesPlural }} away
        </span>
      </div>
      <!--      TODO-->
      <!--      <ProfileModal-->
      <!--        v-if="showProfile && message && message.fromuser"-->
      <!--        :id="message.fromuser.id"-->
      <!--        ref="profile"-->
      <!--      />-->
    </div>
  </div>
</template>
<script>
import pluralize from 'pluralize'
import { milesAway } from '../composables/useDistance'
import ProfileImage from '@/components/ProfileImage'
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import { timeago } from '~/composables/useTimeFormat'

export default {
  name: 'MessageHistory',
  components: { ProfileImage },

  props: {
    id: {
      type: Number,
      default: 0,
    },
  },
  setup() {
    const messageStore = useMessageStore()
    const groupStore = useGroupStore()

    return { messageStore, timeago, groupStore }
  },
  data() {
    return {
      showProfile: false,
    }
  },
  computed: {
    milesaway() {
      return milesAway(
        this.me?.lat,
        this.me?.lng,
        this.message?.lat,
        this.message?.lng
      )
    },
    milesPlural() {
      return pluralize('mile', this.milesaway, true)
    },
    openOfferPlural() {
      return this.message && this.message.fromuser && this.message.fromuser.info
        ? pluralize('open OFFER', this.message.fromuser.info.openoffers, true)
        : null
    },
    openWantedPlural() {
      return this.message && this.message.fromuser && this.message.fromuser.info
        ? pluralize('open WANTED', this.message.fromuser.info.openwanteds, true)
        : null
    },
    message() {
      return this.messageStore.byId(this.id)
    },
    today() {
      return this.$dayjs(this.message.date).isSame(this.$dayjs(), 'day')
    },
    groups() {
      const ret = {}

      if (this.message) {
        this.message.groups.forEach((g) => {
          const thegroup = this.groupStore.get(g.groupid)

          if (thegroup) {
            ret[g.groupid] = thegroup

            // Better to link to the group by name if possible to avoid nuxt generate creating explore pages for the
            // id variants.
            ret[g.groupid].exploreLink = thegroup
              ? thegroup.nameshort
              : g.groupid
          }
        })
      }

      return ret
    },
  },
  methods: {
    showProfileModal(e) {
      this.showProfile = true

      this.waitForRef('profile', () => {
        this.$refs.profile.show()
      })
    },
  },
}
</script>
<style scoped lang="scss">
.grey {
  background-color: $color-gray--lighter;
}
</style>
