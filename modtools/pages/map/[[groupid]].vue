<template>
  <div class="bg-white">
    <ModHelpMap />
    <div v-if="loaded">
      <!--ModGroupMap v-if="groupid" :groupid="groupid" />
      <ModGroupMap v-else groups :caretaker="caretaker" overlaps /-->
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
  return ('groupid' in route.params) ? route.params.groupid : 0
})

const loaded = ref(false)
const all = ref(false)
const caretaker = ref(false)

onMounted(async () => {
  // Get the data before we load the map to avoid timing windows.
  console.log('map onmounted',groupid.value)
  await groupStore.fetchMT({
    id: groupid.value,
    polygon: true
  })
  /*await this.$store.dispatch('group/list', {
    grouptype: 'Freegle'
  })*/

  loaded.value = true
})
/*
created() {
  if (this.$route.params.groupid === 'all') {
    this.all = true
  } else if (this.$route.params.groupid === 'caretaker') {
    this.caretaker = true
  } else {
    this.groupid = parseInt(this.$route.params.groupid)
  }
}*/

</script>
