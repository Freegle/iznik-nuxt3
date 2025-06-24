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
import { useAuthStore } from '../stores/auth'
import { useMobileStore } from '~/stores/mobile'
import LayoutCommon from '~/components/LayoutCommon'
import { ref, computed, watch, useMiscStore } from '#imports'
const GoogleOneTap = defineAsyncComponent(() =>
  import('~/components/GoogleOneTap')
)
const LoginModal = defineAsyncComponent(() => import('~/components/LoginModal'))

<<<<<<< HEAD
export default {
  components: {
    GoogleOneTap,
    LoginModal,
    LayoutCommon,
  },
  async setup() {
    const mobileStore = useMobileStore()
    const ready = ref(mobileStore.isApp)
    const oneTap = ref(false)
    const authStore = useAuthStore()
    const jwt = authStore.auth.jwt
    const persistent = authStore.auth.persistent
=======
const ready = ref(false)
const oneTap = ref(false)
const bump = ref(0)
const bumpLogin = ref(0)
const loginModal = ref(null)
const authStore = useAuthStore()
const miscStore = useMiscStore()
>>>>>>> master

const runtimeConfig = useRuntimeConfig()
const userSite = runtimeConfig.public.USER_SITE
const proxy = runtimeConfig.public.IMAGE_DELIVERY

const loggedIn = computed(() => authStore.user !== null)
const me = computed(() => authStore.user)

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

<<<<<<< HEAD
    if (!ready.value && !mobileStore.isApp) {
      // We don't have a valid JWT.  See if OneTap can sign us in.
      oneTap.value = true
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

    return {
      ready,
      oneTap,
    }
  },
  data() {
    return {
      bump: 0,
      bumpLogin: 0,
    }
  },
  watch: {
    me: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // We've logged in.
          this.ready = true
        } else {
          const authStore = useAuthStore()
          authStore.forceLogin = true
        }
      },
    },
  },
  methods: {
    googleLoggedIn() {
      // OneTap has logged us in.  Re-render the page as logged in.
      this.bump++
    },
    googleLoaded() {
      if (
        this.$refs.loginModal &&
        this.$refs.loginModal.showModal &&
        this.$refs.loginModal.email
      ) {
        // The user is entering an email / password so isn't interested in Google sign-in.  And re-rendering would
        // lose that info.
        console.log(
          'Showing login modal - leave well alone',
          this.$refs.loginModal.email
        )
      } else {
        // We need to force the login modal to rerender, otherwise the login button doesn't always show.
        this.bumpLogin++
      }
=======
  useHead({
    bodyAttrs: {
      style: bg,
>>>>>>> master
    },
  })
}

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

if (!ready.value) {
  // We don't have a valid JWT. See if OneTap can sign us in.
  oneTap.value = true
}
</script>
