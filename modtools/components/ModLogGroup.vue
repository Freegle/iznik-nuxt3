<template>
  <span v-if="log && loggroup">
    {{ tag }}
    <a
      :href="'https://www.ilovefreegle.org/explore/' + loggroup.nameshort"
      target="_blank"
      >{{ groupname }}</a
    >
  </span>
</template>
<script setup>
import { computed } from 'vue'
import { useMe } from '~/composables/useMe'
import { useLogsStore } from '~/stores/logs'
import { useModGroupStore } from '~/stores/modgroup'

const props = defineProps({
  logid: {
    type: Number,
    required: true,
  },
  tag: {
    type: String,
    required: false,
    default: null,
  },
})

const logsStore = useLogsStore()
const modGroupStore = useModGroupStore()
const { myGroup } = useMe()

const log = computed(() => logsStore.byId(props.logid))

function scanUserForGroup(user) {
  let ret = null

  if (user) {
    if (user.applied) {
      user.applied.forEach((g) => {
        if (g.groupid === log.value.groupid) {
          ret = g
        }
      })
    }

    if (!ret && user.memberships) {
      user.memberships.forEach((g) => {
        if (g.groupid === log.value.groupid) {
          ret = g
        }
      })
    }
  }

  return ret
}

const loggroup = computed(() => {
  if (!log.value) return null

  if (log.value.group) {
    return log.value.group
  } else if (
    log.value.message &&
    log.value.message.groups &&
    log.value.message.groups.length
  ) {
    return log.value.message.groups[0]
  } else if (log.value.groupid) {
    let ret = scanUserForGroup(log.value.user)

    if (!ret) {
      ret = scanUserForGroup(log.value.byuser)
    }

    if (!ret) {
      ret = myGroup(log.value.groupid)
    }

    if (!ret) {
      // Fallback: group may not be in the current mod's groups (e.g. activity
      // on a group the mod doesn't moderate). Try the modgroup store directly.
      ret = modGroupStore.get(log.value.groupid)
    }

    return ret
  } else {
    return null
  }
})

const groupname = computed(() => {
  return loggroup.value.nameshort || loggroup.value.namedisplay
})
</script>
