<template>
  <div>
    <NoticeMessage v-if="unbounced" variant="warning" class="mb-2">
      We'll try sending them mail again to see if their email is still bouncing.
    </NoticeMessage>
    <NoticeMessage v-else variant="danger" class="mb-2">
      <p>
        <a :href="user.email">{{ user.email }}</a> is bouncing - see logs for
        details.
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
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const authStore = useAuthStore()
const { supportOrAdmin } = useMe()

const unbouncing = ref(false)
const unbounced = ref(false)

async function unbounce() {
  unbouncing.value = true
  await authStore.unbounceMT(props.user.id)
  unbouncing.value = false
  unbounced.value = true
}
</script>
