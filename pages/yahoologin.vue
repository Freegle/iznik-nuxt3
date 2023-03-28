<template>
  <b-row>
    <b-col class="text-center">
      <b-img lazy src="/loader.gif" alt="Loading" width="100px" />
    </b-col>
  </b-row>
</template>
<script setup>
import axios from 'axios'
import { useAuthStore } from '~/stores/auth'
import { useRoute, useRouter } from '#imports'

const router = useRouter()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const API = runtimeConfig.public.APIv1

// We have been redirected here after an attempt to log in with Yahoo from LoginModal.  We should have two
// url parameters - returnto which we set up, and code which is returned by Yahoo after a successful login

const returnto = route.query.returnto
const code = route.query.code

const authStore = useAuthStore()

if (authStore.user) {
  // We are logged in.  Go back to where we want to be.
  if (returnto) {
    // Go where we want to be.  Make sure we remove the code to avoid us trying to log in again.
    router.push(returnto)
  } else {
    router.push('/')
  }
} else if (!code) {
  // Probably they rejected our authorisation.  Just go back to the same page we were at.
  // window.location = returnto
} else {
  // We have a code.  Use it on the server to log ion.
  const result = await axios.post(API + '/session', {
    yahoocodelogin: code,
  })

  if (result?.data?.ret === 0) {
    // Success
    const authStore = useAuthStore()
    authStore.setAuth(result.data.jwt, result.data.persistent)

    if (returnto) {
      // Go where we want to be.  Make sure we remove the code to avoid us trying to log in again.
      router.go(returnto)
    } else {
      router.push('/')
    }
  }
}
</script>
