<template>
  <div>
    <div v-if="me">
      <NuxtLink to="/">Go to dashboard</NuxtLink>
    </div>
    <div v-else class="p-2">Please login</div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

onMounted(() => {
  // Will usually arrive here on first load of session as authStore user not set in authuser.global.ts: bounce back to intended path
  const route = useRoute()
  const authStore = useAuthStore()
  const me = authStore.user
  if (me && me.id) {
    const router = useRouter()
    if (route.query?.return) {
      router.push(route.query.return)
    } else {
      router.push('/')
    }
  }
})
</script>
