<template>
  <div>
    <b-badge
      v-for="l in user?.logins"
      :key="'login-' + l.id"
      variant="info"
      class="border border-info rounded p-1 mr-1"
    >
      {{ loginType(l.type) }} login {{ timeago(l.lastaccess) }}
    </b-badge>
  </div>
</template>
<script setup>
import { computed, watch } from 'vue'
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
