<template>
  <div>
    <div v-if="me">
      <NuxtLink to="/">Go to dashboard</NuxtLink>
    </div>
    <div v-else-if="loginError" class="p-2 text-danger">
      Login failed: {{ loginError }}
    </div>
    <div v-else class="p-2">Logging in...</div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const me = computed(() => authStore.user)
const loginError = ref(null)
const hasRedirected = ref(false)

function redirectIfLoggedIn() {
  if (hasRedirected.value) return
  if (me.value && me.value.id) {
    hasRedirected.value = true
    const returnPath = route.query?.return || '/'
    console.log(
      'login.vue: redirecting to',
      returnPath,
      'user:',
      me.value.displayname
    )
    router.push(returnPath)
  }
}

onMounted(async () => {
  // This page handles u/k link login (impersonation) only.
  // Normal login is handled by the default layout's LoginModal.
  if (route.query?.u && route.query?.k) {
    console.log(
      'login.vue onMounted u/k login',
      'u=',
      route.query.u,
      'k=',
      route.query.k?.substring(0, 5)
    )
    try {
      await authStore.clearRelated()
      await authStore.login({
        u: route.query.u,
        k: route.query.k,
      })
      console.log(
        'login.vue: u/k login done, user=',
        authStore.user?.displayname
      )
    } catch (e) {
      console.error('u/k login failed', e)
      loginError.value = e?.message || String(e)
    }
  }

  redirectIfLoggedIn()
})

// Watch reactively in case fetchUser completes after onMounted
watch(me, redirectIfLoggedIn)
</script>
