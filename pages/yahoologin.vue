<template>
  <b-row>
    <b-col class="text-center">
      <b-img lazy src="/loader.gif" alt="Loading" width="100px" />
    </b-col>
  </b-row>
</template>
<script setup>
import { useAuthStore } from '~/stores/auth'
import { useRoute, useRouter } from '#imports'

const router = useRouter()
const route = useRoute()

// We have been redirected here after an attempt to log in with Yahoo from LoginModal.  We should have two
// url parameters - returnto which we set up, and code which is returned by Yahoo after a successful login

const returnto = route.query.returnto
let code = route.query.code

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
  // We have a code.  Use it on the server to log in.
  //
  // Sometimes Yahoo returns an array.  Lord knows why.
  console.log('Try Yahoo login with code', code)
  code = typeof code === 'string' ? code : code[0]
  const result = await authStore.yahooCodeLogin(code)

  console.log('Returned', result)

  if (result?.ret === 0) {
    // Success
    const authStore = useAuthStore()
    authStore.setAuth(result.jwt, result.persistent)

    if (returnto) {
      // Go where we want to be.
      console.log('Return to', returnto)
      router.push(returnto)
    } else {
      router.push('/')
    }
  } else {
    console.log('Yahoo login failed')
    authStore.forceLogin = true
  }
}
</script>
