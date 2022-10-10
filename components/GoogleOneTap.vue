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
}
</script>
