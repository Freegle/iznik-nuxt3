<template>
  <div>
    <LayoutCommon :key="'nuxt-' + bump">
      <slot />
    </LayoutCommon>
    <client-only>
      <GoogleOneTap
        v-if="oneTap"
        @loggedin="googleLoggedIn"
        @complete="googleLoaded"
      />
      <LoginModal
        v-if="!loggedIn"
        ref="loginModal"
        :key="'login-' + bumpLogin"
      />
    </client-only>
  </div>
</template>
<script setup>
import { useAuthStore } from '~/stores/auth'
import LayoutCommon from '~/components/LayoutCommon'
import { useMobileStore } from '@/stores/mobile' // APP
import { useMiscStore } from '~/stores/misc'
import { ref, computed, watch } from '#imports'
const GoogleOneTap = defineAsyncComponent(() =>
  import('~/components/GoogleOneTap')
)
const LoginModal = defineAsyncComponent(() => import('~/components/LoginModal'))

const mobileStore = useMobileStore()
const ready = ref(mobileStore.isApp) // APP
const oneTap = ref(false)
const bump = ref(0)
const bumpLogin = ref(0)
const loginModal = ref(null)
const authStore = useAuthStore()
const miscStore = useMiscStore()

const loggedIn = computed(() => authStore.user !== null)
const me = computed(() => authStore.user)

if (process.client) {
  // Ensure we don't wrongly think we have some outstanding requests if the server happened to start some.
  miscStore.apiCount = 0
}

useHead({
  bodyAttrs: {
    style: 'background-color: #f8f9fa',
  },
})

watch(
  me,
  (newVal) => {
    if (newVal) {
      // We've logged in.
      ready.value = true
    } else {
      authStore.forceLogin = true
    }
  },
  { immediate: true }
)

function googleLoggedIn() {
  // OneTap has logged us in. Re-render the page as logged in.
  bump.value++
}

function googleLoaded() {
  if (
    loginModal.value &&
    loginModal.value.showModal &&
    loginModal.value.email
  ) {
    // The user is entering an email / password so isn't interested in Google sign-in.
    console.log(
      'Showing login modal - leave well alone',
      loginModal.value.email
    )
  } else {
    // We need to force the login modal to rerender
    bumpLogin.value++
  }
}

const jwt = authStore.auth.jwt
const persistent = authStore.auth.persistent

if (jwt || persistent) {
  // We have some credentials, which may or may not be valid on the server.
  let user = null

  try {
    user = await authStore.fetchUser()
  } catch (e) {
    console.log('Error fetching user', e)
  }

  if (user) {
    ready.value = true
  }
}

if (!ready.value && !mobileStore.isApp) {
  // We don't have a valid JWT. See if OneTap can sign us in.
  oneTap.value = true
}
</script>
