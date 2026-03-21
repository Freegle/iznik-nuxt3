<template>
  <div v-if="user" class="mt-2 small">
    <div v-if="memberof && memberof.length">
      <div
        v-for="m in memberof"
        :key="'membership-' + m.membershipid"
        class="p-1 me-1"
      >
        <strong class="me-1">{{
          m.namedisplay.length > 32
            ? m.namedisplay.substring(0, 32) + '...'
            : m.namedisplay
        }}</strong>
        <span
          :class="
            'small ' +
            (daysago(m.added) < 31 ? 'text-danger fw-bold' : 'text-muted')
          "
          >{{ timeago(m.added) }}</span
        >
      </div>
    </div>
    <div v-else-if="joinHistory && joinHistory.length">
      <div class="p-1 me-1 text-muted">Not on any communities (history):</div>
      <div
        v-for="m in joinHistory"
        :key="'history-' + m.groupid + '-' + m.timestamp"
        class="p-1 me-1"
      >
        <strong class="me-1">{{
          (m.namedisplay || '').length > 32
            ? m.namedisplay.substring(0, 32) + '...'
            : m.namedisplay || ''
        }}</strong>
        <span
          :class="
            'small ' +
            (daysago(m.timestamp) < 31 ? 'text-danger fw-bold' : 'text-muted')
          "
          >joined {{ timeago(m.timestamp) }}</span
        >
      </div>
    </div>
    <div v-else class="p-1 me-1">Not on any communities</div>
    <b-badge
      v-if="hiddenmemberofs"
      variant="info"
      class="clickme mb-1"
      @click="allmemberships = !allmemberships"
    >
      +{{ hiddenmemberofs }} groups
    </b-badge>
    <div v-if="visibleApplied && visibleApplied.length">
      <div
        v-for="m in visibleApplied"
        :key="'memberapplied-' + m.groupid + '-' + m.added"
        class="p-1 me-1"
      >
        <strong class="me-1">{{
          (m.namedisplay || '').length > 32
            ? m.namedisplay.substring(0, 32) + '...'
            : m.namedisplay || ''
        }}</strong>
        <span
          :class="
            'small ' +
            (daysago(m.added) < 31 ? 'text-danger fw-bold' : 'text-muted')
          "
          >joined {{ timeago(m.added) }}</span
        >
      </div>
    </div>
    <b-badge
      v-if="hiddenapplieds"
      variant="info"
      class="clickme mb-1"
      @click="allapplied = !allapplied"
    >
      +{{ hiddenapplieds }} applied
    </b-badge>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import { useUserStore } from '~/stores/user'
import api from '~/api'
import { useRuntimeConfig } from '#app'

const MEMBERSHIPS_SHOW = 3

const props = defineProps({
  userid: {
    type: Number,
    required: true,
  },
})

const config = useRuntimeConfig()
const userStore = useUserStore()

const user = computed(() => {
  return userStore.byId(props.userid)
})

const applied = ref([])
const membershipHistory = ref([])
const allmemberships = ref(false)

const joinHistory = computed(() => {
  return membershipHistory.value.filter((m) => m.type === 'Joined')
})
const allapplied = ref(false)

async function fetchExtra(id) {
  if (!id) return
  try {
    applied.value = (await api(config).user.fetchApplied(id)) || []
  } catch (e) {
    applied.value = []
  }
  try {
    membershipHistory.value =
      (await api(config).user.fetchMembershipHistory(id)) || []
  } catch (e) {
    membershipHistory.value = []
  }
}

onMounted(() => fetchExtra(props.userid))
watch(() => props.userid, fetchExtra)

const memberof = computed(() => {
  if (!user.value?.memberships) {
    return null
  }

  const ms = [...user.value.memberships]

  ms.sort(function (a, b) {
    return new Date(b.added).getTime() - new Date(a.added).getTime()
  })

  if (allmemberships.value) {
    return ms
  } else {
    return ms.slice(0, MEMBERSHIPS_SHOW)
  }
})

const hiddenmemberofs = computed(() => {
  return allmemberships.value
    ? 0
    : user.value?.memberships?.length > MEMBERSHIPS_SHOW
    ? user.value.memberships.length - MEMBERSHIPS_SHOW
    : 0
})

const filteredApplied = computed(() => {
  if (!applied.value?.length || !user.value?.memberships) {
    return []
  }

  // Filter out anything we're already on.
  const ms = applied.value.filter((g) => {
    let member = false
    user.value.memberships.forEach((h) => {
      if (h.groupid === g.groupid) {
        member = true
      }
    })

    return !member
  })

  ms.sort(function (a, b) {
    return new Date(b.added).getTime() - new Date(a.added).getTime()
  })

  return ms
})

const visibleApplied = computed(() => {
  if (allapplied.value) {
    return filteredApplied.value
  } else {
    return filteredApplied.value.slice(0, MEMBERSHIPS_SHOW)
  }
})

const hiddenapplieds = computed(() => {
  return allapplied.value
    ? 0
    : filteredApplied.value.length > MEMBERSHIPS_SHOW
    ? filteredApplied.value.length - MEMBERSHIPS_SHOW
    : 0
})

function daysago(d) {
  return dayjs().diff(dayjs(d), 'days')
}
</script>
