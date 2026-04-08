<template>
  <div>
    <!-- Redirect to photos page -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const router = useRouter()

onMounted(() => {
  router.replace('/find/mobile/photos')
})
</script>
