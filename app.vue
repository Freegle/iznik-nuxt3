<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const authStore = useAuthStore()

if (route.query.u && route.query.k) {
  // We are impersonating.
  try {
    // Clear the related list.  This avoids accidentally flagging members as related if people forget to close
    // an incognito tab while impersonating.
    await authStore.clearRelated()

    // Log in using the username and key.
    await authStore.login({
      u: this.$route.query.u,
      k: this.$route.query.k,
    })
  } catch (e) {
    // Login failed.  Usually this is because they're logged in as someone else. Ignore it.
    console.log('Login failed', e)
  }
} else {
  // Before we do anything, see if we are logged in.
  await authStore.fetchUser()
}
</script>
