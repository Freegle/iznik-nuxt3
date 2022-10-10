<template>
  <div
    v-if="show"
    id="g_id_onload"
    :data-client_id="clientId"
    data-callback="handleGoogleCredentialsResponse"
    data-auto_select="true"
  />
</template>
<script>
// eslint-disable-next-line camelcase
import jwt_decode from 'jwt-decode'
import { useAuthStore } from '../stores/auth'

export default {
  setup() {
    const authStore = useAuthStore()
    const runtimeConfig = useRuntimeConfig()

    return {
      authStore,
      runtimeConfig,
    }
  },
  data() {
    return {
      show: false,
    }
  },
  computed: {
    clientId() {
      return this.runtimeConfig.public.GOOGLE_CLIENT_ID
    },
  },
  mounted() {
    console.log('Install OneTap')
    window.handleGoogleCredentialsResponse =
      this.handleGoogleCredentialsResponse

    this.show = true
    ;(function (d, s, id) {
      const fjs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) {
        return
      }
      const js = d.createElement(s)
      js.id = id
      js.src = 'https://accounts.google.com/gsi/client'
      js.onload = (e) => {
        console.log('GSI loaded')
        window.google.accounts.id.prompt() // Display the One Tap dialog
      }
      fjs.parentNode.insertBefore(js, fjs)
    })(document, 'script', 'google-jssdk')
  },
  methods: {
    handleGoogleCredentialsResponse(response) {
      console.log('Google login', response)
      const decoded = jwt_decode(response.credential)
      console.log('Decoded', decoded)

      // this.loginType = 'Google'
      // this.nativeLoginError = null
      // this.socialLoginError = null
      // if (response?.credential) {
      //   console.log('Signed in')
      //
      //   try {
      //     await this.authStore.login({
      //       googleauthcode: response.credential,
      //       googlelogin: true,
      //     })
      //
      //     // We are now logged in.
      //     console.log('Logged in')
      //     self.pleaseShowModal = false
      //   } catch (e) {
      //     this.socialLoginError = 'Google login failed: ' + e.message
      //   }
      // } else if (response?.error && response.error !== 'immediate_failed') {
      //   this.socialLoginError = 'Google login failed: ' + response.error
      // }
    },
    googleHandleToken(token) {
      console.log('Handle token', token)
    },
  },
}
</script>
