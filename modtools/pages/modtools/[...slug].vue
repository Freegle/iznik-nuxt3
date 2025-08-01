<template>
  <div>
    <h1>
      Redirecting you to...
      <NuxtLink :to="path">{{ path }}</NuxtLink>
    </h1>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const path = computed(() => {
  const route = useRoute()
  let path = ''
  if (route && route.params) {
    for (const p of route.params.slug) {
      path += '/' + p
    }
  }
  if (path.length === 0) path = '/'
  return path
})

onMounted(() => {
  setTimeout(() => {
    const router = useRouter()
    router.push(path.value)
  }, 2000)
})
</script>
