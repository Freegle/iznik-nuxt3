<template>
  <b-row>
    <b-col
      cols="12"
      xl="6"
      offset-xl="3"
      class="verytop"
      :class="{
        bottom,
      }"
    >
      <NoticeMessage
        v-if="me?.deleted"
        variant="danger"
        class="mb-3 text-center"
      >
        <div v-if="me.forgotten">
          <p class="text--large font-weight-bold">
            <v-icon icon="exclamation-triangle" />
            You deleted your account {{ medeleted }}. Your data has now been
            removed.
          </p>
          <p>If you'd like to rejoin, we'd love to have you.</p>
          <b-button variant="primary" class="mt-2" size="lg" @click="rejoin"
            >Rejoin Freegle</b-button
          >
        </div>
        <div v-else>
          <p class="text--large font-weight-bold">
            <v-icon icon="exclamation-triangle" />
            You deleted your account {{ medeleted }}. It will be completely
            removed soon.
          </p>
          <p class="font-weight-bold">
            Meanwhile, other freeglers can't see your details, posts or chats.
          </p>
          <p>
            If you've done this by mistake, or changed your mind, please click
            here:
          </p>
          <div class="d-flex justify-content-around">
            <SpinButton
              label="Restore your account"
              variant="primary"
              @handle="restore"
            />
          </div>
        </div>
      </NoticeMessage>
    </b-col>
  </b-row>
</template>
<script setup>
import { useAuthStore } from '~/stores/auth'
import { timeago } from '~/composables/useTimeFormat'
import { useMe } from '~/composables/useMe'
const { me } = useMe()

const authStore = useAuthStore()

defineProps({
  bottom: {
    type: Boolean,
    required: false,
    default: true,
  },
})

async function restore(handle) {
  await authStore.restore()
  handle()
}

async function rejoin() {
  await authStore.logout()

  // Go to /
  const router = useRouter()
  router.push('/')
}

const medeleted = computed(() => {
  return me.deleted ? timeago(me.deleted) : null
})
</script>
<style scoped>
.bottom {
  position: fixed;
  bottom: 0;
}
</style>
