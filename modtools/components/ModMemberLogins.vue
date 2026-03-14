<template>
  <div>
    <b-badge
      v-for="l in member.logins"
      :key="'login-' + l.id"
      variant="info"
      class="border border-info rounded p-1 mr-1"
    >
      {{ loginType(l.type) }} login {{ timeago(l.lastaccess) }}
    </b-badge>
  </div>
</template>
<script setup>
defineProps({
  member: {
    type: Object,
    required: true,
  },
})

function loginType(type) {
  switch (type) {
    case 'Native':
      return 'Email/Password'
    case 'Facebook':
      return 'Facebook'
    case 'Yahoo':
      return 'Yahoo'
    case 'Google':
      return 'Google'
    default:
      return type
  }
}
</script>
