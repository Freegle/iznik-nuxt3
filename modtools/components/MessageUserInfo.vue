<template>
  <div class="d-flex justify-content-between flex-wrap order-0">
    <nuxt-link
      :to="clicklink"
      class="text-success decornone"
      :title="'Click to view membership for ' + user.displayname"
    >
      <span class="text-muted small d-flex justify-content-between">
        <ProfileImage
          :image="user.profile.turl"
          class="ml-1 mb-1 inline"
          is-thumbnail
          size="sm"
        />
        <span class="flex-grow-1">
          <span class="text-muted align-middle"> Posted by </span>
          <span class="align-middle font-weight-bold text-info text--medium">
            {{ user.displayname }}
          </span>
          <span v-if="milesaway" class="align-middle">
            &bull; <strong>about {{ milesAwayPlural }} away</strong>
          </span>
          <br class="d-block d-sm-none" />
          <span
            v-if="!modinfo && user.info.openoffers + user.info.openwanteds > 0"
            class="align-middle"
          >
            <span class="d-none d-sm-inline">&bull;</span>
            <span v-if="user.info.openoffers" class="text-success">
              {{ openOffersPlural }}
            </span>
            <span v-if="user.info.openoffers && user.info.openwanteds">
              &bull;
            </span>
            <span v-if="user.info.openwanteds" class="text-success">
              {{ openWantedsPlural }}
            </span>
          </span>
          <ModSupporter v-if="user.supporter" class="d-inline" />
        </span>
      </span>
    </nuxt-link>
    <span v-if="modinfo && membership" class="ml-2 order-1 order-sm-1 small">
      <v-icon icon="calendar-alt" />
      <span :class="joinedAge <= 31 ? 'text-danger' : ''"
        >Joined {{ dateshort(membership.added) }}</span
      >
    </span>
    <span
      v-if="modinfo && membership"
      class="ml-2 text-truncate small email order-3 order-md-1"
    >
      <!-- eslint-disable-next-line -->
      <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{ user.id }}
    </span>
    <ModModeration
      v-if="modinfo && membership"
      :user="user"
      :membership="membership"
      class="order-2 order-md-3 order-lg-4"
    />
    <ModPostingHistory
      v-if="modinfo"
      :user="user"
      class="order-4 order-md-4 order-lg-3 mt-1 mt-md-0"
    />
    <ModMemberships v-if="modinfo" :user="user" class="order-5" />
  </div>
</template>

<script>
import pluralize from 'pluralize'
import dayjs from 'dayjs'
import { useMiscStore } from '../../stores/misc'
import ModPostingHistory from './ModPostingHistory'
import ModMemberships from './ModMemberships'
import ModSupporter from '~/components/ModSupporter'
import ProfileImage from '~/components/ProfileImage'
const ModModeration = () => import('./ModModeration')

export default {
  components: {
    ModSupporter,
    ModMemberships,
    ModPostingHistory,
    ModModeration,
    ProfileImage,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
    message: {
      type: Object,
      required: false,
      default: null,
    },
    milesaway: {
      type: Number,
      required: false,
      default: null,
    },
    modinfo: {
      type: Boolean,
      default: false,
    },
    groupid: {
      type: Number,
      required: false,
      default: null,
    },
  },
  computed: {
    membership() {
      let ret = null

      if (
        this.groupid &&
        this.message &&
        this.message.fromuser &&
        this.message.fromuser.memberof
      ) {
        ret = this.message.fromuser.memberof.find((g) => {
          return g.id === this.groupid
        })

        if (ret) {
          // Hack around format to match what the component needs.
          ret = JSON.parse(JSON.stringify(ret))
          ret.userid = this.message.fromuser.id
          ret.id = this.groupid
        }
      }

      return ret
    },
    joinedAge() {
      if (this.membership) {
        // eslint-disable-next-line new-cap
        return new dayjs().diff(new dayjs(this.membership.added), 'days')
      }

      return null
    },
    clicklink() {
      const miscStore = useMiscStore()
      if (miscStore.modtools) {
        return '/members/approved/' + this.groupid + '/' + this.user.id
      } else {
        return '/profile/' + this.user.id
      }
    },
  },
  methods: {
    milesAwayPlural() {
      return pluralize('mile', this.milesaway, true)
    },
    openOffersPlural() {
      if (this.user?.info?.openoffers) {
        pluralize.addIrregularRule('open OFFER', 'open OFFERs')
        return pluralize('open OFFER', this.user.info.openoffers, true)
      }
      return ''
    },
    openWantedsPlural() {
      if (this.user?.info?.openwanteds) {
        pluralize.addIrregularRule('open WANTED', 'open WANTEDs')
        return pluralize('open WANTED', this.user.info.openwanteds, true)
      }
      return ''
    },
  },
}
</script>
<style scoped>
.email {
  max-width: 200px;
}
</style>
