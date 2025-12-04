<template>
  <client-only>
    <!-- Error state -->
    <div v-if="notFound" class="error-page">
      <div class="error-content">
        <div class="error-card">
          <v-icon icon="question-circle" class="error-icon" />
          <h1 class="error-title">Freegler not found</h1>
          <p class="error-message">
            Sorry, we couldn't find that profile. They may have left Freegle or
            the link might be incorrect.
          </p>
          <b-button variant="primary" @click="goBack">
            <v-icon icon="arrow-left" class="me-2" />Go Back
          </b-button>
        </div>
      </div>
    </div>
    <ProfileInfoMobile v-else :id="id" />
  </client-only>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref } from '#imports'
import { useUserStore } from '~/stores/user'
import ProfileInfoMobile from '~/components/ProfileInfoMobile'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id)
const notFound = ref(false)

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/browse')
  }
}

if (id) {
  try {
    await userStore.fetch(id)
  } catch (e) {
    if (e?.response?.status === 404) {
      console.log('User not found')
      notFound.value = true
    } else {
      throw e
    }
  }
}
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.error-page {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.error-content {
  max-width: 400px;
  width: 100%;
}

.error-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  color: $color-gray--dark;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $color-gray--darker;
  margin-bottom: 0.75rem;
}

.error-message {
  color: $color-gray--dark;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}
</style>
