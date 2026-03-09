<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" md="3" />
      <b-col cols="12" md="6" class="bg-white pt-2">
        <div v-if="status === 'processing'" class="text-center py-4">
          <b-spinner variant="success" />
          <p class="mt-2">Processing your opt-out...</p>
        </div>
        <div v-else-if="status === 'success'">
          <h1>You've been opted out</h1>
          <p>
            You won't receive newsletter or fundraising emails from us any more.
          </p>
          <p>
            You'll still receive any other emails about your Freegle activity.
            See your <a :href="settingsUrl">email settings</a> for details.
          </p>
        </div>
        <div v-else>
          <h1>Opt-out failed</h1>
          <p>
            Sorry, we couldn't process your opt-out. The link may have expired.
          </p>
          <p>
            You can opt out manually by going to your
            <a :href="settingsUrl">email settings</a> and turning off "Freegle
            updates".
          </p>
        </div>
      </b-col>
      <b-col cols="0" md="3" />
    </b-row>
  </client-only>
</template>
<script setup>
import { useAuthStore } from '~/stores/auth'
import { useRoute } from '#imports'

const authStore = useAuthStore()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()

const settingsUrl =
  (runtimeConfig.public?.USER_SITE || 'https://www.ilovefreegle.org') +
  '/settings'

const uid = parseInt(route.query.u)
const key = route.query.k

const status = ref('processing')

onMounted(() => {
  // Safety timeout: if nothing resolves within 10s, show failure
  const safetyTimer = setTimeout(() => {
    if (status.value === 'processing') {
      console.log('Marketing opt-out safety timeout')
      status.value = 'failed'
    }
  }, 10000)

  if (!uid || !key) {
    clearTimeout(safetyTimer)
    status.value = 'failed'
    return
  }

  authStore
    .login({ u: uid, k: key })
    .then(async () => {
      const loggedInAs = authStore.user?.id

      if (loggedInAs === uid) {
        await authStore.saveAndGet({ relevantallowed: false })
        clearTimeout(safetyTimer)
        status.value = 'success'
      } else {
        clearTimeout(safetyTimer)
        status.value = 'failed'
      }
    })
    .catch((e) => {
      console.log('Marketing opt-out failed', e)
      clearTimeout(safetyTimer)
      status.value = 'failed'
    })
})
</script>
