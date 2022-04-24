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
            {{
              message.fromuser.info.openoffers
                | pluralize(['open OFFER', 'open OFFERs'], {
                  includeNumber: true,
                })
            }}
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
            {{
              message.fromuser.info.openwanteds
                | pluralize(['open WANTED', 'open WANTEDs'], {
                  includeNumber: true,
                })
            }}
          </span>
        </div>
        <div
          v-for="group in message.groups"
          :key="'message-' + message.id + '-' + group.id"
        >
          <span :title="group.arrival">{{ timeago(group.arrival) }} on</span>
          <nuxt-link :to="'/explore/' + exploreLink(group)">
            {{ group.namedisplay }}
          </nuxt-link>
        </div>
        <span
          v-if="message.milesaway"
          class="align-middle"
          @click="showProfileModal"
        >
          About
          {{ message.milesaway | pluralize('mile', { includeNumber: true }) }}
          away
        </span>
      </div>
      <ProfileModal
        v-if="showProfile && message && message.fromuser"
        :id="message.fromuser.id"
        ref="profile"
      />
    </div>
  </div>
</template>
<script>
import ProfileImage from '@/components/ProfileImage'
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import { timeago } from '~/composables/useTimeFormat'

const ProfileModal = () => import('~/components/ProfileModal')

export default {
  name: 'MessageHistory',
  components: { ProfileImage, ProfileModal },

  props: {
    id: {
      type: Number,
      default: 0,
    },
    groups: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
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
    message() {
      return this.messageStore.byId(this.id)
    },
    today() {
      return this.$dayjs(this.message.date).isSame(this.$dayjs(), 'day')
    },
  },
  methods: {
    exploreLink(group) {
      // Better to link to the group by name if possible to avoid nuxt generate creating explore pages for the
      // id variants.
      // TODO PERF Do we need to fetch the group?
      const thegroup = this.groupStore.fetch(group.groupid)

      if (thegroup) {
        // TODO Not working.
        return thegroup.nameshort
      } else {
        return group.groupid
      }
    },
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
