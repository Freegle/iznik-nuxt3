<template>
  <div class="bg-white">
    <p>
      This should redirect you back to Discourse. If it doesn't, mail
      geeks@ilovefreegle.org.
    </p>
    <b-img src="/loader.gif" alt="Loading" />
  </div>
</template>
<script setup>
import { watch, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMe } from '~/composables/useMe'

const { myid } = useMe()

function redirect() {
  console.log('modtools discourse redirect')
  window.location = 'https://discourse.ilovefreegle.org'
}

watch(myid, (newVal, oldVal) => {
  console.log('modtools discourse watch myid', newVal, oldVal)
  if (!oldVal && newVal) {
    redirect()
  }
})

onMounted(() => {
  console.log('modtools discourse mounted A', myid.value)
  if (myid.value) {
    redirect()
    return
  }
  console.log('modtools discourse mounted B')
  const authStore = useAuthStore()
  const me = authStore.user
  if (me && me.id) {
    console.log('modtools discourse mounted C', me.id)
    redirect()
  }
})
</script>
