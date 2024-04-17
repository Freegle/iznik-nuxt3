<template>
  <div class="bg-white">
    <ModHelpMap />
    <div v-if="loaded">
      <ModGroupMap v-if="groupid" :groupid="groupid" />
      <ModGroupMap v-else groups :caretaker="caretaker" overlaps />
    </div>
    <div v-else class="d-flex justify-content-around">
      <b-img src="/loader.gif" alt="Loading..." width="100px" />
    </div>
  </div>
</template>

<script setup>
import { useGroupStore } from '~/stores/group'
import { useRoute } from 'vue-router'
const route = useRoute()

const groupStore = useGroupStore()


const groupid = computed(() => {
  return ('groupid' in route.params) ? parseInt(route.params.groupid) : 0
})
const all = computed(() => {
  return ('groupid' in route.params) ? route.params.groupid === "all" : false
})
const caretaker = computed(() => {
  return ('groupid' in route.params) ? route.params.groupid === "caretaker" : false
})

const loaded = ref(false)

onMounted(async () => {
  // Get the data before we load the map to avoid timing windows.
  /*if (groupid.value) {
    console.log('map onmounted', groupid.value)
    await groupStore.fetchMT({
      id: groupid.value,
      polygon: true
    })
  }*/

  loaded.value = true
})

</script>
