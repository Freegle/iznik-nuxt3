<template>
  <div v-if="user">
    <NoticeMessage v-if="unbounced" variant="warning" class="mb-2">
      We'll try sending them mail again to see if their email is still bouncing.
    </NoticeMessage>
    <NoticeMessage v-else variant="danger" class="mb-2">
      <p>
        <a :href="user.email">{{ user.email }}</a> is bouncing<span
          v-if="user.bouncereason"
          >: {{ user.bouncereason }}</span
        ><span v-else> - see logs for details</span>.
        <span v-if="user.bounceat" class="text-muted">
          ({{ timeago(user.bounceat) }})
        </span>
      </p>
      <div v-if="user.role === 'Member' || supportOrAdmin">
        <p>If you think the email is valid, you can:</p>
        <b-button variant="white" @click="unbounce">
          <v-icon v-if="unbouncing" icon="sync" class="fa-spin text-success" />
          <v-icon v-else-if="unbounced" icon="check" class="text-success" />
          <v-icon v-else icon="sync" />
          Reactivate
        </b-button>
      </div>
      <div v-else>
        <!-- eslint-disable-next-line-->
        <p>You can't unbounce - you can only do this to members<span v-if="user.role">, and their role is {{ user.role }}</span>.</p>
      </div>
    </NoticeMessage>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import { useMe } from '~/composables/useMe'
import { timeago } from '~/composables/useTimeFormat'

const props = defineProps({
  userid: {
    type: Number,
    required: true,
  },
})

const authStore = useAuthStore()
const userStore = useUserStore()
const { supportOrAdmin } = useMe()

const user = computed(() => userStore.byId(props.userid))

watch(
  () => props.userid,
  (uid) => {
    if (uid && !userStore.byId(uid)) userStore.fetch(uid)
  },
  { immediate: true }
)

const unbouncing = ref(false)
const unbounced = ref(false)

async function unbounce() {
  unbouncing.value = true
  await authStore.unbounceMT(props.userid)
  unbouncing.value = false
  unbounced.value = true
}
</script>
