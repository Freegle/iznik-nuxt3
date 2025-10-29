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
<script setup>
// eslint-disable-next-line camelcase
import jwt_decode from 'jwt-decode'
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRuntimeConfig } from '#app'

const emit = defineEmits(['complete', 'loggedin'])

const authStore = useAuthStore()
const runtimeConfig = useRuntimeConfig()

const show = ref(false)
const loginType = ref(null)
const nativeLoginError = ref(null)
const socialLoginError = ref(null)

const clientId = computed(() => {
  return runtimeConfig.public.GOOGLE_CLIENT_ID
})

const loggedIn = computed(() => authStore.loggedIn)

const handleGoogleCredentialsResponse = async (response) => {
  console.log('Google login in OneTap', response)
  console.log('Are we logged in', loggedIn.value)

  if (!loggedIn.value) {
    const decoded = jwt_decode(response.credential)
    console.log('Decoded', decoded)

    // Now we can pass response.credential to the server, which can verify it to confirm our login as per
    // https://developers.google.com/identity/gsi/web/guides/verify-google-id-token.

    loginType.value = 'Google'
    nativeLoginError.value = null
    socialLoginError.value = null
    if (response?.credential) {
      console.log('Signed in')

      try {
        await authStore.login({
          googlejwt: response.credential,
          googlelogin: true,
        })

        // We are now logged in.
        console.log('Logged in')
        emit('loggedin')
      } catch (e) {
        socialLoginError.value = 'Google login failed: ' + e.message
      }
    } else if (response?.error && response.error !== 'immediate_failed') {
      socialLoginError.value = 'Google login failed: ' + response.error
    }
  } else {
    console.log('Was already logged in')
    emit('complete')
  }
}

onMounted(() => {
  // Assign the method to window for callback usage
  window.handleGoogleCredentialsResponse = handleGoogleCredentialsResponse

  // Check if running in CircleCI environment and emit complete immediately
  const runtimeConfig = useRuntimeConfig()
  if (runtimeConfig.public.CIRCLECI) {
    console.log('CircleCI environment detected, skipping Google One Tap')
    emit('complete')
    return
  }

  // Fallback in case:
  // - When script load just quietly fails. We've seen this on some Firefox versions.
  // - The notification is not displayed. As of 2024 with OneTap migrating to FedCM we can't find this out.
  setTimeout(() => {
    console.log('One Tap fallback')

    // Remove DOM element with id credential_picker_container if present
    const element = document.getElementById('credential_picker_container')
    if (element) {
      // This can block other clicks.
      console.log('Removing OneTap credential_picker_container')
      element.remove()
    }

    emit('complete')
  }, 15000)

  if (!loggedIn.value) {
    try {
      // GSI script was loaded in nuxt.config.js
      console.log('Set credentials response')
      window.google.accounts.id.initialize({
        client_id: clientId.value,
        callback: handleGoogleCredentialsResponse,
      })

      console.log('Set show')
      show.value = true
      try {
        window.google.accounts.id.prompt(() => {
          console.log('One Tap prompt returned')
          emit('complete')
        })
      } catch (e) {
        console.error('One Tap error', e)
        emit('complete')
      }

      console.log('Loaded SDK')
    } catch (e) {
      console.log('Failed to load One Tap', e)
      emit('complete')
    }
  } else {
    emit('complete')
  }
})
</script>
