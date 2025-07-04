<template>
  <div>
    <div
      v-for="group in message?.groups"
      :key="'message-' + message.id + '-' + group.id"
      class="text--small"
    >
      <client-only>
        <span :title="group.arrival" class="time"
          >{{ grouparrivalago }}
          <span v-if="showSummaryDetails">on </span>
        </span>
      </client-only>
      <nuxt-link
        v-if="group.groupid in groups && showSummaryDetails"
        no-prefetch
        :to="'/explore/' + groups[group.groupid].exploreLink + '?noguard=true'"
        :title="'Click to view ' + groups[group.groupid].namedisplay"
      >
        {{ groups[group.groupid].namedisplay }}
      </nuxt-link>
      &nbsp;
      <client-only>
        <b-button
          v-if="showSummaryDetails"
          variant="link"
          :to="'/message/' + message.id"
          class="text-faded text-decoration-none"
          size="xs"
        >
          #{{ message.id }}
        </b-button>
      </client-only>
      <div v-if="approvedby && showSummaryDetails" class="text-faded small">
        Approved by {{ approvedby }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import { timeago } from '~/composables/useTimeFormat'
import { useMiscStore } from '~/stores/misc'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  summary: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const groupStore = useGroupStore()
const messageStore = useMessageStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const miscStore = useMiscStore()
const { mod } = useMe()

// Get access to miscStore breakpoint
const { breakpoint } = storeToRefs(miscStore)

// Fetch any approving mod when component is created
const me = authStore.user

if (
  me &&
  (me.systemrole === 'Moderator' ||
    me.systemrole === 'Support' ||
    me.systemrole === 'Admin')
) {
  // Fetch any approving mod. No need to wait.
  const currentMessage = messageStore.byId(props.id)

  if (currentMessage?.groups) {
    // Might fail, e.g. network, but we don't much mind if it does - we'd just not show the approving mod.
    for (const group of currentMessage.groups) {
      if (group?.approvedby) {
        userStore.fetch(group.approvedby)
      }
    }
  }
}

// Computed properties
const message = computed(() => {
  return messageStore?.byId(props.id)
})

const showSummaryDetails = computed(() => {
  return (
    !props.summary || (breakpoint.value !== 'xs' && breakpoint.value !== 'sm')
  )
})

const approvedby = computed(() => {
  let result = ''

  if (mod.value) {
    for (const group of message.value?.groups || []) {
      if (group?.approvedby) {
        const moderator = userStore?.byId(group.approvedby)
        result = moderator?.displayname
      }
    }
  }

  return result
})

const groups = computed(() => {
  const ret = {}

  message.value?.groups.forEach((g) => {
    const thegroup = groupStore?.get(g.groupid)

    if (thegroup) {
      ret[g.groupid] = thegroup

      // Better to link to the group by name if possible to avoid nuxt generate creating explore pages for the
      // id variants.
      ret[g.groupid].exploreLink = thegroup ? thegroup.nameshort : g.groupid
    }
  })

  return ret
})

const grouparrivalago = computed(() => {
  return timeago(message.value?.groups[0]?.arrival, true)
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/_functions';
@import 'bootstrap/scss/_variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.time {
  font-size: 0.75rem;

  @include media-breakpoint-up(md) {
    font-size: 1rem;
  }
}
</style>
