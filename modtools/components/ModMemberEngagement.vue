<template>
  <div v-if="member">
    <div
      v-if="member.lastaccess"
      :class="'mb-1 ' + (inactive ? 'text-danger' : '')"
    >
      Last active: {{ timeago(member.lastaccess) }}
      <span v-if="inactive"> - won't send mails </span>
      <b-badge :variant="variant">
        {{ engagement }}
      </b-badge>
      <ModSupporter v-if="member.supporter" class="small" />
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  member: {
    type: Object,
    required: true,
  },
})

const inactive = computed(() => {
  // This code matches server code in sendOurMails.
  return (
    props.member &&
    props.member.lastaccess &&
    dayjs().diff(dayjs(props.member.lastaccess), 'days') >= 365 / 2
  )
})

const engagement = computed(() => {
  if (!props.member) {
    return null
  }

  // Map a few of the server values.
  switch (props.member.engagement) {
    case 'At Risk': {
      return 'Dormant Soon'
    }
    case 'Obsessed': {
      return 'Very Frequent'
    }
    default: {
      return props.member.engagement
    }
  }
})

const variant = computed(() => {
  if (!props.member) {
    return null
  }

  // Colour-code based on engagement.
  let ret = 'light'

  switch (props.member.engagement) {
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
