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

// There's a bug https://github.com/nuxt/framework/issues/3141 which causes route to stop working.
const messages = [
  `Uncaught NotFoundError: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.`, // chromium based
  `NotFoundError: The object can not be found here.`, // safari
  `Cannot read properties of null (reading 'subTree')`,
]

if (typeof window !== 'undefined') {
  window.addEventListener('error', (ev) => {
    if (messages.includes(ev.message)) {
      ev.preventDefault()
      window.location.reload()
    }
  })

  window.onunhandledrejection = (ev) => {
    // We get various of these - some from Leaflet.  It seems to break Nuxt routing and we get stuck, so if we
    // get one of these reload the page so that at least we keep going.
    console.error('Unhandled rejection - may break Nuxt - reload')
    ev.preventDefault()
    window.location.reload()
  }
}
</script>
