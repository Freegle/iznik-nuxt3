<template>
  <div>
    <NuxtLayout v-if="ready">
      <NuxtPage :key="loginCount" />
    </NuxtLayout>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useGroupStore } from './stores/group'
import { useMessageStore } from './stores/message'
import { useUserStore } from './stores/user'
import { useIsochroneStore } from './stores/isochrone'
import { useComposeStore } from './stores/compose'
import { useChatStore } from './stores/chat'
import { useAddressStore } from './stores/address'
import { useTrystStore } from './stores/tryst'
import { useNotificationStore } from './stores/notification'

const route = useRoute()

// Don't render the app until we've done everything in here.
let ready = false

// We're having trouble accessing the Nuxt config from within a Pinia store.  So instead we access it here, then
// pass it in to each store via an init() action.
const runtimeConfig = useRuntimeConfig()

const groupStore = useGroupStore()
const messageStore = useMessageStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const isochroneStore = useIsochroneStore()
const composeStore = useComposeStore()
const chatStore = useChatStore()
const addressStore = useAddressStore()
const trystStore = useTrystStore()
const notificationStore = useNotificationStore()

groupStore.init(runtimeConfig)
messageStore.init(runtimeConfig)
authStore.init(runtimeConfig)
userStore.init(runtimeConfig)
isochroneStore.init(runtimeConfig)
composeStore.init(runtimeConfig)
chatStore.init(runtimeConfig)
addressStore.init(runtimeConfig)
trystStore.init(runtimeConfig)
notificationStore.init(runtimeConfig)

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
    if (messages.includes(ev.message)) {
      console.error('Unhandled rejection - may break Nuxt - reload')
      ev.preventDefault()
      window.location.reload()
    }
  }
}

ready = true
</script>
