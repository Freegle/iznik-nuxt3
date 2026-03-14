<template>
  <span v-if="loggroup">
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

const props = defineProps({
  log: {
    type: Object,
    required: false,
    default: null,
  },
  tag: {
    type: String,
    required: false,
    default: null,
  },
})

const { myGroup } = useMe()

function scanUserForGroup(user) {
  let ret = null

  if (user) {
    if (user.applied) {
      user.applied.forEach((g) => {
        if (g.id === props.log.groupid) {
          ret = g
        }
      })
    }

    if (!ret && user.memberof) {
      user.memberof.forEach((g) => {
        if (g.id === props.log.groupid) {
          ret = g
        }
      })
    }
  }

  return ret
}

const loggroup = computed(() => {
  if (props.log.group) {
    return props.log.group
  } else if (
    props.log.message &&
    props.log.message.groups &&
    props.log.message.groups.length
  ) {
    return props.log.message.groups[0]
  } else if (props.log.groupid) {
    // We have a groupid.  The group objects are not passed back from the server but we might be able to find it in:
    // - a user
    // - a message
    let ret = scanUserForGroup(props.log.user)

    if (!ret) {
      ret = scanUserForGroup(props.log.byuser)
    }

    if (!ret) {
      // We might know it - should be one of ours if we're looking at the logs.
      ret = myGroup(props.log.groupid)
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
