<template>
  <div v-if="user" class="d-flex justify-content-between flex-wrap order-0">
    <nuxt-link
      :to="clicklink"
      class="text-success decornone"
      :title="'Click to view membership for ' + user.displayname"
    >
      <span class="text-muted small d-flex justify-content-between">
        <ProfileImage
          :image="user.profile.turl"
          :name="user.displayname"
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
            v-if="
              !modinfo &&
              user.info &&
              user.info.openoffers + user.info.openwanteds > 0
            "
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
      :userid="userid"
      class="order-4 order-md-4 order-lg-3 mt-1 mt-md-0"
    />
    <ModMemberships v-if="modinfo" :userid="userid" class="order-5" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import pluralize from 'pluralize'
import dayjs from 'dayjs'
import { useMiscStore } from '~/stores/misc'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  userid: {
    type: Number,
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
})

const miscStore = useMiscStore()
const userStore = useUserStore()

const user = computed(() => {
  return userStore.byId(props.userid)
})

const membership = computed(() => {
  let ret = null

  if (props.groupid && user.value?.memberof) {
    ret = user.value.memberof.find((g) => {
      return g.id === props.groupid
    })

    if (ret) {
      // Hack around format to match what the component needs.
      ret = JSON.parse(JSON.stringify(ret))
      ret.userid = user.value.id
      ret.id = props.groupid
    }
  }

  return ret
})

const joinedAge = computed(() => {
  if (membership.value) {
    // eslint-disable-next-line new-cap
    return new dayjs().diff(new dayjs(membership.value.added), 'days')
  }

  return null
})

const clicklink = computed(() => {
  if (miscStore.modtools) {
    return '/members/approved/' + props.groupid + '/' + props.userid
  } else {
    return '/profile/' + props.userid
  }
})

const milesAwayPlural = computed(() => {
  return pluralize('mile', props.milesaway, true)
})

const openOffersPlural = computed(() => {
  if (user.value?.info?.openoffers) {
    pluralize.addIrregularRule('open OFFER', 'open OFFERs')
    return pluralize('open OFFER', user.value.info.openoffers, true)
  }
  return ''
})

const openWantedsPlural = computed(() => {
  if (user.value?.info?.openwanteds) {
    pluralize.addIrregularRule('open WANTED', 'open WANTEDs')
    return pluralize('open WANTED', user.value.info.openwanteds, true)
  }
  return ''
})
</script>
<style scoped>
.email {
  max-width: 200px;
}
</style>
