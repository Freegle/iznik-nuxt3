<template>
  <client-only>
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
  </client-only>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useGroupStore } from '~/stores/group'
const route = useRoute()

const groupStore = useGroupStore()

const groupid = computed(() => {
  return 'groupid' in route.params ? parseInt(route.params.groupid) : 0
})
/* TODO /map/all not actually used ???
const all = computed(() => {
  return ('groupid' in route.params) ? route.params.groupid === "all" : false
}) */
const caretaker = computed(() => {
  const caretaker =
    'groupid' in route.params ? route.params.groupid === 'caretaker' : false
  console.log('caretaker', caretaker)
  return 'groupid' in route.params
    ? route.params.groupid === 'caretaker'
    : false
})

const loaded = ref(false)

onMounted(async () => {
  // Get the data before we load the map to avoid timing windows.
  // Get CGAs and DPAs for all groups - but no locations
  await groupStore.listMT({
    grouptype: 'Freegle',
  })

  loaded.value = true
})
</script>
