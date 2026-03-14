<template>
  <div class="mt-2 small">
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
            (daysago(m.added) < 31
              ? 'text-danger font-weight-bold'
              : 'text-muted')
          "
          >{{ timeago(m.added) }}</span
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
        :key="'memberapplied-' + m.id + '-' + m.userid + '-' + m.added"
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
            (daysago(m.added) < 31
              ? 'text-danger font-weight-bold'
              : 'text-muted')
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
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const MEMBERSHIPS_SHOW = 3

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const allmemberships = ref(false)
const allapplied = ref(false)

const memberof = computed(() => {
  if (!props.user || !props.user.memberof) {
    return null
  }

  const ms = [...props.user.memberof]

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
    : props.user &&
      props.user.memberof &&
      props.user.memberof.length > MEMBERSHIPS_SHOW
    ? props.user.memberof.length - MEMBERSHIPS_SHOW
    : 0
})

const filteredApplied = computed(() => {
  if (!props.user || !props.user.applied || !props.user.memberof) {
    return []
  }

  // Filter out anything we're already on.
  const ms = props.user.applied.filter((g) => {
    let member = false
    props.user.memberof.forEach((h) => {
      if (h.id === g.id) {
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
