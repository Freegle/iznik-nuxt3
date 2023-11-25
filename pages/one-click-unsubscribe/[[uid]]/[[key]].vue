<template>
  <client-only>
    <div>
      <b-row class="m-0">
        <b-col cols="0" md="3" />
        <b-col cols="12" md="6" class="bg-white pt-2"></b-col>
        <b-col cols="0" md="3" />
      </b-row>
    </div>
  </client-only>
</template>
<script setup>
import { useAuthStore } from '~/stores/auth'
import { useRoute } from '#imports'

onMounted(async () => {
  const authStore = useAuthStore()
  const route = useRoute()

  const { key } = route.params
  let { uid } = route.params
  uid = parseInt(uid)

  let showForgetFail = false

  if (uid && key) {
    try {
      // Log in using the username and key.
      console.log('Login with', uid, key)
      await authStore.login({
        u: uid,
        k: key,
      })

      const loggedInAs = authStore.user?.id
      console.log('Logged in as', loggedInAs)

      if (loggedInAs === uid) {
        const ret = await authStore.forget()
        console.log('Forget returned', ret)

        if (ret) {
          showForgetFail = true
        } else {
          useRouter().push('/unsubscribe/unsubscribed')
        }
      }
    } catch (e) {
      // Login failed.  Usually this is because they're logged in as someone else. Ignore it.
      console.log('Login failed', e)
      showForgetFail = true
    }
  } else {
    showForgetFail = true
  }

  if (showForgetFail) {
    // Something went wrong with the one click unsubscribe.  Send them to the page that lets them try harder and
    // contact support.
    useRouter().push('/unsubscribe')
  }
})
</script>
