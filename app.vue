<template>
  <div>
    <NuxtLayout>
      <NuxtPage :key="loginCount" />
    </NuxtLayout>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const runtimeConfig = useRuntimeConfig()
authStore.init(runtimeConfig)

// We use a key to force the whole page to re-render if we have logged in.  This is a sledgehammer way of
// re-calling all the setup() methods etc.  Perhaps there's a better way to do this.
const loginCount = computed(() => {
  return authStore.loginCount
})

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
