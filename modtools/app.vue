<template>
  <div>
    <NuxtLayout name="default">
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { useNoticeboardStore } from '~/stores/noticeboard'
import { useAuthStore } from '~/stores/auth'
import { useGroupStore } from '~/stores/group'
import { useMessageStore } from '~/stores/message'
import { useUserStore } from '~/stores/user'
import { useIsochroneStore } from '~/stores/isochrone'
import { useComposeStore } from '~/stores/compose'
import { useChatStore } from '~/stores/chat'
import { useAddressStore } from '~/stores/address'
import { useTrystStore } from '~/stores/tryst'
import { useNotificationStore } from '~/stores/notification'
import { useNewsfeedStore } from '~/stores/newsfeed'
import { useReplyStore } from '~/stores/reply'
import { useSearchStore } from '~/stores/search'
import { useStoryStore } from '~/stores/stories'
import { useVolunteeringStore } from '~/stores/volunteering'
import { useCommunityEventStore } from '~/stores/communityevent'
import { useJobStore } from '~/stores/job'
import { useTeamStore } from '~/stores/team'
import { useDonationStore } from '~/stores/donations'
import { useGiftAidStore } from '~/stores/giftaid'
import { useAuthorityStore } from '~/stores/authority'
import { useStatsStore } from '~/stores/stats'
import { useMicroVolunteeringStore } from '~/stores/microvolunteering'
import { useImageStore } from '~/stores/image'
import { useDomainStore } from '~/stores/domain'
import { useLogoStore } from '~/stores/logo'
import { useLocationStore } from '~/stores/location'
import { useShortlinkStore } from '~/stores/shortlinks'
import { useMiscStore } from '~/stores/misc'
// polyfills
import 'core-js/actual/array/to-sorted'

import { useAdminsStore } from '~/stores/admins'
import { useAlertStore } from '~/stores/alert'
import { useCommentStore } from '~/stores/comment'
import { useLogsStore } from '~/stores/logs'
import { useMemberStore } from '~/stores/member'
import { useModConfigStore } from '~/stores/modconfig'
import { useSpammerStore } from '~/stores/spammer'
import { useStdmsgStore } from '~/stores/stdmsg'
import { computed, watch, reloadNuxtApp } from '#imports'
import { useModGroupStore } from '~/stores/modgroup'
import { usePublicityStore } from '~/stores/publicity'
import { useSystemConfigStore } from '~/stores/systemconfig'

const route = useRoute()

// We're having trouble accessing the Nuxt config from within a Pinia store.  So instead we access it here, then
// pass it in to each store via an init() action.
//
// Starting with around Nuxt 3.4.1, when we first access the config (here) it has public as we'd expect, but
// if we store that and access it later, we are just looking at the contents of public.  I don't understand why
// this is, but we don't expect the config to change, so we take a copy here.
const runtimeConfig = JSON.parse(
  JSON.stringify({
    public: useRuntimeConfig().public,
    app: useRuntimeConfig().app,
  })
)

const miscStore = useMiscStore()
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
const noticeboardStore = useNoticeboardStore()
const statsStore = useStatsStore()
const microVolunteeringStore = useMicroVolunteeringStore()
const imageStore = useImageStore()
const domainStore = useDomainStore()
const logoStore = useLogoStore()
const locationStore = useLocationStore()
const shortlinkStore = useShortlinkStore()
const adminsStore = useAdminsStore()
const alertStore = useAlertStore()
const commentStore = useCommentStore()
const logsStore = useLogsStore()
const memberStore = useMemberStore()
const modconfigStore = useModConfigStore()
const modGroupStore = useModGroupStore()
const spammerStore = useSpammerStore()
const stdmsgStore = useStdmsgStore()
const publicityStore = usePublicityStore()
const systemConfigStore = useSystemConfigStore()

miscStore.init(runtimeConfig)
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
noticeboardStore.init(runtimeConfig)
statsStore.init(runtimeConfig)
microVolunteeringStore.init(runtimeConfig)
imageStore.init(runtimeConfig)
domainStore.init(runtimeConfig)
logoStore.init(runtimeConfig)
locationStore.init(runtimeConfig)
shortlinkStore.init(runtimeConfig)
adminsStore.init(runtimeConfig)
alertStore.init(runtimeConfig)
commentStore.init(runtimeConfig)
logsStore.init(runtimeConfig)
memberStore.init(runtimeConfig)
modconfigStore.init(runtimeConfig)
modGroupStore.init(runtimeConfig)
spammerStore.init(runtimeConfig)
stdmsgStore.init(runtimeConfig)
publicityStore.init(runtimeConfig)
systemConfigStore.init(runtimeConfig)

miscStore.modtools = true

const loginCount = computed(() => {
  return authStore.loginCount
})

watch(loginCount, async () => {
  if (!route.query.k) {
    await reloadNuxtApp({
      force: true,
      persistState: false,
    })
  }
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

  const menuCount = computed(() => {
    return authStore.work ? authStore.work.total : 0
  })

  const chatCount = computed(() => {
    return chatStore.unreadCount
  })

  useHead({
    titleTemplate: (titleChunk) => {
      const totalCount = menuCount.value + chatCount.value

      if (titleChunk) {
        if (titleChunk.charAt(0) !== '(' && totalCount > 0) {
          return '(' + totalCount + ') ' + titleChunk
        } else {
          return titleChunk
        }
      } else {
        return null
      }
    },
  })
}
</script>

<style lang="scss">
.nuxt-layout-wrapper {
  transition: all 0.25s;
}
</style>
