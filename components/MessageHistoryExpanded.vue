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
        class="d-flex flex-wrap align-items-center"
      >
        <nuxt-link
          v-if="group.groupid in groups"
          no-prefetch
          :to="
            '/explore/' + groups[group.groupid].exploreLink + '?noguard=true'
          "
          :title="'Click to view ' + groups[group.groupid].namedisplay"
          class="small font-weight-bold text-success nodecor mr-1"
        >
          {{ groups[group.groupid].namedisplay }}
        </nuxt-link>
        <span class="small text-muted" :title="group.arrival">{{
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
<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import pluralize from 'pluralize'
import { milesAway } from '../composables/useDistance'
import { useUserStore } from '../stores/user'
import ProfileImage from '~/components/ProfileImage'
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import { timeago } from '~/composables/useTimeFormat'
import { useMe } from '~/composables/useMe'

const ProfileModal = defineAsyncComponent(() =>
  import('~/components/ProfileModal')
)

const props = defineProps({
  id: {
    type: Number,
    default: 0,
  },
})

const messageStore = useMessageStore()
const groupStore = useGroupStore()
const userStore = useUserStore()
const { me } = useMe()

const showProfile = ref(false)

// Fetch user data
const currentMessage = messageStore.byId(props.id)
if (currentMessage) {
  userStore.fetch(currentMessage.fromuser)
}

// Computed properties
const message = computed(() => {
  return messageStore?.byId(props.id)
})

const fromuser = computed(() => {
  return message.value?.fromuser
    ? userStore?.byId(message.value?.fromuser)
    : null
})

const milesaway = computed(() => {
  return milesAway(me?.lat, me?.lng, message.value?.lat, message.value?.lng)
})

const milesPlural = computed(() => {
  return pluralize('mile', milesaway.value, true)
})

const openOfferPlural = computed(() => {
  return message.value && fromuser.value && fromuser.value.info
    ? pluralize('open OFFER', fromuser.value.info.openoffers, true)
    : null
})

const openWantedPlural = computed(() => {
  return message.value && fromuser.value && fromuser.value.info
    ? pluralize('open WANTED', fromuser.value.info.openwanteds, true)
    : null
})

const groups = computed(() => {
  const ret = {}

  if (message.value) {
    message.value.groups.forEach((g) => {
      const thegroup = groupStore.get(g.groupid)

      if (thegroup) {
        ret[g.groupid] = thegroup

        // Better to link to the group by name if possible to avoid nuxt generate creating explore pages for the
        // id variants.
        ret[g.groupid].exploreLink = thegroup ? thegroup.nameshort : g.groupid
      }
    })
  }

  return ret
})

// Methods
function showProfileModal() {
  showProfile.value = true
}

function grouparrivalago(val) {
  return timeago(val)
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
