<template>
  <div
    v-if="!me"
    id="g_id_onload"
    :data-client_id="clientId"
    data-callback="googlehandleToken"
  />
</template>
<script>
import { useAuthStore } from '../stores/auth'

export default {
  setup() {
    console.log('Install OneTap')
    const authStore = useAuthStore()
    const runtimeConfig = useRuntimeConfig()

    window.googleHandleToken = (token) => {
      console.log('Handle token', token)
    }

    console.log('Installed OneTap')

    return {
      authStore,
      runtimeConfig,
    }
  },
  computed: {
    clientId() {
      return this.runtimeConfig.public.GOOGLE_CLIENT_ID
    },
  },
  mounted() {
    const self = this
    window.handleGoogleCredentialsResponse =
      this.handleGoogleCredentialsResponse
    ;(function (d, s, id) {
      const fjs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) {
        return
      }
      const js = d.createElement(s)
      js.id = id
      js.src = 'https://accounts.google.com/gsi/client'
      js.onload = (e) => {
        console.log('GSI loaded from OneTap')
        window.google.accounts.id.initialize({
          client_id: self.runtimeConfig.public.GOOGLE_CLIENT_ID,
          callback: window.handleGoogleCredentialsResponse,
        })

        window.google.accounts.id.prompt() // display the One Tap dialog
      }
      fjs.parentNode.insertBefore(js, fjs)
    })(document, 'script', 'google-jssdk')
  },
  methods: {
    async handleGoogleCredentialsResponse(response) {
      console.log('Google login', response)
      this.loginType = 'Google'
      this.nativeLoginError = null
      this.socialLoginError = null
      if (response?.credential) {
        console.log('Signed in')

        try {
          await this.authStore.login({
            googleauthcode: response.credential,
            googlelogin: true,
          })

          // We are now logged in.
          console.log('Logged in')
          self.pleaseShowModal = false
        } catch (e) {
          this.socialLoginError = 'Google login failed: ' + e.message
        }
      } else if (response?.error && response.error !== 'immediate_failed') {
        this.socialLoginError = 'Google login failed: ' + response.error
      }
    },
  },
}
</script>
