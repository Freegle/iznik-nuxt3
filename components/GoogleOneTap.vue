<template>
  <div
    v-if="show"
    id="g_id_onload"
    :data-client_id="clientId"
    data-callback="handleGoogleCredentialsResponse"
    data-auto_select="true"
    data-use_fedcm_for_prompt="true"
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
    const self = this

    // Fallback in case:
    // - Whe script load just quietly fails.  We've seen this on some Firefox versions.
    // - The notification is not displayed.  As of 2024 with OneTap migrating to FedCM we can't find this out.
    setTimeout(() => {
      console.log('One Tap fallback')
      self.$emit('complete')
    }, 15000)

    if (!this.loggedIn) {
      try {
        // GSI script was loaded in nuxt.config.js
        console.log('Set credentials response')
        window.handleGoogleCredentialsResponse =
          this.handleGoogleCredentialsResponse

        console.log('Set show')
        this.show = true
        try {
          window.google.accounts.id.prompt(() => {
            console.log('One Tap prompt returned')
            self.$emit('complete')
          })
        } catch (e) {
          console.error('One Tap error', e)
          self.$emit('complete')
        }

        console.log('Loaded SDK')
      } catch (e) {
        console.log('Failed to load One Tap', e)
        self.$emit('complete')
      }
    } else {
      self.$emit('complete')
    }
  },
  methods: {
    async handleGoogleCredentialsResponse(response) {
      console.log('Google login in OneTap', response)
      console.log('Are we logged in', this.loggedIn)

      if (!this.loggedIn) {
        const decoded = jwt_decode(response.credential)
        console.log('Decoded', decoded)

        // Now we can pass response.credential to the server, which can verify it to confirm our login as per
        // https://developers.google.com/identity/gsi/web/guides/verify-google-id-token.

        this.loginType = 'Google'
        this.nativeLoginError = null
        this.socialLoginError = null
        if (response?.credential) {
          console.log('Signed in')

          try {
            await this.authStore.login({
              googlejwt: response.credential,
              googlelogin: true,
            })

            // We are now logged in.
            console.log('Logged in')
            this.$emit('loggedin')
          } catch (e) {
            this.socialLoginError = 'Google login failed: ' + e.message
          }
        } else if (response?.error && response.error !== 'immediate_failed') {
          this.socialLoginError = 'Google login failed: ' + response.error
        }
      } else {
        console.log('Was already logged in')
        this.$emit('complete')
      }
    },
  },
}
</script>
