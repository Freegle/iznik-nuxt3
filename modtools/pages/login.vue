<template>
  <div>
    <div v-if="me">
      <NuxtLink to="/">Go to dashboard</NuxtLink>
    </div>
    <div v-else-if="loginError" class="p-2 text-danger">
      Login failed: {{ loginError }}
    </div>
    <div v-else class="p-2">Please login</div>
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

function redirectIfLoggedIn() {
  if (me.value && me.value.id) {
    const returnPath = route.query?.return || '/'
    console.log(
      'login.vue: redirecting to',
      returnPath,
      'user:',
      me.value.displayname
    )
    // Use router.push (not window.location.href) to stay within the SPA.
    // A full page reload would lose the in-memory auth state, causing the
    // auth middleware to redirect back to /login before fetchUser completes.
    router.push({ path: returnPath, query: { noguard: true } })
  }
}

onMounted(async () => {
  console.log(
    'login.vue onMounted',
    'u=',
    route.query?.u,
    'k=',
    route.query?.k?.substring(0, 5)
  )

  // Handle u/k link login (impersonation).
  // The auth middleware redirects here with u/k preserved in query params.
  if (route.query?.u && route.query?.k) {
    try {
      await authStore.clearRelated()
      console.log('login.vue: calling authStore.login with u/k')
      await authStore.login({
        u: route.query.u,
        k: route.query.k,
      })
      console.log('login.vue: login done, user=', authStore.user?.displayname)
    } catch (e) {
      console.error('u/k login failed', e)
      loginError.value = e?.message || String(e)
    }
  }

  // Redirect if already logged in (normal flow or after u/k login above)
  redirectIfLoggedIn()
})

// Also watch reactively in case fetchUser completes after onMounted
watch(me, redirectIfLoggedIn)
</script>
