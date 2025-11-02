<template>
  <div class="w-100 d-flex justify-content-center text-center">
    <client-only>
      <b-img lazy src="/loader.gif" alt="Loading" width="100px" />
    </client-only>
  </div>
</template>
<script setup>
import { useUserStore } from '~/stores/user'
import { ref, onMounted, useRouter, useRoute } from '#imports'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const engageid = ref(null)
const action = ref(null)

engageid.value = route.query.engageid
action.value = route.query.action

onMounted(async () => {
  // Record the engagement.
  if (engageid.value) {
    await userStore?.engaged(engageid.value)
  }

  // Now route on to where we were supposed to go.
  router.push('/' + (action.value ? action.value : ''))
})
</script>
