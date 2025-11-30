<template>
  <div>
    <!-- Redirect to photos page -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.replace('/find/app/photos')
})
</script>
