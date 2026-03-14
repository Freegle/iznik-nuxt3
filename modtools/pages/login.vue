<template>
  <div>
    <div v-if="me">
      <NuxtLink to="/">Go to dashboard</NuxtLink>
    </div>
    <div v-else class="p-2">Please login</div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const me = computed(() => authStore.user)

// Redirect when user becomes available (may happen after hydration + fetchUser)
watch(
  me,
  (newVal) => {
    if (newVal && newVal.id) {
      if (route.query?.return) {
        router.push(route.query.return)
      } else {
        router.push('/')
      }
    }
  },
  { immediate: true }
)
</script>
