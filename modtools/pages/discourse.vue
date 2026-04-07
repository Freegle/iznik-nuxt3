<template>
  <div class="bg-white">
    <p>
      This should redirect you back to Discourse. If it doesn't, mail
      geeks@ilovefreegle.org.
    </p>
    <Spinner :size="50" />
  </div>
</template>
<script setup>
import { watch, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMe } from '~/composables/useMe'

const { myid } = useMe()

function redirect() {
  console.log('modtools discourse redirect')

  // Set the Iznik-Discourse-SSO cookie so that discourse_sso.php (PHP V1) can
  // authenticate us.  With V2 (Go API + JWT), logins never touch the PHP session,
  // so the cookie is never set automatically.  We reconstruct it here from the
  // persistent token in the auth store before handing off to Discourse.
  const authStore = useAuthStore()
  if (authStore.auth.persistent) {
    document.cookie =
      'Iznik-Discourse-SSO=' +
      encodeURIComponent(JSON.stringify(authStore.auth.persistent)) +
      '; path=/; domain=modtools.org; secure; samesite=none'
  }

  window.location = 'https://discourse.ilovefreegle.org'
}

watch(myid, (newVal, oldVal) => {
  console.log('modtools discourse watch myid', newVal, oldVal)
  if (!oldVal && newVal) {
    redirect()
  }
})

onMounted(() => {
  console.log('modtools discourse mounted A', myid.value)
  if (myid.value) {
    redirect()
    return
  }
  console.log('modtools discourse mounted B')
  const authStore = useAuthStore()
  const me = authStore.user
  if (me && me.id) {
    console.log('modtools discourse mounted C', me.id)
    redirect()
  }
})
</script>
