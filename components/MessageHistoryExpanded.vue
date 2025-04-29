<template>
  <div>
    <div
      v-if="fromuser"
      class="grey p-2 clickme minwidth"
      :title="'Click to view profile for ' + fromuser.displayname"
    >
      <div class="d-flex align-content-center">
        <ProfileImage
          v-if="fromuser?.profile"
          :image="fromuser.profile.paththumb"
          class="mr-1 inline"
          is-thumbnail
          size="md"
          @click="showProfileModal"
        />
        <div class="d-flex flex-column order-0" @click="showProfileModal">
          <span class="text-success font-weight-bold">{{
            fromuser?.displayname
          }}</span>
          <span
            v-if="fromuser?.info?.openoffers + fromuser?.info?.openwanteds > 0"
            class="text--small"
            @click="showProfileModal"
          >
            <span v-if="fromuser.info.openoffers" class="text-success">
              {{ openOfferPlural }}
            </span>
            <span v-if="fromuser.info.openoffers && fromuser.info.openwanteds">
              &bull;
            </span>
            <span v-if="fromuser.info.openwanteds" class="text-success">
              {{ openWantedPlural }}
            </span>
          </span>
        </div>
        <nuxt-link
          v-if="message.interacted"
          no-prefetch
          :to="'/chats/' + message.interacted"
          class="font-weight-bold"
          title="You've chatted to this freegler before.  Click here to view Chat."
        >
          <v-icon icon="link" /> Connected before
        </nuxt-link>
      </div>
      <SupporterInfo v-if="fromuser?.supporter" class="d-inline" />
      <div v-if="milesaway" class="align-middle" @click="showProfileModal">
        About {{ milesPlural }} away
      </div>
      <div
        v-for="group in message.groups"
        :key="'message-' + message.id + '-' + group.id"
      >
        <nuxt-link
          v-if="group.groupid in groups"
          no-prefetch
          :to="
            '/explore/' + groups[group.groupid].exploreLink + '?noguard=true'
          "
          :title="'Click to view ' + groups[group.groupid].namedisplay"
          class="font-weight-bold text-success nodecor"
        >
          {{ groups[group.groupid].namedisplay }}
        </nuxt-link>
        <span class="ml-1 small text-muted" :title="group.arrival">{{
          grouparrivalago(group.arrival)
        }}</span>
      </div>
    </div>
    <ProfileModal
      v-if="showProfile && message && fromuser"
      :id="fromuser.id"
      @hidden="showProfile = false"
    />
  </div>
</template>
<script>
import pluralize from 'pluralize'
import dayjs from 'dayjs'
import { milesAway } from '../composables/useDistance'
import { useUserStore } from '../stores/user'
import ProfileImage from '~/components/ProfileImage'
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import { timeago } from '~/composables/useTimeFormat'
const ProfileModal = defineAsyncComponent(() =>
  import('~/components/ProfileModal')
)

export default {
  name: 'MessageHistory',
  components: { ProfileImage, ProfileModal },

  props: {
    id: {
      type: Number,
      default: 0,
    },
  },
  async setup(props) {
    const messageStore = useMessageStore()
    const groupStore = useGroupStore()
    const userStore = useUserStore()

    const message = messageStore.byId(props.id)

    if (message) {
      await userStore.fetch(message.fromuser)
    }

    return { messageStore, timeago, groupStore, userStore }
  },
  data() {
    return {
      showProfile: false,
    }
  },
  computed: {
    fromuser() {
      return this.message?.fromuser
        ? this.userStore?.byId(this.message?.fromuser)
        : null
    },
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
      return this.message && this.fromuser && this.fromuser.info
        ? pluralize('open OFFER', this.fromuser.info.openoffers, true)
        : null
    },
    openWantedPlural() {
      return this.message && this.fromuser && this.fromuser.info
        ? pluralize('open WANTED', this.fromuser.info.openwanteds, true)
        : null
    },
    message() {
      return this.messageStore?.byId(this.id)
    },
    today() {
      return dayjs(this.message?.date).isSame(dayjs(), 'day')
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
    showProfileModal() {
      this.showProfile = true
    },
    grouparrivalago(val) {
      return timeago(val)
    },
  },
}
</script>
<style scoped lang="scss">
.grey {
  background-color: $color-gray--lighter;
}

.minwidth {
  min-width: 250px;
}
</style>
