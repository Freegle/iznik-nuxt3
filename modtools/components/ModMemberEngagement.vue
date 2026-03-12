<template>
  <div v-if="user">
    <div
      v-if="user.lastaccess"
      :class="'mb-1 ' + (inactive ? 'text-danger' : '')"
    >
      Last active: {{ timeago(user.lastaccess) }}
      <span v-if="inactive"> - won't send mails </span>
      <b-badge :variant="variant">
        {{ engagement }}
      </b-badge>
      <ModSupporter v-if="user.supporter" class="small" />
    </div>
  </div>
</template>
<script setup>
import { computed, watch } from 'vue'
import dayjs from 'dayjs'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  userid: {
    type: Number,
    required: true,
  },
})

const userStore = useUserStore()
const user = computed(() => userStore.byId(props.userid))

watch(
  () => props.userid,
  (uid) => {
    if (uid && !userStore.byId(uid)) userStore.fetch(uid)
  },
  { immediate: true }
)

const inactive = computed(() => {
  return (
    user.value &&
    user.value.lastaccess &&
    dayjs().diff(dayjs(user.value.lastaccess), 'days') >= 365 / 2
  )
})

const engagement = computed(() => {
  if (!user.value) {
    return null
  }

  switch (user.value.engagement) {
    case 'At Risk': {
      return 'Dormant Soon'
    }
    case 'Obsessed': {
      return 'Very Frequent'
    }
    default: {
      return user.value.engagement
    }
  }
})

const variant = computed(() => {
  if (!user.value) {
    return null
  }

  let ret = 'light'

  switch (user.value.engagement) {
    case 'New': {
      ret = 'info'
      break
    }
    case 'Occasional': {
      ret = 'secondary'
      break
    }
    case 'Frequent': {
      ret = 'primary'
      break
    }
    case 'Obsessed': {
      ret = 'danger'
      break
    }
    case 'Inactive': {
      ret = 'light'
      break
    }
    case 'AtRisk': {
      ret = 'light'
      break
    }
    case 'Dormant': {
      ret = 'dark'
      break
    }
  }

  return ret
})
</script>
