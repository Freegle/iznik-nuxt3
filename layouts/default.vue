<template>
  <div>
    <LayoutCommon :key="'nuxt-' + bump">
      <slot />
    </LayoutCommon>
    <client-only>
      <GoogleOneTap v-if="oneTap" @loggedin="googleLoggedIn" />
      <LoginModal v-if="!loggedIn" ref="loginModal" />
    </client-only>
  </div>
</template>
<script setup>
import { useMiscStore } from '../stores/misc'
import LayoutCommon from '~/components/LayoutCommon'
import { ref } from '#imports'
import { useAuthStore } from '~/stores/auth'
import { useMobileStore } from '@/stores/mobile' // APP
const GoogleOneTap = defineAsyncComponent(() =>
  import('~/components/GoogleOneTap')
)
const LoginModal = defineAsyncComponent(() => import('~/components/LoginModal'))

const runtimeConfig = useRuntimeConfig()
const userSite = runtimeConfig.public.USER_SITE
const proxy = runtimeConfig.public.IMAGE_DELIVERY
const mobileStore = useMobileStore()

let ready = false
const oneTap = ref(false)
const authStore = useAuthStore()
const miscStore = useMiscStore()

if (process.client) {
  // Ensure we don't wrongly think we have some outstanding requests if the server happened to start some.
  miscStore.apiCount = 0
}

if (proxy) {
  // Add the wallpaper background, proxying it from our image CDN.
  const bg =
    'background-image: url("' +
    proxy +
    '?url=' +
    userSite +
    '/wallpaper.png' +
    '&output=webp")'

  useHead({
    bodyAttrs: {
      style: bg,
    },
  })
}

const bump = ref(0)
const loginStateKnown = computed(() => authStore.loginStateKnown)
const loggedIn = computed(() => authStore.user !== null)

watch(
  loginStateKnown,
  (newVal) => {
    if (newVal && loggedIn.value) {
      // We now know that we have logged in.  We rendered the page originally
      // as logged out.  So re-render the page to make it reflect that.
      bump.value++
    }
  },
  {
    immediate: true,
  }
)

// For this layout we don't need to be logged in.  So can just continue.  But we want to know first whether or
// not we are logged in.  We might already know that from the server via cookies, but if not, find out.
const jwt = authStore.auth.jwt
const persistent = authStore.auth.persistent

if (jwt || persistent) {
  // We have some credentials, which may or may not be valid on the server.  If they are, then we can crack on and
  // start rendering the page.  This will be quicker than waiting for GoogleOneTap to load on the client and tell us
  // whether or not we can log in that way.
  let user = null

  try {
    user = await authStore.fetchUser()
  } catch (e) {
    console.log('Error fetching user', e)
  }

  if (user) {
    ready = true
  }
}

if (!ready && !mobileStore.isApp) {
  // APP
  // We don't have a valid JWT.  See if OneTap can sign us in.
  oneTap.value = true
}

if (!loginStateKnown.value) {
  await authStore.fetchUser()
}

function googleLoggedIn() {
  // OneTap has logged us in.  Re-render the page as logged in.
  bump.value++
}
</script>
