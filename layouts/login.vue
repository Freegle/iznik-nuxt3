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
<script>
import { useAuthStore } from '../stores/auth'
import { useMobileStore } from '~/stores/mobile'
import LayoutCommon from '~/components/LayoutCommon'
import { ref } from '#imports'
const GoogleOneTap = defineAsyncComponent(() =>
  import('~/components/GoogleOneTap')
)
const LoginModal = defineAsyncComponent(() => import('~/components/LoginModal'))

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

    const runtimeConfig = useRuntimeConfig()
    const userSite = runtimeConfig.public.USER_SITE
    const proxy = runtimeConfig.public.IMAGE_DELIVERY

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
        ready.value = true
      }
    }

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
    },
  },
}
</script>
