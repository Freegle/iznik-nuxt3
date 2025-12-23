<template>
  <div :key="'loginCount-' + loginCount">
    <client-only>
      <header v-if="shouldShowNavbar">
        <NavbarDesktop />
        <NavbarMobile />
      </header>
      <div
        class="position-absolute top-50 start-50 translate-middle z-3 pointer-none"
      >
        <LoadingIndicator
          with-transition
          :throttle="loadingIndicatorThrottle"
        />
      </div>
      <template #fallback>
        <header>
          <nav
            id="navbar_large"
            data-v-454188a5=""
            class="navbar fixed-top navbar-expand ourBack d-none d-xl-flex pl-1 pr-2 navbar-dark navbar-expand-xl"
          >
            <div class="container-fluid">
              <a
                data-v-454188a5=""
                aria-current="page"
                href="/"
                class="router-link-active router-link-exact-active navbar-brand p-0"
                ><picture data-v-454188a5="" class="logo mr-2"
                  ><source
                    type="image/webp"
                    sizes="58px"
                    srcset="
                      https://delivery.ilovefreegle.org/?filename=icon.png&we&w=58&output=png&fit=inside&url=https://www.ilovefreegle.org/icon.png   58w,
                      https://delivery.ilovefreegle.org/?filename=icon.png&we&w=116&output=png&fit=inside&url=https://www.ilovefreegle.org/icon.png 116w
                    " />
                  <img
                    alt="Home"
                    loading="eager"
                    data-nuxt-pic=""
                    src="https://61ddd294bd3a390019c6.ucr.io//-/format/png/-/resize/116x//https://www.ilovefreegle.org/icon.png"
                    sizes="58px"
                    srcset="
                      https://delivery.ilovefreegle.org/?filename=icon.png&we&w=58&output=png&fit=inside&url=https://www.ilovefreegle.org/icon.png   58w,
                      https://delivery.ilovefreegle.org/?filename=icon.png&we&w=116&output=png&fit=inside&url=https://www.ilovefreegle.org/icon.png 116w
                    " /></picture></a
              ><!----><!---->
              <div data-v-454188a5="" class="navbar-nav ml-auto">
                <div data-v-454188a5="" class="nav-item" no-prefetch="">
                  <button
                    data-v-454188a5=""
                    class="btn btn-md btn-white mr-2 test-signinbutton"
                    disabled
                    type="button"
                  >
                    Sign&nbsp;in
                  </button>
                </div>
              </div>
            </div>
          </nav>
          <nav
            class="navbar fixed-top navbar-expand ourBack d-flex justify-content-between d-xl-none showNavBarTop"
            type="dark"
          >
            <div class="container-fluid">
              <div />
              <div />
              <div class="d-flex align-items-center">
                <ul class="nav">
                  <a><div class="btn btn-white mr-2">Log in or Join</div></a>
                </ul>
              </div>
            </div>
          </nav>
        </header>
      </template>
    </client-only>
    <div
      v-if="ready"
      class="nuxt-layout-wrapper"
      :style="{
        filter: isLoading ? 'blur(1rem)' : 'unset',
      }"
    >
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { useNoticeboardStore } from './stores/noticeboard'
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
import { useMobileStore } from './stores/mobile'
import { useStatsStore } from './stores/stats'
import { useMicroVolunteeringStore } from './stores/microvolunteering'
import { useImageStore } from './stores/image'
import { useDomainStore } from './stores/domain'
import { useLogoStore } from './stores/logo'
import { useLocationStore } from './stores/location'
import { useShortlinkStore } from './stores/shortlinks'
import { useMiscStore } from './stores/misc'
import { computed } from '#imports'
// polyfills
import 'core-js/actual/array/to-sorted'
import { useConfigStore } from '~/stores/config'

const route = useRoute()
const loadingIndicatorThrottle = ref(5000)
const { isLoading } = useLoadingIndicator({
  throttle: loadingIndicatorThrottle.value,
})

// Don't render the app until we've done everything in here.
let ready = false

