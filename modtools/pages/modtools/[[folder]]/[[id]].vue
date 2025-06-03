<template>
  <div>
    <h1>
      Redirecting you to...
      <NuxtLink :to="path">{{ path }}</NuxtLink>
    </h1>
  </div>
</template>

<script setup>
const path = computed(() => {
  const route = useRoute()
  const folder = 'folder' in route.params ? route.params.folder : ''
  const option = 'id' in route.params ? route.params.id : ''
  const path = '/' + folder + (option === '' ? '' : '/' + option)
  return path
})

onMounted(() => {
  setTimeout(() => {
    const router = useRouter()
    router.push(path.value)
  }, 2000)
})
</script>
