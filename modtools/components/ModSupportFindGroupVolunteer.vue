<template>
  <b-row>
    <b-col cols="4" md="2" class="order-1">
      <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
        volunteer.userid
      }}
    </b-col>
    <b-col cols="12" md="3" class="order-4 order-md-2">
      {{ volunteer.displayname }}
      <span v-if="active" class="fw-bold"> (Active) </span>
      <span v-else class="text-muted"> (Backup) </span>
    </b-col>
    <b-col cols="12" md="3" class="order-5 order-md-3">
      <template v-if="email">
        <ModClipboard class="me-3" :value="email" />
        <!-- eslint-disable-next-line -->
        <ExternalLink :href="'mailto:' + email">{{ email }}</ExternalLink>
      </template>
    </b-col>
    <b-col cols="4" md="2" class="order-2 order-md-4">
      <ModRole
        :userid="volunteer.userid"
        :groupid="groupid"
        :role="volunteer.role"
      />
    </b-col>
    <b-col cols="4" md="2" class="order-3 order-md-5">
      <span v-if="user?.lastaccess">
        {{ timeago(user.lastaccess) }}
      </span>
    </b-col>
  </b-row>
</template>
<script setup>
import { computed } from 'vue'
import { useUserStore } from '~/stores/user'
import { usePreferredEmail } from '~/composables/usePreferredEmail'

const userStore = useUserStore()

const props = defineProps({
  volunteer: {
    type: Object,
    required: true,
  },
  groupid: {
    type: Number,
    required: true,
  },
})

// Fetch user data to get email (memberships API returns userid but not email).
if (props.volunteer?.userid) {
  userStore.fetch(props.volunteer.userid)
}

const user = computed(() => userStore.byId(props.volunteer?.userid))
const email = usePreferredEmail(user)

const active = computed(() => {
  if (!props.volunteer) return false
  if (!props.volunteer.settings) return true
  if (!('active' in props.volunteer.settings)) return true
  return !!props.volunteer.settings.active
})
</script>