// We're having trouble accessing the Nuxt config from within a Pinia store.  So instead we access it here, then
// pass it in to each store via an init() action.
//
// Starting with around Nuxt 3.4.1, when we first access the config (here) it has public as we'd expect, but
// if we store that and access it later, we are just looking at the contents of public.  I don't understand why
// this is, but we don't expect the config to change, so we take a copy here.
console.log('[STARTUP] app.vue script setup start', performance.now())

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
const configStore = useConfigStore()
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
const mobileStore = useMobileStore()
const statsStore = useStatsStore()
const microVolunteeringStore = useMicroVolunteeringStore()
const imageStore = useImageStore()
const domainStore = useDomainStore()
const logoStore = useLogoStore()
const locationStore = useLocationStore()
const shortlinkStore = useShortlinkStore()

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
configStore.init(runtimeConfig)
jobStore.init(runtimeConfig)
teamStore.init(runtimeConfig)
donationStore.init(runtimeConfig)
giftAidStore.init(runtimeConfig)
authorityStore.init(runtimeConfig)
noticeboardStore.init(runtimeConfig)
mobileStore.init(runtimeConfig)
statsStore.init(runtimeConfig)
microVolunteeringStore.init(runtimeConfig)
imageStore.init(runtimeConfig)
domainStore.init(runtimeConfig)
logoStore.init(runtimeConfig)
locationStore.init(runtimeConfig)
shortlinkStore.init(runtimeConfig)
console.log('[STARTUP] app.vue all stores initialized', performance.now())

const loginCount = computed(() => {
  return authStore.loginCount
})

const shouldShowNavbar = computed(() => {
  // Hide navbar for layouts that shouldn't show it
  const layout = route.meta?.layout || 'default'
  return layout !== 'no-navbar'
})

// watch(loginCount, async () => {
//   if (!route.query.k) {
//     console.log('loginCount changed - reload')
//     await reloadNuxtApp({
//       force: true,
//       persistState: false,
//     })
//   }
// })

console.log(
  '[STARTUP] app.vue checking impersonation query params',
  performance.now()
)
try {
  if (route.query.u && route.query.k) {
    // We are impersonating.
    console.log(
      '[STARTUP] app.vue impersonation detected, logging in',
      performance.now()
    )
    try {
      // Clear the related list.  This avoids accidentally flagging members as related if people forget to close
      // an incognito tab while impersonating.
      await authStore.clearRelated()

      // Log in using the username and key.
      await authStore.login({
        u: route.query.u,
        k: route.query.k,
      })
      console.log(
        '[STARTUP] app.vue impersonation login complete',
        performance.now()
      )
    } catch (e) {
      // Login failed.  Usually this is because they're logged in as someone else. Ignore it.
      console.log('Login failed', e)
    }
  }
} catch (e) {
  console.error('Error fetching user', e)
}
console.log('[STARTUP] app.vue impersonation check done', performance.now())

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
        console.log('Error, reload')
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

    window.onerror = function (message, url, line, col, error) {
      // We can get this, for example if the CookieYes script is blocked.
      console.log('Uncaught error', message, url, line, col, error)

      if (url.includes('cookieyes')) {
        // If CookieYes fails with an error, then we proceed as though it wasn't configured.
        //
        // This catches the error on Firefox, but not on Chrome, so it's of limited use.
        console.log('CookieYes error')
        if (window.postCookieYes) {
          window.postCookieYes()
        }
      }
    }

    // Extract any src parameter from the url
    const src = new URLSearchParams(window.location.search).get('src')
    if (src) {
      // Store the source in the store
      console.log('Record source in store', src)
      miscStore.setSource(src)
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

      if (titleChunk) {
        if (titleChunk.charAt(0) !== '(' && totalCount.value > 0) {
          return '(' + totalCount.value + ') ' + titleChunk
        } else {
          return titleChunk
        }
      } else {
        return null
      }
    },
  })
}
console.log('[STARTUP] app.vue ready=true', performance.now())
ready = true
</script>
<style lang="scss">
.nuxt-layout-wrapper {
  transition: all 0.25s;
}

.trans {
  background-color: transparent !important;
  color: transparent !important;
  border: none !important;
}

.pointer-none {
  pointer-events: none;
}
</style>
