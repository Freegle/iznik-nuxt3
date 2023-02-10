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
import { useNewsfeedStore } from './stores/newsfeed'
import { useReplyStore } from './stores/reply'
import { useSearchStore } from './stores/search'
import { useStoryStore } from './stores/stories'
import { useVolunteeringStore } from './stores/volunteering'
import { useCommunityEventStore } from './stores/communityevent'
import { useJobStore } from './stores/job'
import { useTeamStore } from './stores/team'
import { useDonationStore } from './stores/donations'
import { useGiftAidStore } from './stores/giftaid'
import { useAuthorityStore } from './stores/authority'

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
const newsfeedStore = useNewsfeedStore()
const replyStore = useReplyStore()
const searchStore = useSearchStore()
const storyStore = useStoryStore()
const volunteeringStore = useVolunteeringStore()
const communityEventStore = useCommunityEventStore()
const jobStore = useJobStore()
const teamStore = useTeamStore()
const donationStore = useDonationStore()
const giftAidStore = useGiftAidStore()
const authorityStore = useAuthorityStore()

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
newsfeedStore.init(runtimeConfig)
replyStore.init(runtimeConfig)
searchStore.init(runtimeConfig)
storyStore.init(runtimeConfig)
volunteeringStore.init(runtimeConfig)
communityEventStore.init(runtimeConfig)
jobStore.init(runtimeConfig)
teamStore.init(runtimeConfig)
donationStore.init(runtimeConfig)
giftAidStore.init(runtimeConfig)
authorityStore.init(runtimeConfig)

// We use a key to force the whole page to re-render if we have logged in.  This is a sledgehammer way of
// re-calling all the setup() methods etc.  Perhaps there's a better way to do this.
const loginCount = computed(() => {
  return authStore.loginCount
})

try {
  if (route.query.u && route.query.k) {
    // We are impersonating.
    try {
      // Clear the related list.  This avoids accidentally flagging members as related if people forget to close
      // an incognito tab while impersonating.
      await authStore.clearRelated()

      // Log in using the username and key.
      await authStore.login({
        u: route.query.u,
        k: route.query.k,
      })
    } catch (e) {
      // Login failed.  Usually this is because they're logged in as someone else. Ignore it.
      console.log('Login failed', e)
    }
  }
} catch (e) {
  console.error('Error fetching user', e)
}

if (process.client) {
  if (typeof window !== 'undefined') {
    // There's a bug https://github.com/nuxt/framework/issues/3141 which causes route to stop working.
    const messages = [
      `Uncaught NotFoundError: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.`, // chromium based
      `NotFoundError: The object can not be found here.`, // safari
      `Cannot read properties of null (reading 'subTree')`,
    ]

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

  const chatCount = computed(() => {
    return chatStore.unreadCount
  })

  const notificationCount = computed(() => {
    return notificationStore.count
  })

  useHead({
    titleTemplate: (titleChunk) => {
      const totalCount = notificationCount.value + chatCount.value

      if (titleChunk.charAt(0) !== '(' && totalCount.value > 0) {
        return '(' + totalCount.value + ') ' + titleChunk
      } else {
        return titleChunk
      }
    },
  })
}

ready = true
</script>
